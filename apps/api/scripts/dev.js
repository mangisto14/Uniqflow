const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const npxCommand = isWindows ? 'npx.cmd' : 'npx';
const nodeCommand = isWindows ? 'node.exe' : 'node';

const projectRoot = path.resolve(__dirname, '..');
const entryFile = path.join(projectRoot, 'dist', 'apps', 'api', 'src', 'main.js');

let serverProcess = null;
let restartTimer = null;
let shuttingDown = false;
let lastStartedMtimeMs = -1;
let pendingRestart = false;

function pipeOutput(child) {
  if (child.stdout) {
    child.stdout.pipe(process.stdout);
  }

  if (child.stderr) {
    child.stderr.pipe(process.stderr);
  }
}

function log(message) {
  process.stdout.write(`[api-dev] ${message}\n`);
}

function launchServer() {
  if (!fs.existsSync(entryFile)) {
    return;
  }

  const stats = fs.statSync(entryFile);
  lastStartedMtimeMs = stats.mtimeMs;
  pendingRestart = false;
  log('Starting API server...');

  serverProcess = spawn(nodeCommand, [entryFile], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  pipeOutput(serverProcess);

  serverProcess.on('exit', (code, signal) => {
    const shouldRestart = pendingRestart && !shuttingDown;
    serverProcess = null;

    if (shouldRestart) {
      setTimeout(launchServer, 300);
      return;
    }

    if (shuttingDown) {
      return;
    }

    if (signal) {
      log(`API server stopped with signal ${signal}.`);
    } else if (code !== 0) {
      log(`API server exited with code ${code}. Waiting for the next build...`);
    }
  });
}

function startServer() {
  if (!fs.existsSync(entryFile)) {
    return;
  }

  const stats = fs.statSync(entryFile);
  if (stats.mtimeMs === lastStartedMtimeMs && serverProcess && !serverProcess.killed) {
    return;
  }

  if (serverProcess) {
    pendingRestart = true;
    serverProcess.kill();
    return;
  }

  launchServer();
}

function scheduleRestart() {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(startServer, 250);
}

const buildProcess = spawn(npxCommand, ['nest', 'build', '--watch'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
  shell: isWindows,
});
pipeOutput(buildProcess);

buildProcess.on('exit', (code, signal) => {
  if (shuttingDown) {
    return;
  }

  if (signal) {
    log(`Build watcher stopped with signal ${signal}.`);
  } else {
    log(`Build watcher exited with code ${code}.`);
  }

  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  process.exit(code ?? 1);
});

fs.watchFile(entryFile, { interval: 500 }, (current, previous) => {
  if (current.mtimeMs === 0) {
    return;
  }

  if (current.mtimeMs !== previous.mtimeMs || !serverProcess) {
    scheduleRestart();
  }
});

if (fs.existsSync(entryFile)) {
  scheduleRestart();
}

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  log(`Shutting down on ${signal}...`);
  fs.unwatchFile(entryFile);
  clearTimeout(restartTimer);
  pendingRestart = false;
  if (serverProcess) {
    serverProcess.kill();
  }
  buildProcess.kill();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

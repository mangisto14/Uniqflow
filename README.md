# Uniqflow — מיוחדים

Enterprise Process Management Platform — Visual builder, rule engine, execution runtime, and team dashboards.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Flow |
| State | Zustand |
| Backend | NestJS, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Real-time | Socket.IO |
| Auth | JWT (access + refresh tokens) |
| Monorepo | Turborepo |

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Docker + Docker Compose

---

## Local Development

### 1. Clone and install

```bash
git clone <repo-url>
cd Uniqflow
npm install
```

### 2. Start infrastructure (PostgreSQL + Redis)

```bash
docker compose up -d
```

Verify:
```bash
docker compose ps   # both services should show "healthy"
```

### 3. Configure environment

```bash
cp .env.example apps/api/.env
```

Default values work out-of-the-box with `docker compose`. Change `JWT_SECRET` for anything beyond local dev:

```env
DATABASE_URL=postgresql://uniqflow:uniqflow_dev@localhost:5432/uniqflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=uniqflow-jwt-secret-change-in-production-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
API_PORT=3001
API_PREFIX=/api
CORS_ORIGIN=http://localhost:5173
APP_NAME=Uniqflow
APP_URL=http://localhost:5173
```

### 4. Run database migrations + seed

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

This creates all tables and seeds: **5 teams**, **10 users**, **3 sample processes**.

### 5. Start development servers

```bash
# From repo root — starts API + Web in parallel
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001/api |
| Swagger docs | http://localhost:3001/api/docs |
| Prisma Studio | `cd apps/api && npx prisma studio` → http://localhost:5555 |

---

## Project Structure

```
uniqflow/
├── apps/
│   ├── api/                  # NestJS backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── modules/      # auth, process, step, execution, team, user…
│   │       └── engine/       # state machine, condition parser, executor
│   └── web/                  # React + Vite frontend
│       └── src/
│           ├── features/     # builder, execution, dashboard, admin…
│           ├── components/   # UI + layout
│           ├── stores/       # Zustand
│           └── api/          # API clients
├── packages/
│   └── shared/               # Shared types + constants (UserRole, Permission…)
├── docker-compose.yml        # PostgreSQL 16 + Redis 7
└── .env.example
```

---

## Available Scripts

Run from the **repo root**:

```bash
npm run dev        # Start all apps in watch mode
npm run build      # Build all packages and apps
npm run lint       # TypeScript type-check all workspaces
npm run test       # Run all test suites
npm run clean      # Remove all dist/ and node_modules/
```

Run inside `apps/api/`:

```bash
npx prisma migrate dev     # Create and apply a new migration
npx prisma migrate reset   # Drop DB and re-migrate (resets seed data)
npx prisma db seed         # Re-run seed without migrating
npx prisma studio          # Open Prisma Studio GUI
npm run test:cov           # Run tests with coverage report
```

---

## Default Seed Accounts

After running `npx prisma db seed`:

| Email | Password | Role |
|-------|----------|------|
| `admin@uniqflow.com` | `Admin1234!` | SUPER_ADMIN |
| `manager@uniqflow.com` | `Manager1234!` | MANAGER |
| `editor@uniqflow.com` | `Editor1234!` | EDITOR |
| `viewer@uniqflow.com` | `Viewer1234!` | VIEWER |

---

## Deployment (Railway)

See [Railway setup guide](#railway-deployment) below.

### Services to create in Railway

| Service | Dockerfile | Notes |
|---------|------------|-------|
| `uniqflow-api` | `apps/api/Dockerfile` | Add PostgreSQL + Redis plugins |
| `uniqflow-web` | `apps/web/Dockerfile` | Build var: `VITE_API_URL` |

### API environment variables

```env
DATABASE_URL        # auto-injected by Railway PostgreSQL plugin
REDIS_URL           # auto-injected by Railway Redis plugin
JWT_SECRET          # openssl rand -base64 48
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3001
API_PREFIX=/api
CORS_ORIGIN=https://<web-service>.up.railway.app
NODE_ENV=production
```

### Web build variable

```env
VITE_API_URL=https://<api-service>.up.railway.app
```

---

## Resetting Local State

```bash
# Stop and remove containers + volumes (wipes DB)
docker compose down -v

# Restart fresh
docker compose up -d
cd apps/api && npx prisma migrate dev && npx prisma db seed
```

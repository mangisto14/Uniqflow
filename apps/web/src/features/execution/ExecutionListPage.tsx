import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { executionsApi } from '../../api/executions.api';
import { processesApi } from '../../api/processes.api';
import { t } from '../../i18n';

interface Execution {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  process: { id: string; name: string };
  stepExecutions: { id: string; status: string; step: { name: string } }[];
}

interface Process {
  id: string;
  name: string;
  status: string;
}

export function ExecutionListPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [searchParams] = useSearchParams();
  const preselectedProcessId = searchParams.get('processId');

  const load = () => {
    setLoading(true);
    Promise.all([
      executionsApi.list(1, 50) as Promise<{ data: { executions: Execution[] } }>,
      processesApi.list(1, 100) as Promise<{ data: { processes: Process[] } }>,
    ])
      .then(([e, p]) => {
        setExecutions(e.data.executions ?? []);
        setProcesses((p.data.processes ?? []).filter((pr) => pr.status === 'ACTIVE'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStart = async (processId: string) => {
    setStarting(true);
    try {
      await executionsApi.start({ processId });
      load();
    } finally {
      setStarting(false);
    }
  };

  const statusColor: Record<string, string> = {
    RUNNING: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
    PAUSED: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t.executions.title}</h1>
        {processes.length > 0 && (
          <div className="flex gap-2">
            <select
              className="input text-sm"
              defaultValue={preselectedProcessId ?? ''}
              onChange={(e) => e.target.value && handleStart(e.target.value)}
            >
              <option value="">{t.executions.runProcess}</option>
              {processes.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {starting && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 self-center" />}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : executions.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">{t.executions.noExecutions}</div>
      ) : (
        <div className="grid gap-3">
          {executions.map((ex) => {
            const done = ex.stepExecutions.filter((s) => s.status === 'COMPLETED').length;
            const total = ex.stepExecutions.length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <Link key={ex.id} to={`/executions/${ex.id}`} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{ex.process.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[ex.status] ?? 'bg-gray-100'}`}>
                        {t.executions.status[ex.status as keyof typeof t.executions.status] ?? ex.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t.executions.started} {new Date(ex.startedAt).toLocaleString('he-IL')}
                    </p>
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-600">{done}/{total} {t.executions.steps}</div>
                    <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

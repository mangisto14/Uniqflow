import { useEffect, useState } from 'react';
import { processesApi } from '../../api/processes.api';
import { executionsApi } from '../../api/executions.api';

interface Stats {
  processes: number;
  activeExecutions: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ processes: 0, activeExecutions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      processesApi.list(1, 1),
      executionsApi.list(1, 1),
    ])
      .then(([p, e]) => {
        setStats({
          processes: (p as { data: { total: number } }).data?.total ?? 0,
          activeExecutions: (e as { data: { total: number } }).data?.total ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Total Processes</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.processes}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Total Executions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeExecutions}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-500">Platform</p>
          <p className="mt-2 text-lg font-semibold text-primary-600">Uniqflow v1.0</p>
        </div>
      </div>
    </div>
  );
}

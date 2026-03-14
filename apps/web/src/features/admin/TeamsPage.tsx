import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

interface Team {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  _count?: { members: number; assignedSteps: number };
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (apiClient.get('/teams') as Promise<{ data: { data: { teams: Team[] } } }>)
      .then((r) => {
        const d = r.data?.data ?? r.data;
        setTeams((d as { teams: Team[] }).teams ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <h3 className="font-semibold text-gray-900">{t.name}</h3>
                {!t.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
              </div>
              {t.description && <p className="text-sm text-gray-500 mb-2">{t.description}</p>}
              <div className="flex gap-4 text-xs text-gray-400">
                <span>{t._count?.members ?? 0} members</span>
                <span>{t._count?.assignedSteps ?? 0} assigned steps</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

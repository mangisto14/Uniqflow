import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/auth.store';
import { t } from '../../i18n';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface InboxItem {
  id: string;
  status: string;
  startedAt: string;
  process: { name: string };
  stepExecutions: { status: string; step: { name: string; type: string } }[];
}

export function TeamDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamId = (user as unknown as Record<string, unknown>)?.teamId as string | undefined;
    if (!teamId) { setLoading(false); return; }

    Promise.all([
      apiClient.get(`/teams/${teamId}`) as Promise<{ data: { data: { members: TeamMember[] } } }>,
      apiClient.get('/executions?page=1&limit=50') as Promise<{ data: { data: { executions: InboxItem[] } } }>,
    ])
      .then(([t, e]) => {
        const team = t.data?.data ?? t.data;
        setMembers((team as { members: TeamMember[] }).members ?? []);
        const execs = (e.data?.data ?? e.data) as { executions: InboxItem[] };
        const active = (execs.executions ?? []).filter((ex) =>
          ex.stepExecutions.some((se) => se.status === 'ACTIVE'),
        );
        setInbox(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="flex justify-center h-32 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  const teamId = (user as unknown as Record<string, unknown>)?.teamId;
  if (!teamId) {
    return (
      <div className="space-y-4" dir="rtl">
        <h1 className="text-2xl font-bold text-gray-900">{t.teamDashboard.title}</h1>
        <div className="card text-center py-12 text-gray-500">{t.teamDashboard.noTeam}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900">{t.teamDashboard.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inbox */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-800">{t.teamDashboard.activeExecutions} ({inbox.length})</h2>
          {inbox.length === 0 ? (
            <p className="text-sm text-gray-500">{t.teamDashboard.noActiveWork}</p>
          ) : (
            <div className="space-y-2">
              {inbox.map((ex) => {
                const activeStep = ex.stepExecutions.find((s) => s.status === 'ACTIVE');
                return (
                  <div key={ex.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{ex.process.name}</p>
                      {activeStep && (
                        <p className="text-xs text-gray-500">
                          {t.teamDashboard.waiting}: {activeStep.step.name}
                        </p>
                      )}
                    </div>
                    <a href={`/executions/${ex.id}`} className="text-primary-600 text-xs hover:underline">{t.teamDashboard.view}</a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-800">{t.teamDashboard.teamMembers} ({members.length})</h2>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">{t.teamDashboard.noMembers}</p>
          ) : (
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{m.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

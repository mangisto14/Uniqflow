import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { processesApi } from '../../api/processes.api';
import { t } from '../../i18n';

interface Process {
  id: string;
  name: string;
  description?: string;
  status: string;
  updatedAt: string;
  _count?: { steps: number; executions: number };
}

export function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    (processesApi.list(1, 50) as Promise<{ data: { processes: Process[] } }>)
      .then((r) => setProcesses(r.data.processes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await processesApi.create({ name: newName }) as { data: { id: string } };
    setCreating(false);
    setNewName('');
    navigate(`/processes/${res.data.id}/builder`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.processes.deleteConfirm)) return;
    await processesApi.delete(id);
    load();
  };

  const handlePublish = async (id: string) => {
    await processesApi.publish(id);
    load();
  };

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t.processes.title}</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}>{t.processes.newProcess}</button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="card flex gap-3 items-center">
          <input
            autoFocus
            className="input flex-1"
            placeholder={t.processes.processName}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn-primary">{t.create}</button>
          <button type="button" className="btn-secondary" onClick={() => setCreating(false)}>{t.cancel}</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center h-32 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : processes.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">{t.processes.noProcesses}</div>
      ) : (
        <div className="grid gap-4">
          {processes.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.processes.status[p.status as keyof typeof t.processes.status] ?? p.status}
                  </span>
                </div>
                {p.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{p.description}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {p._count?.steps ?? 0} {t.processes.steps} · {p._count?.executions ?? 0} {t.processes.executions}
                </p>
              </div>
              <div className="flex items-center gap-2 mr-4">
                <Link to={`/processes/${p.id}/builder`} className="btn-secondary text-sm">{t.edit}</Link>
                {p.status === 'DRAFT' && (
                  <button onClick={() => handlePublish(p.id)} className="btn-primary text-sm">{t.processes.publish}</button>
                )}
                {p.status === 'ACTIVE' && (
                  <Link to={`/executions/new?processId=${p.id}`} className="btn-primary text-sm">{t.processes.run}</Link>
                )}
                <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-sm px-2">{t.delete}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { processesApi } from '../../api/processes.api';
import { svgTemplatesApi } from '../../api/svg-templates.api';
import { t } from '../../i18n';

interface Process {
  id: string;
  name: string;
  description?: string;
  status: string;
  updatedAt: string;
  _count?: { steps: number; executions: number };
}

interface SvgAttachment {
  id: string;
  template: { id: string; name: string; description?: string; svgContent: string };
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
                <SvgAttachmentsButton processId={p.id} processName={p.name} />
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

// ── SVG Attachments Button + Panel ────────────────────────────────────────────
function SvgAttachmentsButton({ processId, processName }: { processId: string; processName: string }) {
  const [open, setOpen] = useState(false);
  const [attachments, setAttachments] = useState<SvgAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewAtt, setPreviewAtt] = useState<SvgAttachment | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await svgTemplatesApi.getProcessAttachments(processId) as unknown;
      const list = (res as { data: { data: SvgAttachment[] } }).data?.data ??
                   (res as { data: SvgAttachment[] }).data ?? [];
      setAttachments(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    load();
  };

  const handleDetach = async (templateId: string) => {
    await svgTemplatesApi.detachFromProcess(templateId, processId);
    setAttachments((prev) => prev.filter((a) => a.template.id !== templateId));
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors font-medium"
        title="נספחי SVG"
      >
        📎 נספחים
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">נספחי SVG — {processName}</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setOpen(false)}>✕</button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">טוען...</div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-4xl mb-2">📎</div>
                <p>אין נספחים לתהליך זה</p>
                <p className="text-xs mt-1">עבור לגלריית הטמפלטים כדי לצרף</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors">
                    <div
                      className="w-16 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 cursor-pointer flex-shrink-0"
                      onClick={() => setPreviewAtt(att)}
                      dangerouslySetInnerHTML={{ __html: att.template.svgContent }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{att.template.name}</p>
                      {att.template.description && (
                        <p className="text-xs text-gray-500 truncate">{att.template.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-xs text-indigo-600 hover:underline"
                        onClick={() => setPreviewAtt(att)}
                      >
                        צפה
                      </button>
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => handleDetach(att.template.id)}
                      >
                        הסר
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button className="btn-secondary" onClick={() => setOpen(false)}>סגור</button>
            </div>
          </div>
        </div>
      )}

      {previewAtt && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{previewAtt.template.name}</h3>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setPreviewAtt(null)}>✕</button>
            </div>
            <div className="border border-gray-200 rounded-xl bg-gray-50 p-4 flex items-center justify-center min-h-[200px]">
              <div
                className="w-full"
                dangerouslySetInnerHTML={{ __html: previewAtt.template.svgContent }}
              />
            </div>
            <div className="flex justify-end">
              <button className="btn-secondary" onClick={() => setPreviewAtt(null)}>סגור</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

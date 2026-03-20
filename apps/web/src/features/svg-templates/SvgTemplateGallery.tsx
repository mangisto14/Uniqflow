import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { svgTemplatesApi } from '../../api/svg-templates.api';
import { processesApi } from '../../api/processes.api';
import { t } from '../../i18n';

interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  isBuiltIn?: boolean;
  createdAt: string;
  createdBy?: { name: string };
}

interface ProcessSummary {
  id: string;
  name: string;
  status: string;
}

export function SvgTemplateGallery() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [attachTarget, setAttachTarget] = useState<TemplateSummary | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateSummary | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await svgTemplatesApi.list(1, 50) as { data: { templates: TemplateSummary[] } };
      setTemplates(res.data?.templates ?? (res as unknown as { templates: TemplateSummary[] }).templates ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק טמפלט זה?')) return;
    await svgTemplatesApi.delete(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClone = async (tpl: TemplateSummary) => {
    const res = await svgTemplatesApi.clone(tpl.id) as { data: { id: string; name: string } };
    const cloned = (res as unknown as { data: { data: { id: string } } }).data?.data ?? (res as unknown as { data: { id: string } }).data;
    fetchTemplates();
    navigate(`/svg-templates/${cloned.id}/edit`);
  };

  // Split built-in vs custom
  const builtIn = templates.filter((t) => t.isBuiltIn);
  const custom = templates.filter((t) => !t.isBuiltIn);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t.svgTemplates.title}</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          {t.svgTemplates.newTemplate}
        </button>
      </div>

      {showCreate && (
        <CreateTemplateModal
          onClose={() => setShowCreate(false)}
          onCreated={(tpl) => {
            setShowCreate(false);
            navigate(`/svg-templates/${tpl.id}/edit`);
          }}
        />
      )}

      {attachTarget && (
        <AttachToProcessModal
          template={attachTarget}
          onClose={() => setAttachTarget(null)}
        />
      )}

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onClone={() => { setPreviewTemplate(null); handleClone(previewTemplate); }}
          onAttach={() => { setPreviewTemplate(null); setAttachTarget(previewTemplate); }}
          onEdit={() => { setPreviewTemplate(null); navigate(`/svg-templates/${previewTemplate.id}/edit`); }}
        />
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-12">{t.loading}</div>
      ) : (
        <>
          {/* Built-in templates */}
          {builtIn.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">תבניות מובנות</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">מוכן לשימוש</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {builtIn.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    onPreview={() => setPreviewTemplate(tpl)}
                    onClone={() => handleClone(tpl)}
                    onAttach={() => setAttachTarget(tpl)}
                    onEdit={() => navigate(`/svg-templates/${tpl.id}/edit`)}
                    onDelete={() => handleDelete(tpl.id)}
                    isBuiltIn
                  />
                ))}
              </div>
            </section>
          )}

          {/* Custom templates */}
          {custom.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">תבניות מותאמות אישית</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {custom.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    onPreview={() => setPreviewTemplate(tpl)}
                    onClone={() => handleClone(tpl)}
                    onAttach={() => setAttachTarget(tpl)}
                    onEdit={() => navigate(`/svg-templates/${tpl.id}/edit`)}
                    onDelete={() => handleDelete(tpl.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {templates.length === 0 && (
            <div className="card text-center py-16 text-gray-400">{t.svgTemplates.noTemplates}</div>
          )}
        </>
      )}
    </div>
  );
}

// ── Template Card ─────────────────────────────────────────────────────────────
interface CardProps {
  tpl: TemplateSummary;
  isBuiltIn?: boolean;
  onPreview: () => void;
  onClone: () => void;
  onAttach: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TemplateCard({ tpl, isBuiltIn, onPreview, onClone, onAttach, onEdit, onDelete }: CardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Preview area */}
      <div
        className="h-36 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer relative group"
        onClick={onPreview}
      >
        {tpl.thumbnail ? (
          <img src={tpl.thumbnail} alt={tpl.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-5xl">{isBuiltIn ? (tpl.name.includes('טנדר') ? '🚛' : '👷') : '🗺️'}</span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded transition-opacity">
            תצוגה מקדימה
          </span>
        </div>
        {isBuiltIn && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            מובנה
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
        {tpl.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{tpl.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {tpl.createdBy?.name} · {new Date(tpl.createdAt).toLocaleDateString('he-IL')}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 flex-wrap border-t border-gray-100 pt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${tpl.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {tpl.isActive ? t.svgTemplates.active : t.svgTemplates.inactive}
        </span>
        <div className="flex-1" />
        <button
          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
          onClick={onClone}
          title="שכפל לעותק חדש שניתן לערוך"
        >
          שכפל
        </button>
        <button
          className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-0.5 rounded transition-colors"
          onClick={onAttach}
          title="צרף לתהליך"
        >
          צרף לתהליך
        </button>
        {!isBuiltIn && (
          <button className="text-xs text-primary-600 hover:underline" onClick={onEdit}>
            {t.edit}
          </button>
        )}
        {!isBuiltIn && (
          <button className="text-xs text-red-500 hover:underline" onClick={onDelete}>
            {t.delete}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
interface PreviewModalProps {
  template: TemplateSummary;
  onClose: () => void;
  onClone: () => void;
  onAttach: () => void;
  onEdit: () => void;
}

function TemplatePreviewModal({ template, onClose, onClone, onAttach, onEdit }: PreviewModalProps) {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    svgTemplatesApi.get(template.id).then((res) => {
      const tpl = (res as unknown as { data: { data: { svgContent: string } } }).data?.data ??
                  (res as unknown as { data: { svgContent: string } }).data;
      setSvgContent(tpl.svgContent ?? '');
    });
  }, [template.id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{template.name}</h2>
          <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={onClose}>✕</button>
        </div>

        {template.description && (
          <p className="text-sm text-gray-500">{template.description}</p>
        )}

        <div className="border border-gray-200 rounded-xl bg-gray-50 p-3 flex items-center justify-center min-h-[200px]">
          {svgContent ? (
            <div className="w-full max-h-64 overflow-hidden" dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : (
            <div className="text-gray-300 text-4xl">{template.name.includes('טנדר') ? '🚛' : '👷'}</div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button className="btn-secondary flex-1" onClick={onClose}>סגור</button>
          <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors" onClick={onClone}>
            שכפל לעריכה
          </button>
          <button className="btn-primary flex-1" onClick={onAttach}>
            צרף לתהליך
          </button>
          {!template.isBuiltIn && (
            <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors" onClick={onEdit}>
              {t.edit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Attach to Process Modal ───────────────────────────────────────────────────
interface AttachModalProps {
  template: TemplateSummary;
  onClose: () => void;
}

function AttachToProcessModal({ template, onClose }: AttachModalProps) {
  const [processes, setProcesses] = useState<ProcessSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [attaching, setAttaching] = useState<string | null>(null);
  const [attached, setAttached] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    (processesApi.list(1, 100) as Promise<{ data: { processes: ProcessSummary[] } }>)
      .then((r) => setProcesses(r.data.processes ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAttach = async (processId: string) => {
    if (attached.has(processId)) return;
    setAttaching(processId);
    try {
      await svgTemplatesApi.attachToProcess(template.id, processId);
      setAttached((prev) => new Set([...prev, processId]));
    } finally {
      setAttaching(null);
    }
  };

  const filtered = processes.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const statusLabel: Record<string, string> = {
    DRAFT: 'טיוטה',
    ACTIVE: 'פעיל',
    PAUSED: 'מושהה',
    COMPLETED: 'הושלם',
    CANCELLED: 'בוטל',
  };

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-700',
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-gray-100 text-gray-600',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            צרף <span className="text-primary-600">"{template.name}"</span> לתהליך
          </h2>
          <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={onClose}>✕</button>
        </div>

        <input
          className="input"
          placeholder="חיפוש תהליך..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-400">{t.loading}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400">לא נמצאו תהליכים</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{p.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColor[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </div>
                <button
                  onClick={() => handleAttach(p.id)}
                  disabled={attaching === p.id || attached.has(p.id)}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    attached.has(p.id)
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {attaching === p.id ? '...' : attached.has(p.id) ? '✓ צורף' : 'צרף'}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button className="btn-secondary" onClick={onClose}>סגור</button>
        </div>
      </div>
    </div>
  );
}

// ── Create Template Modal ─────────────────────────────────────────────────────
interface CreateModalProps {
  onClose: () => void;
  onCreated: (tpl: { id: string }) => void;
}

function CreateTemplateModal({ onClose, onCreated }: CreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSvgContent(ev.target?.result as string);
    reader.readAsText(file);
    if (!name) setName(file.name.replace('.svg', ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!svgContent) return;
    setSaving(true);
    try {
      const res = await svgTemplatesApi.create({ name, description, svgContent }) as { data: { data: { id: string } } };
      const tpl = res.data?.data ?? res.data;
      onCreated(tpl);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold">{t.svgTemplates.newTemplate}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">{t.svgTemplates.templateName}</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">{t.description}</label>
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">{t.svgTemplates.uploadSvg}</label>
            <input ref={fileRef} type="file" accept=".svg,image/svg+xml" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-secondary w-full"
            >
              {svgContent ? '✓ SVG נטען' : t.svgTemplates.uploadSvg}
            </button>
          </div>
          {svgContent && (
            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 h-28 overflow-hidden flex items-center justify-center">
              <div
                className="max-h-full max-w-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>{t.cancel}</button>
            <button type="submit" className="btn-primary" disabled={saving || !svgContent}>
              {saving ? t.loading : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

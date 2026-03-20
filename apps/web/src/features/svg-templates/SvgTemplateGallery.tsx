import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { svgTemplatesApi } from '../../api/svg-templates.api';
import { t } from '../../i18n';

interface TemplateSummary {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: { name: string };
}

export function SvgTemplateGallery() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

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

      {loading ? (
        <div className="text-gray-500 text-center py-12">{t.loading}</div>
      ) : templates.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">{t.svgTemplates.noTemplates}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="card hover:shadow-md transition-shadow flex flex-col gap-3">
              {/* Thumbnail / placeholder */}
              <div
                className="h-36 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => navigate(`/svg-templates/${tpl.id}/edit`)}
              >
                {tpl.thumbnail ? (
                  <img src={tpl.thumbnail} alt={tpl.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-4xl text-gray-300">🗺️</span>
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

              <div className="flex gap-2 border-t border-gray-100 pt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${tpl.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {tpl.isActive ? t.svgTemplates.active : t.svgTemplates.inactive}
                </span>
                <div className="flex-1" />
                <button
                  className="text-xs text-primary-600 hover:underline"
                  onClick={() => navigate(`/svg-templates/${tpl.id}/edit`)}
                >
                  {t.edit}
                </button>
                <button
                  className="text-xs text-red-500 hover:underline"
                  onClick={() => handleDelete(tpl.id)}
                >
                  {t.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

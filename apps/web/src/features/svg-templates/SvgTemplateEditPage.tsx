import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { svgTemplatesApi } from '../../api/svg-templates.api';
import { SvgPointEditor, SvgPoint } from './SvgPointEditor';
import { t } from '../../i18n';

interface Template {
  id: string;
  name: string;
  description?: string;
  svgContent: string;
  pointsConfig: SvgPoint[];
  isActive: boolean;
}

export function SvgTemplateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState<SvgPoint[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    svgTemplatesApi.get(id).then((res) => {
      const tpl = (res as unknown as { data: { data: Template } }).data?.data ??
                  (res as unknown as { data: Template }).data;
      setTemplate(tpl);
      setName(tpl.name);
      setDescription(tpl.description ?? '');
      setPoints(tpl.pointsConfig ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await svgTemplatesApi.update(id, { name, description, pointsConfig: points });
      navigate('/svg-templates');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{t.loading}</div>;
  if (!template) return <div className="text-center py-20 text-gray-400">טמפלט לא נמצא</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button className="btn-secondary text-sm" onClick={() => navigate('/svg-templates')}>
          {t.back}
        </button>
        <input
          className="input flex-1 max-w-xs font-semibold"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.svgTemplates.templateName}
        />
        <input
          className="input flex-1 max-w-sm text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.description}
        />
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? t.loading : t.svgTemplates.saveTemplate}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 card overflow-hidden">
        <SvgPointEditor
          svgContent={template.svgContent}
          points={points}
          onChange={setPoints}
        />
      </div>

      {/* Footer summary */}
      <div className="text-xs text-gray-400 text-left">
        {points.length} נקודות מוגדרות
      </div>
    </div>
  );
}

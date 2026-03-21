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
  isBuiltIn?: boolean;
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    svgTemplatesApi.get(id).then((res) => {
      const tpl =
        (res as unknown as { data: { data: Template } }).data?.data ??
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400" dir="rtl">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400" dir="rtl">
        <div className="text-center space-y-3">
          <p className="text-4xl">🔍</p>
          <p>טמפלט לא נמצא</p>
          <button className="btn-secondary text-sm" onClick={() => navigate('/svg-templates')}>חזור לגלריה</button>
        </div>
      </div>
    );
  }

  const isBuiltIn = !!template.isBuiltIn;

  return (
    <div className="flex flex-col gap-4" style={{ minHeight: 'calc(100vh - 9rem)' }} dir="rtl">

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button className="btn-secondary text-sm flex-shrink-0" onClick={() => navigate('/svg-templates')}>
          ← {t.back}
        </button>

        {isBuiltIn ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex-shrink-0">מובנה</span>
            <h1 className="font-semibold text-gray-800 truncate">{template.name}</h1>
          </div>
        ) : (
          <>
            <input
              className="input font-semibold flex-1 min-w-[140px] max-w-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם הטמפלט"
            />
            <input
              className="input text-sm flex-1 min-w-[160px] max-w-sm hidden sm:block"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר (אופציונלי)"
            />
          </>
        )}

        <div className="flex items-center gap-2 flex-shrink-0 mr-auto">
          {saved && <span className="text-sm text-green-600 font-medium">✓ נשמר!</span>}
          {!isBuiltIn && (
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving
                ? <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> שומר...</span>
                : t.svgTemplates.saveTemplate
              }
            </button>
          )}
        </div>
      </div>

      {/* Mobile description field */}
      {!isBuiltIn && (
        <input
          className="input text-sm sm:hidden"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="תיאור קצר (אופציונלי)"
        />
      )}

      {/* Built-in notice */}
      {isBuiltIn && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-blue-500 text-base flex-shrink-0 mt-0.5">ℹ️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-800">טמפלט מובנה — לא ניתן לערוך ישירות</p>
            <p className="text-xs text-blue-600 mt-0.5">שכפל ליצירת עותק אישי עם אפשרות עריכה.</p>
          </div>
          <button
            className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            onClick={async () => {
              const res = await svgTemplatesApi.clone(id!) as unknown as { data: { id: string } | { data: { id: string } } };
              const cloned = (res as unknown as { data: { data: { id: string } } }).data?.data ?? (res as unknown as { data: { id: string } }).data;
              navigate(`/svg-templates/${cloned.id}/edit`);
            }}
          >
            🔀 שכפל וערוך
          </button>
        </div>
      )}

      {/* Point editor */}
      <div className="card flex-1 overflow-hidden" style={{ minHeight: 420 }}>
        <SvgPointEditor
          svgContent={template.svgContent}
          points={points}
          onChange={isBuiltIn ? () => {} : setPoints}
          readOnly={isBuiltIn}
        />
      </div>

      {/* Footer */}
      {!isBuiltIn && (
        <div className="flex items-center justify-between text-xs text-gray-400 pb-2">
          <span>{points.length} נקודות מוגדרות</span>
          <span>שינויים לא נשמרים אוטומטית</span>
        </div>
      )}
    </div>
  );
}

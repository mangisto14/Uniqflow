import { useEffect, useState } from 'react';
import { svgTemplatesApi } from '../../api/svg-templates.api';
import { t } from '../../i18n';

interface SvgPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  fieldType: string;
}

interface Props {
  templateId: string;
  formData: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
  onSubmit: () => void;
  submitting?: boolean;
}

export function SvgStepInteraction({ templateId, formData, onChange, onSubmit, submitting }: Props) {
  const [svgContent, setSvgContent] = useState('');
  const [points, setPoints] = useState<SvgPoint[]>([]);
  const [activePoint, setActivePoint] = useState<SvgPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    svgTemplatesApi.get(templateId).then((res) => {
      const tpl = (res as unknown as { data: { data: { svgContent: string; pointsConfig: SvgPoint[] } } }).data?.data ??
                  (res as unknown as { data: { svgContent: string; pointsConfig: SvgPoint[] } }).data;
      setSvgContent(tpl.svgContent ?? '');
      setPoints(tpl.pointsConfig ?? []);
    }).finally(() => setLoading(false));
  }, [templateId]);

  if (loading) return <div className="text-gray-400 text-sm">{t.loading}</div>;

  const filledCount = points.filter((p) => !!formData[p.id]).length;

  return (
    <div className="space-y-4" dir="rtl">
      <p className="text-xs text-gray-500">
        {t.svgTemplates.fillPoints} · {filledCount}/{points.length} מולאו
      </p>

      {/* SVG with clickable pins */}
      <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50" style={{ minHeight: 300 }}>
        <div className="w-full h-full" style={{ pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: svgContent }} />

        {points.map((pt, i) => {
          const filled = !!formData[pt.id];
          return (
            <div
              key={pt.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              onClick={() => setActivePoint(activePoint?.id === pt.id ? null : pt)}
            >
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold shadow-md transition-transform hover:scale-110 ${
                filled ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'
              } ${activePoint?.id === pt.id ? 'scale-125' : ''}`}>
                {filled ? '✓' : i + 1}
              </div>
              <div className="absolute top-full mt-0.5 right-1/2 translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                {pt.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active point input */}
      {activePoint && (
        <div className="card border border-primary-200 bg-primary-50 space-y-2">
          <p className="font-medium text-sm text-primary-800">{activePoint.label}</p>
          <input
            className="input"
            type={activePoint.fieldType === 'number' ? 'number' : activePoint.fieldType === 'date' ? 'date' : 'text'}
            value={formData[activePoint.id] ?? ''}
            onChange={(e) => onChange({ ...formData, [activePoint.id]: e.target.value })}
            placeholder={activePoint.label}
            autoFocus
          />
          <button
            className="text-xs text-primary-600 hover:underline"
            onClick={() => setActivePoint(null)}
          >
            סגור
          </button>
        </div>
      )}

      {/* Points list (quick fill) */}
      <div className="space-y-2">
        {points.map((pt) => (
          <div key={pt.id} className="flex items-center gap-3">
            <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 ${
              formData[pt.id] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {formData[pt.id] ? '✓' : ''}
            </span>
            <label className="text-sm text-gray-700 w-28 flex-shrink-0">{pt.label}</label>
            <input
              className="input flex-1 text-sm py-1"
              type={pt.fieldType === 'number' ? 'number' : pt.fieldType === 'date' ? 'date' : 'text'}
              value={formData[pt.id] ?? ''}
              onChange={(e) => onChange({ ...formData, [pt.id]: e.target.value })}
              placeholder={pt.label}
            />
          </div>
        ))}
      </div>

      <button onClick={onSubmit} disabled={submitting} className="btn-primary w-full">
        {submitting ? t.steps.submitting : t.steps.submit}
      </button>
    </div>
  );
}

import { useRef, useState } from 'react';
import { t } from '../../i18n';

export interface SvgPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  fieldType: string;
}

const FIELD_TYPES = ['text', 'number', 'email', 'date', 'select', 'textarea', 'checkbox'];

interface Props {
  svgContent: string;
  points: SvgPoint[];
  onChange: (points: SvgPoint[]) => void;
}

export function SvgPointEditor({ svgContent, points, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingPoint, setEditingPoint] = useState<SvgPoint | null>(null);

  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Only add if clicking directly on SVG (not on a pin)
    if ((e.target as HTMLElement).closest('.svg-pin')) return;

    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newPoint: SvgPoint = {
      id: `pt-${Date.now()}`,
      label: `נקודה ${points.length + 1}`,
      x,
      y,
      fieldType: 'text',
    };
    const updated = [...points, newPoint];
    onChange(updated);
    setEditingPoint(newPoint);
    setSelectedId(newPoint.id);
  };

  const updatePoint = (id: string, patch: Partial<SvgPoint>) => {
    const updated = points.map((p) => (p.id === id ? { ...p, ...patch } : p));
    onChange(updated);
    if (editingPoint?.id === id) setEditingPoint((prev) => prev ? { ...prev, ...patch } : prev);
  };

  const removePoint = (id: string) => {
    onChange(points.filter((p) => p.id !== id));
    if (selectedId === id) { setSelectedId(null); setEditingPoint(null); }
  };

  const selectedPoint = points.find((p) => p.id === selectedId);

  return (
    <div className="flex gap-4 h-full" dir="rtl">
      {/* SVG canvas */}
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-xs text-gray-500">{t.svgTemplates.clickToPlace}</p>
        <div
          ref={containerRef}
          className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 cursor-crosshair select-none"
          style={{ minHeight: 360 }}
          onClick={handleSvgClick}
        >
          {/* SVG content */}
          <div
            className="w-full h-full"
            style={{ pointerEvents: 'none' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />

          {/* Point pins */}
          {points.map((pt) => (
            <div
              key={pt.id}
              className={`svg-pin absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(pt.id);
                setEditingPoint(pt);
              }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform ${
                  selectedId === pt.id
                    ? 'bg-primary-600 border-primary-800 scale-125'
                    : 'bg-red-500 border-red-700 hover:scale-110'
                }`}
              >
                {points.indexOf(pt) + 1}
              </div>
              <div className="absolute top-full mt-0.5 right-1/2 translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                {pt.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points list + editor */}
      <div className="w-60 flex flex-col gap-3">
        <h3 className="font-semibold text-sm text-gray-700">{t.svgTemplates.pointsConfig}</h3>

        {points.length === 0 ? (
          <p className="text-xs text-gray-400">{t.svgTemplates.noPoints}</p>
        ) : (
          <div className="space-y-1 overflow-y-auto flex-1">
            {points.map((pt, i) => (
              <div
                key={pt.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors ${
                  selectedId === pt.id ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => { setSelectedId(pt.id); setEditingPoint(pt); }}
              >
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-gray-800">{pt.label}</span>
                <button
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  onClick={(e) => { e.stopPropagation(); removePoint(pt.id); }}
                  title={t.svgTemplates.deletePoint}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Inline editor for selected point */}
        {selectedPoint && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="text-xs font-medium text-gray-600">עריכת נקודה {points.indexOf(selectedPoint) + 1}</p>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">{t.svgTemplates.pointLabel}</label>
              <input
                className="input text-sm"
                value={selectedPoint.label}
                onChange={(e) => updatePoint(selectedPoint.id, { label: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">{t.svgTemplates.pointFieldType}</label>
              <select
                className="input text-sm"
                value={selectedPoint.fieldType}
                onChange={(e) => updatePoint(selectedPoint.id, { fieldType: e.target.value })}
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400">
              מיקום: {selectedPoint.x}%, {selectedPoint.y}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

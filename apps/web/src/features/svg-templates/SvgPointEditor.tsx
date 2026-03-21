import { useRef, useState, useCallback } from 'react';

export interface SvgPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  fieldType: string;
  description?: string;
}

const FIELD_TYPES: { value: string; label: string }[] = [
  { value: 'text',     label: 'טקסט' },
  { value: 'number',   label: 'מספר' },
  { value: 'textarea', label: 'טקסט חופשי' },
  { value: 'date',     label: 'תאריך' },
  { value: 'select',   label: 'בחירה מרשימה' },
  { value: 'checkbox', label: 'כן / לא' },
  { value: 'email',    label: 'אימייל' },
];

interface Props {
  svgContent: string;
  points: SvgPoint[];
  onChange: (points: SvgPoint[]) => void;
  readOnly?: boolean;
}

export function SvgPointEditor({ svgContent, points, onChange, readOnly = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const selectedPoint = points.find((p) => p.id === selectedId) ?? null;

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if ((e.target as HTMLElement).closest('[data-pin]')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const newPoint: SvgPoint = {
      id: `pt-${Date.now()}`,
      label: `נקודה ${points.length + 1}`,
      x, y,
      fieldType: 'text',
    };
    onChange([...points, newPoint]);
    setSelectedId(newPoint.id);
  }, [readOnly, points, onChange]);

  const handlePinMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (readOnly) return;
    setDraggingId(id);
    setSelectedId(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const onMouseMove = (ev: MouseEvent) => {
      const x = Math.max(0, Math.min(100, Math.round(((ev.clientX - rect.left) / rect.width) * 100)));
      const y = Math.max(0, Math.min(100, Math.round(((ev.clientY - rect.top) / rect.height) * 100)));
      onChange(points.map((p) => p.id === id ? { ...p, x, y } : p));
    };
    const onMouseUp = () => {
      setDraggingId(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [readOnly, points, onChange]);

  const updatePoint = (id: string, patch: Partial<SvgPoint>) =>
    onChange(points.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const removePoint = (id: string) => {
    onChange(points.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0" dir="rtl">

      {/* ── SVG Canvas ── */}
      <div className="flex-1 flex flex-col min-h-0 gap-2">
        {!readOnly && (
          <p className="text-xs text-gray-500 flex-shrink-0">
            💡 לחץ על המודל להוספת נקודה · גרור נקודה קיימת לשינוי מיקום
          </p>
        )}
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          className={[
            'relative flex-1 rounded-xl overflow-hidden bg-gray-50 select-none',
            readOnly
              ? 'border border-gray-200 cursor-default'
              : 'border-2 border-dashed border-primary-300 hover:border-primary-400 transition-colors',
            draggingId ? 'cursor-grabbing' : readOnly ? '' : 'cursor-crosshair',
          ].join(' ')}
          style={{ minHeight: 300 }}
        >
          {/* SVG */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center p-3"
            style={{ pointerEvents: 'none' }}
            dangerouslySetInnerHTML={{ __html: svgContent || '' }}
          />

          {/* Pins */}
          {points.map((pt, i) => {
            const sel = selectedId === pt.id;
            return (
              <div
                key={pt.id}
                data-pin="true"
                className="absolute z-10"
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: readOnly ? 'default' : draggingId === pt.id ? 'grabbing' : 'grab',
                }}
                onMouseDown={(e) => handlePinMouseDown(e, pt.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedId(pt.id); }}
              >
                <div className={[
                  'w-7 h-7 rounded-full border-2 flex items-center justify-center',
                  'text-white text-xs font-bold shadow-lg transition-all duration-100',
                  sel
                    ? 'bg-primary-600 border-primary-800 scale-125 ring-2 ring-primary-300 ring-offset-1'
                    : 'bg-red-500 border-red-700 hover:scale-110',
                ].join(' ')}>
                  {i + 1}
                </div>
                <div className="absolute top-full mt-1 right-1/2 translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                  {pt.label}
                </div>
              </div>
            );
          })}

          {points.length === 0 && !readOnly && (
            <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
              <div className="bg-white/90 rounded-xl px-4 py-2 text-sm text-gray-400 shadow border border-gray-100">
                לחץ על המודל להוספת נקודה ראשונה
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Panel: list + editor ── */}
      <div className="lg:w-64 flex flex-col gap-3 flex-shrink-0 min-h-0">
        <h3 className="font-semibold text-sm text-gray-700 flex-shrink-0">
          נקודות{' '}
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-normal">
            {points.length}
          </span>
        </h3>

        {/* List */}
        <div className="overflow-y-auto flex-1 space-y-1 min-h-0" style={{ maxHeight: 200 }}>
          {points.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              {readOnly ? 'אין נקודות' : 'לחץ על המודל להוספה'}
            </p>
          ) : points.map((pt, i) => (
            <div
              key={pt.id}
              onClick={() => setSelectedId(pt.id === selectedId ? null : pt.id)}
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all',
                selectedId === pt.id
                  ? 'bg-primary-50 border border-primary-200 shadow-sm'
                  : 'hover:bg-gray-50 border border-transparent',
              ].join(' ')}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${selectedId === pt.id ? 'bg-primary-600' : 'bg-red-500'}`}>
                {i + 1}
              </span>
              <span className="flex-1 truncate text-gray-800">{pt.label}</span>
              <span className="text-[10px] text-gray-400">{FIELD_TYPES.find(f => f.value === pt.fieldType)?.label ?? pt.fieldType}</span>
              {!readOnly && (
                <button
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  onClick={(e) => { e.stopPropagation(); removePoint(pt.id); }}
                >✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Edit panel */}
        {selectedPoint && !readOnly && (
          <div className="border-t border-gray-100 pt-3 space-y-3 flex-shrink-0">
            <p className="text-xs font-semibold text-primary-700">
              עריכת נקודה {points.indexOf(selectedPoint) + 1}
            </p>

            <div>
              <label className="text-xs text-gray-500 block mb-1">שם / תווית *</label>
              <input
                className="input text-sm"
                value={selectedPoint.label}
                onChange={(e) => updatePoint(selectedPoint.id, { label: e.target.value })}
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">סוג שדה</label>
              <select
                className="input text-sm"
                value={selectedPoint.fieldType}
                onChange={(e) => updatePoint(selectedPoint.id, { fieldType: e.target.value })}
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">הוראות (אופציונלי)</label>
              <textarea
                className="input text-sm resize-none"
                rows={2}
                value={selectedPoint.description ?? ''}
                onChange={(e) => updatePoint(selectedPoint.id, { description: e.target.value })}
                placeholder="מה למלא בנקודה זו..."
              />
            </div>

            <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-2 py-1.5 flex justify-between">
              <span>מיקום: {selectedPoint.x}%, {selectedPoint.y}%</span>
              <span>גרור לשינוי</span>
            </div>

            <button
              onClick={() => removePoint(selectedPoint.id)}
              className="w-full text-xs text-red-500 hover:bg-red-50 rounded-lg py-1.5 transition-colors border border-red-100"
            >
              מחק נקודה זו
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

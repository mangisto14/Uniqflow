import { useState } from 'react'
import type { ModelPoint, PointField } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface PointEditorProps {
  point: ModelPoint
  allPointIds: string[]
  onChange: (updated: ModelPoint) => void
  onRemove: () => void
}

export function PointEditor({ point, allPointIds, onChange, onRemove }: PointEditorProps) {
  const [expanded, setExpanded] = useState(false)

  const update = (partial: Partial<ModelPoint>) => onChange({ ...point, ...partial })

  const addField = () => {
    const newField: PointField = { name: `field_${Date.now()}`, label: 'New Field', field_type: 'text', required: false }
    update({ fields: [...point.fields, newField] })
  }

  const updateField = (idx: number, partial: Partial<PointField>) => {
    const fields = point.fields.map((f, i) => (i === idx ? { ...f, ...partial } : f))
    update({ fields })
  }

  const removeField = (idx: number) => {
    update({ fields: point.fields.filter((_, i) => i !== idx) })
  }

  const toggleNextPoint = (pid: string) => {
    const next = point.next_points.includes(pid)
      ? point.next_points.filter((p) => p !== pid)
      : [...point.next_points, pid]
    update({ next_points: next })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="font-medium text-gray-800">{point.label || 'Unnamed Point'}</span>
          <span className="text-xs text-gray-400">({point.point_id})</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {point.fields.length} fields
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove() }} className="rounded p-1 text-red-400 hover:bg-red-50">
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Point ID"
              value={point.point_id}
              onChange={(e) => update({ point_id: e.target.value })}
              placeholder="engine"
            />
            <Input
              label="Label"
              value={point.label}
              onChange={(e) => update({ label: e.target.value })}
              placeholder="Engine"
            />
          </div>
          <Input
            label="Description"
            value={point.description ?? ''}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Optional description"
          />

          {/* Coordinates */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">POSITION (% of model area)</p>
            <div className="grid grid-cols-3 gap-3">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis}>
                  <label className="text-xs text-gray-500 uppercase">{axis}</label>
                  <input
                    type="number"
                    min={0}
                    max={axis !== 'z' ? 100 : 1000}
                    value={point.coordinates[axis]}
                    onChange={(e) => update({ coordinates: { ...point.coordinates, [axis]: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">FIELDS</p>
              <Button type="button" size="sm" variant="secondary" onClick={addField}>
                <Plus size={12} /> Add Field
              </Button>
            </div>
            {point.fields.length === 0 ? (
              <p className="text-xs text-gray-400">No fields yet.</p>
            ) : (
              <div className="space-y-2">
                {point.fields.map((field, idx) => (
                  <FieldRow key={idx} field={field} onUpdate={(p) => updateField(idx, p)} onRemove={() => removeField(idx)} />
                ))}
              </div>
            )}
          </div>

          {/* Next points (branching) */}
          {allPointIds.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">NEXT POINTS (branching)</p>
              <div className="flex flex-wrap gap-2">
                {allPointIds.filter((pid) => pid !== point.point_id).map((pid) => (
                  <label key={pid} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={point.next_points.includes(pid)}
                      onChange={() => toggleNextPoint(pid)}
                      className="h-3 w-3"
                    />
                    {pid}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Field row ──────────────────────────────────────────────────────────────────

function FieldRow({ field, onUpdate, onRemove }: { field: PointField; onUpdate: (p: Partial<PointField>) => void; onRemove: () => void }) {
  const inputCls = 'rounded-lg border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none'

  return (
    <div className="grid grid-cols-12 gap-2 items-center rounded-lg border border-gray-200 bg-white p-2">
      <input className={`col-span-3 ${inputCls}`} placeholder="name" value={field.name} onChange={(e) => onUpdate({ name: e.target.value })} />
      <input className={`col-span-3 ${inputCls}`} placeholder="Label" value={field.label} onChange={(e) => onUpdate({ label: e.target.value })} />
      <select className={`col-span-3 ${inputCls}`} value={field.field_type} onChange={(e) => onUpdate({ field_type: e.target.value as PointField['field_type'] })}>
        {['text','number','select','date','textarea','checkbox'].map((t) => <option key={t}>{t}</option>)}
      </select>
      {field.field_type === 'select' && (
        <input
          className={`col-span-2 ${inputCls}`}
          placeholder="opt1,opt2"
          value={(field.options ?? []).join(',')}
          onChange={(e) => onUpdate({ options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
        />
      )}
      <label className="col-span-1 flex cursor-pointer items-center gap-1 text-xs text-gray-500">
        <input type="checkbox" checked={field.required} onChange={(e) => onUpdate({ required: e.target.checked })} className="h-3 w-3" />
        req
      </label>
      <button type="button" onClick={onRemove} className="col-span-1 flex justify-end text-red-400 hover:text-red-600">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

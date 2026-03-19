import { useState } from 'react'
import type { ModelTemplate, ModelPoint, ModelType, ModelCategory } from '../../types'
import { modelsApi } from '../../api/models.api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PointEditor } from './PointEditor'
import { InteractiveSVG } from '../../components/ModelViewer/InteractiveSVG'
import { Plus, Save, Eye } from 'lucide-react'

interface TemplateEditorProps {
  initial?: ModelTemplate
  onSaved: (m: ModelTemplate) => void
  onCancel: () => void
}

const emptyTemplate = (): Omit<ModelTemplate, 'id' | 'created_at' | 'updated_at'> => ({
  name: '',
  description: '',
  model_type: 'svg',
  model_category: 'vehicle',
  model_file: '',
  points: [],
})

export function TemplateEditor({ initial, onSaved, onCancel }: TemplateEditorProps) {
  const [form, setForm] = useState(initial ? { ...initial } : emptyTemplate())
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')

  const updateForm = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }))

  const addPoint = () => {
    const newPoint: ModelPoint = {
      point_id: `point_${Date.now()}`,
      label: 'New Point',
      coordinates: { x: 50, y: 50, z: 0 },
      fields: [],
      next_points: [],
    }
    updateForm({ points: [...form.points, newPoint] })
  }

  const updatePoint = (idx: number, updated: ModelPoint) => {
    updateForm({ points: form.points.map((p, i) => (i === idx ? updated : p)) })
  }

  const removePoint = (idx: number) => {
    updateForm({ points: form.points.filter((_, i) => i !== idx) })
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const saved = initial?.id
        ? await modelsApi.update(initial.id, form)
        : await modelsApi.create(form as Omit<ModelTemplate, 'id' | 'created_at' | 'updated_at'>)
      onSaved(saved)
    } catch (e: unknown) {
      setError('Save failed. Check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  const allPointIds = form.points.map((p) => p.point_id)

  return (
    <div className="space-y-5">
      {/* Basic info */}
      <div className="space-y-4">
        <Input label="Model Name" value={form.name} onChange={(e) => updateForm({ name: e.target.value })} required placeholder="e.g. Forklift Inspection" />
        <Input label="Description" value={form.description ?? ''} onChange={(e) => updateForm({ description: e.target.value })} placeholder="Optional description" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Model Type</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={form.model_type}
              onChange={(e) => updateForm({ model_type: e.target.value as ModelType })}
            >
              <option value="svg">SVG (2D)</option>
              <option value="3d">3D Model</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={form.model_category}
              onChange={(e) => updateForm({ model_category: e.target.value as ModelCategory })}
            >
              <option value="vehicle">Vehicle</option>
              <option value="equipment">Equipment</option>
              <option value="human">Human Body</option>
            </select>
          </div>
        </div>

        <Input
          label="Model File URL (SVG / 3D)"
          value={form.model_file ?? ''}
          onChange={(e) => updateForm({ model_file: e.target.value })}
          placeholder="/models/forklift.svg or https://..."
        />
      </div>

      {/* Points section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Inspection Points ({form.points.length})</h3>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setPreview((p) => !p)}>
              <Eye size={14} /> {preview ? 'Hide' : 'Preview'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={addPoint}>
              <Plus size={14} /> Add Point
            </Button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
            <InteractiveSVG
              model={{ ...form, id: '', created_at: '' } as ModelTemplate}
              selectedPoints={[]}
              onPointClick={() => {}}
            />
          </div>
        )}

        {/* Point list */}
        {form.points.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            No inspection points. Click "Add Point" to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {form.points.map((point, idx) => (
              <PointEditor
                key={point.point_id + idx}
                point={point}
                allPointIds={allPointIds}
                onChange={(updated) => updatePoint(idx, updated)}
                onRemove={() => removePoint(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>
          <Save size={14} />
          {initial ? 'Update Model' : 'Create Model'}
        </Button>
      </div>
    </div>
  )
}

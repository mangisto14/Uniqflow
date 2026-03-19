import { useState, useEffect } from 'react'
import { Sparkles, AlertTriangle, ChevronRight } from 'lucide-react'
import type { ModelPoint, ProcessInstance } from '../../types'
import { processInstancesApi } from '../../api/processes.api'
import { chatApi } from '../../api/chat.api'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FieldRenderer } from './FieldRenderer'

interface PointModalProps {
  open: boolean
  point: ModelPoint
  process: ProcessInstance
  onClose: () => void
  onSaved: (updated: ProcessInstance) => void
}

export function PointModal({ open, point, process, onClose, onSaved }: PointModalProps) {
  const saved = (process.field_values[point.point_id] ?? {}) as Record<string, unknown>
  const [values, setValues] = useState<Record<string, unknown>>(saved)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<{
    suggestion: string
    field_hints: Record<string, string>
    warnings: string[]
    recommended_next_points: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset when point changes
  useEffect(() => {
    setValues((process.field_values[point.point_id] ?? {}) as Record<string, unknown>)
    setAiResult(null)
    setError(null)
  }, [point.point_id, process.field_values])

  const handleChange = (name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }))
  }

  const handleSave = async () => {
    // Validate required fields
    for (const f of point.fields) {
      if (f.required && (values[f.name] === undefined || values[f.name] === '' || values[f.name] === null)) {
        setError(`"${f.label}" is required`)
        return
      }
    }

    setSaving(true)
    setError(null)
    try {
      await processInstancesApi.savePointFields(process.id, point.point_id, values)
      // Refresh instance
      const updated = await processInstancesApi.get(process.id)
      onSaved(updated)
    } catch (e) {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAI = async () => {
    setAiLoading(true)
    setAiResult(null)
    try {
      const result = await chatApi.getPointSuggestion({
        process_id: process.id,
        point_id: point.point_id,
        point_label: point.label,
        fields: point.fields,
        field_values: values,
        process_context: { process_name: process.name, status: process.status },
      })
      setAiResult(result)
    } catch {
      setAiResult({ suggestion: 'AI not available', field_hints: {}, warnings: [], recommended_next_points: [] })
    } finally {
      setAiLoading(false)
    }
  }

  const isCompleted = process.selected_points.includes(point.point_id)

  return (
    <Modal open={open} onClose={onClose} title={point.label} size="lg">
      <div className="space-y-5">
        {/* Description */}
        {point.description && (
          <p className="text-sm text-gray-600">{point.description}</p>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            ✓ This point has been completed. You can update values below.
          </div>
        )}

        {/* AI suggestion banner */}
        {aiResult && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
            <div className="flex items-center gap-2 font-medium text-blue-800">
              <Sparkles size={16} />
              AI Suggestion
            </div>
            <p className="text-sm text-blue-700">{aiResult.suggestion}</p>

            {aiResult.warnings.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-2 text-sm text-yellow-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <ul className="space-y-0.5">
                  {aiResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {aiResult.recommended_next_points.length > 0 && (
              <div className="text-xs text-blue-600">
                <span className="font-medium">Suggested next: </span>
                {aiResult.recommended_next_points.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Fields */}
        {point.fields.length > 0 ? (
          <div className="space-y-4">
            {point.fields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={values[field.name]}
                hint={aiResult?.field_hints[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No fields for this point.</p>
        )}

        {/* Next points */}
        {point.next_points.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">NEXT POINTS</p>
            <div className="flex flex-wrap gap-2">
              {point.next_points.map((pid) => (
                <span key={pid} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  <ChevronRight size={12} />
                  {pid}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <Button variant="ghost" size="sm" onClick={handleAI} loading={aiLoading}>
            <Sparkles size={14} />
            Ask AI
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            {point.fields.length > 0 && (
              <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

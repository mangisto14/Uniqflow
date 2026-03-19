import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { processInstancesApi } from '../../api/processes.api'
import { processTemplatesApi } from '../../api/processes.api'
import { modelsApi } from '../../api/models.api'
import type { ProcessInstance, ProcessTemplate, ModelTemplate } from '../../types'
import { ModelViewer } from '../../components/ModelViewer/ModelViewer'
import { BreadcrumbFlow } from './BreadcrumbFlow'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useProcessStore } from '../../stores/process.store'

export function ProcessPage() {
  const { id } = useParams<{ id: string }>()
  const { updateLocal } = useProcessStore()
  const [process, setProcess] = useState<ProcessInstance | null>(null)
  const [template, setTemplate] = useState<ProcessTemplate | null>(null)
  const [model, setModel] = useState<ModelTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    processInstancesApi.get(id).then(async (proc) => {
      setProcess(proc)
      const tpl = await processTemplatesApi.get(proc.template_id)
      setTemplate(tpl)
      if (tpl.model_template_id) {
        const m = await modelsApi.get(tpl.model_template_id)
        setModel(m)
      }
      setLoading(false)
    })
  }, [id])

  const handleFieldsSaved = (updated: ProcessInstance) => {
    setProcess(updated)
    updateLocal(updated)
  }

  const handleComplete = async () => {
    if (!id) return
    setCompleting(true)
    try {
      const updated = await processInstancesApi.update(id, { status: 'completed' })
      setProcess(updated)
      updateLocal(updated)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  )

  if (!process || !template) return <div className="p-8 text-center text-gray-400">Process not found.</div>

  const points = model?.points ?? []
  const allDone = points.length > 0 && process.selected_points.length >= points.length
  const pct = points.length > 0 ? Math.round((process.selected_points.length / points.length) * 100) : 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <Link to="/" className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{process.name ?? template.name}</h1>
          <p className="text-sm text-gray-500">{template.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={process.status === 'completed' ? 'green' : process.status === 'active' ? 'blue' : 'gray'}>
            {process.status}
          </Badge>
          {process.status === 'active' && allDone && (
            <Button size="sm" onClick={handleComplete} loading={completing}>
              <CheckCircle size={14} />
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {points.length > 0 && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white px-5 py-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Overall Progress</span>
            <span className="font-semibold text-gray-900">{process.selected_points.length} / {points.length} points</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Breadcrumb flow */}
      {points.length > 0 && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white px-5 py-3">
          <p className="mb-1.5 text-xs font-medium text-gray-400">INSPECTION FLOW</p>
          <BreadcrumbFlow
            points={points}
            selectedPoints={process.selected_points}
          />
        </div>
      )}

      {/* Model viewer */}
      {model ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <ModelViewer model={model} process={process} onFieldsSaved={handleFieldsSaved} />
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          No model attached to this template.
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { modelsApi } from '../../api/models.api'
import type { ModelTemplate } from '../../types'
import { InteractiveSVG } from '../../components/ModelViewer/InteractiveSVG'
import { ArrowLeft } from 'lucide-react'

export function ModelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [model, setModel] = useState<ModelTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) modelsApi.get(id).then(setModel).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>
  if (!model) return <div className="p-8 text-center text-gray-400">Model not found.</div>

  return (
    <div className="p-6">
      <Link to="/gallery" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={14} /> Back to Gallery
      </Link>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{model.name}</h1>
        {model.description && <p className="text-sm text-gray-500">{model.description}</p>}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <InteractiveSVG
          model={model}
          selectedPoints={[]}
          onPointClick={(p) => alert(`Point: ${p.label}\n${p.description ?? ''}`)}
        />
      </div>
    </div>
  )
}

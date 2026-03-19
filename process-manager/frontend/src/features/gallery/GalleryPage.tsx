import { useEffect, useState } from 'react'
import { modelsApi } from '../../api/models.api'
import type { ModelTemplate, ModelCategory } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Layers, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const categoryLabels: Record<ModelCategory, string> = {
  vehicle: 'Vehicle',
  equipment: 'Equipment',
  human: 'Human Body',
}

const categoryColors: Record<ModelCategory, 'blue' | 'green' | 'purple'> = {
  vehicle: 'blue',
  equipment: 'green',
  human: 'purple',
}

export function GalleryPage() {
  const [models, setModels] = useState<ModelTemplate[]>([])
  const [filter, setFilter] = useState<ModelCategory | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    modelsApi
      .list(filter as ModelCategory || undefined)
      .then(setModels)
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Model Gallery</h1>
        <p className="text-sm text-gray-500">Interactive inspection models</p>
      </div>

      {/* Category filter */}
      <div className="mb-5 flex gap-2">
        {(['', 'vehicle', 'equipment', 'human'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat === '' ? 'All' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : models.length === 0 ? (
        <div className="py-16 text-center text-gray-400">No models found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      )}
    </div>
  )
}

function ModelCard({ model }: { model: ModelTemplate }) {
  return (
    <Link to={`/gallery/${model.id}`} className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Layers size={20} />
        </div>
        <Badge color={categoryColors[model.model_category] ?? 'gray'}>
          {categoryLabels[model.model_category]}
        </Badge>
      </div>

      <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{model.name}</h3>
      {model.description && <p className="mb-3 text-sm text-gray-500 line-clamp-2">{model.description}</p>}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{model.points.length} inspection points</span>
        <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View <ChevronRight size={12} />
        </div>
      </div>
    </Link>
  )
}

import { useState } from 'react'
import type { ModelTemplate, ModelPoint, ProcessInstance } from '../../types'
import { InteractiveSVG } from './InteractiveSVG'
import { PointModal } from '../PointModal/PointModal'
import { Badge } from '../ui/Badge'
import { CheckCircle, Circle } from 'lucide-react'

interface ModelViewerProps {
  model: ModelTemplate
  process: ProcessInstance
  onFieldsSaved: (updated: ProcessInstance) => void
}

export function ModelViewer({ model, process, onFieldsSaved }: ModelViewerProps) {
  const [selectedPoint, setSelectedPoint] = useState<ModelPoint | null>(null)

  const completedCount = process.selected_points.length
  const totalCount = model.points.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="flex gap-6">
      {/* Model area */}
      <div className="flex-1">
        <InteractiveSVG
          model={model}
          selectedPoints={process.selected_points}
          onPointClick={setSelectedPoint}
        />
      </div>

      {/* Points list */}
      <div className="w-56 flex-shrink-0">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          {/* Progress */}
          <p className="mb-1 text-xs font-medium text-gray-500">PROGRESS</p>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-2">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700">{pct}%</span>
          </div>

          <p className="mb-2 text-xs font-medium text-gray-500">INSPECTION POINTS</p>
          <ul className="space-y-1">
            {model.points.map((p) => {
              const done = process.selected_points.includes(p.point_id)
              return (
                <li key={p.point_id}>
                  <button
                    onClick={() => setSelectedPoint(p)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-gray-50"
                  >
                    {done ? (
                      <CheckCircle size={15} className="shrink-0 text-green-500" />
                    ) : (
                      <Circle size={15} className="shrink-0 text-gray-300" />
                    )}
                    <span className={done ? 'text-gray-500 line-through' : 'text-gray-800'}>
                      {p.label}
                    </span>
                    {done && <Badge color="green" className="ml-auto text-[10px]">Done</Badge>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Point modal */}
      {selectedPoint && (
        <PointModal
          open={!!selectedPoint}
          point={selectedPoint}
          process={process}
          onClose={() => setSelectedPoint(null)}
          onSaved={(updated) => {
            onFieldsSaved(updated)
            setSelectedPoint(null)
          }}
        />
      )}
    </div>
  )
}

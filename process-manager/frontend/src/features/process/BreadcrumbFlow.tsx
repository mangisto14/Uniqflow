import type { ModelPoint } from '../../types'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

interface BreadcrumbFlowProps {
  points: ModelPoint[]
  selectedPoints: string[]
  currentPointId?: string
  onPointClick?: (point: ModelPoint) => void
}

export function BreadcrumbFlow({ points, selectedPoints, currentPointId, onPointClick }: BreadcrumbFlowProps) {
  if (points.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 py-2">
        {points.map((point, idx) => {
          const done = selectedPoints.includes(point.point_id)
          const current = point.point_id === currentPointId

          return (
            <div key={point.point_id} className="flex items-center gap-1">
              <button
                onClick={() => onPointClick?.(point)}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
                  done
                    ? 'bg-green-100 text-green-700'
                    : current
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {done ? <CheckCircle size={12} /> : <Circle size={12} />}
                {point.label}
              </button>
              {idx < points.length - 1 && (
                <ArrowRight size={12} className="shrink-0 text-gray-300" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import type { ModelTemplate, ModelPoint } from '../../types'
import clsx from 'clsx'

interface InteractiveSVGProps {
  model: ModelTemplate
  selectedPoints: string[]
  onPointClick: (point: ModelPoint) => void
}

export function InteractiveSVG({ model, selectedPoints, onPointClick }: InteractiveSVGProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [svgError, setSvgError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const isCompleted = (pid: string) => selectedPoints.includes(pid)
  const isHovered = (pid: string) => hoveredPoint === pid

  return (
    <div className="relative flex flex-col gap-3">
      {/* Zoom controls */}
      <div className="flex items-center gap-2 self-end">
        <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-100">−</button>
        <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-100">+</button>
        <button onClick={() => setZoom(1)}
          className="rounded border border-gray-300 px-2 py-0.5 text-xs hover:bg-gray-100">Reset</button>
      </div>

      {/* SVG container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50"
        style={{ minHeight: 400 }}
      >
        <div
          className="relative"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%` }}
        >
          {/* Render embedded SVG or fallback placeholder */}
          {model.model_file && !svgError ? (
            <img
              src={model.model_file}
              alt={model.name}
              className="h-auto w-full"
              onError={() => setSvgError(true)}
            />
          ) : (
            <ModelPlaceholder category={model.model_category} />
          )}

          {/* Interactive points overlay */}
          {model.points.map((point) => (
            <PointMarker
              key={point.point_id}
              point={point}
              completed={isCompleted(point.point_id)}
              hovered={isHovered(point.point_id)}
              onClick={() => onPointClick(point)}
              onMouseEnter={() => setHoveredPoint(point.point_id)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-blue-500 bg-white" /> Pending
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-green-500" /> Completed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" /> Hovered
        </span>
      </div>
    </div>
  )
}

// ── Point marker ───────────────────────────────────────────────────────────────

interface PointMarkerProps {
  point: ModelPoint
  completed: boolean
  hovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function PointMarker({ point, completed, hovered, onClick, onMouseEnter, onMouseLeave }: PointMarkerProps) {
  const { x, y } = point.coordinates

  return (
    <div
      className="absolute cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Pulse ring for pending */}
      {!completed && (
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-50" />
      )}

      {/* Main dot */}
      <div
        className={clsx(
          'relative flex h-7 w-7 items-center justify-center rounded-full border-2 text-white text-xs font-bold shadow-lg transition-all',
          completed
            ? 'border-green-400 bg-green-500 scale-110'
            : hovered
              ? 'border-yellow-400 bg-yellow-400 scale-125'
              : 'border-blue-500 bg-blue-600 hover:scale-110',
        )}
      >
        {completed ? '✓' : '●'}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
          {point.label}
          {point.description && (
            <p className="mt-0.5 max-w-[200px] whitespace-normal text-gray-300">{point.description}</p>
          )}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

// ── Placeholder SVG for missing model files ────────────────────────────────────

function ModelPlaceholder({ category }: { category: string }) {
  if (category === 'vehicle') return <VehiclePlaceholder />
  if (category === 'human') return <HumanPlaceholder />
  return <EquipmentPlaceholder />
}

function VehiclePlaceholder() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="#f8fafc" />
      {/* Body */}
      <rect x="30" y="55" width="140" height="40" rx="6" fill="#94a3b8" />
      {/* Cab */}
      <rect x="100" y="30" width="60" height="35" rx="4" fill="#64748b" />
      {/* Forks */}
      <rect x="10" y="65" width="28" height="5" rx="2" fill="#475569" />
      <rect x="10" y="75" width="28" height="5" rx="2" fill="#475569" />
      {/* Mast */}
      <rect x="32" y="35" width="6" height="35" rx="2" fill="#475569" />
      {/* Wheels */}
      <circle cx="55" cy="98" r="12" fill="#334155" />
      <circle cx="145" cy="98" r="12" fill="#334155" />
      <circle cx="55" cy="98" r="6" fill="#64748b" />
      <circle cx="145" cy="98" r="6" fill="#64748b" />
      {/* Battery */}
      <rect x="140" y="60" width="20" height="14" rx="2" fill="#fbbf24" />
    </svg>
  )
}

function HumanPlaceholder() {
  return (
    <svg viewBox="0 0 100 160" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="160" fill="#f8fafc" />
      {/* Head */}
      <circle cx="50" cy="18" r="14" fill="#fcd34d" stroke="#d97706" strokeWidth="1.5" />
      {/* Body */}
      <rect x="30" y="35" width="40" height="55" rx="5" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Left arm */}
      <rect x="8" y="38" width="22" height="10" rx="5" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Right arm */}
      <rect x="70" y="38" width="22" height="10" rx="5" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Left leg */}
      <rect x="30" y="93" width="16" height="50" rx="5" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
      {/* Right leg */}
      <rect x="54" y="93" width="16" height="50" rx="5" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" />
    </svg>
  )
}

function EquipmentPlaceholder() {
  return (
    <svg viewBox="0 0 80 180" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="180" fill="#f8fafc" />
      {/* Handle */}
      <rect x="28" y="5" width="24" height="8" rx="4" fill="#ef4444" />
      {/* Lever */}
      <rect x="22" y="13" width="6" height="15" rx="3" fill="#dc2626" />
      {/* Gauge */}
      <circle cx="40" cy="40" r="14" fill="white" stroke="#9ca3af" strokeWidth="2" />
      <path d="M 30 44 A 12 12 0 1 1 50 44" fill="none" stroke="#86efac" strokeWidth="3" />
      <line x1="40" y1="40" x2="40" y2="30" stroke="#1f2937" strokeWidth="2" />
      {/* Body */}
      <rect x="20" y="55" width="40" height="100" rx="6" fill="#ef4444" />
      <rect x="24" y="60" width="32" height="90" rx="4" fill="#fca5a5" />
      {/* Nozzle hose */}
      <path d="M 60 30 Q 75 30 75 45 Q 75 55 65 60" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      <circle cx="65" cy="62" r="4" fill="#374151" />
      {/* Bottom */}
      <rect x="22" y="155" width="36" height="10" rx="5" fill="#dc2626" />
    </svg>
  )
}

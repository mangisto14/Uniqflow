import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProcessStore } from '../../stores/process.store'
import { Badge } from '../../components/ui/Badge'
import { Play, ChevronRight } from 'lucide-react'

const statusColor: Record<string, 'green' | 'blue' | 'gray' | 'red'> = {
  active: 'blue', completed: 'green', draft: 'gray', cancelled: 'red',
}

export function ProcessListPage() {
  const { instances, loading, fetchAll } = useProcessStore()

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Processes</h1>
        <p className="text-sm text-gray-500">View and manage all process instances</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : instances.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No processes yet. <Link to="/" className="text-blue-600 hover:underline">Start one from Dashboard</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {instances.map((inst) => (
              <li key={inst.id}>
                <Link to={`/processes/${inst.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Play size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900">{inst.name ?? 'Unnamed'}</p>
                    <p className="text-xs text-gray-500">{new Date(inst.created_at).toLocaleDateString()} · {inst.selected_points.length} points done</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={statusColor[inst.status] ?? 'gray'}>{inst.status}</Badge>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

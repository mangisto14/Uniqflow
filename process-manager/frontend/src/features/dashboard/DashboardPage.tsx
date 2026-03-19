import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProcessStore } from '../../stores/process.store'
import { processTemplatesApi } from '../../api/processes.api'
import { teamsApi } from '../../api/teams.api'
import type { ProcessTemplate, Team } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Plus, Play, CheckCircle, Clock } from 'lucide-react'
import { processInstancesApi } from '../../api/processes.api'
import { useNavigate } from 'react-router-dom'

const statusColor: Record<string, 'green' | 'blue' | 'gray' | 'red'> = {
  active: 'blue', completed: 'green', draft: 'gray', cancelled: 'red',
}

export function DashboardPage() {
  const { instances, loading, fetchAll } = useProcessStore()
  const [templates, setTemplates] = useState<ProcessTemplate[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
    processTemplatesApi.list().then(setTemplates)
    teamsApi.list().then(setTeams)
  }, [fetchAll])

  const handleCreate = async (templateId: string) => {
    setCreating(true)
    try {
      const tpl = templates.find((t) => t.id === templateId)
      const inst = await processInstancesApi.create({
        template_id: templateId,
        name: `${tpl?.name ?? 'Process'} — ${new Date().toLocaleDateString()}`,
      })
      navigate(`/processes/${inst.id}`)
    } finally {
      setCreating(false)
    }
  }

  const stats = {
    total: instances.length,
    active: instances.filter((i) => i.status === 'active').length,
    completed: instances.filter((i) => i.status === 'completed').length,
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your process inspections</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Play, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: stats.active, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Start new process */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-900">Start New Process</h2>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <Button key={t.id} variant="secondary" size="sm" loading={creating} onClick={() => handleCreate(t.id)}>
              <Plus size={14} />
              {t.name}
            </Button>
          ))}
          {templates.length === 0 && (
            <p className="text-sm text-gray-400">No templates yet. <Link to="/admin" className="text-blue-600 hover:underline">Create one in Admin</Link></p>
          )}
        </div>
      </div>

      {/* Process list */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Recent Processes</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : instances.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No processes yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {instances.map((inst) => {
              const team = teams.find((t) => t.id === inst.team_id)
              return (
                <li key={inst.id}>
                  <Link
                    to={`/processes/${inst.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-900">{inst.name ?? 'Unnamed process'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(inst.created_at).toLocaleDateString()}
                        {team && ` · ${team.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {inst.selected_points.length} points done
                      </span>
                      <Badge color={statusColor[inst.status] ?? 'gray'}>{inst.status}</Badge>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

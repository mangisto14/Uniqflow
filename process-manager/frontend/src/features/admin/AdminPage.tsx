import { useEffect, useState } from 'react'
import { modelsApi } from '../../api/models.api'
import { processTemplatesApi } from '../../api/processes.api'
import { teamsApi } from '../../api/teams.api'
import type { ModelTemplate, ProcessTemplate, Team } from '../../types'
import { TemplateEditor } from './TemplateEditor'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Plus, Edit2, Trash2, Layers, FileText, Users } from 'lucide-react'
import { Input } from '../../components/ui/Input'

type Tab = 'models' | 'templates' | 'teams'

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('models')
  const [models, setModels] = useState<ModelTemplate[]>([])
  const [templates, setTemplates] = useState<ProcessTemplate[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [editingModel, setEditingModel] = useState<ModelTemplate | 'new' | null>(null)

  const refresh = () => {
    modelsApi.list().then(setModels)
    processTemplatesApi.list().then(setTemplates)
    teamsApi.list().then(setTeams)
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="text-sm text-gray-500">Manage models, templates and teams</p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
        {([
          { id: 'models', icon: Layers, label: 'Model Templates' },
          { id: 'templates', icon: FileText, label: 'Process Templates' },
          { id: 'teams', icon: Users, label: 'Teams' },
        ] as const).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Models tab */}
      {tab === 'models' && (
        <div>
          <div className="mb-4 flex justify-end">
            <Button size="sm" onClick={() => setEditingModel('new')}>
              <Plus size={14} /> New Model Template
            </Button>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white">
            {models.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No models yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {models.map((m) => (
                  <li key={m.id} className="flex items-center gap-4 px-5 py-4">
                    <Layers size={18} className="shrink-0 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.points.length} points · {m.model_category} · {m.model_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color="blue">{m.model_category}</Badge>
                      <button onClick={() => setEditingModel(m)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={async () => { await modelsApi.delete(m.id); refresh() }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Editor modal */}
          <Modal
            open={editingModel !== null}
            onClose={() => setEditingModel(null)}
            title={editingModel === 'new' ? 'New Model Template' : 'Edit Model Template'}
            size="xl"
          >
            <TemplateEditor
              initial={editingModel !== 'new' && editingModel !== null ? editingModel : undefined}
              onSaved={() => { refresh(); setEditingModel(null) }}
              onCancel={() => setEditingModel(null)}
            />
          </Modal>
        </div>
      )}

      {/* Process templates tab */}
      {tab === 'templates' && (
        <ProcessTemplatesPanel templates={templates} models={models} onRefresh={refresh} />
      )}

      {/* Teams tab */}
      {tab === 'teams' && (
        <TeamsPanel teams={teams} onRefresh={refresh} />
      )}
    </div>
  )
}

// ── Process Templates Panel ────────────────────────────────────────────────────

function ProcessTemplatesPanel({ templates, models, onRefresh }: {
  templates: ProcessTemplate[]
  models: ModelTemplate[]
  onRefresh: () => void
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [modelId, setModelId] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    await processTemplatesApi.create({ name, description: desc, model_template_id: modelId || undefined, template_points: [] })
    setCreating(false)
    setName(''); setDesc(''); setModelId('')
    onRefresh()
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}><Plus size={14} /> New Template</Button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white">
        {templates.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No process templates yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {templates.map((t) => {
              const m = models.find((m) => m.id === t.model_template_id)
              return (
                <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <FileText size={18} className="shrink-0 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{m ? `Model: ${m.name}` : 'No model attached'}</p>
                  </div>
                  <button onClick={async () => { await processTemplatesApi.delete(t.id); onRefresh() }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New Process Template">
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Model Template</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" value={modelId} onChange={(e) => setModelId(e.target.value)}>
              <option value="">— none —</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Teams Panel ────────────────────────────────────────────────────────────────

function TeamsPanel({ teams, onRefresh }: { teams: Team[]; onRefresh: () => void }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    await teamsApi.create({ name, color })
    setCreating(false)
    setName(''); setColor('#3b82f6')
    onRefresh()
    setSaving(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}><Plus size={14} /> New Team</Button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white">
        {teams.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No teams yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {teams.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-8 w-8 rounded-full border-2 border-white shadow" style={{ background: t.color }} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{t.name}</p>
                  {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                </div>
                <button onClick={async () => { await teamsApi.delete(t.id); onRefresh() }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New Team">
        <div className="space-y-4">
          <Input label="Team Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border border-gray-300 p-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node, Edge, Controls, Background,
  addEdge, useNodesState, useEdgesState, Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { processesApi } from '../../api/processes.api';
import { apiClient } from '../../api/client';
import { svgTemplatesApi } from '../../api/svg-templates.api';
import { t } from '../../i18n';
import { FormDesigner } from '../forms/FormDesigner';
import { ConditionEditor, IConditionGroup, createEmptyCondition } from '../conditions/ConditionEditor';

const NODE_TYPES_OPTIONS = [
  { type: 'FORM', label: t.builder.stepTypes.FORM, color: '#3b82f6' },
  { type: 'APPROVAL', label: t.builder.stepTypes.APPROVAL, color: '#10b981' },
  { type: 'CONDITION', label: t.builder.stepTypes.CONDITION, color: '#f59e0b' },
  { type: 'TASK', label: t.builder.stepTypes.TASK, color: '#8b5cf6' },
  { type: 'NOTIFICATION', label: t.builder.stepTypes.NOTIFICATION, color: '#6366f1' },
  { type: 'REVIEW', label: t.builder.stepTypes.REVIEW, color: '#ef4444' },
  { type: 'SVG_MODEL', label: t.builder.stepTypes.SVG_MODEL, color: '#0891b2' },
];

type FieldType = 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox';
interface Field {
  id: string; name: string; label: string;
  fieldType: FieldType; required: boolean;
  placeholder?: string; options?: string;
}

function stepToNode(step: Record<string, unknown>, index: number): Node {
  const pos = (step.position as { x: number; y: number }) ?? { x: 100 + index * 220, y: 100 };
  const typeInfo = NODE_TYPES_OPTIONS.find((t) => t.type === step.type) ?? NODE_TYPES_OPTIONS[0];
  const cfg = step.config as Record<string, unknown> | undefined;
  const isEnd = cfg?.isEndStep === true;
  const color = isEnd ? '#ef4444' : typeInfo.color;
  const label = isEnd ? `🏁 ${step.name as string}` : step.name as string;
  return {
    id: step.id as string,
    position: pos,
    data: { label, type: step.type, color, raw: step },
    style: {
      background: color + '22',
      border: `2px solid ${color}`,
      borderRadius: 8,
      padding: '8px 16px',
      minWidth: 140,
    },
  };
}

export function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [process, setProcess] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [stepName, setStepName] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [condition, setCondition] = useState<IConditionGroup>(createEmptyCondition());
  const [configTab, setConfigTab] = useState<'general' | 'fields' | 'condition' | 'svg'>('general');
  const [svgTemplates, setSvgTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isEndStep, setIsEndStep] = useState(false);

  useEffect(() => {
    svgTemplatesApi.list(1, 100, true).then((res) => {
      const data = (res as unknown as { data: { templates: { id: string; name: string }[] } }).data;
      setSvgTemplates(data?.templates ?? []);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    (processesApi.get(id) as Promise<{ data: { data: Record<string, unknown> } }>).then((r) => {
      const p = r.data?.data ?? r.data;
      setProcess(p as Record<string, unknown>);
      const steps = (p.steps as Record<string, unknown>[]) ?? [];
      setNodes(steps.map((s, i) => stepToNode(s, i)));
      const edgeList: Edge[] = [];
      for (let i = 0; i < steps.length - 1; i++) {
        edgeList.push({
          id: `e-${steps[i].id}-${steps[i + 1].id}`,
          source: steps[i].id as string,
          target: steps[i + 1].id as string,
        });
      }
      setEdges(edgeList);
    });
  }, [id]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSelectNode = (node: Node) => {
    setSelectedNode(node);
    setStepName(node.data.label as string);
    const raw = node.data.raw as Record<string, unknown>;
    setFields((raw?.fields as Field[]) ?? []);
    const cfg = raw?.config as Record<string, unknown>;
    setCondition((cfg?.condition as IConditionGroup) ?? createEmptyCondition());
    setSelectedTemplateId((cfg?.templateId as string) ?? '');
    setIsEndStep((cfg?.isEndStep as boolean) ?? false);
    setConfigTab('general');
  };

  const handleAddStep = async (type: string, label: string) => {
    if (!id) return;
    const steps = (process?.steps as Record<string, unknown>[]) ?? [];
    const res = await apiClient.post(`/processes/${id}/steps`, {
      type,
      name: label,
      config: {} as Record<string, unknown>,
      position: { x: 100 + steps.length * 220, y: 100 },
      order: steps.length,
    }) as { data: Record<string, unknown> };
    const step = (res.data?.data ?? res.data) as Record<string, unknown>;
    setNodes((nds) => [...nds, stepToNode(step, steps.length)]);
    setProcess((p) => p ? { ...p, steps: [...steps, step] } : p);
  };

  const handleSaveStep = async () => {
    if (!id || !selectedNode) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: stepName,
        position: selectedNode.position,
      };
      if (selectedNode.data.type === 'FORM') payload.fields = fields;
      if (selectedNode.data.type === 'CONDITION') payload.config = { condition, isEndStep };
      if (selectedNode.data.type === 'SVG_MODEL') payload.config = { templateId: selectedTemplateId, isEndStep };
      // For all types: persist isEndStep in config (merge with existing config)
      if (!['CONDITION', 'SVG_MODEL'].includes(selectedNode.data.type)) {
        const existingCfg = (selectedNode.data.raw as Record<string, unknown>)?.config as Record<string, unknown> ?? {};
        payload.config = { ...existingCfg, isEndStep };
      }
      await apiClient.put(`/processes/${id}/steps/${selectedNode.id}`, payload);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, label: stepName } }
            : n
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSavePositions = async () => {
    if (!id) return;
    setSaving(true);
    try {
      for (const node of nodes) {
        await apiClient.put(`/processes/${id}/steps/${node.id}`, { position: node.position });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStep = async (nodeId: string) => {
    if (!id) return;
    await apiClient.delete(`/processes/${id}/steps/${nodeId}`);
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
  };

  const selectedType = selectedNode?.data.type as string | undefined;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4" dir="rtl">
      {/* Palette */}
      <div className="w-44 flex-shrink-0 space-y-2 overflow-y-auto">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">{t.builder.addStep}</h2>
        {NODE_TYPES_OPTIONS.map((tp) => (
          <button
            key={tp.type}
            onClick={() => handleAddStep(tp.type, tp.label)}
            className="w-full text-right px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors hover:opacity-80"
            style={{ borderColor: tp.color, color: tp.color, background: tp.color + '11' }}
          >
            {tp.label}
          </button>
        ))}
        <div className="pt-4 space-y-2">
          <button onClick={handleSavePositions} disabled={saving} className="btn-secondary w-full text-sm">
            {saving ? t.loading : t.builder.saveLayout}
          </button>
          <button onClick={() => navigate('/processes')} className="btn-secondary w-full text-sm">
            {t.back}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
          <span className="font-semibold text-gray-800">{(process?.name as string) ?? t.builder.title}</span>
          <span className="text-xs text-gray-400">{nodes.length} {t.builder.steps}</span>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => handleSelectNode(node)}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Config panel */}
      {selectedNode && (
        <div className="w-72 flex-shrink-0 card space-y-3 overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-100 pb-2">
            {([
              'general',
              ...(selectedType === 'FORM' ? ['fields'] : []),
              ...(selectedType === 'CONDITION' ? ['condition'] : []),
              ...(selectedType === 'SVG_MODEL' ? ['svg'] : []),
            ] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setConfigTab(tab as typeof configTab)}
                className={`text-xs px-2 py-1 rounded ${
                  configTab === tab ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab === 'general' ? 'כללי' : tab === 'fields' ? 'שדות' : tab === 'condition' ? 'תנאי' : 'SVG'}
              </button>
            ))}
          </div>

          {configTab === 'general' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">שם העמדה</label>
                <input
                  className="input text-sm"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-400">
                סוג: {t.builder.stepTypes[selectedType as keyof typeof t.builder.stepTypes] ?? selectedType}
              </p>

              {/* End station toggle */}
              <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                isEndStep
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-red-500"
                  checked={isEndStep}
                  onChange={(e) => setIsEndStep(e.target.checked)}
                />
                <div>
                  <p className={`text-sm font-medium ${isEndStep ? 'text-red-700' : 'text-gray-700'}`}>
                    🏁 עמדת סיום
                  </p>
                  <p className="text-xs text-gray-400">
                    כשמשלימים עמדה זו — התהליך מסתיים
                  </p>
                </div>
              </label>
            </div>
          )}

          {configTab === 'fields' && selectedType === 'FORM' && (
            <FormDesigner fields={fields} onChange={setFields} />
          )}

          {configTab === 'condition' && selectedType === 'CONDITION' && (
            <ConditionEditor
              condition={condition}
              availableFields={(process?.steps as Record<string, unknown>[] ?? [])
                .flatMap((s) => (s.fields as Field[] ?? []).map((f) => f.name))}
              onChange={setCondition}
            />
          )}

          {configTab === 'svg' && selectedType === 'SVG_MODEL' && (
            <div className="space-y-2">
              <label className="text-xs text-gray-500 block">{t.svgTemplates.selectTemplate}</label>
              {svgTemplates.length === 0 ? (
                <p className="text-xs text-gray-400">
                  אין טמפלטים. <a href="/svg-templates" className="text-primary-600 underline">צור טמפלט</a>
                </p>
              ) : (
                <select
                  className="input text-sm"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                  <option value="">— בחר טמפלט —</option>
                  {svgTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </select>
              )}
              {selectedTemplateId && (
                <p className="text-xs text-green-600">✓ טמפלט נבחר</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <button onClick={handleSaveStep} disabled={saving} className="btn-primary w-full text-sm">
              {saving ? t.loading : t.save}
            </button>
            <button onClick={() => handleDeleteStep(selectedNode.id)} className="btn-secondary w-full text-sm text-red-600">
              {t.builder.deleteStep}
            </button>
            <button onClick={() => setSelectedNode(null)} className="btn-secondary w-full text-sm">
              {t.builder.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

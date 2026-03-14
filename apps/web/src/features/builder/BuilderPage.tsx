import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node, Edge, Controls, Background,
  addEdge, useNodesState, useEdgesState, Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { processesApi } from '../../api/processes.api';
import { apiClient } from '../../api/client';

const NODE_TYPES_OPTIONS = [
  { type: 'FORM', label: 'Form', color: '#3b82f6' },
  { type: 'APPROVAL', label: 'Approval', color: '#10b981' },
  { type: 'CONDITION', label: 'Condition', color: '#f59e0b' },
  { type: 'TASK', label: 'Task', color: '#8b5cf6' },
  { type: 'NOTIFICATION', label: 'Notification', color: '#6366f1' },
  { type: 'REVIEW', label: 'Review', color: '#ef4444' },
];

function stepToNode(step: Record<string, unknown>, index: number): Node {
  const pos = (step.position as { x: number; y: number }) ?? { x: 100 + index * 220, y: 100 };
  const typeInfo = NODE_TYPES_OPTIONS.find((t) => t.type === step.type) ?? NODE_TYPES_OPTIONS[0];
  return {
    id: step.id as string,
    position: pos,
    data: { label: step.name as string, type: step.type, color: typeInfo.color },
    style: {
      background: typeInfo.color + '22',
      border: `2px solid ${typeInfo.color}`,
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

  useEffect(() => {
    if (!id) return;
    (processesApi.get(id) as Promise<{ data: { data: Record<string, unknown> } }>).then((r) => {
      const p = r.data?.data ?? r.data;
      setProcess(p as Record<string, unknown>);
      const steps = (p.steps as Record<string, unknown>[]) ?? [];
      setNodes(steps.map((s, i) => stepToNode(s, i)));
      // Build edges from step order
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

  const handleSavePositions = async () => {
    if (!id) return;
    setSaving(true);
    try {
      for (const node of nodes) {
        await apiClient.put(`/processes/${id}/steps/${node.id}`, {
          position: node.position,
        });
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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Palette */}
      <div className="w-48 flex-shrink-0 space-y-2">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Add Step</h2>
        {NODE_TYPES_OPTIONS.map((t) => (
          <button
            key={t.type}
            onClick={() => handleAddStep(t.type, t.label)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors hover:opacity-80"
            style={{ borderColor: t.color, color: t.color, background: t.color + '11' }}
          >
            {t.label}
          </button>
        ))}
        <div className="pt-4 space-y-2">
          <button onClick={handleSavePositions} disabled={saving} className="btn-secondary w-full text-sm">
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
          <button onClick={() => navigate(`/processes`)} className="btn-secondary w-full text-sm">
            Back
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50">
          <span className="font-semibold text-gray-800">{(process?.name as string) ?? 'Builder'}</span>
          <span className="text-xs text-gray-400">{nodes.length} steps</span>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Config panel */}
      {selectedNode && (
        <div className="w-56 flex-shrink-0 card space-y-3">
          <h3 className="font-semibold text-gray-800">Step</h3>
          <p className="text-sm text-gray-600">{selectedNode.data.label}</p>
          <p className="text-xs text-gray-400 uppercase">{selectedNode.data.type}</p>
          <button
            onClick={() => handleDeleteStep(selectedNode.id)}
            className="w-full btn-secondary text-sm text-red-600 hover:text-red-700"
          >
            Delete Step
          </button>
          <button onClick={() => setSelectedNode(null)} className="w-full btn-secondary text-sm">
            Close
          </button>
        </div>
      )}
    </div>
  );
}

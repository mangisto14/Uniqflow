import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { executionsApi } from '../../api/executions.api';
import { t } from '../../i18n';

interface StepExecution {
  id: string;
  stepId: string;
  status: string;
  data?: Record<string, unknown>;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
  assignedTo?: { name: string };
  step: {
    id: string;
    name: string;
    type: string;
    order: number;
    fields?: { id: string; name: string; label: string; fieldType: string; required: boolean }[];
  };
}

interface Execution {
  id: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  currentData: Record<string, unknown>;
  process: { id: string; name: string; steps: { id: string }[] };
  stepExecutions: StepExecution[];
}

export function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    if (!id) return;
    (executionsApi.get(id) as Promise<{ data: { data: Execution } }>)
      .then((r) => {
        const ex = r.data?.data ?? r.data;
        setExecution(ex as Execution);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleComplete = async (stepId: string) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await executionsApi.completeStep(id, stepId, { data: formData });
      setFormData({});
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (stepId: string) => {
    if (!id || !rejectReason.trim()) return;
    setSubmitting(true);
    try {
      await executionsApi.rejectStep(id, stepId, { reason: rejectReason });
      setRejectReason('');
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !confirm(t.executions.cancelConfirm)) return;
    await executionsApi.cancel(id, 'בוטל על ידי משתמש');
    navigate('/executions');
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    PENDING: 'bg-gray-100 text-gray-500',
    SKIPPED: 'bg-yellow-100 text-yellow-700',
  };

  if (loading) return <div className="flex justify-center h-32 items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!execution) return <div className="card text-center text-gray-500">הרצה לא נמצאה.</div>;

  const sorted = [...execution.stepExecutions].sort((a, b) => a.step.order - b.step.order);

  return (
    <div className="space-y-6 max-w-3xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{execution.process.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.executions.started} {new Date(execution.startedAt).toLocaleString('he-IL')}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[execution.status] ?? 'bg-gray-100'}`}>
            {t.executions.status[execution.status as keyof typeof t.executions.status] ?? execution.status}
          </span>
          {execution.status === 'ACTIVE' && (
            <button onClick={handleCancel} className="btn-secondary text-sm text-red-600">{t.executions.cancel}</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((se, i) => (
          <div key={se.id} className={`card border-r-4 ${
            se.status === 'ACTIVE' ? 'border-blue-500' :
            se.status === 'COMPLETED' ? 'border-green-500' :
            se.status === 'FAILED' ? 'border-red-500' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{se.step.name}</p>
                  <p className="text-xs text-gray-400">{t.builder.stepTypes[se.step.type as keyof typeof t.builder.stepTypes] ?? se.step.type}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[se.status] ?? 'bg-gray-100'}`}>
                {t.executions.status[se.status as keyof typeof t.executions.status] ?? se.status}
              </span>
            </div>

            {se.status === 'ACTIVE' && (
              <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                {se.step.type === 'FORM' && se.step.fields && se.step.fields.map((f) => (
                  <div key={f.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}{f.required && <span className="text-red-500 mr-1">*</span>}
                    </label>
                    <input
                      className="input"
                      type={f.fieldType === 'number' ? 'number' : f.fieldType === 'date' ? 'date' : 'text'}
                      value={formData[f.name] ?? ''}
                      onChange={(e) => setFormData((d) => ({ ...d, [f.name]: e.target.value }))}
                    />
                  </div>
                ))}

                {(se.step.type === 'APPROVAL' || se.step.type === 'REVIEW') && (
                  <div className="space-y-2">
                    <textarea
                      className="input resize-none"
                      rows={2}
                      placeholder={t.steps.notes}
                      value={formData['notes'] ?? ''}
                      onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setFormData((d) => ({ ...d, approved: 'true', reviewed: 'true' })); handleComplete(se.stepId); }}
                        disabled={submitting}
                        className="btn-primary flex-1"
                      >
                        {t.steps.approve}
                      </button>
                      <div className="flex gap-2 flex-1">
                        <input
                          className="input flex-1 text-sm"
                          placeholder={t.steps.rejectionReason}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <button onClick={() => handleReject(se.stepId)} disabled={submitting} className="btn-secondary text-red-600 text-sm">{t.steps.reject}</button>
                      </div>
                    </div>
                  </div>
                )}

                {se.step.type === 'TASK' && (
                  <button
                    onClick={() => { setFormData((d) => ({ ...d, completed: 'true' })); handleComplete(se.stepId); }}
                    disabled={submitting}
                    className="btn-primary"
                  >
                    {t.steps.markComplete}
                  </button>
                )}

                {se.step.type === 'FORM' && (
                  <button onClick={() => handleComplete(se.stepId)} disabled={submitting} className="btn-primary">
                    {submitting ? t.steps.submitting : t.steps.submit}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

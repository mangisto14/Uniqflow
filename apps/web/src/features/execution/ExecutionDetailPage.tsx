import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { executionsApi } from '../../api/executions.api';
import { useAuthStore } from '../../stores/auth.store';
import { t } from '../../i18n';
import { SvgStepInteraction } from '../svg-templates/SvgStepInteraction';

interface StepField {
  id: string; name: string; label: string; fieldType: string; required: boolean;
}

interface Step {
  id: string; name: string; type: string; order: number;
  config?: Record<string, unknown>;
  fields?: StepField[];
}

interface StepExecution {
  id: string; stepId: string; status: string;
  data?: Record<string, unknown>; notes?: string;
  startedAt?: string; completedAt?: string;
  assignedTo?: { name: string };
  step: Step;
}

interface Execution {
  id: string; status: string; startedAt: string; completedAt?: string;
  currentData: Record<string, unknown>;
  process: { id: string; name: string; steps: Step[] };
  stepExecutions: StepExecution[];
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    'bg-blue-100 text-blue-800 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200',
  FAILED:    'bg-red-100 text-red-800 border-red-200',
  PENDING:   'bg-gray-100 text-gray-500 border-gray-200',
  SKIPPED:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  PAUSED:    'bg-orange-100 text-orange-700 border-orange-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
};

const BORDER_COLOR: Record<string, string> = {
  ACTIVE:    'border-r-4 border-blue-500',
  COMPLETED: 'border-r-4 border-green-500',
  FAILED:    'border-r-4 border-red-400',
  PENDING:   'border-r-4 border-gray-200',
  SKIPPED:   'border-r-4 border-yellow-400',
};

export function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  // next-station routing
  const [nextStepId, setNextStepId] = useState<string>('');
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  const load = () => {
    if (!id) return;
    (executionsApi.get(id) as Promise<{ data: { data: Execution } }>)
      .then((r) => setExecution((r.data?.data ?? r.data) as Execution))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  // WebSocket
  useEffect(() => {
    if (!id || !accessToken) return;
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') ?? '';
    const socket = io(`${apiBase}/executions`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.emit('join-execution', id);
    socket.on('execution-updated', (data: Execution) => setExecution(data));
    socket.on('step-updated', () => load());
    return () => {
      socket.emit('leave-execution', id);
      socket.disconnect();
    };
  }, [id, accessToken]);

  const handleComplete = async (stepId: string, overrideNextStepId?: string) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await (executionsApi.completeStep as (
        id: string, sid: string,
        body: { data: Record<string, string>; nextStepId?: string }
      ) => Promise<unknown>)(
        id, stepId,
        { data: formData, nextStepId: overrideNextStepId ?? nextStepId || undefined },
      );
      setFormData({});
      setNextStepId('');
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

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!execution) return (
    <div className="card text-center text-gray-500 py-16">הרצה לא נמצאה</div>
  );

  const sorted = [...execution.stepExecutions].sort((a, b) => a.step.order - b.step.order);
  const activeStep = sorted.find((se) => se.status === 'ACTIVE');

  // Pending steps that the active step can route to (all except itself and completed)
  const routeOptions = activeStep
    ? sorted.filter((se) => se.stepId !== activeStep.stepId && se.status !== 'COMPLETED')
    : [];

  const isCompleted = execution.status === 'COMPLETED';
  const isCancelled = execution.status === 'CANCELLED';

  return (
    <div className="space-y-5 max-w-3xl" dir="rtl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{execution.process.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            התחיל: {new Date(execution.startedAt).toLocaleString('he-IL')}
            {execution.completedAt && (
              <span className="mr-2">· הסתיים: {new Date(execution.completedAt).toLocaleString('he-IL')}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLOR[execution.status] ?? 'bg-gray-100'}`}>
            {t.executions.status[execution.status as keyof typeof t.executions.status] ?? execution.status}
          </span>
          {execution.status === 'ACTIVE' && (
            <button onClick={handleCancel} className="btn-secondary text-sm text-red-600">
              {t.executions.cancel}
            </button>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      {!isCancelled && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>התקדמות</span>
            <span>{sorted.filter(s => s.status === 'COMPLETED').length} / {sorted.length} עמדות</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${sorted.length ? (sorted.filter(s => s.status === 'COMPLETED').length / sorted.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Steps ── */}
      <div className="space-y-3">
        {sorted.map((se, i) => {
          const isEnd = se.step.config?.isEndStep === true;
          return (
            <div key={se.id} className={`card ${BORDER_COLOR[se.status] ?? 'border-r-4 border-gray-200'} transition-shadow`}>

              {/* Step header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    se.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                    se.status === 'ACTIVE' ? 'bg-blue-500 text-white' :
                    se.status === 'FAILED' ? 'bg-red-400 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {se.status === 'COMPLETED' ? '✓' : se.status === 'FAILED' ? '✕' : i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{se.step.name}</p>
                      {isEnd && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full font-medium">
                          🏁 עמדת סיום
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {t.builder.stepTypes[se.step.type as keyof typeof t.builder.stepTypes] ?? se.step.type}
                      {se.completedAt && ` · ${new Date(se.completedAt).toLocaleString('he-IL')}`}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${STATUS_COLOR[se.status] ?? 'bg-gray-100'}`}>
                  {t.executions.status[se.status as keyof typeof t.executions.status] ?? se.status}
                </span>
              </div>

              {/* Completed: show submitted data */}
              {se.status === 'COMPLETED' && se.data && Object.keys(se.data).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">נתונים שהוגשו:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(se.data).map(([k, v]) => (
                      <div key={k} className="text-xs bg-gray-50 rounded px-2 py-1">
                        <span className="text-gray-400">{k}: </span>
                        <span className="text-gray-700 font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVE step — interactive area */}
              {se.status === 'ACTIVE' && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">

                  {/* FORM step fields */}
                  {se.step.type === 'FORM' && se.step.fields && se.step.fields.length > 0 && (
                    <div className="space-y-3">
                      {se.step.fields.map((f) => (
                        <div key={f.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {f.label}
                            {f.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          {f.fieldType === 'textarea' ? (
                            <textarea
                              className="input resize-none"
                              rows={3}
                              value={formData[f.name] ?? ''}
                              onChange={(e) => setFormData((d) => ({ ...d, [f.name]: e.target.value }))}
                            />
                          ) : f.fieldType === 'select' ? (
                            <select
                              className="input"
                              value={formData[f.name] ?? ''}
                              onChange={(e) => setFormData((d) => ({ ...d, [f.name]: e.target.value }))}
                            >
                              <option value="">— בחר —</option>
                            </select>
                          ) : (
                            <input
                              className="input"
                              type={f.fieldType === 'number' ? 'number' : f.fieldType === 'date' ? 'date' : f.fieldType === 'email' ? 'email' : 'text'}
                              value={formData[f.name] ?? ''}
                              onChange={(e) => setFormData((d) => ({ ...d, [f.name]: e.target.value }))}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SVG_MODEL step */}
                  {se.step.type === 'SVG_MODEL' && typeof se.step.config?.templateId === 'string' && (
                    <SvgStepInteraction
                      templateId={se.step.config.templateId}
                      formData={formData}
                      onChange={setFormData}
                      onSubmit={() => handleComplete(se.stepId)}
                      submitting={submitting}
                    />
                  )}

                  {/* APPROVAL / REVIEW */}
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
                          onClick={() => { setFormData((d) => ({ ...d, approved: 'true' })); handleComplete(se.stepId); }}
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
                          <button
                            onClick={() => handleReject(se.stepId)}
                            disabled={submitting || !rejectReason.trim()}
                            className="btn-secondary text-red-600 text-sm"
                          >
                            {t.steps.reject}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TASK step */}
                  {se.step.type === 'TASK' && (
                    <button
                      onClick={() => handleComplete(se.stepId)}
                      disabled={submitting}
                      className="btn-primary"
                    >
                      {t.steps.markComplete}
                    </button>
                  )}

                  {/* ── Next station routing ── */}
                  {!isEnd && routeOptions.length > 1 && se.step.type !== 'SVG_MODEL' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                        <span>🔀</span> העבר לעמדה:
                      </label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {routeOptions.map((opt) => {
                          const optIsEnd = opt.step.config?.isEndStep === true;
                          return (
                            <button
                              key={opt.stepId}
                              onClick={() => setNextStepId(opt.stepId === nextStepId ? '' : opt.stepId)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm text-right transition-all ${
                                nextStepId === opt.stepId
                                  ? 'border-primary-500 bg-primary-50 text-primary-800 font-medium'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              <span className="text-xs">{optIsEnd ? '🏁' : '→'}</span>
                              <span className="flex-1">{opt.step.name}</span>
                              {nextStepId === opt.stepId && <span className="text-primary-600">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      {nextStepId && (
                        <p className="text-xs text-primary-600">
                          הטופס יועבר לעמדה: <strong>{routeOptions.find(o => o.stepId === nextStepId)?.step.name}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Submit button (non-SVG, non-APPROVAL) ── */}
                  {se.step.type !== 'SVG_MODEL' &&
                   se.step.type !== 'APPROVAL' &&
                   se.step.type !== 'REVIEW' &&
                   se.step.type !== 'TASK' && (
                    <button
                      onClick={() => handleComplete(se.stepId)}
                      disabled={submitting}
                      className={`w-full ${isEnd ? 'btn-primary bg-red-600 hover:bg-red-700' : 'btn-primary'}`}
                    >
                      {submitting
                        ? <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t.steps.submitting}
                          </span>
                        : isEnd ? '🏁 סיים תהליך' : t.steps.submit
                      }
                    </button>
                  )}

                  {/* TASK end-step */}
                  {se.step.type === 'TASK' && isEnd && (
                    <p className="text-xs text-red-600 text-center">⚠️ לחיצה תסיים את התהליך כולו</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Completion banner ── */}
      {isCompleted && (
        <div className="card bg-green-50 border border-green-200 text-center py-6">
          <p className="text-2xl mb-2">✅</p>
          <p className="font-semibold text-green-800 text-lg">התהליך הושלם בהצלחה</p>
          <p className="text-sm text-green-600 mt-1">
            {execution.completedAt && new Date(execution.completedAt).toLocaleString('he-IL')}
          </p>
          <button className="btn-secondary mt-4 text-sm" onClick={() => navigate('/executions')}>
            חזור לרשימת ההרצות
          </button>
        </div>
      )}
    </div>
  );
}

export interface ExecutionContext {
  executionId: string;
  processId: string;
  startedById: string;
  currentData: Record<string, unknown>;
  stepResults: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export function mergeStepData(
  ctx: ExecutionContext,
  stepId: string,
  data: Record<string, unknown>,
): ExecutionContext {
  return {
    ...ctx,
    stepResults: { ...ctx.stepResults, [stepId]: data },
    currentData: { ...ctx.currentData, ...data },
  };
}

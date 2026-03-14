import { ProcessStep, StepExecution } from '@prisma/client';
import { ExecutionContext } from '../executor/execution-context';

export interface StepHandlerResult {
  success: boolean;
  data?: Record<string, unknown>;
  nextStepId?: string;
  error?: string;
  autoComplete?: boolean;
}

export abstract class BaseStepHandler {
  abstract handle(
    step: ProcessStep,
    stepExecution: StepExecution,
    ctx: ExecutionContext,
    input?: Record<string, unknown>,
  ): Promise<StepHandlerResult>;

  protected ok(data?: Record<string, unknown>, nextStepId?: string): StepHandlerResult {
    return { success: true, data, nextStepId };
  }

  protected fail(error: string): StepHandlerResult {
    return { success: false, error };
  }

  protected autoComplete(data?: Record<string, unknown>): StepHandlerResult {
    return { success: true, data, autoComplete: true };
  }
}

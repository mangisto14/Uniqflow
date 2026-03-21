import { Injectable } from '@nestjs/common';
import { ProcessStep, StepExecution } from '@prisma/client';
import { BaseStepHandler, StepHandlerResult } from './base.handler';
import { ExecutionContext } from '../executor/execution-context';

@Injectable()
export class TaskHandler extends BaseStepHandler {
  async handle(
    _step: ProcessStep,
    _stepExecution: StepExecution,
    _ctx: ExecutionContext,
    input?: Record<string, unknown>,
  ): Promise<StepHandlerResult> {
    // Any explicit completeStep call marks the task as done
    if (input !== undefined) {
      return this.ok({ completed: true, notes: input['notes'] });
    }
    return { success: false, error: 'Awaiting task completion' };
  }
}

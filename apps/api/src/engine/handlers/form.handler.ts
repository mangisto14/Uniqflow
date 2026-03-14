import { Injectable } from '@nestjs/common';
import { ProcessStep, StepExecution } from '@prisma/client';
import { BaseStepHandler, StepHandlerResult } from './base.handler';
import { ExecutionContext } from '../executor/execution-context';

@Injectable()
export class FormHandler extends BaseStepHandler {
  async handle(
    _step: ProcessStep,
    _stepExecution: StepExecution,
    _ctx: ExecutionContext,
    input?: Record<string, unknown>,
  ): Promise<StepHandlerResult> {
    // Accept submission even with empty data (step may have no required fields)
    if (input !== undefined) {
      return this.ok(input);
    }
    // No input provided at all — waiting for user
    return { success: false, error: 'Awaiting form submission' };
  }
}

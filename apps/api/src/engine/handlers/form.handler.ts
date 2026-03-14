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
    // Form steps require user input — they stay ACTIVE until user submits
    if (input && Object.keys(input).length > 0) {
      return this.ok(input);
    }
    // No input yet — waiting for user
    return { success: false, error: 'Awaiting form submission' };
  }
}

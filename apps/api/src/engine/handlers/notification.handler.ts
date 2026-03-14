import { Injectable } from '@nestjs/common';
import { ProcessStep, StepExecution } from '@prisma/client';
import { BaseStepHandler, StepHandlerResult } from './base.handler';
import { ExecutionContext } from '../executor/execution-context';

@Injectable()
export class NotificationHandler extends BaseStepHandler {
  async handle(
    step: ProcessStep,
    _stepExecution: StepExecution,
    ctx: ExecutionContext,
  ): Promise<StepHandlerResult> {
    const config = step.config as Record<string, unknown>;
    const message = String(config['message'] ?? 'Process notification');
    // Auto-complete — notification is fire-and-forget
    return this.autoComplete({ sent: true, message, executionId: ctx.executionId });
  }
}

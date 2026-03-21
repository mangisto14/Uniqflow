import { Injectable } from '@nestjs/common';
import { ProcessStep, StepExecution } from '@prisma/client';
import { BaseStepHandler, StepHandlerResult } from './base.handler';
import { ExecutionContext } from '../executor/execution-context';

@Injectable()
export class ReviewHandler extends BaseStepHandler {
  async handle(
    _step: ProcessStep,
    _stepExecution: StepExecution,
    _ctx: ExecutionContext,
    input?: Record<string, unknown>,
  ): Promise<StepHandlerResult> {
    // Any explicit completeStep call (including approve path from UI) marks the review as done
    if (!input) return { success: false, error: 'Awaiting review' };
    const raw = input['reviewed'] ?? input['approved'];
    const isRejected = raw === false || raw === 'false';
    if (isRejected) {
      return this.fail('Review rejected: ' + (input['reason'] ?? 'No reason given'));
    }
    return this.ok({ reviewed: true, feedback: input['feedback'] ?? input['notes'] });
  }
}

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
    if (!input) return { success: false, error: 'Awaiting review' };
    const reviewed = input['reviewed'];
    if (reviewed === true) {
      return this.ok({ reviewed: true, reviewedBy: input['userId'], feedback: input['feedback'] });
    }
    return { success: false, error: 'Awaiting review' };
  }
}

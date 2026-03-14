import { Injectable } from '@nestjs/common';
import { ProcessStep, StepExecution } from '@prisma/client';
import { BaseStepHandler, StepHandlerResult } from './base.handler';
import { ExecutionContext } from '../executor/execution-context';

@Injectable()
export class ApprovalHandler extends BaseStepHandler {
  async handle(
    _step: ProcessStep,
    _stepExecution: StepExecution,
    _ctx: ExecutionContext,
    input?: Record<string, unknown>,
  ): Promise<StepHandlerResult> {
    if (!input) return { success: false, error: 'Awaiting approval decision' };

    const approved = input['approved'];
    if (approved === true) {
      return this.ok({ approved: true, approvedBy: input['userId'], notes: input['notes'] });
    } else if (approved === false) {
      return this.fail('Rejected: ' + (input['reason'] ?? 'No reason given'));
    }
    return { success: false, error: 'Awaiting approval decision' };
  }
}

import { Injectable } from '@nestjs/common';
import { ProcessStep, StepExecution } from '@prisma/client';
import { BaseStepHandler, StepHandlerResult } from './base.handler';
import { ExecutionContext } from '../executor/execution-context';
import { evaluateCondition, ConditionGroup } from '../conditions/condition-parser';

@Injectable()
export class ConditionHandler extends BaseStepHandler {
  async handle(
    step: ProcessStep,
    _stepExecution: StepExecution,
    ctx: ExecutionContext,
  ): Promise<StepHandlerResult> {
    const config = step.config as Record<string, unknown>;
    const condition = config['condition'] as ConditionGroup | undefined;

    if (!condition) {
      // No condition — auto-complete and proceed
      return this.autoComplete({ result: true });
    }

    const result = evaluateCondition(condition, ctx.currentData);
    const nextStepId = result
      ? (config['trueStepId'] as string | undefined)
      : (config['falseStepId'] as string | undefined);

    return { success: true, data: { result }, nextStepId, autoComplete: true };
  }
}

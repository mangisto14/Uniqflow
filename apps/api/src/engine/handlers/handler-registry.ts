import { Injectable } from '@nestjs/common';
import { StepType } from '@prisma/client';
import { BaseStepHandler } from './base.handler';
import { FormHandler } from './form.handler';
import { ApprovalHandler } from './approval.handler';
import { ConditionHandler } from './condition.handler';
import { TaskHandler } from './task.handler';
import { NotificationHandler } from './notification.handler';
import { ReviewHandler } from './review.handler';

@Injectable()
export class HandlerRegistry {
  private readonly handlers: Map<StepType, BaseStepHandler>;

  constructor(
    private readonly formHandler: FormHandler,
    private readonly approvalHandler: ApprovalHandler,
    private readonly conditionHandler: ConditionHandler,
    private readonly taskHandler: TaskHandler,
    private readonly notificationHandler: NotificationHandler,
    private readonly reviewHandler: ReviewHandler,
  ) {
    this.handlers = new Map([
      [StepType.FORM, this.formHandler],
      [StepType.APPROVAL, this.approvalHandler],
      [StepType.CONDITION, this.conditionHandler],
      [StepType.TASK, this.taskHandler],
      [StepType.NOTIFICATION, this.notificationHandler],
      [StepType.REVIEW, this.reviewHandler],
    ]);
  }

  get(type: StepType): BaseStepHandler {
    const handler = this.handlers.get(type);
    if (!handler) throw new Error(`No handler for step type: ${type}`);
    return handler;
  }
}

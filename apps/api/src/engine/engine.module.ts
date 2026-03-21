import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProcessExecutor } from './executor/process-executor';
import { DependencyResolver } from './executor/dependency-resolver';
import { HandlerRegistry } from './handlers/handler-registry';
import { FormHandler } from './handlers/form.handler';
import { ApprovalHandler } from './handlers/approval.handler';
import { ConditionHandler } from './handlers/condition.handler';
import { TaskHandler } from './handlers/task.handler';
import { NotificationHandler } from './handlers/notification.handler';
import { ReviewHandler } from './handlers/review.handler';
import { SvgModelHandler } from './handlers/svg-model.handler';

@Module({
  imports: [PrismaModule],
  providers: [
    ProcessExecutor,
    DependencyResolver,
    HandlerRegistry,
    FormHandler,
    ApprovalHandler,
    ConditionHandler,
    TaskHandler,
    NotificationHandler,
    ReviewHandler,
    SvgModelHandler,
  ],
  exports: [ProcessExecutor, DependencyResolver],
})
export class EngineModule {}

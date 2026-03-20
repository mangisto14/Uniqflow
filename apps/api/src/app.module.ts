import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProcessModule } from './modules/process/process.module';
import { StepModule } from './modules/step/step.module';
import { ExecutionModule } from './modules/execution/execution.module';
import { TeamModule } from './modules/team/team.module';
import { UserModule } from './modules/user/user.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { EngineModule } from './engine/engine.module';
import { SvgTemplateModule } from './modules/svg-template/svg-template.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    ProcessModule,
    StepModule,
    ExecutionModule,
    TeamModule,
    UserModule,
    NotificationModule,
    AuditModule,
    EngineModule,
    SvgTemplateModule,
  ],
})
export class AppModule {}

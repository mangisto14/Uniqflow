import { Module } from '@nestjs/common';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';
import { ExecutionGateway } from './execution.gateway';

@Module({
  controllers: [ExecutionController],
  providers: [ExecutionService, ExecutionGateway],
  exports: [ExecutionService],
})
export class ExecutionModule {}

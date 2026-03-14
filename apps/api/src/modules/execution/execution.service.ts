import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExecutionDto,
  CompleteStepDto,
  RejectStepDto,
  CancelExecutionDto,
} from './dto/create-execution.dto';
import { ProcessExecutor } from '../../engine/executor/process-executor';
import { ProcessStatus } from '@prisma/client';

@Injectable()
export class ExecutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly executor: ProcessExecutor,
  ) {}

  async start(dto: CreateExecutionDto, userId: string) {
    const process = await this.prisma.process.findUnique({ where: { id: dto.processId } });
    if (!process) throw new NotFoundException(`Process ${dto.processId} not found`);
    if (process.status !== ProcessStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE processes can be executed');
    }
    return this.executor.startExecution(dto.processId, userId, dto.metadata);
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);
    const [executions, total] = await Promise.all([
      this.prisma.processExecution.findMany({
        skip, take,
        include: { process: { select: { id: true, name: true } }, stepExecutions: true },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.processExecution.count(),
    ]);
    return { executions, total, page, limit: take };
  }

  async findOne(id: string) {
    const execution = await this.prisma.processExecution.findUnique({
      where: { id },
      include: {
        process: { include: { steps: { orderBy: { order: 'asc' } } } },
        stepExecutions: { include: { step: true, assignedTo: { select: { id: true, name: true } } } },
      },
    });
    if (!execution) throw new NotFoundException(`Execution ${id} not found`);
    return execution;
  }

  async completeStep(executionId: string, stepId: string, dto: CompleteStepDto, userId: string) {
    return this.executor.completeStep(executionId, stepId, userId, dto.data ?? {});
  }

  async rejectStep(executionId: string, stepId: string, dto: RejectStepDto, userId: string) {
    return this.executor.rejectStep(executionId, stepId, userId, dto.reason);
  }

  async pause(executionId: string) {
    await this.findOne(executionId);
    return this.prisma.processExecution.update({
      where: { id: executionId },
      data: { status: ProcessStatus.PAUSED },
    });
  }

  async resume(executionId: string) {
    await this.findOne(executionId);
    return this.prisma.processExecution.update({
      where: { id: executionId },
      data: { status: ProcessStatus.ACTIVE },
    });
  }

  async cancel(executionId: string, dto: CancelExecutionDto) {
    await this.findOne(executionId);
    return this.prisma.processExecution.update({
      where: { id: executionId },
      data: {
        status: ProcessStatus.CANCELLED,
        cancelledAt: new Date(),
        metadata: { cancellationReason: dto.reason },
      },
    });
  }

  async getHistory(executionId: string) {
    const execution = await this.findOne(executionId);
    return execution.stepExecutions.sort(
      (a, b) =>
        new Date(a.startedAt ?? 0).getTime() - new Date(b.startedAt ?? 0).getTime(),
    );
  }
}

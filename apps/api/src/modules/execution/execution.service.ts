import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExecutionDto,
  CompleteStepDto,
  RejectStepDto,
  CancelExecutionDto,
} from './dto/create-execution.dto';
import { ProcessExecutor } from '../../engine/executor/process-executor';
import { ExecutionGateway } from './execution.gateway';
import { ProcessStatus } from '@prisma/client';

@Injectable()
export class ExecutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly executor: ProcessExecutor,
    private readonly gateway: ExecutionGateway,
  ) {}

  async start(dto: CreateExecutionDto, userId: string) {
    const process = await this.prisma.process.findUnique({ where: { id: dto.processId } });
    if (!process) throw new NotFoundException(`Process ${dto.processId} not found`);
    if (process.status !== ProcessStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE processes can be executed');
    }
    const result = await this.executor.startExecution(dto.processId, userId, dto.metadata);
    this.gateway.emitExecutionUpdate(result.id, result);
    return result;
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
    const result = await this.executor.completeStep(
      executionId, stepId, userId, dto.data ?? {}, dto.nextStepId,
    );
    this.gateway.emitExecutionUpdate(executionId, result);
    return result;
  }

  async rejectStep(executionId: string, stepId: string, dto: RejectStepDto, userId: string) {
    const result = await this.executor.rejectStep(executionId, stepId, userId, dto.reason);
    this.gateway.emitStepUpdate(executionId, result);
    return result;
  }

  async pause(executionId: string) {
    await this.findOne(executionId);
    const result = await this.prisma.processExecution.update({
      where: { id: executionId },
      data: { status: ProcessStatus.PAUSED },
    });
    this.gateway.emitExecutionUpdate(executionId, result);
    return result;
  }

  async resume(executionId: string) {
    await this.findOne(executionId);
    const result = await this.prisma.processExecution.update({
      where: { id: executionId },
      data: { status: ProcessStatus.ACTIVE },
    });
    this.gateway.emitExecutionUpdate(executionId, result);
    return result;
  }

  async cancel(executionId: string, dto: CancelExecutionDto) {
    await this.findOne(executionId);
    const result = await this.prisma.processExecution.update({
      where: { id: executionId },
      data: {
        status: ProcessStatus.CANCELLED,
        cancelledAt: new Date(),
        metadata: { cancellationReason: dto.reason },
      },
    });
    this.gateway.emitExecutionUpdate(executionId, result);
    return result;
  }

  async getHistory(executionId: string) {
    const execution = await this.findOne(executionId);
    return execution.stepExecutions.sort(
      (a, b) =>
        new Date(a.startedAt ?? 0).getTime() - new Date(b.startedAt ?? 0).getTime(),
    );
  }
}

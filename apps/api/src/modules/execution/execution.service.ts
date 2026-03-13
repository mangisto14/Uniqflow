import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExecutionDto,
  CompleteStepDto,
  RejectStepDto,
  CancelExecutionDto,
} from './dto/create-execution.dto';
import { Prisma, ProcessStatus, StepExecutionStatus } from '@prisma/client';

@Injectable()
export class ExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  async start(dto: CreateExecutionDto, userId: string) {
    const process = await this.prisma.process.findUnique({
      where: { id: dto.processId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
    if (!process) throw new NotFoundException(`Process ${dto.processId} not found`);
    if (process.status !== ProcessStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE processes can be executed');
    }

    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.processExecution.create({
        data: {
          processId: dto.processId,
          startedById: userId,
          metadata: dto.metadata as Prisma.InputJsonValue | undefined,
          stepExecutions: {
            create: process.steps.map((step) => ({
              stepId: step.id,
              status: StepExecutionStatus.PENDING,
            })),
          },
        },
        include: { stepExecutions: true },
      });

      // Activate first step
      if (process.steps.length > 0) {
        await tx.stepExecution.updateMany({
          where: { executionId: execution.id, stepId: process.steps[0].id },
          data: { status: StepExecutionStatus.ACTIVE, startedAt: new Date() },
        });
      }

      return execution;
    });
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
    const execution = await this.findOne(executionId);
    const stepExecution = execution.stepExecutions.find((se) => se.stepId === stepId);
    if (!stepExecution) throw new NotFoundException(`Step execution not found`);
    if (stepExecution.status !== StepExecutionStatus.ACTIVE) {
      throw new BadRequestException(`Step is not in ACTIVE state`);
    }

    const stepData = (dto.data ?? {}) as Record<string, unknown>;
    const currentData = execution.currentData as Record<string, unknown>;

    return this.prisma.$transaction(async (tx) => {
      const completed = await tx.stepExecution.update({
        where: { id: stepExecution.id },
        data: {
          status: StepExecutionStatus.COMPLETED,
          data: stepData as Prisma.InputJsonValue,
          notes: dto.notes,
          completedAt: new Date(),
          assignedToId: userId,
        },
      });

      // Merge data into execution
      await tx.processExecution.update({
        where: { id: executionId },
        data: {
          currentData: { ...currentData, ...stepData } as Prisma.InputJsonValue,
        },
      });

      // Activate next pending step
      const pendingSteps = execution.stepExecutions.filter(
        (se) => se.status === StepExecutionStatus.PENDING,
      );
      if (pendingSteps.length > 0) {
        await tx.stepExecution.update({
          where: { id: pendingSteps[0].id },
          data: { status: StepExecutionStatus.ACTIVE, startedAt: new Date() },
        });
      } else {
        // Check if all complete
        const remaining = execution.stepExecutions.filter(
          (se) => se.id !== stepExecution.id && se.status !== StepExecutionStatus.COMPLETED,
        );
        if (remaining.length === 0) {
          await tx.processExecution.update({
            where: { id: executionId },
            data: { status: ProcessStatus.COMPLETED, completedAt: new Date() },
          });
        }
      }

      return completed;
    });
  }

  async rejectStep(executionId: string, stepId: string, dto: RejectStepDto, userId: string) {
    const execution = await this.findOne(executionId);
    const stepExecution = execution.stepExecutions.find((se) => se.stepId === stepId);
    if (!stepExecution) throw new NotFoundException(`Step execution ${stepId} not found`);

    return this.prisma.stepExecution.update({
      where: { id: stepExecution.id },
      data: {
        status: StepExecutionStatus.FAILED,
        notes: dto.reason,
        assignedToId: userId,
        completedAt: new Date(),
      },
    });
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

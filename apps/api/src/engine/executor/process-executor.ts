import { Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HandlerRegistry } from '../handlers/handler-registry';
import { ExecutionContext, mergeStepData } from './execution-context';
import { canTransitionStep } from '../state-machine/step-fsm';
import { canTransitionProcess } from '../state-machine/process-fsm';
import {
  Prisma,
  ProcessStep,
  StepExecution,
  StepExecutionStatus,
  ProcessStatus,
  StepType,
} from '@prisma/client';

export interface IExecutionGateway {
  emitExecutionUpdate(executionId: string, data: unknown): void;
  emitStepUpdate(executionId: string, stepData: unknown): void;
}

@Injectable()
export class ProcessExecutor {
  private readonly logger = new Logger(ProcessExecutor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly handlers: HandlerRegistry,
    @Optional() private readonly gateway?: IExecutionGateway,
  ) {}

  async startExecution(
    processId: string,
    startedById: string,
    metadata?: Record<string, unknown>,
  ) {
    const process = await this.prisma.process.findUniqueOrThrow({
      where: { id: processId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return this.prisma.$transaction(async (tx) => {
      const execution = await tx.processExecution.create({
        data: {
          processId,
          startedById,
          status: ProcessStatus.ACTIVE,
          metadata: (metadata ?? {}) as Prisma.InputJsonValue,
          currentData: {} as Prisma.InputJsonValue,
          stepExecutions: {
            create: process.steps.map((s) => ({
              stepId: s.id,
              status: StepExecutionStatus.PENDING,
            })),
          },
        },
        include: { stepExecutions: true },
      });

      if (process.steps.length > 0) {
        const firstStep = process.steps[0];
        await tx.stepExecution.updateMany({
          where: { executionId: execution.id, stepId: firstStep.id },
          data: { status: StepExecutionStatus.ACTIVE, startedAt: new Date() },
        });

        if (this.isAutoStep(firstStep.type)) {
          await this.autoAdvance(tx, execution.id, firstStep, process.steps, execution.stepExecutions, {});
        }
      }

      const result = await tx.processExecution.findUniqueOrThrow({
        where: { id: execution.id },
        include: { stepExecutions: { include: { step: true } } },
      });

      this.gateway?.emitExecutionUpdate(result.id, result);
      return result;
    });
  }

  async completeStep(
    executionId: string,
    stepId: string,
    userId: string,
    input: Record<string, unknown>,
    nextStepId?: string,
  ) {
    const execution = await this.prisma.processExecution.findUniqueOrThrow({
      where: { id: executionId },
      include: {
        process: { include: { steps: { orderBy: { order: 'asc' } } } },
        stepExecutions: true,
      },
    });

    const stepExecution = execution.stepExecutions.find((se) => se.stepId === stepId);
    if (!stepExecution) throw new Error(`Step execution not found for step ${stepId}`);
    if (!canTransitionStep(stepExecution.status, StepExecutionStatus.COMPLETED)) {
      throw new Error(`Cannot complete step in state ${stepExecution.status}`);
    }

    const step = execution.process.steps.find((s) => s.id === stepId)!;
    const ctx: ExecutionContext = {
      executionId,
      processId: execution.processId,
      startedById: execution.startedById,
      currentData: (execution.currentData ?? {}) as Record<string, unknown>,
      stepResults: {},
      metadata: (execution.metadata ?? {}) as Record<string, unknown>,
    };

    const handler = this.handlers.get(step.type);
    const result = await handler.handle(step, stepExecution, ctx, input);

    if (!result.success) throw new Error(result.error ?? 'Step handler failed');

    const updatedCtx = mergeStepData(ctx, stepId, result.data ?? {});

    return this.prisma.$transaction(async (tx) => {
      const updatedSE = await tx.stepExecution.update({
        where: { id: stepExecution.id },
        data: {
          status: StepExecutionStatus.COMPLETED,
          data: (result.data ?? {}) as Prisma.InputJsonValue,
          completedAt: new Date(),
          assignedToId: userId,
        },
      });

      await tx.processExecution.update({
        where: { id: executionId },
        data: { currentData: updatedCtx.currentData as Prisma.InputJsonValue },
      });

      await this.advanceExecution(
        tx,
        execution.id,
        execution.process.steps,
        execution.stepExecutions,
        stepId,
        updatedCtx,
        nextStepId,
      );

      const finalExecution = await tx.processExecution.findUniqueOrThrow({
        where: { id: executionId },
        include: { stepExecutions: { include: { step: true } } },
      });

      this.gateway?.emitStepUpdate(executionId, updatedSE);
      this.gateway?.emitExecutionUpdate(executionId, finalExecution);

      return finalExecution;
    });
  }

  async rejectStep(
    executionId: string,
    stepId: string,
    userId: string,
    reason: string,
  ) {
    const stepExecution = await this.prisma.stepExecution.findFirstOrThrow({
      where: { executionId, stepId },
    });

    const updated = await this.prisma.stepExecution.update({
      where: { id: stepExecution.id },
      data: {
        status: StepExecutionStatus.FAILED,
        notes: reason,
        assignedToId: userId,
        completedAt: new Date(),
      },
    });

    this.gateway?.emitStepUpdate(executionId, updated);
    return updated;
  }

  private async advanceExecution(
    tx: Prisma.TransactionClient,
    executionId: string,
    steps: ProcessStep[],
    stepExecutions: StepExecution[],
    completedStepId: string,
    ctx: ExecutionContext,
    nextStepId?: string,
  ) {
    // Check if completed step is marked as end station
    const completedStep = steps.find((s) => s.id === completedStepId);
    const isEndStep = (completedStep?.config as Record<string, unknown>)?.isEndStep === true;

    if (isEndStep) {
      if (canTransitionProcess(ProcessStatus.ACTIVE, ProcessStatus.COMPLETED)) {
        await tx.processExecution.update({
          where: { id: executionId },
          data: { status: ProcessStatus.COMPLETED, completedAt: new Date() },
        });
      }
      return;
    }

    // Determine next step: manual override > sequential
    let nextStep: ProcessStep | undefined;
    if (nextStepId) {
      nextStep = steps.find((s) => s.id === nextStepId);
    }
    if (!nextStep) {
      const completedIdx = steps.findIndex((s) => s.id === completedStepId);
      nextStep = steps[completedIdx + 1];
    }

    if (!nextStep) {
      if (canTransitionProcess(ProcessStatus.ACTIVE, ProcessStatus.COMPLETED)) {
        await tx.processExecution.update({
          where: { id: executionId },
          data: { status: ProcessStatus.COMPLETED, completedAt: new Date() },
        });
      }
      return;
    }

    // Activate the next step execution (reset if it was already visited)
    const nextSE = stepExecutions.find((se) => se.stepId === nextStep!.id);
    if (!nextSE) return;

    await tx.stepExecution.update({
      where: { id: nextSE.id },
      data: { status: StepExecutionStatus.ACTIVE, startedAt: new Date() },
    });

    if (this.isAutoStep(nextStep.type)) {
      await this.autoAdvance(tx, executionId, nextStep, steps, stepExecutions, ctx.currentData);
    }
  }

  private async autoAdvance(
    tx: Prisma.TransactionClient,
    executionId: string,
    step: ProcessStep,
    allSteps: ProcessStep[],
    stepExecutions: StepExecution[],
    currentData: Record<string, unknown>,
  ) {
    const ctx: ExecutionContext = {
      executionId,
      processId: '',
      startedById: '',
      currentData,
      stepResults: {},
      metadata: {},
    };

    const se = stepExecutions.find((s) => s.stepId === step.id);
    if (!se) return;

    try {
      const handler = this.handlers.get(step.type);
      const result = await handler.handle(step, se, ctx);
      if (result.autoComplete) {
        await tx.stepExecution.update({
          where: { id: se.id },
          data: {
            status: StepExecutionStatus.COMPLETED,
            data: (result.data ?? {}) as Prisma.InputJsonValue,
            completedAt: new Date(),
          },
        });

        const updatedCtx = mergeStepData(ctx, step.id, result.data ?? {});
        await this.advanceExecution(
          tx,
          executionId,
          allSteps,
          stepExecutions,
          step.id,
          updatedCtx,
          result.nextStepId,
        );
      }
    } catch (e) {
      this.logger.error(`Auto-advance failed for step ${step.id}`, e);
    }
  }

  private isAutoStep(type: StepType): boolean {
    return type === StepType.CONDITION || type === StepType.NOTIFICATION;
  }
}

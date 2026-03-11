import { ProcessStatus } from './process';

export enum StepExecutionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED',
}

export interface IStepExecution {
  id: string;
  executionId: string;
  stepId: string;
  status: StepExecutionStatus;
  data: Record<string, unknown>;
  assignedToId?: string;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface IExecution {
  id: string;
  processId: string;
  status: ProcessStatus;
  currentData: Record<string, unknown>;
  startedById: string;
  startedAt: string;
  completedAt?: string;
  stepExecutions: IStepExecution[];
}

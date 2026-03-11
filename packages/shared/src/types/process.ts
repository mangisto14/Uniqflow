export enum ProcessStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface IProcess {
  id: string;
  name: string;
  description?: string;
  status: ProcessStatus;
  version: number;
  metadata?: Record<string, unknown>;
  createdById: string;
  steps: import('./step').IStep[];
  createdAt: string;
  updatedAt: string;
}

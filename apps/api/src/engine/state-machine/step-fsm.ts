import { StepExecutionStatus } from '@prisma/client';

type StepTransition = {
  from: StepExecutionStatus;
  to: StepExecutionStatus;
};

const ALLOWED_TRANSITIONS: StepTransition[] = [
  { from: StepExecutionStatus.PENDING, to: StepExecutionStatus.ACTIVE },
  { from: StepExecutionStatus.PENDING, to: StepExecutionStatus.SKIPPED },
  { from: StepExecutionStatus.ACTIVE, to: StepExecutionStatus.COMPLETED },
  { from: StepExecutionStatus.ACTIVE, to: StepExecutionStatus.FAILED },
  { from: StepExecutionStatus.ACTIVE, to: StepExecutionStatus.PENDING },
  { from: StepExecutionStatus.FAILED, to: StepExecutionStatus.ACTIVE },
];

export function canTransitionStep(
  from: StepExecutionStatus,
  to: StepExecutionStatus,
): boolean {
  return ALLOWED_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

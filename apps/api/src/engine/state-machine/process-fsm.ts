import { ProcessStatus } from '@prisma/client';

type ProcessTransition = {
  from: ProcessStatus;
  to: ProcessStatus;
};

const ALLOWED_TRANSITIONS: ProcessTransition[] = [
  { from: ProcessStatus.ACTIVE, to: ProcessStatus.COMPLETED },
  { from: ProcessStatus.ACTIVE, to: ProcessStatus.CANCELLED },
  { from: ProcessStatus.ACTIVE, to: ProcessStatus.PAUSED },
  { from: ProcessStatus.PAUSED, to: ProcessStatus.ACTIVE },
  { from: ProcessStatus.PAUSED, to: ProcessStatus.CANCELLED },
];

export function canTransitionProcess(
  from: ProcessStatus,
  to: ProcessStatus,
): boolean {
  return ALLOWED_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

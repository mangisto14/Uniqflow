import { IConditionGroup, ICondition } from '../types/conditions';

export function isConditionGroup(
  condition: ICondition | IConditionGroup,
): condition is IConditionGroup {
  return 'logic' in condition && 'conditions' in condition;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidCuid(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function paginate(page: number, limit: number, maxLimit = 100) {
  const safePage = Math.max(1, page);
  const safeLimit = clamp(limit, 1, maxLimit);
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

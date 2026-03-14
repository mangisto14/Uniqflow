export type ConditionOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'not_contains' | 'starts_with' | 'ends_with'
  | 'is_empty' | 'is_not_empty' | 'in' | 'not_in';

export type LogicalOperator = 'AND' | 'OR';

export interface ConditionRule {
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export interface ConditionGroup {
  logic: LogicalOperator;
  rules: (ConditionRule | ConditionGroup)[];
}

function isGroup(r: ConditionRule | ConditionGroup): r is ConditionGroup {
  return 'logic' in r;
}

function getFieldValue(data: Record<string, unknown>, field: string): unknown {
  return field.split('.').reduce<unknown>((obj, key) => {
    if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
    return undefined;
  }, data);
}

function evaluateRule(rule: ConditionRule, data: Record<string, unknown>): boolean {
  const val = getFieldValue(data, rule.field);
  const rv = rule.value;

  switch (rule.operator) {
    case 'eq': return val === rv;
    case 'neq': return val !== rv;
    case 'gt': return Number(val) > Number(rv);
    case 'gte': return Number(val) >= Number(rv);
    case 'lt': return Number(val) < Number(rv);
    case 'lte': return Number(val) <= Number(rv);
    case 'contains': return String(val).includes(String(rv));
    case 'not_contains': return !String(val).includes(String(rv));
    case 'starts_with': return String(val).startsWith(String(rv));
    case 'ends_with': return String(val).endsWith(String(rv));
    case 'is_empty': return val === null || val === undefined || val === '';
    case 'is_not_empty': return val !== null && val !== undefined && val !== '';
    case 'in': return Array.isArray(rv) && rv.includes(val);
    case 'not_in': return Array.isArray(rv) && !rv.includes(val);
    default: return false;
  }
}

export function evaluateCondition(
  condition: ConditionGroup,
  data: Record<string, unknown>,
): boolean {
  const results = condition.rules.map((r) =>
    isGroup(r) ? evaluateCondition(r, data) : evaluateRule(r, data),
  );
  return condition.logic === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}

export enum Operator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  REGEX = 'regex',
}

export enum LogicOperator {
  AND = 'AND',
  OR = 'OR',
}

export interface ICondition {
  field: string;
  operator: Operator;
  value: unknown;
}

export interface IConditionGroup {
  logic: LogicOperator;
  conditions: Array<ICondition | IConditionGroup>;
}

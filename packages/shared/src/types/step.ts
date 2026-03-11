import { IConditionGroup } from './conditions';
import { ISharingRule } from './sharing';

export type { ISharingRule };

export enum StepType {
  FORM = 'FORM',
  APPROVAL = 'APPROVAL',
  CONDITION = 'CONDITION',
  NOTIFICATION = 'NOTIFICATION',
  TASK = 'TASK',
  REVIEW = 'REVIEW',
}

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'textarea'
  | 'file'
  | 'checkbox';

export interface IStepField {
  id: string;
  stepId: string;
  name: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  defaultValue?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
  conditionalOn?: IConditionGroup;
}

export interface IStepBranch {
  id: string;
  stepId: string;
  label: string;
  condition: IConditionGroup;
  targetStepId?: string;
  isDefault: boolean;
  order: number;
}

export interface IStepDependency {
  id: string;
  stepId: string;
  dependsOnStepId: string;
  type: 'completion' | 'approval' | 'condition';
}

export interface IStep {
  id: string;
  processId: string;
  type: StepType;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  order: number;
  assignedTeamId?: string;
  timeoutMinutes?: number;
  isRequired: boolean;
  fields?: IStepField[];
  branches?: IStepBranch[];
  dependencies?: IStepDependency[];
  sharingRules?: ISharingRule[];
}

export type TriggerKind = 'webhook' | 'schedule' | 'app_trigger';
export type StepKind = 'piece_action' | 'code' | 'branch' | 'loop';

export interface WebhookTriggerPlan {
  kind: 'webhook';
  name?: string;
  inputs?: Record<string, unknown>;
}

export interface ScheduleTriggerPlan {
  kind: 'schedule';
  cron: string;
  inputs?: Record<string, unknown>;
}

export interface AppTriggerPlan {
  kind: 'app_trigger';
  piece: string;
  triggerName: string;
  version?: string;
  name?: string;
  inputs?: Record<string, unknown>;
}

export type FlowTriggerPlan =
  | WebhookTriggerPlan
  | ScheduleTriggerPlan
  | AppTriggerPlan;

export interface PieceActionStepPlan {
  kind: 'piece_action';
  piece: string;
  actionName: string;
  version?: string;
  name?: string;
  inputs?: Record<string, unknown>;
}

export interface CodeStepPlan {
  kind: 'code';
  name?: string;
  language?: 'ts' | 'js';
  sourceCode: string;
  packageJson?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
}

export interface BranchStepPlan {
  kind: 'branch';
  expression: string;
  whenTrue: FlowStepPlan[];
  whenFalse?: FlowStepPlan[];
}

export interface LoopStepPlan {
  kind: 'loop';
  itemsExpr: string;
  body: FlowStepPlan[];
}

export type FlowStepPlan =
  | PieceActionStepPlan
  | CodeStepPlan
  | BranchStepPlan
  | LoopStepPlan;

export interface LoadOptionsHint {
  piece: string;
  targetType: 'action' | 'trigger';
  targetName: string;
  property: string;
}

export interface ChecklistItem {
  field: string;
  description?: string;
  placeholder?: string;
}

export interface FlowPlan {
  name: string;
  description?: string;
  folderId?: string | null;
  trigger: FlowTriggerPlan;
  steps: FlowStepPlan[];
  enableAfterBuild?: boolean;
  __needsOptions?: LoadOptionsHint[];
  checklist?: ChecklistItem[];
}

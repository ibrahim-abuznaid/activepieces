import { z } from 'zod';

export const loadOptionsHintSchema = z.object({
  piece: z.string().min(1),
  targetType: z.enum(['action', 'trigger']),
  targetName: z.string().min(1),
  property: z.string().min(1),
});

export const checklistItemSchema = z.object({
  field: z.string().min(1),
  description: z.string().optional(),
  placeholder: z.string().optional(),
});

const baseStepSchema = z.object({
  name: z.string().min(1).optional(),
  inputs: z.record(z.unknown()).optional(),
});

const pieceActionSchema = baseStepSchema.extend({
  kind: z.literal('piece_action'),
  piece: z.string().min(1),
  actionName: z.string().min(1),
  version: z.string().optional(),
});

const codeStepSchema = baseStepSchema.extend({
  kind: z.literal('code'),
  language: z.enum(['ts', 'js']).optional(),
  sourceCode: z.string().min(1),
  packageJson: z.record(z.unknown()).optional(),
});

export const flowStepSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    pieceActionSchema,
    codeStepSchema,
    baseStepSchema.extend({
      kind: z.literal('branch'),
      expression: z.string().min(1),
      whenTrue: z.array(flowStepSchema),
      whenFalse: z.array(flowStepSchema).optional(),
    }),
    baseStepSchema.extend({
      kind: z.literal('loop'),
      itemsExpr: z.string().min(1),
      body: z.array(flowStepSchema),
    }),
  ]),
);

const triggerBaseSchema = z.object({
  inputs: z.record(z.unknown()).optional(),
  name: z.string().optional(),
});

const webhookTriggerSchema = triggerBaseSchema.extend({
  kind: z.literal('webhook'),
});

const scheduleTriggerSchema = triggerBaseSchema.extend({
  kind: z.literal('schedule'),
  cron: z.string().min(1),
});

const appTriggerSchema = triggerBaseSchema.extend({
  kind: z.literal('app_trigger'),
  piece: z.string().min(1),
  triggerName: z.string().min(1),
  version: z.string().optional(),
});

export const flowTriggerSchema = z.union([
  webhookTriggerSchema,
  scheduleTriggerSchema,
  appTriggerSchema,
]);

export const flowPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  folderId: z.string().optional().nullable(),
  trigger: flowTriggerSchema,
  steps: z.array(flowStepSchema),
  enableAfterBuild: z.boolean().optional(),
  __needsOptions: z.array(loadOptionsHintSchema).optional(),
  checklist: z.array(checklistItemSchema).optional(),
});

export type FlowPlanInput = z.infer<typeof flowPlanSchema>;

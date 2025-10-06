import { z } from 'zod';

import {
  FlowActionType,
  FlowOperationType,
  FlowStatus,
  FlowTriggerType,
  StepLocationRelativeToParent,
} from '@activepieces/shared';

export const createFlowSchema = z.object({
  displayName: z.string().min(1),
  projectId: z.string().min(1),
  folderId: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

const sampleDataSchema = z
  .object({
    sampleDataFileId: z.string().optional().nullable(),
    sampleDataInputFileId: z.string().optional().nullable(),
  })
  .partial();

const baseStepSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  valid: z.boolean(),
  skip: z.boolean().optional(),
  customLogoUrl: z.string().optional(),
  sampleData: sampleDataSchema.optional(),
});

const codeActionSchema = baseStepSchema.extend({
  type: z.literal(FlowActionType.CODE),
  settings: z.object({
    sourceCode: z.object({
      code: z.string(),
      packageJson: z.string(),
    }),
    input: z.record(z.unknown()).optional(),
    customLogoUrl: z.string().optional(),
    sampleData: sampleDataSchema.optional(),
    errorHandlingOptions: z.record(z.unknown()).optional(),
  }),
});

const pieceActionSchema = baseStepSchema.extend({
  type: z.literal(FlowActionType.PIECE),
  settings: z.object({
    pieceName: z.string(),
    pieceVersion: z.string(),
    actionName: z.string().optional(),
    input: z.record(z.unknown()),
    propertySettings: z.record(z.unknown()).optional(),
    customLogoUrl: z.string().optional(),
    sampleData: sampleDataSchema.optional(),
    errorHandlingOptions: z.record(z.unknown()).optional(),
  }),
});

const triggerSettingsSchema = z
  .object({
    pieceName: z.string().optional(),
    pieceVersion: z.string().optional(),
    triggerName: z.string().optional(),
    input: z.record(z.unknown()).optional(),
    propertySettings: z.record(z.unknown()).optional(),
    customLogoUrl: z.string().optional(),
    sampleData: sampleDataSchema.optional(),
  })
  .partial();

const triggerOperationSchema = z.object({
  type: z.literal(FlowOperationType.UPDATE_TRIGGER),
  request: baseStepSchema.extend({
    type: z.nativeEnum(FlowTriggerType),
    settings: triggerSettingsSchema,
  }),
});

const addActionOperationSchema = z.object({
  type: z.literal(FlowOperationType.ADD_ACTION),
  request: z.object({
    parentStep: z.string().min(1),
    stepLocationRelativeToParent: z
      .nativeEnum(StepLocationRelativeToParent)
      .optional(),
    branchIndex: z.number().optional(),
    action: z.union([pieceActionSchema, codeActionSchema]),
  }),
});

const changeStatusOperationSchema = z.object({
  type: z.literal(FlowOperationType.CHANGE_STATUS),
  request: z.object({
    status: z.nativeEnum(FlowStatus),
  }),
});

export const flowOperationSchema = z.union([
  triggerOperationSchema,
  addActionOperationSchema,
  changeStatusOperationSchema,
]);

export type FlowOperationInput = z.infer<typeof flowOperationSchema>;
export type FlowCreateInput = z.infer<typeof createFlowSchema>;

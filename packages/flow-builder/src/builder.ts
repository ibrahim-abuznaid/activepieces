import {
  DEFAULT_SAMPLE_DATA_SETTINGS,
  FlowActionType,
  FlowOperationRequest,
  FlowOperationType,
  FlowStatus,
  FlowTriggerType,
  PieceTriggerSettings,
  StepLocationRelativeToParent,
} from '@activepieces/shared';
import { PieceMetadataModel } from '@activepieces/pieces-framework';
import { IFlowBackend } from '@flowpilot/activepieces-client';

import { FlowPlan, FlowStepPlan, PieceActionStepPlan } from './plan';
import { flowPlanSchema } from './validators';

const PLACEHOLDER_PATTERN = /<ASK_USER:([^>]+)>/i;

const DEFAULT_ERROR_HANDLING = {
  continueOnFailure: { value: false },
  retryOnFailure: { value: false },
};

export interface BuildOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export interface PlannedOperation {
  label: string;
  operation: FlowOperationRequest;
}

export interface BuildResult {
  flowId: string;
  created: boolean;
  operations: PlannedOperation[];
  dryRun: boolean;
  plan: FlowPlan;
}

export class MissingInputsError extends Error {
  constructor(readonly placeholders: string[]) {
    super(
      `Flow plan contains unresolved placeholders: ${placeholders.join(', ')}`,
    );
    this.name = 'MissingInputsError';
  }
}

export class UnsupportedStepError extends Error {
  constructor(readonly step: FlowStepPlan) {
    super(`FlowBuilder does not yet support step kind "${step.kind}"`);
    this.name = 'UnsupportedStepError';
  }
}

export class FlowBuilder {
  constructor(private readonly backend: IFlowBackend) {}

  async build(plan: FlowPlan, options: BuildOptions = {}): Promise<BuildResult> {
    const parsedPlan = flowPlanSchema.parse(plan);
    const unresolvedPlaceholders = collectPlaceholders(parsedPlan);
    if (unresolvedPlaceholders.length > 0) {
      throw new MissingInputsError(unresolvedPlaceholders);
    }

    const dryRun = options.dryRun ?? false;

    const existing = await this.lookupFlowByName(parsedPlan.name);
    const created = !existing && !dryRun;

    let flowId = existing?.id ?? '';
    if (!existing && !dryRun) {
      const createdFlow = await this.backend.flows.create({
        displayName: parsedPlan.name,
        folderId: parsedPlan.folderId ?? undefined,
        metadata: null,
      });
      flowId = createdFlow.id;
    } else if (!existing && dryRun) {
      flowId = 'DRY_RUN_NEW_FLOW';
    }

    if (existing && dryRun) {
      flowId = existing.id;
    }

    const operations: PlannedOperation[] = [];
    const triggerOperation = await this.buildTriggerOperation(parsedPlan);
    operations.push({ label: 'Update trigger', operation: triggerOperation });

    const stepOperations = await this.buildStepOperations(parsedPlan.steps);
    operations.push(...stepOperations);

    if (parsedPlan.enableAfterBuild) {
      operations.push({
        label: 'Enable flow',
        operation: {
          type: FlowOperationType.CHANGE_STATUS,
          request: { status: FlowStatus.ENABLED },
        },
      });
    }

    if (!dryRun) {
      await this.applyOperations(flowId, operations);
    }

    return {
      flowId,
      created,
      operations,
      dryRun,
      plan: parsedPlan,
    };
  }

  private async lookupFlowByName(name: string) {
    const result = await this.backend.flows.list({ name, limit: 1 });
    return result.data.find((flow) => flow.version.displayName === name);
  }

  private async applyOperations(
    flowId: string,
    operations: PlannedOperation[],
  ): Promise<void> {
    for (const op of operations) {
      await this.backend.flows.update(flowId, op.operation);
    }
  }

  private async buildTriggerOperation(plan: FlowPlan): Promise<FlowOperationRequest> {
    const trigger = plan.trigger;
    if (trigger.kind === 'app_trigger') {
      const version = await this.resolvePieceVersion(
        trigger.piece,
        trigger.version,
      );
      const request: FlowOperationRequest = {
        type: FlowOperationType.UPDATE_TRIGGER,
        request: {
          name: 'trigger',
          displayName: trigger.name ?? humanize(trigger.triggerName),
          valid: true,
          skip: false,
          type: FlowTriggerType.PIECE,
          settings: {
            pieceName: trigger.piece,
            pieceVersion: version,
            triggerName: trigger.triggerName,
            input: trigger.inputs ?? {},
            propertySettings: {},
            sampleData: DEFAULT_SAMPLE_DATA_SETTINGS,
          } satisfies PieceTriggerSettings,
        },
      };
      return request;
    }

    if (trigger.kind === 'webhook') {
      const version = await this.resolvePieceVersion('webhook');
      return {
        type: FlowOperationType.UPDATE_TRIGGER,
        request: {
          name: 'trigger',
          displayName: trigger.name ?? 'Webhook',
          valid: true,
          skip: false,
          type: FlowTriggerType.PIECE,
          settings: {
            pieceName: 'webhook',
            pieceVersion: version,
            triggerName: 'catch_webhook',
            input: trigger.inputs ?? {},
            propertySettings: {},
            sampleData: DEFAULT_SAMPLE_DATA_SETTINGS,
          } satisfies PieceTriggerSettings,
        },
      };
    }

    if (trigger.kind === 'schedule') {
      const version = await this.resolvePieceVersion('schedule');
      return {
        type: FlowOperationType.UPDATE_TRIGGER,
        request: {
          name: 'trigger',
          displayName: trigger.name ?? 'Schedule',
          valid: true,
          skip: false,
          type: FlowTriggerType.PIECE,
          settings: {
            pieceName: 'schedule',
            pieceVersion: version,
            triggerName: 'cron',
            input: { cron: trigger.cron, ...(trigger.inputs ?? {}) },
            propertySettings: {},
            sampleData: DEFAULT_SAMPLE_DATA_SETTINGS,
          } satisfies PieceTriggerSettings,
        },
      };
    }

    throw new Error(`Unknown trigger kind: ${(trigger as { kind: string }).kind}`);
  }

  private async buildStepOperations(
    steps: FlowStepPlan[],
  ): Promise<PlannedOperation[]> {
    const operations: PlannedOperation[] = [];
    let parentStep = 'trigger';
    let index = 0;
    for (const step of steps) {
      index += 1;
      switch (step.kind) {
        case 'piece_action': {
          const operation = await this.createPieceActionOperation(
            step,
            parentStep,
            index,
          );
          operations.push({
            label: `Add action: ${step.piece}.${step.actionName}`,
            operation,
          });
          parentStep = operation.request.action.name;
          break;
        }
        case 'code': {
          const operation = await this.createCodeActionOperation(
            step,
            parentStep,
            index,
          );
          operations.push({ label: 'Add code action', operation });
          parentStep = operation.request.action.name;
          break;
        }
        default:
          throw new UnsupportedStepError(step);
      }
    }
    return operations;
  }

  private async createPieceActionOperation(
    step: PieceActionStepPlan,
    parentStep: string,
    index: number,
  ): Promise<FlowOperationRequest> {
    const version = await this.resolvePieceVersion(step.piece, step.version);
    const name = step.name ?? `step_${index}`;
    return {
      type: FlowOperationType.ADD_ACTION,
      request: {
        parentStep,
        stepLocationRelativeToParent: StepLocationRelativeToParent.AFTER,
        action: {
          name,
          displayName: step.name ?? humanize(step.actionName),
          valid: true,
          skip: false,
          type: FlowActionType.PIECE,
          settings: {
            pieceName: step.piece,
            pieceVersion: version,
            actionName: step.actionName,
            input: step.inputs ?? {},
            propertySettings: {},
            customLogoUrl: undefined,
            sampleData: DEFAULT_SAMPLE_DATA_SETTINGS,
            errorHandlingOptions: DEFAULT_ERROR_HANDLING,
          },
        },
      },
    };
  }

  private async createCodeActionOperation(
    step: Extract<FlowStepPlan, { kind: 'code' }>,
    parentStep: string,
    index: number,
  ): Promise<FlowOperationRequest> {
    const name = step.name ?? `code_${index}`;
    return {
      type: FlowOperationType.ADD_ACTION,
      request: {
        parentStep,
        stepLocationRelativeToParent: StepLocationRelativeToParent.AFTER,
        action: {
          name,
          displayName: step.name ?? 'Code',
          valid: true,
          skip: false,
          type: FlowActionType.CODE,
          settings: {
            sourceCode: {
              code: step.sourceCode,
              packageJson: JSON.stringify(step.packageJson ?? {}, null, 2),
            },
            input: step.inputs ?? {},
            customLogoUrl: undefined,
            sampleData: DEFAULT_SAMPLE_DATA_SETTINGS,
            errorHandlingOptions: DEFAULT_ERROR_HANDLING,
          },
        },
      },
    };
  }

  private async resolvePieceVersion(
    pieceName: string,
    requestedVersion?: string,
  ): Promise<string> {
    if (requestedVersion) {
      return requestedVersion;
    }
    const metadata: PieceMetadataModel = await this.backend.pieces.get(
      pieceName,
      {},
    );
    return metadata.version;
  }
}

function humanize(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function collectPlaceholders(plan: FlowPlan): string[] {
  const placeholders = new Set<string>();
  const visit = (value: unknown) => {
    if (typeof value === 'string') {
      const match = value.match(PLACEHOLDER_PATTERN);
      if (match) {
        placeholders.add(match[1].trim());
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === 'object') {
      Object.values(value).forEach(visit);
    }
  };

  visit(plan.trigger);
  plan.steps.forEach(visit);
  return Array.from(placeholders).sort();
}

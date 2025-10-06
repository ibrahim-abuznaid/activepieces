import { FlowBuilder, MissingInputsError } from './builder';
import { FlowPlan } from './plan';
import { IFlowBackend } from '@flowpilot/activepieces-client';
import {
  FlowOperationType,
  FlowStatus,
  FlowTriggerType,
  PackageType,
  PieceType,
} from '@activepieces/shared';
import { PieceMetadataModel } from '@activepieces/pieces-framework';

describe('FlowBuilder', () => {
  const metadataFor = (name: string): PieceMetadataModel => ({
    name,
    displayName: name,
    logoUrl: '',
    description: '',
    authors: [],
    version: '0.1.0',
    actions: {},
    triggers: {},
    projectUsage: 0,
    pieceType: PieceType.STANDARD,
    packageType: PackageType.REGISTRY,
  });

  const createBackend = (): IFlowBackend => ({
    flows: {
      async create() {
        return {
          id: 'flow_1',
          projectId: 'project',
          externalId: 'flow_1',
          folderId: null,
          status: FlowStatus.DISABLED,
          publishedVersionId: null,
          metadata: null,
          created: '',
          updated: '',
          version: {
            id: 'version_1',
            created: '',
            updated: '',
            displayName: 'Flow',
            trigger: {
              name: 'trigger',
              valid: true,
              displayName: 'Trigger',
              nextAction: undefined,
              type: FlowTriggerType.PIECE,
              settings: {
                pieceName: 'webhook',
                pieceVersion: '0.1.0',
                triggerName: 'catch_webhook',
                input: {},
                propertySettings: {},
              },
            },
            state: 'DRAFT',
            flowId: 'flow_1',
            valid: true,
            revision: 1,
          },
        } as unknown as ReturnType<IFlowBackend['flows']['create']> extends Promise<infer R>
          ? R
          : never;
      },
      async update() {
        return undefined as never;
      },
      async changeStatus() {
        return undefined as never;
      },
      async list() {
        return { data: [], next: null, previous: null };
      },
      async get() {
        throw new Error('not implemented in test');
      },
    },
    pieces: {
      async list() {
        return [];
      },
      async get(name: string) {
        return metadataFor(name);
      },
      async loadOptions() {
        return { options: [], type: 'DROPDOWN' } as never;
      },
    },
  });

  it('creates a deterministic sequence of operations', async () => {
    const backend = createBackend();
    const builder = new FlowBuilder(backend);
    const plan: FlowPlan = {
      name: 'Trello to Slack',
      trigger: {
        kind: 'app_trigger',
        piece: 'trello',
        triggerName: 'new_card',
        inputs: {},
      },
      steps: [
        {
          kind: 'piece_action',
          piece: 'slack',
          actionName: 'send_message',
          inputs: {
            channel: '#ops',
            text: 'New card',
          },
        },
      ],
      enableAfterBuild: true,
    };

    const result = await builder.build(plan, { dryRun: true });
    expect(result.operations).toHaveLength(3);
    expect(result.operations[0].operation.type).toBe(
      FlowOperationType.UPDATE_TRIGGER,
    );
    expect(result.operations[1].operation.type).toBe(
      FlowOperationType.ADD_ACTION,
    );
    expect(result.operations[2].operation.type).toBe(
      FlowOperationType.CHANGE_STATUS,
    );
  });

  it('fails when placeholders remain', async () => {
    const backend = createBackend();
    const builder = new FlowBuilder(backend);
    const plan: FlowPlan = {
      name: 'Trello to Slack',
      trigger: {
        kind: 'app_trigger',
        piece: 'trello',
        triggerName: 'new_card',
        inputs: {
          boardId: '<ASK_USER: choose board>',
        },
      },
      steps: [
        {
          kind: 'piece_action',
          piece: 'slack',
          actionName: 'send_message',
          inputs: {
            channel: '<ASK_USER: slack channel>',
            text: 'Hello',
          },
        },
      ],
    };

    await expect(builder.build(plan, { dryRun: true })).rejects.toBeInstanceOf(
      MissingInputsError,
    );
  });
});

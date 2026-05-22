import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const batchModify = createAction({
  auth: gmailAuth,
  name: 'batch_modify_messages',
  displayName: 'Batch Modify Messages',
  description: 'Add and/or remove labels on many messages in one call.',
  llmDescription:
    'users.messages.batchModify — apply the same label additions/removals to a list of messageIds in one round-trip. Use when bulk-archiving or bulk-labelling. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    ids: Property.Array({ displayName: 'Message IDs', required: true }),
    addLabelIds: Property.Array({ displayName: 'Add Labels', required: false }),
    removeLabelIds: Property.Array({
      displayName: 'Remove Labels',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    await gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: {
        ids: propsValue.ids as string[],
        addLabelIds:
          (propsValue.addLabelIds as string[] | undefined) ?? undefined,
        removeLabelIds:
          (propsValue.removeLabelIds as string[] | undefined) ?? undefined,
      },
    });
    return { ok: true, count: (propsValue.ids as string[]).length };
  },
});

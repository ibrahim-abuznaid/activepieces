import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const removeLabel = createAction({
  auth: gmailAuth,
  name: 'remove_label_from_message',
  displayName: 'Remove Label',
  description: 'Remove a label from a Gmail message.',
  llmDescription:
    'users.messages.modify with removeLabelIds=[labelId]. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', labelIds: ['INBOX'] },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
    labelId: Property.ShortText({ displayName: 'Label ID', required: true }),
  },
  async run({ auth, propsValue }) {
    return await gmailAgentCommon.modifyLabels({
      auth,
      id: propsValue.id,
      removeLabelIds: [propsValue.labelId],
    });
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const addLabel = createAction({
  auth: gmailAuth,
  name: 'add_label_to_message',
  displayName: 'Add Label',
  description: 'Add a label to a Gmail message.',
  llmDescription:
    'users.messages.modify with addLabelIds=[labelId]. Use list_labels to look up the id of a label by name first (Gmail uses ids, not names, when modifying messages). Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', labelIds: ['INBOX', 'Label_123'] },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
    labelId: Property.ShortText({ displayName: 'Label ID', required: true }),
  },
  async run({ auth, propsValue }) {
    return await gmailAgentCommon.modifyLabels({
      auth,
      id: propsValue.id,
      addLabelIds: [propsValue.labelId],
    });
  },
});

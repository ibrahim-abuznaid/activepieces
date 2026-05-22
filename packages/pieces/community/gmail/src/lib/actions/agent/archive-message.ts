import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const archiveMessage = createAction({
  auth: gmailAuth,
  name: 'archive_message',
  displayName: 'Archive Message',
  description: 'Archive a Gmail message (remove the INBOX label).',
  llmDescription:
    "users.messages.modify with removeLabelIds=['INBOX']. The message stays accessible via search, just leaves Inbox. Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', labelIds: [] },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
  },
  async run({ auth, propsValue }) {
    return await gmailAgentCommon.modifyLabels({
      auth,
      id: propsValue.id,
      removeLabelIds: ['INBOX'],
    });
  },
});

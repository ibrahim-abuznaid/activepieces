import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const markAsUnread = createAction({
  auth: gmailAuth,
  name: 'mark_as_unread',
  displayName: 'Mark Message Unread',
  description: 'Mark a Gmail message as unread.',
  llmDescription:
    "users.messages.modify with addLabelIds=['UNREAD']. Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', labelIds: ['INBOX', 'UNREAD'] },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
  },
  async run({ auth, propsValue }) {
    return await gmailAgentCommon.modifyLabels({
      auth,
      id: propsValue.id,
      addLabelIds: ['UNREAD'],
    });
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const markAsRead = createAction({
  auth: gmailAuth,
  name: 'mark_as_read',
  displayName: 'Mark Message Read',
  description: 'Mark a Gmail message as read.',
  llmDescription:
    "users.messages.modify with removeLabelIds=['UNREAD']. Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', labelIds: ['INBOX'] },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
  },
  async run({ auth, propsValue }) {
    return await gmailAgentCommon.modifyLabels({
      auth,
      id: propsValue.id,
      removeLabelIds: ['UNREAD'],
    });
  },
});

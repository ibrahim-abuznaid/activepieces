import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const untrashMessage = createAction({
  auth: gmailAuth,
  name: 'untrash_message',
  displayName: 'Untrash Message',
  description: 'Restore a Gmail message from Trash.',
  llmDescription:
    'users.messages.untrash — remove the TRASH label from a message. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', labelIds: ['INBOX'] },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.messages.untrash({
      userId: 'me',
      id: propsValue.id,
    });
    return res.data;
  },
});

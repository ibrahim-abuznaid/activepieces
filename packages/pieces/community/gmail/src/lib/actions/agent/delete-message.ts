import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const deleteMessage = createAction({
  auth: gmailAuth,
  name: 'delete_message',
  displayName: 'Permanently Delete Message',
  description: 'Permanently delete a Gmail message (skips Trash).',
  llmDescription:
    'users.messages.delete — permanently delete the message. NOT recoverable. Prefer trash_message unless the user explicitly asks for permanent deletion.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', deleted: true },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    await gmail.users.messages.delete({ userId: 'me', id: propsValue.id });
    return { id: propsValue.id, deleted: true };
  },
});

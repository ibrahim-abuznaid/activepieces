import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const trashMessage = createAction({
  auth: gmailAuth,
  name: 'trash_message',
  displayName: 'Trash Message',
  description: 'Move a Gmail message to Trash.',
  llmDescription:
    'users.messages.trash — move to Trash (recoverable for 30 days). Prefer this over delete_message unless the user explicitly asks to permanently delete.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '18f...', labelIds: ['TRASH'] },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.messages.trash({
      userId: 'me',
      id: propsValue.id,
    });
    return res.data;
  },
});

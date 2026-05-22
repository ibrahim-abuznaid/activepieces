import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const trashThread = createAction({
  auth: gmailAuth,
  name: 'trash_thread',
  displayName: 'Trash Thread',
  description: 'Move a Gmail thread to Trash.',
  llmDescription:
    'users.threads.trash — move an entire thread (every message in it) to Trash. Recoverable for 30 days.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'thread-1', labelIds: ['TRASH'] },
  props: {
    id: Property.ShortText({ displayName: 'Thread ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.threads.trash({
      userId: 'me',
      id: propsValue.id,
    });
    return res.data;
  },
});

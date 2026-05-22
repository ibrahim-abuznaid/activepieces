import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const sendDraft = createAction({
  auth: gmailAuth,
  name: 'send_draft',
  displayName: 'Send Draft',
  description: 'Send a Gmail draft.',
  llmDescription:
    'users.drafts.send — send a previously-created draft by its draftId. Returns the sent message.',
  audience: 'agent',
  idempotent: false,
  sampleData: { id: '18f...', labelIds: ['SENT'], threadId: '18f...' },
  props: {
    id: Property.ShortText({ displayName: 'Draft ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.drafts.send({
      userId: 'me',
      requestBody: { id: propsValue.id },
    });
    return res.data;
  },
});

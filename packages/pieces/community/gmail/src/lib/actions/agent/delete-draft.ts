import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const deleteDraft = createAction({
  auth: gmailAuth,
  name: 'delete_draft',
  displayName: 'Delete Draft',
  description: 'Delete a Gmail draft.',
  llmDescription:
    'users.drafts.delete — permanently delete a draft (note: this is not Trash).',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'r-1', deleted: true },
  props: {
    id: Property.ShortText({ displayName: 'Draft ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    await gmail.users.drafts.delete({ userId: 'me', id: propsValue.id });
    return { id: propsValue.id, deleted: true };
  },
});

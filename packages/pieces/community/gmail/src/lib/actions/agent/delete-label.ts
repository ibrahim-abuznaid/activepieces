import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const deleteLabel = createAction({
  auth: gmailAuth,
  name: 'delete_label',
  displayName: 'Delete Label',
  description: 'Delete a Gmail label by id.',
  llmDescription:
    'users.labels.delete — delete a user-defined label. Cannot delete system labels (INBOX, SENT, etc.). Destructive.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'Label_42', deleted: true },
  props: {
    id: Property.ShortText({ displayName: 'Label ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    await gmail.users.labels.delete({ userId: 'me', id: propsValue.id });
    return { id: propsValue.id, deleted: true };
  },
});

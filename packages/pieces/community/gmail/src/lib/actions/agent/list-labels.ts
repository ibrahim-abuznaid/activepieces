import { createAction } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const listLabels = createAction({
  auth: gmailAuth,
  name: 'list_labels',
  displayName: 'List Labels',
  description: 'List all Gmail labels available to the user.',
  llmDescription:
    'users.labels.list — returns all labels including system labels (INBOX, SENT, DRAFT, ...) and user-created. Use to resolve a label name to its id before add/remove operations. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    labels: [
      { id: 'INBOX', name: 'INBOX', type: 'system' },
      { id: 'Label_5', name: 'Work', type: 'user' },
    ],
  },
  props: {},
  async run({ auth }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.labels.list({ userId: 'me' });
    return res.data;
  },
});

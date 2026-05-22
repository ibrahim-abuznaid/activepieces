import { createAction } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const getProfile = createAction({
  auth: gmailAuth,
  name: 'get_user_profile',
  displayName: 'Get User Profile',
  description: "Return the authenticated user's Gmail profile.",
  llmDescription:
    'users.getProfile — returns emailAddress, messagesTotal, threadsTotal, historyId. Useful to discover the current account email. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    emailAddress: 'me@example.com',
    messagesTotal: 12345,
    threadsTotal: 4321,
    historyId: '987',
  },
  props: {},
  async run({ auth }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.getProfile({ userId: 'me' });
    return res.data;
  },
});

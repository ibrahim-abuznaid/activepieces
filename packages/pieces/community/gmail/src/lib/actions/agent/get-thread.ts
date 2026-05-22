import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const getThread = createAction({
  auth: gmailAuth,
  name: 'get_thread',
  displayName: 'Get Thread',
  description: 'Fetch a full Gmail thread with all messages.',
  llmDescription:
    'users.threads.get — return a full thread including every message in it. Use when you need the conversation context, not just one message. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    id: 'thread-1',
    messages: [{ id: '18f...', snippet: 'Hello...' }],
    historyId: '123',
  },
  props: {
    id: Property.ShortText({ displayName: 'Thread ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.threads.get({
      userId: 'me',
      id: propsValue.id,
    });
    return res.data;
  },
});

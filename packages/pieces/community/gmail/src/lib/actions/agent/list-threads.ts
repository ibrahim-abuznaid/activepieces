import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const listThreads = createAction({
  auth: gmailAuth,
  name: 'list_threads',
  displayName: 'List Threads',
  description: 'List Gmail threads matching a query.',
  llmDescription:
    'users.threads.list with an optional Gmail-style query. Returns thread ids only — fetch each with get_thread. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    threads: [{ id: 'thread-1', historyId: '123', snippet: 'Hi...' }],
  },
  props: {
    q: Property.ShortText({ displayName: 'Gmail Query', required: false }),
    maxResults: Property.Number({
      displayName: 'Max Results',
      required: false,
      defaultValue: 25,
    }),
    labelIds: Property.Array({ displayName: 'Label IDs', required: false }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.threads.list({
      userId: 'me',
      q: propsValue.q,
      maxResults: propsValue.maxResults ?? 25,
      labelIds: (propsValue.labelIds as string[] | undefined) ?? undefined,
    });
    return res.data;
  },
});

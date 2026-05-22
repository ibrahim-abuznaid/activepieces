import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const listMessages = createAction({
  auth: gmailAuth,
  name: 'list_messages',
  displayName: 'List Messages',
  description: 'List Gmail messages matching a Gmail search query.',
  llmDescription:
    "users.messages.list with an optional Gmail-style query (e.g. 'is:unread', 'from:alice@', 'subject:report newer_than:7d'). Returns message ids only — fetch each one with get_message. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: {
    messages: [{ id: '18f...', threadId: '18f...' }],
    resultSizeEstimate: 12,
  },
  props: {
    q: Property.ShortText({ displayName: 'Gmail Query', required: false }),
    maxResults: Property.Number({
      displayName: 'Max Results',
      required: false,
      defaultValue: 25,
    }),
    pageToken: Property.ShortText({
      displayName: 'Page Token',
      required: false,
    }),
    labelIds: Property.Array({ displayName: 'Label IDs', required: false }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: propsValue.q,
      maxResults: propsValue.maxResults ?? 25,
      pageToken: propsValue.pageToken,
      labelIds: (propsValue.labelIds as string[] | undefined) ?? undefined,
    });
    return res.data;
  },
});

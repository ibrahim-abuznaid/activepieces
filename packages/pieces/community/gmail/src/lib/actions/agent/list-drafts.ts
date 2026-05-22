import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const listDrafts = createAction({
  auth: gmailAuth,
  name: 'list_drafts',
  displayName: 'List Drafts',
  description: "List the authenticated user's Gmail drafts.",
  llmDescription:
    'users.drafts.list — return draft ids (each with its associated messageId). Use get_message on draft.message.id to see contents. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { drafts: [{ id: 'r-1', message: { id: '18f...' } }] },
  props: {
    maxResults: Property.Number({
      displayName: 'Max Results',
      required: false,
      defaultValue: 25,
    }),
    q: Property.ShortText({ displayName: 'Gmail Query', required: false }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.drafts.list({
      userId: 'me',
      maxResults: propsValue.maxResults ?? 25,
      q: propsValue.q,
    });
    return res.data;
  },
});

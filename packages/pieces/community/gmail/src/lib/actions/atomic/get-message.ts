import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const getMessage = createAction({
  auth: gmailAuth,
  name: 'get_message',
  displayName: 'Get Message',
  description: 'Fetch a Gmail message by id.',
  llmDescription:
    "users.messages.get — fetch a single message. format='full' (default) returns payload+headers+body, 'metadata' returns headers only, 'minimal' returns just id+threadId. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: {
    id: '18f...',
    threadId: '18f...',
    labelIds: ['INBOX', 'UNREAD'],
    snippet: 'Hello...',
  },
  props: {
    id: Property.ShortText({ displayName: 'Message ID', required: true }),
    format: Property.StaticDropdown({
      displayName: 'Format',
      required: false,
      defaultValue: 'full',
      options: {
        disabled: false,
        options: ['minimal', 'metadata', 'full', 'raw'].map((v) => ({
          label: v,
          value: v,
        })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: propsValue.id,
      format: propsValue.format ?? 'full',
    });
    return res.data;
  },
});

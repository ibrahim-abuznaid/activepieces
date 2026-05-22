import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const listUsers = createAction({
  auth: notionAuth,
  name: 'list_users',
  displayName: 'List Users',
  description: 'List users in the Notion workspace.',
  llmDescription:
    'GET /v1/users — list members of the workspace (id, name, person.email or bot type). Useful to find a user_id for @-mentions or assignments. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { results: [{ id: 'user-id', name: 'Alice', type: 'person' }] },
  props: {
    pageSize: Property.Number({
      displayName: 'Page Size',
      required: false,
      defaultValue: 50,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.users.list({ page_size: propsValue.pageSize ?? 50 });
  },
});

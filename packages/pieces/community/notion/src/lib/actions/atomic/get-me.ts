import { createAction } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const getMe = createAction({
  auth: notionAuth,
  name: 'get_me',
  displayName: 'Get Bot User',
  description: 'Return the Notion bot user associated with this token.',
  llmDescription:
    'GET /v1/users/me — return the integration bot user resource (id, name, type=bot, owner workspace). Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'bot-id', name: 'My Integration', type: 'bot' },
  props: {},
  async run({ auth }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.users.me({});
  },
});

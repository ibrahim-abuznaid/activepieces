import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const getUserInfo = createAction({
  auth: slackAuth,
  name: 'get_user_info',
  displayName: 'Get User Info',
  description: 'Return profile + meta for a Slack user by id.',
  llmDescription: "users.info — name, real_name, profile, is_bot, tz. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { user: { id: 'U0123', name: 'alice', real_name: 'Alice', is_bot: false } },
  props: { user: Property.ShortText({ displayName: 'User ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.users.info({ user: propsValue.user });
  },
});

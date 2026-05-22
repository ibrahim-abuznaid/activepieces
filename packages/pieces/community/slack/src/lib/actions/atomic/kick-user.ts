import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const kickUser = createAction({
  auth: slackAuth,
  name: 'kick_user_from_channel',
  displayName: 'Remove User From Channel',
  description: 'Remove a user from a Slack channel.',
  llmDescription: "conversations.kick — destructive. Confirm before calling.",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    user: Property.ShortText({ displayName: 'User ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.kick({ channel: propsValue.channel, user: propsValue.user });
  },
});

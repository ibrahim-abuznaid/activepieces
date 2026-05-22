import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const getChannelInfo = createAction({
  auth: slackAuth,
  name: 'get_channel_info',
  displayName: 'Get Channel Info',
  description: 'Return metadata for a Slack channel by id.',
  llmDescription:
    'conversations.info — name, topic, purpose, num_members, archived, etc. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { channel: { id: 'C0123', name: 'general', num_members: 12 } },
  props: { channel: Property.ShortText({ displayName: 'Channel ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.info({ channel: propsValue.channel });
  },
});

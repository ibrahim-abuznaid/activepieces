import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const getChannelHistoryAgent = createAction({
  auth: slackAuth,
  name: 'get_channel_history_agent',
  displayName: 'Get Channel History (Agent)',
  description: 'Fetch recent messages from a Slack channel.',
  llmDescription:
    "conversations.history — recent messages from the channel, newest first. Limit N (default 50). Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { messages: [{ ts: '1716345600.001', user: 'U0123', text: 'hi' }] },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    limit: Property.Number({ displayName: 'Limit', required: false, defaultValue: 50 }),
    oldest: Property.ShortText({ displayName: 'Oldest TS', required: false }),
    latest: Property.ShortText({ displayName: 'Latest TS', required: false }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.history({
      channel: propsValue.channel,
      limit: propsValue.limit ?? 50,
      oldest: propsValue.oldest,
      latest: propsValue.latest,
    });
  },
});

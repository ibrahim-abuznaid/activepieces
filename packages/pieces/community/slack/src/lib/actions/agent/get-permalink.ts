import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const getPermalink = createAction({
  auth: slackAuth,
  name: 'get_message_permalink',
  displayName: 'Get Message Permalink',
  description: 'Return the permalink URL of a Slack message.',
  llmDescription: 'chat.getPermalink — useful for sharing a link to a specific message. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { permalink: 'https://example.slack.com/archives/C0123/p1716345600001' },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    messageTs: Property.ShortText({ displayName: 'Message TS', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.chat.getPermalink({
      channel: propsValue.channel,
      message_ts: propsValue.messageTs,
    });
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const getThreadReplies = createAction({
  auth: slackAuth,
  name: 'get_thread_replies',
  displayName: 'Get Thread Replies',
  description: 'Fetch all messages in a Slack thread.',
  llmDescription:
    "conversations.replies — return parent + replies for a thread (need channel + thread_ts). Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { messages: [{ ts: '1716345600.001', text: 'parent' }] },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    threadTs: Property.ShortText({ displayName: 'Thread TS', required: true }),
    limit: Property.Number({ displayName: 'Limit', required: false, defaultValue: 50 }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.replies({
      channel: propsValue.channel,
      ts: propsValue.threadTs,
      limit: propsValue.limit ?? 50,
    });
  },
});

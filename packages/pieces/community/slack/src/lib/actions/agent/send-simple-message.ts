import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const sendSimpleMessage = createAction({
  auth: slackAuth,
  name: 'send_simple_message',
  displayName: 'Send Simple Message',
  description: 'Send a plain text message to a Slack channel by id.',
  llmDescription:
    "chat.postMessage with channel + text. Pass the channel id (Cxxxxxxx) directly — agents shouldn't be guessing names. For rich Block Kit, use the existing canvas send action.",
  audience: 'agent',
  idempotent: false,
  sampleData: { ok: true, channel: 'C0123', ts: '1716345600.001' },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    text: Property.LongText({ displayName: 'Message Text', required: true }),
    threadTs: Property.ShortText({ displayName: 'Thread TS (reply in thread)', required: false }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.chat.postMessage({
      channel: propsValue.channel,
      text: propsValue.text,
      thread_ts: propsValue.threadTs,
    });
  },
});

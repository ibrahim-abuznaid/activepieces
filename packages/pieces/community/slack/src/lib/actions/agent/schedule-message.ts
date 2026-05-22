import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const scheduleMessage = createAction({
  auth: slackAuth,
  name: 'schedule_message',
  displayName: 'Schedule Message',
  description: 'Schedule a Slack message to be sent at a future time.',
  llmDescription:
    "chat.scheduleMessage — Slack delivers the message at `postAt` (ISO datetime → epoch seconds). Up to 120 days in advance.",
  audience: 'agent',
  idempotent: false,
  sampleData: { ok: true, scheduled_message_id: 'Q0123' },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    text: Property.LongText({ displayName: 'Text', required: true }),
    postAt: Property.DateTime({ displayName: 'Post At (ISO)', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    const postAtEpoch = Math.floor(new Date(propsValue.postAt).getTime() / 1000);
    return await slack.chat.scheduleMessage({
      channel: propsValue.channel,
      text: propsValue.text,
      post_at: postAtEpoch,
    });
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const updateMessageAgent = createAction({
  auth: slackAuth,
  name: 'update_message_agent',
  displayName: 'Update Message (Agent)',
  description: 'Edit a Slack message by channel + ts.',
  llmDescription:
    'chat.update — replace the text of an existing message. Need both channel id and the message ts (timestamp). Idempotent (same input → same end state).',
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true, channel: 'C0123', ts: '1716345600.001' },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    ts: Property.ShortText({ displayName: 'Message TS', required: true }),
    text: Property.LongText({ displayName: 'New Text', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.chat.update({
      channel: propsValue.channel,
      ts: propsValue.ts,
      text: propsValue.text,
    });
  },
});

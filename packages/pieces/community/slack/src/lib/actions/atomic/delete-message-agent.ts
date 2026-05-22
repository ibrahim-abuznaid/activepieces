import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const deleteMessageAgent = createAction({
  auth: slackAuth,
  name: 'delete_message_agent',
  displayName: 'Delete Message (Agent)',
  description: 'Delete a Slack message by channel + ts.',
  llmDescription:
    'chat.delete — permanently remove a message. Destructive — confirm with the user before calling.',
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true, channel: 'C0123', ts: '1716345600.001' },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    ts: Property.ShortText({ displayName: 'Message TS', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.chat.delete({ channel: propsValue.channel, ts: propsValue.ts });
  },
});

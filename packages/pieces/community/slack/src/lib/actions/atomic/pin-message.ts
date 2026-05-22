import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const pinMessage = createAction({
  auth: slackAuth,
  name: 'pin_message',
  displayName: 'Pin Message',
  description: 'Pin a Slack message in a channel.',
  llmDescription: "pins.add — idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    timestamp: Property.ShortText({ displayName: 'Message TS', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.pins.add({ channel: propsValue.channel, timestamp: propsValue.timestamp });
  },
});

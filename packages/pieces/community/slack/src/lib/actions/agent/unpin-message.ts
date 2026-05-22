import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const unpinMessage = createAction({
  auth: slackAuth,
  name: 'unpin_message',
  displayName: 'Unpin Message',
  description: 'Remove a pin from a Slack channel message.',
  llmDescription: "pins.remove — idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    timestamp: Property.ShortText({ displayName: 'Message TS', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.pins.remove({ channel: propsValue.channel, timestamp: propsValue.timestamp });
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const setChannelPurpose = createAction({
  auth: slackAuth,
  name: 'set_channel_purpose',
  displayName: 'Set Channel Purpose',
  description: 'Set the purpose of a Slack channel.',
  llmDescription: "conversations.setPurpose — idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true, purpose: 'Team planning' },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    purpose: Property.LongText({ displayName: 'Purpose', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.setPurpose({ channel: propsValue.channel, purpose: propsValue.purpose });
  },
});

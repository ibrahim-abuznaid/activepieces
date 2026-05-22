import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const leaveChannel = createAction({
  auth: slackAuth,
  name: 'leave_channel',
  displayName: 'Leave Channel',
  description: 'Bot leaves a Slack channel.',
  llmDescription: "conversations.leave — idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: { channel: Property.ShortText({ displayName: 'Channel ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.leave({ channel: propsValue.channel });
  },
});

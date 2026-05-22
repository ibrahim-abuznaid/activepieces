import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const joinChannel = createAction({
  auth: slackAuth,
  name: 'join_channel',
  displayName: 'Join Channel',
  description: 'Bot joins a Slack channel by id.',
  llmDescription: "conversations.join — idempotent (re-joining is a no-op).",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true, channel: { id: 'C0123' } },
  props: { channel: Property.ShortText({ displayName: 'Channel ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.join({ channel: propsValue.channel });
  },
});

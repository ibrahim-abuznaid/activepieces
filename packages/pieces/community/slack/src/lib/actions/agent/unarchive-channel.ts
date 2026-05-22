import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const unarchiveChannel = createAction({
  auth: slackAuth,
  name: 'unarchive_channel',
  displayName: 'Unarchive Channel',
  description: 'Unarchive a Slack channel.',
  llmDescription: 'conversations.unarchive — idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: { channel: Property.ShortText({ displayName: 'Channel ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.unarchive({ channel: propsValue.channel });
  },
});

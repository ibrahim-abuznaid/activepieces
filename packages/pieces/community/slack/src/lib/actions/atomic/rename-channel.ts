import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const renameChannel = createAction({
  auth: slackAuth,
  name: 'rename_channel',
  displayName: 'Rename Channel',
  description: 'Rename a Slack channel.',
  llmDescription: "conversations.rename — new name must follow Slack rules (lowercase, no spaces, etc.).",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true, channel: { id: 'C0123', name: 'new-name' } },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    name: Property.ShortText({ displayName: 'New Name', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.rename({ channel: propsValue.channel, name: propsValue.name });
  },
});

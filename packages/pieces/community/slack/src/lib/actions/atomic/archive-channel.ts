import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const archiveChannel = createAction({
  auth: slackAuth,
  name: 'archive_channel',
  displayName: 'Archive Channel',
  description: 'Archive a Slack channel.',
  llmDescription: "conversations.archive — destructive (can't post). Confirm before calling.",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: { channel: Property.ShortText({ displayName: 'Channel ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.archive({ channel: propsValue.channel });
  },
});

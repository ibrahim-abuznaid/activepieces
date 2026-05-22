import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const listChannels = createAction({
  auth: slackAuth,
  name: 'list_channels',
  displayName: 'List Channels',
  description: 'List Slack channels matching type filter.',
  llmDescription:
    "conversations.list — list channels (public, private, im, mpim). Defaults to public+private. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { channels: [{ id: 'C0123', name: 'general', is_channel: true }] },
  props: {
    types: Property.ShortText({
      displayName: 'Types (csv)',
      required: false,
      defaultValue: 'public_channel,private_channel',
      description: 'Any of public_channel, private_channel, im, mpim',
    }),
    excludeArchived: Property.Checkbox({ displayName: 'Exclude Archived', required: false, defaultValue: true }),
    limit: Property.Number({ displayName: 'Limit', required: false, defaultValue: 200 }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.conversations.list({
      types: propsValue.types ?? 'public_channel,private_channel',
      exclude_archived: propsValue.excludeArchived ?? true,
      limit: propsValue.limit ?? 200,
    });
  },
});

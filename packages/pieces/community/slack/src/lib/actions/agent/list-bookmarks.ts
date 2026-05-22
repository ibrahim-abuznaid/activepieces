import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const listBookmarks = createAction({
  auth: slackAuth,
  name: 'list_bookmarks',
  displayName: 'List Channel Bookmarks',
  description: 'List bookmarks on a Slack channel.',
  llmDescription: 'bookmarks.list — read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { bookmarks: [{ id: 'B0123', title: 'Docs', link: 'https://...' }] },
  props: { channel: Property.ShortText({ displayName: 'Channel ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.bookmarks.list({ channel_id: propsValue.channel });
  },
});

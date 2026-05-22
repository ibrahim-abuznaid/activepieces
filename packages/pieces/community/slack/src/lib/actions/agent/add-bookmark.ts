import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const addBookmark = createAction({
  auth: slackAuth,
  name: 'add_bookmark',
  displayName: 'Add Channel Bookmark',
  description: 'Add a bookmark (link) to a Slack channel.',
  llmDescription: 'bookmarks.add — title + link displayed on the channel header.',
  audience: 'agent',
  idempotent: false,
  sampleData: { ok: true, bookmark: { id: 'B0123' } },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    title: Property.ShortText({ displayName: 'Title', required: true }),
    link: Property.ShortText({ displayName: 'Link', required: true }),
    emoji: Property.ShortText({ displayName: 'Emoji', required: false }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.bookmarks.add({
      channel_id: propsValue.channel,
      title: propsValue.title,
      type: 'link',
      link: propsValue.link,
      emoji: propsValue.emoji,
    });
  },
});

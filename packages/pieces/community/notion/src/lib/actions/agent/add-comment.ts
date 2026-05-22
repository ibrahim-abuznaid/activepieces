import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const addCommentAgent = createAction({
  auth: notionAuth,
  name: 'add_comment_to_page',
  displayName: 'Add Comment To Page',
  description: 'Add a comment to a Notion page.',
  llmDescription:
    'POST /v1/comments with parent={ page_id } and rich_text content. To comment on a thread / block, use the canvas add_comment action (which supports discussion threads).',
  audience: 'agent',
  idempotent: false,
  sampleData: { id: 'c-1', rich_text: [{ plain_text: 'note' }] },
  props: {
    pageId: Property.ShortText({ displayName: 'Page ID', required: true }),
    text: Property.LongText({ displayName: 'Comment Text', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.comments.create({
      parent: { page_id: propsValue.pageId },
      rich_text: notionAgentCommon.richText(propsValue.text),
    });
  },
});

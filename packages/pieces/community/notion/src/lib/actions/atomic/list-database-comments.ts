import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const listComments = createAction({
  auth: notionAuth,
  name: 'list_block_comments',
  displayName: 'List Comments',
  description: 'List comments on a Notion block.',
  llmDescription:
    'GET /v1/comments?block_id={block_id} — list comments attached to a block. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { results: [{ id: 'c-1', created_by: { id: 'user-id' } }] },
  props: {
    blockId: Property.ShortText({ displayName: 'Block ID', required: true }),
    pageSize: Property.Number({
      displayName: 'Page Size',
      required: false,
      defaultValue: 50,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.comments.list({
      block_id: propsValue.blockId,
      page_size: propsValue.pageSize ?? 50,
    });
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const listPageBlocks = createAction({
  auth: notionAuth,
  name: 'list_page_blocks',
  displayName: 'List Page Blocks',
  description: 'List the block children of a Notion page or block.',
  llmDescription:
    'GET /v1/blocks/{block_id}/children — return the children blocks. Use the page id as block_id to get top-level page content. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { results: [{ id: 'block-id', type: 'paragraph' }] },
  props: {
    blockId: Property.ShortText({
      displayName: 'Block / Page ID',
      required: true,
    }),
    pageSize: Property.Number({
      displayName: 'Page Size',
      required: false,
      defaultValue: 50,
    }),
    startCursor: Property.ShortText({
      displayName: 'Start Cursor',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.blocks.children.list({
      block_id: propsValue.blockId,
      page_size: propsValue.pageSize ?? 50,
      start_cursor: propsValue.startCursor,
    });
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const getBlock = createAction({
  auth: notionAuth,
  name: 'get_block',
  displayName: 'Get Block',
  description: 'Retrieve a Notion block by id.',
  llmDescription:
    'GET /v1/blocks/{block_id} — return a single block resource (paragraph, heading, list_item, etc.). Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    id: 'block-id',
    type: 'paragraph',
    paragraph: { rich_text: [] },
  },
  props: {
    blockId: Property.ShortText({ displayName: 'Block ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.blocks.retrieve({ block_id: propsValue.blockId });
  },
});

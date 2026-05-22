import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const deleteBlock = createAction({
  auth: notionAuth,
  name: 'delete_block',
  displayName: 'Delete Block',
  description: 'Delete a Notion block (move to trash).',
  llmDescription:
    'DELETE /v1/blocks/{block_id} — soft-delete a block (Notion archives it). Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'block-id', archived: true },
  props: {
    blockId: Property.ShortText({ displayName: 'Block ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.blocks.delete({ block_id: propsValue.blockId });
  },
});

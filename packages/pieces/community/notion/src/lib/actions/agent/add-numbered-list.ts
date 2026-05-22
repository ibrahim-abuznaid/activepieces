import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const addNumberedList = createAction({
  auth: notionAuth,
  name: 'add_numbered_list',
  displayName: 'Add Numbered List',
  description: 'Append a numbered list to a Notion page (one block per item).',
  llmDescription:
    'POST /v1/blocks/{block_id}/children with N numbered_list_item blocks.',
  audience: 'agent',
  idempotent: false,
  sampleData: { results: [{ id: 'b-1', type: 'numbered_list_item' }] },
  props: {
    pageId: Property.ShortText({
      displayName: 'Page / Block ID',
      required: true,
    }),
    items: Property.Array({ displayName: 'Items', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    const items = (propsValue.items as string[]) ?? [];
    return await notion.blocks.children.append({
      block_id: propsValue.pageId,
      children: items.map((text) => ({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: notionAgentCommon.richText(String(text)),
        },
      })),
    });
  },
});

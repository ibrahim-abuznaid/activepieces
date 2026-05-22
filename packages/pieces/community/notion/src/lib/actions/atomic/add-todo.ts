import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const addTodo = createAction({
  auth: notionAuth,
  name: 'add_todo',
  displayName: 'Add To-Do',
  description: 'Append a to-do checkbox block to a Notion page.',
  llmDescription:
    'POST /v1/blocks/{block_id}/children with a to_do block. Set `checked` to make it pre-checked.',
  audience: 'agent',
  idempotent: false,
  sampleData: { results: [{ id: 'block-new', type: 'to_do' }] },
  props: {
    pageId: Property.ShortText({
      displayName: 'Page / Block ID',
      required: true,
    }),
    text: Property.ShortText({ displayName: 'To-do Text', required: true }),
    checked: Property.Checkbox({
      displayName: 'Pre-checked',
      required: false,
      defaultValue: false,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.blocks.children.append({
      block_id: propsValue.pageId,
      children: [
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: notionAgentCommon.richText(propsValue.text),
            checked: propsValue.checked ?? false,
          },
        },
      ],
    });
  },
});

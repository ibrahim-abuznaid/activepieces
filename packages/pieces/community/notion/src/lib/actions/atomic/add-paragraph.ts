import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const addParagraph = createAction({
  auth: notionAuth,
  name: 'add_paragraph',
  displayName: 'Add Paragraph',
  description: 'Append a paragraph to the end of a Notion page.',
  llmDescription:
    'POST /v1/blocks/{block_id}/children with a single paragraph block. Use the page id as block_id. Not idempotent.',
  audience: 'agent',
  idempotent: false,
  sampleData: { results: [{ id: 'block-new', type: 'paragraph' }] },
  props: {
    pageId: Property.ShortText({
      displayName: 'Page / Block ID',
      required: true,
    }),
    text: Property.LongText({ displayName: 'Text', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.blocks.children.append({
      block_id: propsValue.pageId,
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: notionAgentCommon.richText(propsValue.text) },
        },
      ],
    });
  },
});

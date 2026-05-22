import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const addHeading = createAction({
  auth: notionAuth,
  name: 'add_heading',
  displayName: 'Add Heading',
  description: 'Append a heading (level 1, 2, or 3) to a Notion page.',
  llmDescription:
    'POST /v1/blocks/{block_id}/children with a heading_1 / heading_2 / heading_3 block.',
  audience: 'agent',
  idempotent: false,
  sampleData: { results: [{ id: 'block-new', type: 'heading_2' }] },
  props: {
    pageId: Property.ShortText({
      displayName: 'Page / Block ID',
      required: true,
    }),
    text: Property.ShortText({ displayName: 'Heading Text', required: true }),
    level: Property.StaticDropdown({
      displayName: 'Level',
      required: true,
      defaultValue: 2,
      options: {
        disabled: false,
        options: [
          { label: 'H1', value: 1 },
          { label: 'H2', value: 2 },
          { label: 'H3', value: 3 },
        ],
      },
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    const type = `heading_${propsValue.level}` as
      | 'heading_1'
      | 'heading_2'
      | 'heading_3';
    return await notion.blocks.children.append({
      block_id: propsValue.pageId,
      children: [
        {
          object: 'block',
          type,
          [type]: { rich_text: notionAgentCommon.richText(propsValue.text) },
        } as never,
      ],
    });
  },
});

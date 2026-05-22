import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const addCallout = createAction({
  auth: notionAuth,
  name: 'add_callout',
  displayName: 'Add Callout',
  description: 'Append a callout block with an emoji icon to a Notion page.',
  llmDescription:
    'POST /v1/blocks/{block_id}/children with a callout block. `emoji` defaults to ⭐.',
  audience: 'agent',
  idempotent: false,
  sampleData: { results: [{ id: 'b-1', type: 'callout' }] },
  props: {
    pageId: Property.ShortText({
      displayName: 'Page / Block ID',
      required: true,
    }),
    text: Property.LongText({ displayName: 'Text', required: true }),
    emoji: Property.ShortText({
      displayName: 'Emoji',
      required: false,
      defaultValue: '⭐',
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.blocks.children.append({
      block_id: propsValue.pageId,
      children: [
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: notionAgentCommon.richText(propsValue.text),
            icon: { type: 'emoji', emoji: (propsValue.emoji ?? '⭐') as never },
          },
        },
      ],
    });
  },
});

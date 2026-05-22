import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const addCodeBlock = createAction({
  auth: notionAuth,
  name: 'add_code_block',
  displayName: 'Add Code Block',
  description: 'Append a code block to a Notion page.',
  llmDescription:
    "POST /v1/blocks/{block_id}/children with a code block. Pass `language` for syntax highlighting (e.g. 'typescript', 'python', 'javascript', 'plain text').",
  audience: 'agent',
  idempotent: false,
  sampleData: { results: [{ id: 'b-1', type: 'code' }] },
  props: {
    pageId: Property.ShortText({
      displayName: 'Page / Block ID',
      required: true,
    }),
    code: Property.LongText({ displayName: 'Code', required: true }),
    language: Property.ShortText({
      displayName: 'Language',
      required: false,
      defaultValue: 'plain text',
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.blocks.children.append({
      block_id: propsValue.pageId,
      children: [
        {
          object: 'block',
          type: 'code',
          code: {
            rich_text: notionAgentCommon.richText(propsValue.code),
            language: (propsValue.language ?? 'plain text') as never,
          },
        },
      ],
    });
  },
});

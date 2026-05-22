import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const getPage = createAction({
  auth: notionAuth,
  name: 'get_page',
  displayName: 'Get Page',
  description: 'Retrieve a Notion page by id.',
  llmDescription:
    'GET /v1/pages/{page_id} — returns the page resource including properties. For body blocks, use list_page_blocks. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'page-id', object: 'page', properties: {} },
  props: {
    pageId: Property.ShortText({ displayName: 'Page ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.pages.retrieve({ page_id: propsValue.pageId });
  },
});

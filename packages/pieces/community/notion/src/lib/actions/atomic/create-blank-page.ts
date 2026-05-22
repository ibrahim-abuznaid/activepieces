import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const createBlankPage = createAction({
  auth: notionAuth,
  name: 'create_blank_page',
  displayName: 'Create Blank Page',
  description: 'Create a Notion page under a parent page with just a title.',
  llmDescription:
    'POST /v1/pages with parent={ page_id } and a title property. Body is empty — use add_paragraph / add_heading afterwards to fill it.',
  audience: 'agent',
  idempotent: false,
  sampleData: { id: 'page-new', object: 'page', url: 'https://notion.so/...' },
  props: {
    parentPageId: Property.ShortText({
      displayName: 'Parent Page ID',
      required: true,
    }),
    title: Property.ShortText({ displayName: 'Title', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.pages.create({
      parent: { type: 'page_id', page_id: propsValue.parentPageId },
      properties: {
        title: {
          type: 'title',
          title: notionAgentCommon.richText(propsValue.title),
        },
      },
    });
  },
});

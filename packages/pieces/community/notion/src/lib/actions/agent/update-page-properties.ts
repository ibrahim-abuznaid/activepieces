import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const updatePageProperties = createAction({
  auth: notionAuth,
  name: 'update_page_properties',
  displayName: 'Update Page Properties',
  description: 'Patch properties on a Notion page or database item.',
  llmDescription:
    "PATCH /v1/pages/{page_id} with body { properties }. Pass properties as the Notion typed property JSON (e.g. { Status: { select: { name: 'Done' } } }). For canvas-style typed inputs, use the existing update_database_item action.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'page-id', properties: {} },
  props: {
    pageId: Property.ShortText({ displayName: 'Page ID', required: true }),
    properties: Property.Object({
      displayName: 'Properties (Notion JSON)',
      required: true,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.pages.update({
      page_id: propsValue.pageId,
      properties: propsValue.properties as never,
    });
  },
});

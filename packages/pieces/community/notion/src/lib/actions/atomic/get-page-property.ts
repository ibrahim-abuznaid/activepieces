import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const getPageProperty = createAction({
  auth: notionAuth,
  name: 'get_page_property',
  displayName: 'Get Page Property',
  description: 'Retrieve the value of a single Notion page property.',
  llmDescription:
    'GET /v1/pages/{page_id}/properties/{property_id} — return one property value (handles paginated relations / rollups automatically). Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    object: 'property_item',
    type: 'title',
    title: { plain_text: 'Hello' },
  },
  props: {
    pageId: Property.ShortText({ displayName: 'Page ID', required: true }),
    propertyId: Property.ShortText({
      displayName: 'Property ID',
      required: true,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.pages.properties.retrieve({
      page_id: propsValue.pageId,
      property_id: propsValue.propertyId,
    });
  },
});

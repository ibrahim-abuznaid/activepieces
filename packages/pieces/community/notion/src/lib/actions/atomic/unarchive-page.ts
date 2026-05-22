import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const unarchivePage = createAction({
  auth: notionAuth,
  name: 'unarchive_page',
  displayName: 'Unarchive Page',
  description: 'Unarchive a Notion page.',
  llmDescription:
    'PATCH /v1/pages/{page_id} with body { archived: false }. Restores a soft-deleted page. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'page-id', archived: false },
  props: {
    pageId: Property.ShortText({ displayName: 'Page ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.pages.update({
      page_id: propsValue.pageId,
      archived: false,
    });
  },
});

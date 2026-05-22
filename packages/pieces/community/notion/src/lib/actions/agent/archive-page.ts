import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const archivePage = createAction({
  auth: notionAuth,
  name: 'archive_page',
  displayName: 'Archive Page',
  description: 'Archive a Notion page.',
  llmDescription:
    'PATCH /v1/pages/{page_id} with body { archived: true }. Notion treats archived pages as soft-deleted. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'page-id', archived: true },
  props: {
    pageId: Property.ShortText({ displayName: 'Page ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.pages.update({
      page_id: propsValue.pageId,
      archived: true,
    });
  },
});

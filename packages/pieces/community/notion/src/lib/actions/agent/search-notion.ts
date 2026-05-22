import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const searchNotion = createAction({
  auth: notionAuth,
  name: 'search_notion',
  displayName: 'Search Notion',
  description: 'Search Notion pages and databases by free-text.',
  llmDescription:
    "POST /v1/search — substring match against page/database titles. Filter by type via `filter` ('page' or 'database'). Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: {
    results: [{ object: 'page', id: 'page-id', url: 'https://notion.so/...' }],
  },
  props: {
    query: Property.ShortText({ displayName: 'Query', required: false }),
    filterType: Property.StaticDropdown({
      displayName: 'Type Filter',
      required: false,
      options: {
        disabled: false,
        options: [
          { label: 'Page', value: 'page' },
          { label: 'Database', value: 'database' },
        ],
      },
    }),
    pageSize: Property.Number({
      displayName: 'Page Size',
      required: false,
      defaultValue: 25,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    const res = await notion.search({
      query: propsValue.query,
      filter:
        propsValue.filterType === 'page' || propsValue.filterType === 'database'
          ? { property: 'object', value: propsValue.filterType }
          : undefined,
      page_size: propsValue.pageSize ?? 25,
    });
    return res;
  },
});

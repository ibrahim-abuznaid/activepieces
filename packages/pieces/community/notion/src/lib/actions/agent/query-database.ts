import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const queryDatabase = createAction({
  auth: notionAuth,
  name: 'query_database',
  displayName: 'Query Database',
  description: 'Query a Notion database with optional filter and sort.',
  llmDescription:
    "POST /v1/databases/{database_id}/query — list items matching `filter` and `sorts`. Pass filter/sorts as Notion's typed filter JSON (https://developers.notion.com/reference/post-database-query-filter). Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { results: [{ id: 'page-id', object: 'page' }] },
  props: {
    databaseId: Property.ShortText({
      displayName: 'Database ID',
      required: true,
    }),
    filter: Property.Object({
      displayName: 'Filter (Notion JSON)',
      required: false,
    }),
    sorts: Property.Json({
      displayName: 'Sorts (Notion JSON array)',
      required: false,
    }),
    pageSize: Property.Number({
      displayName: 'Page Size',
      required: false,
      defaultValue: 25,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.databases.query({
      database_id: propsValue.databaseId,
      filter: propsValue.filter as never,
      sorts: propsValue.sorts as never,
      page_size: propsValue.pageSize ?? 25,
    });
  },
});

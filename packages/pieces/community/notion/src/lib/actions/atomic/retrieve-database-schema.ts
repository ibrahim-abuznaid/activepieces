import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from './agent-common';

export const retrieveDatabaseSchema = createAction({
  auth: notionAuth,
  name: 'retrieve_database_schema',
  displayName: 'Retrieve Database Schema',
  description: 'Get the schema (properties) of a Notion database.',
  llmDescription:
    'GET /v1/databases/{database_id} — return the database resource including its `properties` schema. Use to know which columns/types exist before query_database. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'db-id', title: [{ plain_text: 'Tasks' }], properties: {} },
  props: {
    databaseId: Property.ShortText({
      displayName: 'Database ID',
      required: true,
    }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    return await notion.databases.retrieve({
      database_id: propsValue.databaseId,
    });
  },
});

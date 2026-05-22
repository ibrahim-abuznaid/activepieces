import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const insertTable = createAction({
  auth: googleDocsAuth,
  name: 'insert_table',
  displayName: 'Insert Table',
  description: 'Insert an empty table of given rows × columns.',
  llmDescription:
    'Insert an empty table at the given character index via batchUpdate insertTable. Provide rows and columns (positive integers). Cells start empty — fill them with insert_text_at_index using indices from a subsequent read_document.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    index: Property.Number({ displayName: 'Insertion Index', required: true }),
    rows: Property.Number({ displayName: 'Rows', required: true, defaultValue: 2 }),
    columns: Property.Number({ displayName: 'Columns', required: true, defaultValue: 2 }),
  },
  async run({ auth, propsValue }) {
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [
        {
          insertTable: {
            location: { index: propsValue.index },
            rows: propsValue.rows,
            columns: propsValue.columns,
          },
        },
      ],
    });
  },
});

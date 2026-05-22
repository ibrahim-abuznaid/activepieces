import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const insertPageBreak = createAction({
  auth: googleDocsAuth,
  name: 'insert_page_break',
  displayName: 'Insert Page Break',
  description: 'Insert a page break at a character index.',
  llmDescription:
    'Insert a page break at the given character index via batchUpdate insertPageBreak. Use index=1 to put a break at the very top, or the endIndex of the previous paragraph to break before new content.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    index: Property.Number({ displayName: 'Insertion Index', required: true }),
  },
  async run({ auth, propsValue }) {
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [{ insertPageBreak: { location: { index: propsValue.index } } }],
    });
  },
});

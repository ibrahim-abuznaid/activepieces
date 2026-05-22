import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const deleteTextRange = createAction({
  auth: googleDocsAuth,
  name: 'delete_text_range',
  displayName: 'Delete Text Range',
  description: 'Delete a character range from a Google Doc.',
  llmDescription:
    'Delete a contiguous character range [startIndex, endIndex) from the document body via batchUpdate deleteContentRange. Inspect read_document first to find correct indices.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    startIndex: Property.Number({ displayName: 'Start Index', required: true }),
    endIndex: Property.Number({ displayName: 'End Index (exclusive)', required: true }),
  },
  async run({ auth, propsValue }) {
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [
        {
          deleteContentRange: {
            range: { startIndex: propsValue.startIndex, endIndex: propsValue.endIndex },
          },
        },
      ],
    });
  },
});

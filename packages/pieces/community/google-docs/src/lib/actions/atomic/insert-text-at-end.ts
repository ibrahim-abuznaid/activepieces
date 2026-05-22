import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const insertTextAtEnd = createAction({
  auth: googleDocsAuth,
  name: 'insert_text_at_end',
  displayName: 'Insert Text At End',
  description: 'Append text to the end of a Google Doc.',
  llmDescription:
    'Append text to the end of the document body via batchUpdate insertText with endOfSegmentLocation. Equivalent to append_text but lives in the agent surface alongside other granular insert helpers. Not idempotent.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    text: Property.LongText({ displayName: 'Text', required: true }),
  },
  async run({ auth, propsValue }) {
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [{ insertText: { endOfSegmentLocation: {}, text: propsValue.text } }],
    });
  },
});

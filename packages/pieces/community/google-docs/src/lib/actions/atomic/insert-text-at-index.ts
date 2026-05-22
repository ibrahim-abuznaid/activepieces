import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const insertTextAtIndex = createAction({
  auth: googleDocsAuth,
  name: 'insert_text_at_index',
  displayName: 'Insert Text At Index',
  description: 'Insert text at a specific character index in a Google Doc.',
  llmDescription:
    'Insert text at an explicit zero-based character index in the document body via batchUpdate insertText. Use index=1 to prepend at the top (index 0 is reserved). Not idempotent.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    index: Property.Number({ displayName: 'Insertion Index', required: true, defaultValue: 1 }),
    text: Property.LongText({ displayName: 'Text', required: true }),
  },
  async run({ auth, propsValue }) {
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [{ insertText: { location: { index: propsValue.index }, text: propsValue.text } }],
    });
  },
});

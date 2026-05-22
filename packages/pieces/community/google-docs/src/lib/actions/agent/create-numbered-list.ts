import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const createNumberedList = createAction({
  auth: googleDocsAuth,
  name: 'create_numbered_list',
  displayName: 'Create Numbered List',
  description: 'Insert a list of items as a numbered list.',
  llmDescription:
    'Insert each item as its own paragraph at the end of the document, then apply numbered-list formatting via batchUpdate createParagraphBullets with NUMBERED_DECIMAL_ALPHA_ROMAN preset.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}, {}, {}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    items: Property.Array({ displayName: 'List Items', required: true }),
  },
  async run({ auth, propsValue }) {
    const docs = await agentCommon.docsClient(auth);
    const doc = await docs.documents.get({ documentId: propsValue.documentId });
    const endIndex = (doc.data.body?.content ?? []).reduce(
      (max, el) => Math.max(max, el.endIndex ?? 0),
      1,
    );
    const insertAt = Math.max(endIndex - 1, 1);
    const items = (propsValue.items ?? []).map((i) => String(i));
    const text = items.map((i) => `${i}\n`).join('');
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [
        { insertText: { location: { index: insertAt }, text } },
        {
          createParagraphBullets: {
            range: { startIndex: insertAt, endIndex: insertAt + text.length },
            bulletPreset: 'NUMBERED_DECIMAL_ALPHA_ROMAN',
          },
        },
      ],
    });
  },
});

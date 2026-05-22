import { createAction, Property } from '@activepieces/pieces-framework';
import { docs_v1 } from 'googleapis';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

const extractText = (body: docs_v1.Schema$Body | undefined): string => {
  if (!body?.content) return '';
  const collect = (elements: docs_v1.Schema$StructuralElement[] | undefined): string => {
    if (!elements) return '';
    return elements
      .map((el) => {
        if (el.paragraph?.elements) {
          return el.paragraph.elements
            .map((e) => e.textRun?.content ?? '')
            .join('');
        }
        if (el.table?.tableRows) {
          return el.table.tableRows
            .map((row) =>
              row.tableCells?.map((cell) => collect(cell.content)).join('\t') ?? '',
            )
            .join('\n');
        }
        return '';
      })
      .join('');
  };
  return collect(body.content);
};

export const readDocumentText = createAction({
  auth: googleDocsAuth,
  name: 'read_document_text',
  displayName: 'Read Document Text',
  description: 'Return the plaintext contents of a Google Doc.',
  llmDescription:
    'Fetch a Google Doc and return its body as a single plaintext string with paragraph breaks. Use this when you only need the words (summarisation, classification, Q&A) and not the full structural JSON returned by read_document.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    documentId: '1A2bC3dEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEF',
    title: 'Meeting notes',
    text: 'Heading\nSome paragraph text...\n',
  },
  props: {
    documentId: Property.ShortText({
      displayName: 'Document ID',
      required: true,
    }),
  },
  async run({ auth, propsValue }) {
    const docs = await agentCommon.docsClient(auth);
    const res = await docs.documents.get({ documentId: propsValue.documentId });
    return {
      documentId: res.data.documentId,
      title: res.data.title,
      text: extractText(res.data.body ?? undefined),
    };
  },
});

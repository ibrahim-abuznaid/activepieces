import { googleDocsAuth, createGoogleClient } from '../auth';
import { Property, createAction } from '@activepieces/pieces-framework';
import { google } from 'googleapis';

export const readDocument = createAction({
  displayName: 'Read Document',
  auth: googleDocsAuth,
  name: 'read_document',
  description: 'Read a document from Google Docs',
  llmDescription:
    'Fetch the full Google Docs document JSON for the given documentId, including title, body content (structural elements), and named ranges. Returns the raw Documents.get response. For extracting just plain text, prefer read_document_text.',
  audience: 'both',
  idempotent: true,
  sampleData: {
    documentId: '1A2bC3dEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEF',
    title: 'My Document',
    body: { content: [{ startIndex: 1, endIndex: 12, paragraph: { elements: [{ textRun: { content: 'Hello world\n' } }] } }] },
    revisionId: 'ALm37BV',
  },
  props: {
    documentId: Property.ShortText({
      displayName: 'Document ID',
      description: 'The ID of the document to read',
      required: true,
    }),
  },
  async run(context) {
    const authClient = await createGoogleClient(context.auth);

    const docs = google.docs({ version: 'v1', auth: authClient });
    const response = await docs.documents.get({
      documentId: context.propsValue.documentId,
    });

    if (response.status !== 200) {
      console.error(response);
      throw new Error('Error reading document');
    }

    return response.data;
  },
});

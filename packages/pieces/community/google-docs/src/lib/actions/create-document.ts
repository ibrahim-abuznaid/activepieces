import { createAction } from '@activepieces/pieces-framework';
import { docsCommon } from '../common';
import { googleDocsAuth, getAccessToken } from '../auth';

export const createDocument = createAction({
  auth: googleDocsAuth,
  name: 'create_document',
  description: 'Create a document on Google Docs',
  displayName: 'Create Document',
  llmDescription:
    'Create a new Google Docs document with the given title and initial body text. Returns the freshly created document including its documentId. Use this when the user wants a brand-new doc; for editing an existing doc, prefer the append/insert/replace actions instead.',
  audience: 'both',
  idempotent: false,
  sampleData: {
    documentId: '1A2bC3dEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEF',
    title: 'Untitled document',
    body: { content: [] },
    revisionId: 'ALm37BV',
  },
  props: {
    title: docsCommon.title,
    body: docsCommon.body,
  },
  async run(context) {
    const accessToken = await getAccessToken(context.auth);
    const document = await docsCommon.createDocument(
      context.propsValue.title,
      accessToken
    );
    const response = await docsCommon.writeToDocument(
      document.documentId,
      context.propsValue.body,
      accessToken
    );

    return response;
  },
});

import { docsCommon } from '../common';
import { googleDocsAuth, getAccessToken } from '../auth';
import { Property, createAction } from "@activepieces/pieces-framework";

export const appendText = createAction({
    auth: googleDocsAuth,
    name: 'append_text',
    description: 'Appends text to google docs',
    displayName: 'Append text to google docs',
    llmDescription:
      'Append raw text to the end of an existing Google Docs document. Inserts a single insertText request via batchUpdate. Re-running with the same input appends the text again (not idempotent). Use insert_text_at_index for placing text mid-document.',
    audience: 'both',
    idempotent: false,
    sampleData: {
      documentId: '1A2bC3dEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEF',
      replies: [{}],
      writeControl: { requiredRevisionId: 'ALm37BV' },
    },
    props: {
      text: Property.LongText({
        displayName: 'Text to append',
        description: 'The text to append to the document',
        required: true,
      }),
      documentId: Property.ShortText({
        displayName: 'Document ID',
        description: 'The ID of the document to append text to',
        required: true,
      })
    },
    async run(context) {
      return await docsCommon.writeToDocument(
        context.propsValue.documentId,
        context.propsValue.text,
        await getAccessToken(context.auth)
      );
    },
  });

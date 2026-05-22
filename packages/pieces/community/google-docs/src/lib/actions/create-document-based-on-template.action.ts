/* eslint-disable @typescript-eslint/no-explicit-any */
import { googleDocsAuth, createGoogleClient } from '../auth';
import { Property, createAction } from '@activepieces/pieces-framework';
import { google } from 'googleapis';

const PLACEHOLDER_FORMATS: Record<string, string> = {
  'curly_braces': '{{KEY}}',
  'square_brackets': '[[KEY]]',
  'single_curly': '{KEY}',
  'single_square': '[KEY]',
  '{{KEY}}': '{{KEY}}',
  '[[KEY]]': '[[KEY]]',
  '{KEY}': '{KEY}',
  '[KEY]': '[KEY]',
};

export const createDocumentBasedOnTemplate = createAction({
  auth: googleDocsAuth,
  name: 'create_document_based_on_template',
  description:
    'Edit a template file and replace the values with the ones provided',
  displayName: 'Edit template file',
  llmDescription:
    'Mail-merge style replacement: given a template documentId and a key/value map, replace every placeholder (e.g. [[name]] or {{name}}) with the provided value via a single batchUpdate. Also supports replacing inline images by image objectId. Mutates the target document in place.',
  audience: 'both',
  idempotent: false,
  sampleData: {
    documentId: '1A2bC3dEfGhIjKlMnOpQrStUvWxYz0123456789ABCDEF',
    replies: [{ replaceAllText: { occurrencesChanged: 3 } }],
  },
  props: {
    template: Property.ShortText({
      displayName: 'Destination File',
      description: 'The ID of the file to replace the values',
      required: true,
    }),
    values: Property.Object({
      displayName: 'Variables',
      description: 'Dont include the placeholder format "[[]]" or "{{}}", only the key name and its value',
      required: true,
    }),
    images: Property.Object({
      displayName: 'Images',
      description:
        'Key: Image ID (get it manually from the Read File Action), Value: Image URL',
      required: true,
    }),
    placeholder_format: Property.StaticDropdown({
      displayName: 'Placeholder Format',
      description: 'Choose the format of placeholders in your template',
      required: true,
      defaultValue: 'square_brackets',
      options: {
          disabled: false,
          options: [
              { label: 'Curly Braces {{}}', value: 'curly_braces' },
              { label: 'Square Brackets [[]]', value: 'square_brackets' },
              { label: 'Single Curly Braces {}', value: 'single_curly' },
              { label: 'Single Square Brackets []', value: 'single_square' }
          ],
        },
  }),
  },
  async run(context) {
    const documentId: string = context.propsValue.template;
    const values = context.propsValue.values;
    const placeholderType = context.propsValue.placeholder_format;
    const placeholder_format = PLACEHOLDER_FORMATS[placeholderType] || '[[KEY]]';

    const authClient = await createGoogleClient(context.auth);
    const docs = google.docs('v1');

    const requests = [];

    for (const key in values) {
      const value = values[key];
      const new_key = placeholder_format.replace('KEY', key);

      requests.push({
        replaceAllText: {
          containsText: {
            text: new_key,
            matchCase: true,
          },
          replaceText: String(value),
        },
      });
    }

    for (const key in context.propsValue.images) {
      const value = context.propsValue.images[key];
      requests.push({
        replaceImage: {
          imageObjectId: key,
          uri: String(value),
        },
      });
    }

    const res = await docs.documents.batchUpdate({
      auth: authClient,
      documentId,
      requestBody: {
        requests: requests,
      },
    });

    return res;
  },
});

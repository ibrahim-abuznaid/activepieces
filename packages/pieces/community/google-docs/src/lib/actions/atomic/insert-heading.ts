import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

const HEADING_LEVELS = [
  'TITLE',
  'SUBTITLE',
  'HEADING_1',
  'HEADING_2',
  'HEADING_3',
  'HEADING_4',
  'HEADING_5',
  'HEADING_6',
] as const;

export const insertHeading = createAction({
  auth: googleDocsAuth,
  name: 'insert_heading',
  displayName: 'Insert Heading',
  description: 'Append a heading of the chosen level to the end of a Google Doc.',
  llmDescription:
    'Append a heading paragraph (e.g. HEADING_1, HEADING_2, TITLE, SUBTITLE) to the end of the document. Inserts the text then applies a paragraph style. Not idempotent — calling twice creates two headings.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}, {}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    text: Property.ShortText({ displayName: 'Heading Text', required: true }),
    level: Property.StaticDropdown({
      displayName: 'Heading Level',
      required: true,
      defaultValue: 'HEADING_1',
      options: {
        disabled: false,
        options: HEADING_LEVELS.map((l) => ({ label: l, value: l })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const docs = await agentCommon.docsClient(auth);
    const doc = await docs.documents.get({ documentId: propsValue.documentId });
    const endIndex = (doc.data.body?.content ?? []).reduce(
      (max, el) => Math.max(max, el.endIndex ?? 0),
      1,
    );
    const insertAt = Math.max(endIndex - 1, 1);
    const newline = '\n';
    const requests = [
      { insertText: { location: { index: insertAt }, text: propsValue.text + newline } },
      {
        updateParagraphStyle: {
          range: { startIndex: insertAt, endIndex: insertAt + propsValue.text.length + 1 },
          paragraphStyle: { namedStyleType: propsValue.level },
          fields: 'namedStyleType',
        },
      },
    ];
    return await agentCommon.batchUpdate({ auth, documentId: propsValue.documentId, requests });
  },
});

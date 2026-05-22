import { createAction, Property } from '@activepieces/pieces-framework';
import { docs_v1 } from 'googleapis';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

const flattenText = (body: docs_v1.Schema$Body | undefined): string => {
  if (!body?.content) return '';
  return body.content
    .map((el) =>
      (el.paragraph?.elements ?? [])
        .map((e) => e.textRun?.content ?? '')
        .join(''),
    )
    .join('');
};

export const countWords = createAction({
  auth: googleDocsAuth,
  name: 'count_words_in_document',
  displayName: 'Count Words',
  description: 'Count words and characters in a Google Doc.',
  llmDescription:
    'Return word count, character count (with and without whitespace), and paragraph count for a Google Doc. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { documentId: '1A2bC3', words: 412, charactersWithSpaces: 2480, charactersNoSpaces: 2068, paragraphs: 18 },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const docs = await agentCommon.docsClient(auth);
    const res = await docs.documents.get({ documentId: propsValue.documentId });
    const text = flattenText(res.data.body ?? undefined);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const paragraphs = (res.data.body?.content ?? []).filter((el) => el.paragraph).length;
    return {
      documentId: res.data.documentId,
      words,
      charactersWithSpaces: text.length,
      charactersNoSpaces: text.replace(/\s+/g, '').length,
      paragraphs,
    };
  },
});

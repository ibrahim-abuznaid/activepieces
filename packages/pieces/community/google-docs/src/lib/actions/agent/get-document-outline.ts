import { createAction, Property } from '@activepieces/pieces-framework';
import { docs_v1 } from 'googleapis';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

const collectHeadings = (
  elements: docs_v1.Schema$StructuralElement[] | undefined,
): Array<{ level: string; text: string; startIndex: number }> => {
  if (!elements) return [];
  const headings: Array<{ level: string; text: string; startIndex: number }> = [];
  for (const el of elements) {
    const style = el.paragraph?.paragraphStyle?.namedStyleType;
    if (style && style.startsWith('HEADING_')) {
      const text = (el.paragraph?.elements ?? [])
        .map((e) => e.textRun?.content ?? '')
        .join('')
        .trim();
      headings.push({ level: style, text, startIndex: el.startIndex ?? 0 });
    }
  }
  return headings;
};

export const getDocumentOutline = createAction({
  auth: googleDocsAuth,
  name: 'get_document_outline',
  displayName: 'Get Document Outline',
  description: 'Get the heading outline and named ranges of a Google Doc.',
  llmDescription:
    'Return a compact outline of a Google Doc: ordered list of headings (with named style level), named ranges, and table-of-contents-style structure. Use this for navigation/jumping rather than reading the full body. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    documentId: '1A2bC3',
    headings: [
      { level: 'HEADING_1', text: 'Overview', startIndex: 1 },
      { level: 'HEADING_2', text: 'Goals', startIndex: 42 },
    ],
    namedRanges: [],
  },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const docs = await agentCommon.docsClient(auth);
    const res = await docs.documents.get({ documentId: propsValue.documentId });
    return {
      documentId: res.data.documentId,
      headings: collectHeadings(res.data.body?.content),
      namedRanges: Object.keys(res.data.namedRanges ?? {}),
    };
  },
});

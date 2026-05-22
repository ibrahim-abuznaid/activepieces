import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const insertSectionBreak = createAction({
  auth: googleDocsAuth,
  name: 'insert_section_break',
  displayName: 'Insert Section Break',
  description: 'Insert a continuous or next-page section break.',
  llmDescription:
    'Insert a section break at the given index via batchUpdate insertSectionBreak. sectionType: CONTINUOUS (default) or NEXT_PAGE. Used to change page setup (orientation/margins) mid-doc.',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    index: Property.Number({ displayName: 'Insertion Index', required: true }),
    sectionType: Property.StaticDropdown({
      displayName: 'Section Type',
      required: false,
      defaultValue: 'CONTINUOUS',
      options: {
        disabled: false,
        options: [
          { label: 'Continuous', value: 'CONTINUOUS' },
          { label: 'Next Page', value: 'NEXT_PAGE' },
        ],
      },
    }),
  },
  async run({ auth, propsValue }) {
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [
        {
          insertSectionBreak: {
            location: { index: propsValue.index },
            sectionType: propsValue.sectionType ?? 'CONTINUOUS',
          },
        },
      ],
    });
  },
});

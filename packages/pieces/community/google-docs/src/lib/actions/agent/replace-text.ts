import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const replaceText = createAction({
  auth: googleDocsAuth,
  name: 'replace_text',
  displayName: 'Replace Text',
  description: 'Replace all occurrences of a string in a Google Doc.',
  llmDescription:
    'Replace every occurrence of `find` with `replace` in the document body via batchUpdate replaceAllText. Case-sensitivity is controlled by matchCase (default true). Returns occurrencesChanged. Idempotent only when find no longer appears (re-running finds nothing).',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{ replaceAllText: { occurrencesChanged: 2 } }] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    find: Property.ShortText({ displayName: 'Find', required: true }),
    replace: Property.ShortText({ displayName: 'Replace With', required: true }),
    matchCase: Property.Checkbox({ displayName: 'Match Case', required: false, defaultValue: true }),
  },
  async run({ auth, propsValue }) {
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [
        {
          replaceAllText: {
            containsText: { text: propsValue.find, matchCase: propsValue.matchCase ?? true },
            replaceText: propsValue.replace,
          },
        },
      ],
    });
  },
});

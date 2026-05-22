import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const setAnyoneWithLink = createAction({
  auth: googleDocsAuth,
  name: 'set_document_anyone_with_link',
  displayName: 'Set Link Sharing',
  description: 'Grant anyone-with-the-link access to a Google Doc at the chosen role.',
  llmDescription:
    "Create a Drive permission of type='anyone' on the document with the chosen role (reader|commenter|writer). Equivalent to 'Anyone with the link' sharing in the UI. Returns the new permission resource.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'anyoneWithLink', type: 'anyone', role: 'reader' },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    role: Property.StaticDropdown({
      displayName: 'Role',
      required: false,
      defaultValue: 'reader',
      options: {
        disabled: false,
        options: [
          { label: 'Reader', value: 'reader' },
          { label: 'Commenter', value: 'commenter' },
          { label: 'Writer', value: 'writer' },
        ],
      },
    }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    const res = await drive.permissions.create({
      fileId: propsValue.documentId,
      supportsAllDrives: true,
      requestBody: { type: 'anyone', role: propsValue.role ?? 'reader' },
      fields: 'id,type,role',
    });
    return res.data;
  },
});

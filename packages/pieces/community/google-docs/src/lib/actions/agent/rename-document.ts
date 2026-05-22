import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const renameDocument = createAction({
  auth: googleDocsAuth,
  name: 'rename_document',
  displayName: 'Rename Document',
  description: 'Rename a Google Doc.',
  llmDescription:
    'Update the title of a Google Doc via Drive files.update. Returns the updated file metadata.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: '1A2bC3', name: 'New title', mimeType: 'application/vnd.google-apps.document' },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    newTitle: Property.ShortText({ displayName: 'New Title', required: true }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    const res = await drive.files.update({
      fileId: propsValue.documentId,
      requestBody: { name: propsValue.newTitle },
      supportsAllDrives: true,
      fields: 'id,name,mimeType,modifiedTime',
    });
    return res.data;
  },
});

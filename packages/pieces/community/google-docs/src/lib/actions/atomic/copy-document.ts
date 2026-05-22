import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const copyDocument = createAction({
  auth: googleDocsAuth,
  name: 'copy_document',
  displayName: 'Copy Document',
  description: 'Make a copy of a Google Doc, optionally renaming it.',
  llmDescription:
    'Drive files.copy on a Google Docs document. Returns the new file metadata including id, name, and webViewLink. Use for duplicating templates before editing them.',
  audience: 'agent',
  idempotent: false,
  sampleData: {
    id: '1xYzNew',
    name: 'Copy of Template',
    mimeType: 'application/vnd.google-apps.document',
    webViewLink: 'https://docs.google.com/document/d/1xYzNew/edit',
  },
  props: {
    documentId: Property.ShortText({ displayName: 'Source Document ID', required: true }),
    newTitle: Property.ShortText({ displayName: 'New Title', required: false }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    const res = await drive.files.copy({
      fileId: propsValue.documentId,
      requestBody: propsValue.newTitle ? { name: propsValue.newTitle } : {},
      supportsAllDrives: true,
      fields: 'id,name,mimeType,webViewLink',
    });
    return res.data;
  },
});

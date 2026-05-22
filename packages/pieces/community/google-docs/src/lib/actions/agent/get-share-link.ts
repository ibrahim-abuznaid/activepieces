import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const getShareLink = createAction({
  auth: googleDocsAuth,
  name: 'get_document_share_link',
  displayName: 'Get Share Link',
  description: 'Return the webViewLink of a Google Doc.',
  llmDescription:
    'Return the canonical Google Docs URL (webViewLink) for a documentId via Drive files.get with fields=webViewLink. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    id: '1A2bC3',
    webViewLink: 'https://docs.google.com/document/d/1A2bC3/edit?usp=drivesdk',
  },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    const res = await drive.files.get({
      fileId: propsValue.documentId,
      supportsAllDrives: true,
      fields: 'id,webViewLink',
    });
    return res.data;
  },
});

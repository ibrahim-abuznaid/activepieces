import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const listRecentDocuments = createAction({
  auth: googleDocsAuth,
  name: 'list_recent_documents',
  displayName: 'List Recent Documents',
  description: 'List the most recently modified Google Docs documents.',
  llmDescription:
    'Return the N most recently modified Google Docs (Drive files with mimeType=application/vnd.google-apps.document, sorted by modifiedTime desc). Each item has id, name, modifiedTime, and webViewLink. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    files: [
      { id: '1A2bC3', name: 'Q4 plan', modifiedTime: '2026-05-22T01:00:00.000Z', webViewLink: 'https://docs.google.com/document/d/1A2bC3/edit' },
    ],
  },
  props: {
    limit: Property.Number({ displayName: 'Limit', required: false, defaultValue: 10 }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document' and trashed=false",
      orderBy: 'modifiedTime desc',
      pageSize: propsValue.limit ?? 10,
      fields: 'files(id,name,modifiedTime,webViewLink,owners(emailAddress))',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'allDrives',
    });
    return { files: res.data.files ?? [] };
  },
});

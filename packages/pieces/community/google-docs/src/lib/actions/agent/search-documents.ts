import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const searchDocuments = createAction({
  auth: googleDocsAuth,
  name: 'search_documents',
  displayName: 'Search Documents',
  description: 'Full-text search across Google Docs (Drive fullText query).',
  llmDescription:
    'Search Google Docs documents by free-text query (matches title and body via Drive fullText contains). Returns id, name, snippet (when available), modifiedTime, webViewLink. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: {
    files: [
      { id: '1A2bC3', name: 'Quarterly review', modifiedTime: '2026-05-21T10:00:00Z', webViewLink: 'https://docs.google.com/document/d/1A2bC3/edit' },
    ],
  },
  props: {
    query: Property.ShortText({ displayName: 'Search Query', required: true }),
    limit: Property.Number({ displayName: 'Limit', required: false, defaultValue: 20 }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    const escaped = propsValue.query.replace(/'/g, "\\'");
    const res = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and trashed=false and fullText contains '${escaped}'`,
      orderBy: 'modifiedTime desc',
      pageSize: propsValue.limit ?? 20,
      fields: 'files(id,name,modifiedTime,webViewLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      corpora: 'allDrives',
    });
    return { files: res.data.files ?? [] };
  },
});

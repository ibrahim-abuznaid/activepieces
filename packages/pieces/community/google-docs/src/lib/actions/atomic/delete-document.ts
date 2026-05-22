import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const deleteDocument = createAction({
  auth: googleDocsAuth,
  name: 'delete_document',
  displayName: 'Delete Document',
  description: 'Move a Google Doc to the trash (or permanently delete).',
  llmDescription:
    'Trash or hard-delete a Google Docs document via Drive. Defaults to trash (recoverable). Set permanent=true to skip trash and call files.delete directly. Destructive — confirm with the user before calling.',
  audience: 'agent',
  idempotent: true,
  sampleData: { documentId: '1A2bC3', deleted: true, permanent: false },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    permanent: Property.Checkbox({
      displayName: 'Permanent Delete',
      description: 'When true, calls files.delete (skips trash). When false, sets trashed=true.',
      required: false,
      defaultValue: false,
    }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    if (propsValue.permanent) {
      await drive.files.delete({ fileId: propsValue.documentId, supportsAllDrives: true });
    } else {
      await drive.files.update({
        fileId: propsValue.documentId,
        requestBody: { trashed: true },
        supportsAllDrives: true,
      });
    }
    return { documentId: propsValue.documentId, deleted: true, permanent: propsValue.permanent ?? false };
  },
});

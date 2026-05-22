import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const shareDocument = createAction({
  auth: googleDocsAuth,
  name: 'share_document_with_user',
  displayName: 'Share Document',
  description: "Share a Google Doc with a user's email at the chosen role.",
  llmDescription:
    "Grant a user permission on a Google Doc via Drive permissions.create. role: reader | commenter | writer | fileOrganizer | organizer | owner (default writer). Set sendNotificationEmail=false to skip the share email.",
  audience: 'agent',
  idempotent: true,
  sampleData: {
    id: 'permId123',
    type: 'user',
    role: 'writer',
    emailAddress: 'alice@example.com',
  },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    email: Property.ShortText({ displayName: 'User Email', required: true }),
    role: Property.StaticDropdown({
      displayName: 'Role',
      required: false,
      defaultValue: 'writer',
      options: {
        disabled: false,
        options: [
          { label: 'Reader', value: 'reader' },
          { label: 'Commenter', value: 'commenter' },
          { label: 'Writer', value: 'writer' },
          { label: 'File Organizer', value: 'fileOrganizer' },
          { label: 'Organizer', value: 'organizer' },
          { label: 'Owner', value: 'owner' },
        ],
      },
    }),
    sendNotificationEmail: Property.Checkbox({
      displayName: 'Send Notification Email',
      required: false,
      defaultValue: true,
    }),
  },
  async run({ auth, propsValue }) {
    const drive = await agentCommon.driveClient(auth);
    const res = await drive.permissions.create({
      fileId: propsValue.documentId,
      sendNotificationEmail: propsValue.sendNotificationEmail ?? true,
      supportsAllDrives: true,
      requestBody: {
        type: 'user',
        role: propsValue.role ?? 'writer',
        emailAddress: propsValue.email,
      },
      fields: 'id,type,role,emailAddress',
    });
    return res.data;
  },
});

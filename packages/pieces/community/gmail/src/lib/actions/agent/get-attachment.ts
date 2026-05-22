import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const getAttachment = createAction({
  auth: gmailAuth,
  name: 'get_attachment',
  displayName: 'Get Attachment',
  description: 'Download a Gmail attachment as base64.',
  llmDescription:
    'users.messages.attachments.get — fetch attachment bytes for an attachmentId on a message. Returns base64url-encoded data + size. Pair attachmentId with messageId (from get_message payload.parts[].body.attachmentId). Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { data: 'JVBERi0xLjcK...', size: 18432 },
  props: {
    messageId: Property.ShortText({
      displayName: 'Message ID',
      required: true,
    }),
    attachmentId: Property.ShortText({
      displayName: 'Attachment ID',
      required: true,
    }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.messages.attachments.get({
      userId: 'me',
      messageId: propsValue.messageId,
      id: propsValue.attachmentId,
    });
    return res.data;
  },
});

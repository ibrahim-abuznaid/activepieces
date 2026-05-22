import { createAction, Property } from '@activepieces/pieces-framework';
import { createGoogleClient, gmailAuth, getUserEmail } from '../../auth';
import { gmailAgentCommon } from './agent-common';

const toBase64Url = (input: string): string =>
  Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

export const createDraft = createAction({
  auth: gmailAuth,
  name: 'create_draft',
  displayName: 'Create Draft',
  description: 'Create a Gmail draft email.',
  llmDescription:
    'users.drafts.create — create a draft from RFC 2822 fields (to, subject, body). The body is treated as text/plain by default; set isHtml=true for HTML. Use send_draft to send afterwards.',
  audience: 'agent',
  idempotent: false,
  sampleData: { id: 'r-1', message: { id: '18f...', labelIds: ['DRAFT'] } },
  props: {
    to: Property.Array({ displayName: 'To', required: true }),
    cc: Property.Array({ displayName: 'Cc', required: false }),
    bcc: Property.Array({ displayName: 'Bcc', required: false }),
    subject: Property.ShortText({ displayName: 'Subject', required: true }),
    body: Property.LongText({ displayName: 'Body', required: true }),
    isHtml: Property.Checkbox({
      displayName: 'HTML Body',
      required: false,
      defaultValue: false,
    }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const authClient = await createGoogleClient(auth);
    const from = await getUserEmail(auth, authClient);
    const toLine = (propsValue.to as string[]).join(', ');
    const ccLine = propsValue.cc
      ? `Cc: ${(propsValue.cc as string[]).join(', ')}\r\n`
      : '';
    const bccLine = propsValue.bcc
      ? `Bcc: ${(propsValue.bcc as string[]).join(', ')}\r\n`
      : '';
    const mime = propsValue.isHtml ? 'text/html' : 'text/plain';
    const raw = toBase64Url(
      `From: ${from}\r\nTo: ${toLine}\r\n${ccLine}${bccLine}Subject: ${propsValue.subject}\r\nMIME-Version: 1.0\r\nContent-Type: ${mime}; charset="UTF-8"\r\n\r\n${propsValue.body}`
    );
    const res = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw } },
    });
    return res.data;
  },
});

import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { createGoogleClient, GmailAuthValue } from '../../auth';

const gmailClient = async (auth: GmailAuthValue): Promise<gmail_v1.Gmail> => {
  const authClient: OAuth2Client = await createGoogleClient(auth);
  return google.gmail({ version: 'v1', auth: authClient });
};

const modifyLabels = async ({
  auth,
  id,
  addLabelIds,
  removeLabelIds,
}: {
  auth: GmailAuthValue;
  id: string;
  addLabelIds?: string[];
  removeLabelIds?: string[];
}) => {
  const gmail = await gmailClient(auth);
  const res = await gmail.users.messages.modify({
    userId: 'me',
    id,
    requestBody: { addLabelIds, removeLabelIds },
  });
  return res.data;
};

export const gmailAgentCommon = {
  gmailClient,
  modifyLabels,
};

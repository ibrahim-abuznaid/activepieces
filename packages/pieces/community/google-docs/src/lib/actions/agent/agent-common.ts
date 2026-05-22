import { google, docs_v1, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { createGoogleClient, GoogleDocsAuthValue } from '../../auth';

const docsClient = async (auth: GoogleDocsAuthValue): Promise<docs_v1.Docs> => {
  const authClient: OAuth2Client = await createGoogleClient(auth);
  return google.docs({ version: 'v1', auth: authClient });
};

const driveClient = async (auth: GoogleDocsAuthValue): Promise<drive_v3.Drive> => {
  const authClient: OAuth2Client = await createGoogleClient(auth);
  return google.drive({ version: 'v3', auth: authClient });
};

const batchUpdate = async ({
  auth,
  documentId,
  requests,
}: {
  auth: GoogleDocsAuthValue;
  documentId: string;
  requests: docs_v1.Schema$Request[];
}) => {
  const docs = await docsClient(auth);
  const res = await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests },
  });
  return res.data;
};

export const agentCommon = {
  docsClient,
  driveClient,
  batchUpdate,
};

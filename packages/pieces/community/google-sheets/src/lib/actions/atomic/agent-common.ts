import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { createGoogleClient, GoogleSheetsAuthValue } from '../../common/common';

const sheetsClient = async (
  auth: GoogleSheetsAuthValue,
): Promise<sheets_v4.Sheets> => {
  const authClient: OAuth2Client = await createGoogleClient(auth);
  return google.sheets({ version: 'v4', auth: authClient });
};

export const sheetsAgentCommon = {
  sheetsClient,
};

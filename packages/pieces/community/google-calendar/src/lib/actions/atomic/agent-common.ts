import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { createGoogleClient, GoogleCalendarAuthValue } from '../../auth';

const calendarClient = async (
  auth: GoogleCalendarAuthValue,
): Promise<calendar_v3.Calendar> => {
  const authClient: OAuth2Client = await createGoogleClient(auth);
  return google.calendar({ version: 'v3', auth: authClient });
};

export const calendarAgentCommon = {
  calendarClient,
};

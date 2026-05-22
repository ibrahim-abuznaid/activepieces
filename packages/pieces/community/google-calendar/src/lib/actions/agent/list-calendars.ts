import { createAction } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const listCalendars = createAction({
  auth: googleCalendarAuth,
  name: 'list_calendars',
  displayName: 'List Calendars',
  description: 'List calendars accessible to the user.',
  llmDescription:
    'calendarList.list — return all calendars on the user calendar list (primary + subscribed). Includes id, summary, primary flag, accessRole, timeZone. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { items: [{ id: 'primary', summary: 'me@example.com', primary: true, accessRole: 'owner' }] },
  props: {},
  async run({ auth }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.calendarList.list({});
    return res.data;
  },
});

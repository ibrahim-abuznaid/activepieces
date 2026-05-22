import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const findFreeSlots = createAction({
  auth: googleCalendarAuth,
  name: 'find_free_slots',
  displayName: 'Find Free Slots',
  description: 'Find free time blocks on one or more calendars within a window.',
  llmDescription:
    "freebusy.query — return busy intervals for given calendars between timeMin/timeMax. The agent inverts these to compute free slots client-side. Useful for scheduling. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { calendars: { primary: { busy: [{ start: '2026-05-22T15:00:00Z', end: '2026-05-22T16:00:00Z' }] } } },
  props: {
    calendarIds: Property.Array({ displayName: 'Calendar IDs', required: true }),
    timeMin: Property.DateTime({ displayName: 'Time Min (ISO)', required: true }),
    timeMax: Property.DateTime({ displayName: 'Time Max (ISO)', required: true }),
    timeZone: Property.ShortText({ displayName: 'Time Zone (IANA)', required: false }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.freebusy.query({
      requestBody: {
        timeMin: new Date(propsValue.timeMin).toISOString(),
        timeMax: new Date(propsValue.timeMax).toISOString(),
        timeZone: propsValue.timeZone,
        items: (propsValue.calendarIds as string[]).map((id) => ({ id })),
      },
    });
    return res.data;
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const getEvent = createAction({
  auth: googleCalendarAuth,
  name: 'get_event',
  displayName: 'Get Event',
  description: 'Fetch a single calendar event by id.',
  llmDescription: 'events.get — return the full event resource. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', summary: 'Sync', attendees: [], start: { dateTime: '2026-05-22T15:00:00Z' } },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.get({ calendarId: propsValue.calendarId ?? 'primary', eventId: propsValue.eventId });
    return res.data;
  },
});

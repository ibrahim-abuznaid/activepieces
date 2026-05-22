import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const addAttendeeSimple = createAction({
  auth: googleCalendarAuth,
  name: 'add_attendee_simple',
  displayName: 'Add Single Attendee',
  description: "Append one attendee to an event by email (preserves existing attendees).",
  llmDescription:
    'events.patch — fetch event, append { email } to attendees[], patch back. For multiple attendees in one call, prefer the existing canvas action add_attendees_to_event.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', attendees: [{ email: 'new@example.com', responseStatus: 'needsAction' }] },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    email: Property.ShortText({ displayName: 'Attendee Email', required: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const ev = await cal.events.get({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
    });
    const existing = ev.data.attendees ?? [];
    const already = existing.some((a) => a.email?.toLowerCase() === propsValue.email.toLowerCase());
    const attendees = already ? existing : [...existing, { email: propsValue.email }];
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      sendUpdates: 'all',
      requestBody: { attendees },
    });
    return res.data;
  },
});

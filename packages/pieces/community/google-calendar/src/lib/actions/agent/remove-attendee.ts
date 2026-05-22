import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const removeAttendee = createAction({
  auth: googleCalendarAuth,
  name: 'remove_attendee',
  displayName: 'Remove Attendee',
  description: 'Remove an attendee from a calendar event.',
  llmDescription:
    'events.patch — fetch event, filter the attendees[] to drop matching email, patch back. Idempotent (removing absent attendee is a no-op).',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', attendees: [] },
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
    const attendees = (ev.data.attendees ?? []).filter(
      (a) => a.email?.toLowerCase() !== propsValue.email.toLowerCase(),
    );
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      sendUpdates: 'all',
      requestBody: { attendees },
    });
    return res.data;
  },
});

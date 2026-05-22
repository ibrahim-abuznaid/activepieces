import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const listAttendees = createAction({
  auth: googleCalendarAuth,
  name: 'list_event_attendees',
  displayName: 'List Event Attendees',
  description: 'List attendees and their RSVP status on an event.',
  llmDescription:
    'events.get fields=attendees — return the attendees array including email, displayName, responseStatus, optional. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', attendees: [{ email: 'a@example.com', responseStatus: 'accepted' }] },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.get({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      fields: 'id,attendees',
    });
    return res.data;
  },
});

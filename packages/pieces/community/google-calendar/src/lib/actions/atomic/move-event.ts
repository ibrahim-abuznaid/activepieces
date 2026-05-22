import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const moveEvent = createAction({
  auth: googleCalendarAuth,
  name: 'move_event_to_calendar',
  displayName: 'Move Event To Calendar',
  description: 'Move an event from one calendar to another.',
  llmDescription:
    'events.move — moves the event from `calendarId` to `destinationCalendarId`. Both must be writable. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', summary: 'Moved event', organizer: { email: 'other@example.com' } },
  props: {
    calendarId: Property.ShortText({ displayName: 'Source Calendar ID', required: true }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    destinationCalendarId: Property.ShortText({ displayName: 'Destination Calendar ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.move({
      calendarId: propsValue.calendarId,
      eventId: propsValue.eventId,
      destination: propsValue.destinationCalendarId,
    });
    return res.data;
  },
});

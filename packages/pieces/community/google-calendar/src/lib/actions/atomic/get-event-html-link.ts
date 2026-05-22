import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const getEventHtmlLink = createAction({
  auth: googleCalendarAuth,
  name: 'get_event_html_link',
  displayName: 'Get Event Link',
  description: 'Return the htmlLink (web URL) of an event.',
  llmDescription:
    'events.get fields=htmlLink — return just the canonical Google Calendar URL of the event. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', htmlLink: 'https://calendar.google.com/calendar/event?eid=...' },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.get({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      fields: 'id,htmlLink',
    });
    return res.data;
  },
});

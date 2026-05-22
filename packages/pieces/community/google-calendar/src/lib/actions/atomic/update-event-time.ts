import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const updateEventTime = createAction({
  auth: googleCalendarAuth,
  name: 'update_event_time',
  displayName: 'Update Event Time',
  description: 'Reschedule an event to new start/end times.',
  llmDescription:
    'events.patch with body { start, end }. Provide ISO datetimes and an IANA timeZone. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', start: { dateTime: '2026-05-23T15:00:00Z' }, end: { dateTime: '2026-05-23T16:00:00Z' } },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    start: Property.DateTime({ displayName: 'Start (ISO)', required: true }),
    end: Property.DateTime({ displayName: 'End (ISO)', required: true }),
    timeZone: Property.ShortText({ displayName: 'Time Zone (IANA)', required: false }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      requestBody: {
        start: { dateTime: new Date(propsValue.start).toISOString(), timeZone: propsValue.timeZone },
        end: { dateTime: new Date(propsValue.end).toISOString(), timeZone: propsValue.timeZone },
      },
    });
    return res.data;
  },
});

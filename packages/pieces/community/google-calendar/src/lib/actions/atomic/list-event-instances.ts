import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const listEventInstances = createAction({
  auth: googleCalendarAuth,
  name: 'list_event_instances',
  displayName: 'List Recurring Event Instances',
  description: 'List individual occurrences of a recurring event.',
  llmDescription:
    'events.instances — expand a recurring event into its concrete occurrences within an optional timeMin/timeMax window. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { items: [{ id: 'ev-1_20260522', recurringEventId: 'ev-1', start: { dateTime: '2026-05-22T15:00:00Z' } }] },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Recurring Event ID', required: true }),
    timeMin: Property.DateTime({ displayName: 'Time Min (ISO)', required: false }),
    timeMax: Property.DateTime({ displayName: 'Time Max (ISO)', required: false }),
    maxResults: Property.Number({ displayName: 'Max Results', required: false, defaultValue: 25 }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.instances({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      timeMin: propsValue.timeMin ? new Date(propsValue.timeMin).toISOString() : undefined,
      timeMax: propsValue.timeMax ? new Date(propsValue.timeMax).toISOString() : undefined,
      maxResults: propsValue.maxResults ?? 25,
    });
    return res.data;
  },
});

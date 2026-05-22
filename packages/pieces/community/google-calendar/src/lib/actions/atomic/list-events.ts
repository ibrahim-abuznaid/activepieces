import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const listEvents = createAction({
  auth: googleCalendarAuth,
  name: 'list_events',
  displayName: 'List Events',
  description: 'List events on a calendar within an optional time window.',
  llmDescription:
    'events.list — fetch events from the given calendar (default "primary"). Supports timeMin/timeMax (RFC3339), q (free-text), maxResults, singleEvents=true to expand recurring events. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { items: [{ id: 'ev-1', summary: 'Sync', start: { dateTime: '2026-05-22T15:00:00Z' } }] },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    timeMin: Property.DateTime({ displayName: 'Time Min (ISO)', required: false }),
    timeMax: Property.DateTime({ displayName: 'Time Max (ISO)', required: false }),
    q: Property.ShortText({ displayName: 'Search Query', required: false }),
    maxResults: Property.Number({ displayName: 'Max Results', required: false, defaultValue: 50 }),
    singleEvents: Property.Checkbox({ displayName: 'Expand Recurring (singleEvents)', required: false, defaultValue: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.list({
      calendarId: propsValue.calendarId ?? 'primary',
      timeMin: propsValue.timeMin ? new Date(propsValue.timeMin).toISOString() : undefined,
      timeMax: propsValue.timeMax ? new Date(propsValue.timeMax).toISOString() : undefined,
      q: propsValue.q,
      maxResults: propsValue.maxResults ?? 50,
      singleEvents: propsValue.singleEvents ?? true,
      orderBy: propsValue.singleEvents !== false ? 'startTime' : undefined,
    });
    return res.data;
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from '../atomic/agent-common';

export const scheduleMeeting = createAction({
  auth: googleCalendarAuth,
  name: 'schedule_meeting_composite',
  displayName: 'Schedule Meeting',
  description:
    'Composite: find a free slot in a window, then create an event with attendees and reminders.',
  llmDescription:
    "Canvas-facing composite. Chains atomic Calendar API calls: freebusy.query → events.insert (with start/end inside a free slot) → events.patch (set reminders override). Returns the new event.",
  audience: 'canvas',
  idempotent: false,
  sampleData: { id: 'ev-1', summary: 'Sync', start: { dateTime: '2026-05-23T15:00:00Z' } },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    title: Property.ShortText({ displayName: 'Title', required: true }),
    durationMinutes: Property.Number({ displayName: 'Duration (minutes)', required: true, defaultValue: 30 }),
    windowStart: Property.DateTime({ displayName: 'Search Window Start', required: true }),
    windowEnd: Property.DateTime({ displayName: 'Search Window End', required: true }),
    attendeeEmails: Property.Array({ displayName: 'Attendee Emails', required: false }),
    reminderMinutes: Property.Number({ displayName: 'Popup Reminder (min before)', required: false, defaultValue: 10 }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const busy = await cal.freebusy.query({
      requestBody: {
        timeMin: new Date(propsValue.windowStart).toISOString(),
        timeMax: new Date(propsValue.windowEnd).toISOString(),
        items: [{ id: propsValue.calendarId ?? 'primary' }],
      },
    });
    const busyIntervals = (busy.data.calendars?.[propsValue.calendarId ?? 'primary']?.busy ?? []).map(
      (b) => ({ start: new Date(b.start ?? '').getTime(), end: new Date(b.end ?? '').getTime() }),
    );
    const durationMs = propsValue.durationMinutes * 60_000;

    let cursor = new Date(propsValue.windowStart).getTime();
    const windowEnd = new Date(propsValue.windowEnd).getTime();
    for (const interval of busyIntervals.sort((a, b) => a.start - b.start)) {
      if (cursor + durationMs <= interval.start) break;
      cursor = Math.max(cursor, interval.end);
    }
    if (cursor + durationMs > windowEnd) throw new Error('No free slot found in window.');

    const startISO = new Date(cursor).toISOString();
    const endISO = new Date(cursor + durationMs).toISOString();

    const created = await cal.events.insert({
      calendarId: propsValue.calendarId ?? 'primary',
      sendUpdates: 'all',
      requestBody: {
        summary: propsValue.title,
        start: { dateTime: startISO },
        end: { dateTime: endISO },
        attendees: ((propsValue.attendeeEmails as string[]) ?? []).map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: propsValue.reminderMinutes ?? 10 }],
        },
      },
    });
    return created.data;
  },
});

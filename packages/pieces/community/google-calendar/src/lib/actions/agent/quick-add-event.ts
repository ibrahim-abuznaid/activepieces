import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const quickAddEvent = createAction({
  auth: googleCalendarAuth,
  name: 'quick_add_event',
  displayName: 'Quick Add Event',
  description: 'Create an event from natural-language text (Google parses time + title).',
  llmDescription:
    "events.quickAdd — Google parses a sentence like 'Coffee with Alice tomorrow 9am' into an event on the calendar. Useful when the agent has a single natural-language string and doesn't want to construct the full Event resource.",
  audience: 'agent',
  idempotent: false,
  sampleData: { id: 'ev-2', summary: 'Coffee with Alice', start: { dateTime: '2026-05-23T09:00:00Z' } },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    text: Property.ShortText({ displayName: 'Natural-language Event', required: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.quickAdd({
      calendarId: propsValue.calendarId ?? 'primary',
      text: propsValue.text,
    });
    return res.data;
  },
});

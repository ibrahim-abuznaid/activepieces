import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const setEventReminders = createAction({
  auth: googleCalendarAuth,
  name: 'set_event_reminders',
  displayName: 'Set Event Reminders',
  description: 'Override reminders on an event (popup / email at N minutes before).',
  llmDescription:
    "events.patch with body { reminders: { useDefault: false, overrides: [{method,minutes},...] } }. method = 'popup' | 'email'. Pass empty overrides + useDefault=true to clear and revert to calendar default. Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }] } },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    method: Property.StaticDropdown({
      displayName: 'Method',
      required: true,
      defaultValue: 'popup',
      options: {
        disabled: false,
        options: [
          { label: 'Popup', value: 'popup' },
          { label: 'Email', value: 'email' },
        ],
      },
    }),
    minutesBefore: Property.Number({ displayName: 'Minutes Before', required: true, defaultValue: 10 }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      requestBody: {
        reminders: {
          useDefault: false,
          overrides: [{ method: propsValue.method ?? 'popup', minutes: propsValue.minutesBefore ?? 10 }],
        },
      },
    });
    return res.data;
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const setEventVisibility = createAction({
  auth: googleCalendarAuth,
  name: 'set_event_visibility',
  displayName: 'Set Event Visibility',
  description: 'Set event visibility (default / public / private / confidential).',
  llmDescription:
    'events.patch with body { visibility }. Controls whether attendees outside the calendar can see event details. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', visibility: 'private' },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    visibility: Property.StaticDropdown({
      displayName: 'Visibility',
      required: true,
      options: {
        disabled: false,
        options: ['default', 'public', 'private', 'confidential'].map((v) => ({ label: v, value: v })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      requestBody: { visibility: propsValue.visibility },
    });
    return res.data;
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const setEventColor = createAction({
  auth: googleCalendarAuth,
  name: 'set_event_color',
  displayName: 'Set Event Color',
  description: 'Set the colour of an event.',
  llmDescription:
    "events.patch with body { colorId }. colorId is 1..11 (see list_colors action for the palette). Idempotent.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', colorId: '7' },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    colorId: Property.ShortText({ displayName: 'Color ID (1-11)', required: true }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      requestBody: { colorId: propsValue.colorId },
    });
    return res.data;
  },
});

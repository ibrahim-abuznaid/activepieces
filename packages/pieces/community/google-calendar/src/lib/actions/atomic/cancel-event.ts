import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const cancelEvent = createAction({
  auth: googleCalendarAuth,
  name: 'cancel_event',
  displayName: 'Cancel Event',
  description: 'Set an event status to cancelled (keeps record, notifies attendees).',
  llmDescription:
    "events.patch with body { status: 'cancelled' }. Unlike delete, the event remains in the calendar (as a cancelled entry). Attendees see the cancellation if sendUpdates is set.",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', status: 'cancelled' },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    sendUpdates: Property.StaticDropdown({
      displayName: 'Send Updates',
      required: false,
      defaultValue: 'all',
      options: {
        disabled: false,
        options: [
          { label: 'All Attendees', value: 'all' },
          { label: 'External Only', value: 'externalOnly' },
          { label: 'None', value: 'none' },
        ],
      },
    }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      sendUpdates: propsValue.sendUpdates ?? 'all',
      requestBody: { status: 'cancelled' },
    });
    return res.data;
  },
});

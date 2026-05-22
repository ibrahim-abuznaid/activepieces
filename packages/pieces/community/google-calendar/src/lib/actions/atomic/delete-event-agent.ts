import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const deleteEventAgent = createAction({
  auth: googleCalendarAuth,
  name: 'delete_event_agent',
  displayName: 'Delete Event (Agent)',
  description: 'Delete an event by id.',
  llmDescription:
    'events.delete — permanently remove the event from the calendar (no Trash). Destructive — confirm before calling.',
  audience: 'agent',
  idempotent: true,
  sampleData: { eventId: 'ev-1', deleted: true },
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
    await cal.events.delete({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      sendUpdates: propsValue.sendUpdates ?? 'all',
    });
    return { eventId: propsValue.eventId, deleted: true };
  },
});

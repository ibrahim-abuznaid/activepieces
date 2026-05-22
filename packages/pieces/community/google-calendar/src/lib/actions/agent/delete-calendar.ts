import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const deleteCalendar = createAction({
  auth: googleCalendarAuth,
  name: 'delete_calendar',
  displayName: 'Delete Calendar',
  description: 'Delete a secondary calendar.',
  llmDescription:
    'calendars.delete — permanently delete a secondary calendar (cannot delete primary). Destructive — confirm with the user.',
  audience: 'agent',
  idempotent: true,
  sampleData: { calendarId: 'abc@group.calendar.google.com', deleted: true },
  props: { calendarId: Property.ShortText({ displayName: 'Calendar ID', required: true }) },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    await cal.calendars.delete({ calendarId: propsValue.calendarId });
    return { calendarId: propsValue.calendarId, deleted: true };
  },
});

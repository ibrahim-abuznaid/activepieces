import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const createCalendar = createAction({
  auth: googleCalendarAuth,
  name: 'create_calendar',
  displayName: 'Create Calendar',
  description: 'Create a new secondary calendar.',
  llmDescription:
    'calendars.insert — create a new calendar with summary (+ optional description, timeZone). Returns the calendar id. Not idempotent.',
  audience: 'agent',
  idempotent: false,
  sampleData: { id: 'abc@group.calendar.google.com', summary: 'Project X', timeZone: 'UTC' },
  props: {
    summary: Property.ShortText({ displayName: 'Calendar Name', required: true }),
    description: Property.LongText({ displayName: 'Description', required: false }),
    timeZone: Property.ShortText({ displayName: 'Time Zone (IANA)', required: false }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.calendars.insert({
      requestBody: {
        summary: propsValue.summary,
        description: propsValue.description,
        timeZone: propsValue.timeZone,
      },
    });
    return res.data;
  },
});

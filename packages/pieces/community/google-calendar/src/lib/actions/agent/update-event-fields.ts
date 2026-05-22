import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const updateEventFields = createAction({
  auth: googleCalendarAuth,
  name: 'update_event_fields',
  displayName: 'Update Event Fields',
  description: 'Update summary / description / location on an event.',
  llmDescription:
    'events.patch — partially update title (summary), description, or location. Pass only the fields to change. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', summary: 'New title' },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    summary: Property.ShortText({ displayName: 'Title', required: false }),
    description: Property.LongText({ displayName: 'Description', required: false }),
    location: Property.ShortText({ displayName: 'Location', required: false }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const body: Record<string, string> = {};
    if (propsValue.summary !== undefined) body['summary'] = propsValue.summary;
    if (propsValue.description !== undefined) body['description'] = propsValue.description;
    if (propsValue.location !== undefined) body['location'] = propsValue.location;
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      requestBody: body,
    });
    return res.data;
  },
});

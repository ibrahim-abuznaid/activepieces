import { createAction, Property } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

const RESPONSES = ['accepted', 'declined', 'tentative', 'needsAction'] as const;

export const respondToInvite = createAction({
  auth: googleCalendarAuth,
  name: 'respond_to_invite',
  displayName: 'Respond To Invite',
  description: "RSVP to an event as the authenticated user.",
  llmDescription:
    "events.patch — locate the attendee entry matching myEmail and set responseStatus to accepted|declined|tentative|needsAction. Requires myEmail (use list_calendars primary id as a proxy or pass explicitly).",
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'ev-1', attendees: [{ email: 'me@example.com', responseStatus: 'accepted' }] },
  props: {
    calendarId: Property.ShortText({ displayName: 'Calendar ID', required: false, defaultValue: 'primary' }),
    eventId: Property.ShortText({ displayName: 'Event ID', required: true }),
    myEmail: Property.ShortText({ displayName: 'My Email', required: true }),
    response: Property.StaticDropdown({
      displayName: 'Response',
      required: true,
      options: { disabled: false, options: RESPONSES.map((v) => ({ label: v, value: v })) },
    }),
  },
  async run({ auth, propsValue }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const ev = await cal.events.get({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
    });
    const attendees = (ev.data.attendees ?? []).map((a) =>
      a.email?.toLowerCase() === propsValue.myEmail.toLowerCase()
        ? { ...a, responseStatus: propsValue.response }
        : a,
    );
    const res = await cal.events.patch({
      calendarId: propsValue.calendarId ?? 'primary',
      eventId: propsValue.eventId,
      sendUpdates: 'all',
      requestBody: { attendees },
    });
    return res.data;
  },
});

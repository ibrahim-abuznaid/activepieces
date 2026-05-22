import { createCustomApiCallAction } from '@activepieces/pieces-common';
import {
  createPiece,
} from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createEvent } from './lib/actions/create-event';
import { createQuickCalendarEvent } from './lib/actions/create-quick-event';
import { deleteEventAction } from './lib/actions/delete-event.action';
import { getEvents } from './lib/actions/get-events';
import { updateEventAction } from './lib/actions/update-event.action';
import { googleCalendarCommon, googleCalendarAuth, getAccessToken, type GoogleCalendarAuthValue } from './lib/common';
import { calendarEventChanged } from './lib/triggers/calendar-event';
import { addAttendeesToEventAction } from './lib/actions/add-attendees.action';
import { findFreeBusy } from './lib/actions/find-busy-free-periods';
import { getEventById } from './lib/actions/get-event-by-id';
import { newEvent } from './lib/triggers/new-event';
import { eventEnds } from './lib/triggers/event-ends';
import { eventStartTimeBefore } from './lib/triggers/event-start-time-before';
import { newEventMatchingSearch } from './lib/triggers/new-event-matching-search';
import { eventCancelled } from './lib/triggers/event-cancelled';
import { newCalendar } from './lib/triggers/new-calendar';

import { listEvents } from './lib/actions/agent/list-events';
import { getEvent } from './lib/actions/agent/get-event';
import { listCalendars } from './lib/actions/agent/list-calendars';
import { quickAddEvent } from './lib/actions/agent/quick-add-event';
import { deleteEventAgent } from './lib/actions/agent/delete-event-agent';
import { cancelEvent } from './lib/actions/agent/cancel-event';
import { respondToInvite } from './lib/actions/agent/respond-to-invite';
import { setEventColor } from './lib/actions/agent/set-event-color';
import { updateEventTime } from './lib/actions/agent/update-event-time';
import { moveEvent } from './lib/actions/agent/move-event';
import { updateEventFields } from './lib/actions/agent/update-event-fields';
import { setEventVisibility } from './lib/actions/agent/set-event-visibility';
import { setEventReminders } from './lib/actions/agent/set-event-reminders';
import { getEventHtmlLink } from './lib/actions/agent/get-event-html-link';
import { listColors } from './lib/actions/agent/list-colors';
import { findFreeSlots } from './lib/actions/agent/find-free-slots';
import { listEventInstances } from './lib/actions/agent/list-event-instances';
import { removeAttendee } from './lib/actions/agent/remove-attendee';
import { listAttendees } from './lib/actions/agent/list-attendees';
import { createCalendar } from './lib/actions/agent/create-calendar';
import { deleteCalendar } from './lib/actions/agent/delete-calendar';
import { addAttendeeSimple } from './lib/actions/agent/add-attendee-simple';

export { googleCalendarAuth, getAccessToken, GoogleCalendarAuthValue, createGoogleClient } from './lib/common';

export const googleCalendar = createPiece({
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/google-calendar.png',
  categories: [PieceCategory.PRODUCTIVITY],
  displayName: 'Google Calendar',
  description: 'Get organized and stay on schedule',

  authors: [
    'OsamaHaikal',
    'bibhuty-did-this',
    'Vitalini',
    'pfernandez98',
    'kishanprmr',
    'MoShizzle',
    'khaledmashaly',
    'abuaboud',
    'ikus060',
    'Cloudieunnie',
    'sanket-a11y',
    'geekyme'
  ],
  auth: googleCalendarAuth,
  actions: [
    addAttendeesToEventAction,
    createQuickCalendarEvent,
    createEvent,
    getEvents,
    updateEventAction,
    deleteEventAction,
    findFreeBusy,
    getEventById,
    // TODO: add action after calendarList scope is verified
    // addCalendarToCalendarlist,
    createCustomApiCallAction({
      auth: googleCalendarAuth,
      baseUrl() {
        return googleCalendarCommon.baseUrl;
      },
      authMapping: async (auth) => {
        return {
          Authorization: `Bearer ${await getAccessToken(auth as GoogleCalendarAuthValue)}`,
        };
      },
    }),
    listEvents,
    getEvent,
    listCalendars,
    quickAddEvent,
    deleteEventAgent,
    cancelEvent,
    respondToInvite,
    setEventColor,
    updateEventTime,
    moveEvent,
    updateEventFields,
    setEventVisibility,
    setEventReminders,
    getEventHtmlLink,
    listColors,
    findFreeSlots,
    listEventInstances,
    removeAttendee,
    listAttendees,
    createCalendar,
    deleteCalendar,
    addAttendeeSimple,
  ],
  triggers: [calendarEventChanged,
    newEvent,
    eventEnds,
    eventStartTimeBefore,
    newEventMatchingSearch,
    eventCancelled,
    newCalendar
  ],
});

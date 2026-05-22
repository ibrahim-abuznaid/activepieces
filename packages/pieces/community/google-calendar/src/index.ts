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

import { listEvents } from './lib/actions/atomic/list-events';
import { getEvent } from './lib/actions/atomic/get-event';
import { listCalendars } from './lib/actions/atomic/list-calendars';
import { quickAddEvent } from './lib/actions/atomic/quick-add-event';
import { deleteEventAgent } from './lib/actions/atomic/delete-event-agent';
import { cancelEvent } from './lib/actions/atomic/cancel-event';
import { respondToInvite } from './lib/actions/atomic/respond-to-invite';
import { setEventColor } from './lib/actions/atomic/set-event-color';
import { updateEventTime } from './lib/actions/atomic/update-event-time';
import { moveEvent } from './lib/actions/atomic/move-event';
import { updateEventFields } from './lib/actions/atomic/update-event-fields';
import { setEventVisibility } from './lib/actions/atomic/set-event-visibility';
import { setEventReminders } from './lib/actions/atomic/set-event-reminders';
import { getEventHtmlLink } from './lib/actions/atomic/get-event-html-link';
import { listColors } from './lib/actions/atomic/list-colors';
import { findFreeSlots } from './lib/actions/atomic/find-free-slots';
import { listEventInstances } from './lib/actions/atomic/list-event-instances';
import { removeAttendee } from './lib/actions/atomic/remove-attendee';
import { listAttendees } from './lib/actions/atomic/list-attendees';
import { createCalendar } from './lib/actions/atomic/create-calendar';
import { deleteCalendar } from './lib/actions/atomic/delete-calendar';
import { addAttendeeSimple } from './lib/actions/atomic/add-attendee-simple';
import { scheduleMeeting } from './lib/actions/composite/schedule-meeting';

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
    scheduleMeeting,
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

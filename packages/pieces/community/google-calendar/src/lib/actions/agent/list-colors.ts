import { createAction } from '@activepieces/pieces-framework';
import { googleCalendarAuth } from '../../auth';
import { calendarAgentCommon } from './agent-common';

export const listColors = createAction({
  auth: googleCalendarAuth,
  name: 'list_event_colors',
  displayName: 'List Event Colors',
  description: 'List the colorId palette available for events and calendars.',
  llmDescription:
    'colors.get — returns the {calendar, event} palette with hex codes keyed by colorId. Use to translate UI-friendly color names to ids before set_event_color. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { event: { '1': { background: '#a4bdfc', foreground: '#1d1d1d' } } },
  props: {},
  async run({ auth }) {
    const cal = await calendarAgentCommon.calendarClient(auth);
    const res = await cal.colors.get({});
    return res.data;
  },
});

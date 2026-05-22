import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const listTasksInList = createAction({
  auth: clickupAuth,
  name: 'list_tasks_in_list',
  displayName: 'List Tasks In List',
  description: 'List tasks in a ClickUp list with optional filters.',
  llmDescription:
    'GET /list/{list_id}/task — list tasks in a list. Supports filters: archived, includeClosed, page, orderBy (id|created|updated|due_date|status), reverse. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { tasks: [{ id: 'abc', name: 'Task 1', status: { status: 'open' } }] },
  props: {
    listId: Property.ShortText({ displayName: 'List ID', required: true }),
    includeClosed: Property.Checkbox({ displayName: 'Include Closed', required: false, defaultValue: false }),
    archived: Property.Checkbox({ displayName: 'Include Archived', required: false, defaultValue: false }),
    page: Property.Number({ displayName: 'Page (0-indexed)', required: false, defaultValue: 0 }),
    orderBy: Property.StaticDropdown({
      displayName: 'Order By',
      required: false,
      defaultValue: 'created',
      options: {
        disabled: false,
        options: ['id', 'created', 'updated', 'due_date', 'status'].map((v) => ({ label: v, value: v })),
      },
    }),
    reverse: Property.Checkbox({ displayName: 'Reverse Order', required: false, defaultValue: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.GET,
      `list/${propsValue.listId}/task`,
      getAccessTokenOrThrow(auth),
      undefined,
      {
        archived: propsValue.archived ?? false,
        include_closed: propsValue.includeClosed ?? false,
        page: propsValue.page ?? 0,
        order_by: propsValue.orderBy ?? 'created',
        reverse: propsValue.reverse ?? true,
      },
    );
    return res.body;
  },
});

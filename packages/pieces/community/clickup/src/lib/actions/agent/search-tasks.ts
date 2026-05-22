import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const searchTasks = createAction({
  auth: clickupAuth,
  name: 'search_tasks',
  displayName: 'Search Tasks',
  description: 'Search ClickUp tasks across a workspace.',
  llmDescription:
    "GET /team/{workspace_id}/task with query filters. Supports: includeClosed, page, statuses[], assignees[], tags[], dueDateGt, dueDateLt, plus free-text via the name URL param (not the API's native fulltext — exact-name match). Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { tasks: [{ id: 'abc', name: 'matching task' }] },
  props: {
    workspaceId: Property.ShortText({ displayName: 'Workspace ID', required: true }),
    nameContains: Property.ShortText({ displayName: 'Name Contains', required: false }),
    statuses: Property.Array({ displayName: 'Statuses', required: false }),
    includeClosed: Property.Checkbox({ displayName: 'Include Closed', required: false, defaultValue: false }),
    dueDateGt: Property.DateTime({ displayName: 'Due After (ISO)', required: false }),
    dueDateLt: Property.DateTime({ displayName: 'Due Before (ISO)', required: false }),
  },
  async run({ auth, propsValue }) {
    const queryParams: Record<string, unknown> = {
      include_closed: propsValue.includeClosed ?? false,
    };
    if (propsValue.nameContains) queryParams['name'] = propsValue.nameContains;
    if (propsValue.statuses && propsValue.statuses.length > 0) {
      queryParams['statuses[]'] = propsValue.statuses;
    }
    if (propsValue.dueDateGt) queryParams['due_date_gt'] = new Date(propsValue.dueDateGt).getTime();
    if (propsValue.dueDateLt) queryParams['due_date_lt'] = new Date(propsValue.dueDateLt).getTime();
    const res = await callClickUpApi(
      HttpMethod.GET,
      `team/${propsValue.workspaceId}/task`,
      getAccessTokenOrThrow(auth),
      undefined,
      queryParams,
    );
    return res.body;
  },
});

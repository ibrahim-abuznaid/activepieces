import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const listMyTasks = createAction({
  auth: clickupAuth,
  name: 'list_tasks_assigned_to_me',
  displayName: 'List Tasks Assigned To Me',
  description: 'List ClickUp tasks assigned to the authenticated user.',
  llmDescription:
    "GET /team/{workspace_id}/task filtered by the current user's id. Looks up the current user via /user then queries with assignees[]={userId}. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { tasks: [{ id: 'abc', name: 'My task' }] },
  props: {
    workspaceId: Property.ShortText({ displayName: 'Workspace ID', required: true }),
    includeClosed: Property.Checkbox({ displayName: 'Include Closed', required: false, defaultValue: false }),
  },
  async run({ auth, propsValue }) {
    const me = await callClickUpApi<{ user?: { id: number } }>(
      HttpMethod.GET,
      'user',
      getAccessTokenOrThrow(auth),
      undefined,
    );
    const userId = me.body.user?.id;
    if (!userId) throw new Error('Could not determine current user.');
    const res = await callClickUpApi(
      HttpMethod.GET,
      `team/${propsValue.workspaceId}/task`,
      getAccessTokenOrThrow(auth),
      undefined,
      {
        'assignees[]': userId,
        include_closed: propsValue.includeClosed ?? false,
      },
    );
    return res.body;
  },
});

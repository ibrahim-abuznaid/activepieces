import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const unassignTask = createAction({
  auth: clickupAuth,
  name: 'unassign_task',
  displayName: 'Unassign Task',
  description: 'Remove one or more users from a ClickUp task.',
  llmDescription:
    'PUT /task/{task_id} with body { assignees: { rem: [userIds] } }. Idempotent — removing a not-assigned user is a no-op.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'abc', assignees: [] },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    userIds: Property.Array({ displayName: 'User IDs to Remove', required: true }),
  },
  async run({ auth, propsValue }) {
    const ids = (propsValue.userIds ?? []).map((v) => Number(v)).filter((n) => !Number.isNaN(n));
    const res = await callClickUpApi(
      HttpMethod.PUT,
      `task/${propsValue.taskId}`,
      getAccessTokenOrThrow(auth),
      { assignees: { rem: ids } },
    );
    return res.body;
  },
});

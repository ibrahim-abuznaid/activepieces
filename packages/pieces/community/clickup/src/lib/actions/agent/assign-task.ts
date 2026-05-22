import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const assignTask = createAction({
  auth: clickupAuth,
  name: 'assign_task',
  displayName: 'Assign Task',
  description: 'Assign one or more users to a ClickUp task.',
  llmDescription:
    'PUT /task/{task_id} with body { assignees: { add: [userIds] } }. Use unassign_task to remove. Idempotent — adding an already-assigned user is a no-op.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'abc', assignees: [{ id: 1, username: 'alice' }] },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    userIds: Property.Array({ displayName: 'User IDs to Add', required: true }),
  },
  async run({ auth, propsValue }) {
    const ids = (propsValue.userIds ?? []).map((v) => Number(v)).filter((n) => !Number.isNaN(n));
    const res = await callClickUpApi(
      HttpMethod.PUT,
      `task/${propsValue.taskId}`,
      getAccessTokenOrThrow(auth),
      { assignees: { add: ids } },
    );
    return res.body;
  },
});

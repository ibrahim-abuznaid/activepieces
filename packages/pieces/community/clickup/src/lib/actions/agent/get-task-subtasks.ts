import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const getTaskSubtasks = createAction({
  auth: clickupAuth,
  name: 'get_task_subtasks',
  displayName: 'Get Task Subtasks',
  description: 'Return the subtasks of a ClickUp task.',
  llmDescription:
    'GET /task/{task_id}?include_subtasks=true — fetch the task and return only the subtasks[] field. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { subtasks: [{ id: 'sub-1', name: 'Subtask 1' }] },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi<{ subtasks?: unknown[] }>(
      HttpMethod.GET,
      `task/${propsValue.taskId}`,
      getAccessTokenOrThrow(auth),
      undefined,
      { include_subtasks: true },
    );
    return { subtasks: res.body.subtasks ?? [] };
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const setTaskStatus = createAction({
  auth: clickupAuth,
  name: 'set_task_status',
  displayName: 'Set Task Status',
  description: 'Change the status of a ClickUp task.',
  llmDescription:
    'PUT /task/{task_id} with body { status }. Available statuses come from the task list; list them first via list_tasks_in_list and inspect status.status_id or status.status.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'abc', status: { status: 'in progress' } },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    status: Property.ShortText({ displayName: 'Status Name', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.PUT,
      `task/${propsValue.taskId}`,
      getAccessTokenOrThrow(auth),
      { status: propsValue.status },
    );
    return res.body;
  },
});

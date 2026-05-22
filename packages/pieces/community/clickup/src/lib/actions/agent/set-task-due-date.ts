import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const setTaskDueDate = createAction({
  auth: clickupAuth,
  name: 'set_task_due_date',
  displayName: 'Set Task Due Date',
  description: 'Set the due date of a ClickUp task.',
  llmDescription:
    'PUT /task/{task_id} with body { due_date, due_date_time }. due_date is an epoch millisecond. due_date_time=true keeps the time component.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'abc', due_date: '1764979200000' },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    dueDate: Property.DateTime({ displayName: 'Due Date (ISO)', required: true }),
    includeTime: Property.Checkbox({ displayName: 'Include Time', required: false, defaultValue: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.PUT,
      `task/${propsValue.taskId}`,
      getAccessTokenOrThrow(auth),
      {
        due_date: new Date(propsValue.dueDate).getTime(),
        due_date_time: propsValue.includeTime ?? true,
      },
    );
    return res.body;
  },
});

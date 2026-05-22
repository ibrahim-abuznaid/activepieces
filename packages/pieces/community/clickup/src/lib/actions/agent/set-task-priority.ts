import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const setTaskPriority = createAction({
  auth: clickupAuth,
  name: 'set_task_priority',
  displayName: 'Set Task Priority',
  description: 'Set priority on a ClickUp task (1=Urgent .. 4=Low, null=none).',
  llmDescription:
    'PUT /task/{task_id} with body { priority }. priority is integer: 1=Urgent, 2=High, 3=Normal, 4=Low. Pass null to clear.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'abc', priority: { id: '2', priority: 'high' } },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    priority: Property.StaticDropdown({
      displayName: 'Priority',
      required: true,
      options: {
        disabled: false,
        options: [
          { label: 'Urgent', value: 1 },
          { label: 'High', value: 2 },
          { label: 'Normal', value: 3 },
          { label: 'Low', value: 4 },
          { label: 'None', value: 0 },
        ],
      },
    }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.PUT,
      `task/${propsValue.taskId}`,
      getAccessTokenOrThrow(auth),
      { priority: propsValue.priority === 0 ? null : propsValue.priority },
    );
    return res.body;
  },
});

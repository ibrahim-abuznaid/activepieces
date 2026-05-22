import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const moveTask = createAction({
  auth: clickupAuth,
  name: 'move_task_to_list',
  displayName: 'Move Task To List',
  description: 'Move a ClickUp task to a different list.',
  llmDescription:
    'POST /list/{list_id}/task/{task_id} — move (or "add to additional list" if available on plan) the task into the target list. Returns the task in its new location.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'abc', list: { id: 'list-2' } },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    targetListId: Property.ShortText({ displayName: 'Target List ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.POST,
      `list/${propsValue.targetListId}/task/${propsValue.taskId}`,
      getAccessTokenOrThrow(auth),
      {},
    );
    return res.body;
  },
});

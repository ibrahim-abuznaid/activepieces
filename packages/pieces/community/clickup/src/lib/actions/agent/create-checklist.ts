import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const createChecklist = createAction({
  auth: clickupAuth,
  name: 'create_checklist',
  displayName: 'Create Checklist In Task',
  description: 'Create a checklist on a ClickUp task.',
  llmDescription:
    'POST /task/{task_id}/checklist with body { name }. Returns the new checklist with its id. Use add_checklist_item to populate.',
  audience: 'agent',
  idempotent: false,
  sampleData: { checklist: { id: 'cl-1', name: 'Subtasks', items: [] } },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    name: Property.ShortText({ displayName: 'Checklist Name', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.POST,
      `task/${propsValue.taskId}/checklist`,
      getAccessTokenOrThrow(auth),
      { name: propsValue.name },
    );
    return res.body;
  },
});

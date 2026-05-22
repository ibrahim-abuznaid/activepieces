import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const addTaskLink = createAction({
  auth: clickupAuth,
  name: 'add_task_link',
  displayName: 'Link Tasks',
  description: 'Create a link between two ClickUp tasks.',
  llmDescription:
    'POST /task/{task_id}/link/{links_to} — create a link from task_id to links_to. Idempotent (creating an existing link is safe).',
  audience: 'agent',
  idempotent: true,
  sampleData: { task: { id: 'abc' }, linked_to: 'def' },
  props: {
    taskId: Property.ShortText({ displayName: 'Source Task ID', required: true }),
    linksToTaskId: Property.ShortText({ displayName: 'Target Task ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.POST,
      `task/${propsValue.taskId}/link/${propsValue.linksToTaskId}`,
      getAccessTokenOrThrow(auth),
      {},
    );
    return res.body;
  },
});

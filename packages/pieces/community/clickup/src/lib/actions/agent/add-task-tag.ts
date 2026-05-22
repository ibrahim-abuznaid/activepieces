import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const addTaskTag = createAction({
  auth: clickupAuth,
  name: 'add_task_tag',
  displayName: 'Add Tag to Task',
  description: 'Add a tag to a ClickUp task.',
  llmDescription:
    'POST /task/{task_id}/tag/{tag_name} — attach a tag to a task. Idempotent (tag is added once).',
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    tagName: Property.ShortText({ displayName: 'Tag Name', required: true }),
  },
  async run({ auth, propsValue }) {
    await callClickUpApi(
      HttpMethod.POST,
      `task/${propsValue.taskId}/tag/${encodeURIComponent(propsValue.tagName)}`,
      getAccessTokenOrThrow(auth),
      {},
    );
    return { ok: true, taskId: propsValue.taskId, tag: propsValue.tagName };
  },
});

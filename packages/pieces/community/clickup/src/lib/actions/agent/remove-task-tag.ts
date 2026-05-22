import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const removeTaskTag = createAction({
  auth: clickupAuth,
  name: 'remove_task_tag',
  displayName: 'Remove Tag from Task',
  description: 'Remove a tag from a ClickUp task.',
  llmDescription:
    'DELETE /task/{task_id}/tag/{tag_name} — detach a tag from a task. Idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    tagName: Property.ShortText({ displayName: 'Tag Name', required: true }),
  },
  async run({ auth, propsValue }) {
    await callClickUpApi(
      HttpMethod.DELETE,
      `task/${propsValue.taskId}/tag/${encodeURIComponent(propsValue.tagName)}`,
      getAccessTokenOrThrow(auth),
      {},
    );
    return { ok: true, taskId: propsValue.taskId, tag: propsValue.tagName };
  },
});

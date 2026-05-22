import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const duplicateTask = createAction({
  auth: clickupAuth,
  name: 'duplicate_task',
  displayName: 'Duplicate Task',
  description: 'Duplicate a ClickUp task by copying it via the source as a template name.',
  llmDescription:
    'Approximate duplicate: GET /task/{task_id} then POST /list/{list_id}/task with the original task fields and an optional new name. Pass useNewName to override the title.',
  audience: 'agent',
  idempotent: false,
  sampleData: { id: 'newAbc', name: 'Copy of My task' },
  props: {
    taskId: Property.ShortText({ displayName: 'Source Task ID', required: true }),
    targetListId: Property.ShortText({ displayName: 'Target List ID', required: true }),
    newName: Property.ShortText({ displayName: 'New Name', required: false }),
  },
  async run({ auth, propsValue }) {
    const source = await callClickUpApi<{
      name?: string;
      description?: string;
      priority?: { id: string } | null;
      assignees?: { id: number }[];
      tags?: { name: string }[];
    }>(HttpMethod.GET, `task/${propsValue.taskId}`, getAccessTokenOrThrow(auth), undefined);
    const body = {
      name: propsValue.newName ?? `Copy of ${source.body.name ?? 'task'}`,
      description: source.body.description ?? '',
      priority: source.body.priority?.id ? Number(source.body.priority.id) : undefined,
      assignees: (source.body.assignees ?? []).map((a) => a.id),
      tags: (source.body.tags ?? []).map((t) => t.name),
    };
    const created = await callClickUpApi(
      HttpMethod.POST,
      `list/${propsValue.targetListId}/task`,
      getAccessTokenOrThrow(auth),
      body,
    );
    return created.body;
  },
});

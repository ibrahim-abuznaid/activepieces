import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const triageNewTask = createAction({
  auth: clickupAuth,
  name: 'triage_new_task',
  displayName: 'Triage New Task',
  description:
    'Composite: create a task, set priority + due date, optionally assign, and add tags in one canvas action.',
  llmDescription:
    'Canvas-facing composite. Sequences atomic ClickUp API calls: POST /list/{id}/task → PUT /task/{id} (priority+due) → POST /task/{id}/tag/{name} (each tag) → PUT /task/{id} (assignees). Returns the final task resource.',
  audience: 'canvas',
  idempotent: false,
  sampleData: { id: 'abc', name: 'New task', priority: { id: '2' } },
  props: {
    listId: Property.ShortText({ displayName: 'List ID', required: true }),
    name: Property.ShortText({ displayName: 'Task Name', required: true }),
    description: Property.LongText({ displayName: 'Description', required: false }),
    priority: Property.StaticDropdown({
      displayName: 'Priority',
      required: false,
      options: {
        disabled: false,
        options: [
          { label: 'Urgent', value: 1 },
          { label: 'High', value: 2 },
          { label: 'Normal', value: 3 },
          { label: 'Low', value: 4 },
        ],
      },
    }),
    dueDate: Property.DateTime({ displayName: 'Due Date', required: false }),
    assigneeUserIds: Property.Array({ displayName: 'Assignee User IDs', required: false }),
    tags: Property.Array({ displayName: 'Tags', required: false }),
  },
  async run({ auth, propsValue }) {
    const token = getAccessTokenOrThrow(auth);
    const created = await callClickUpApi<{ id: string }>(
      HttpMethod.POST,
      `list/${propsValue.listId}/task`,
      token,
      { name: propsValue.name, description: propsValue.description },
    );
    const taskId = created.body.id;

    const patchBody: Record<string, unknown> = {};
    if (propsValue.priority) patchBody['priority'] = propsValue.priority;
    if (propsValue.dueDate) {
      patchBody['due_date'] = new Date(propsValue.dueDate).getTime();
      patchBody['due_date_time'] = true;
    }
    if (propsValue.assigneeUserIds && (propsValue.assigneeUserIds as unknown[]).length > 0) {
      patchBody['assignees'] = {
        add: (propsValue.assigneeUserIds as unknown[]).map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
      };
    }
    if (Object.keys(patchBody).length > 0) {
      await callClickUpApi(HttpMethod.PUT, `task/${taskId}`, token, patchBody);
    }
    for (const tag of (propsValue.tags as string[] | undefined) ?? []) {
      await callClickUpApi(HttpMethod.POST, `task/${taskId}/tag/${encodeURIComponent(tag)}`, token, {});
    }

    const finalRes = await callClickUpApi(HttpMethod.GET, `task/${taskId}`, token, undefined);
    return finalRes.body;
  },
});

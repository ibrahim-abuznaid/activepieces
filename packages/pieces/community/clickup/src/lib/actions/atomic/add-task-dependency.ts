import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const addTaskDependency = createAction({
  auth: clickupAuth,
  name: 'add_task_dependency',
  displayName: 'Add Task Dependency',
  description: "Mark a task as 'waiting on' or 'blocking' another.",
  llmDescription:
    "POST /task/{task_id}/dependency — create a dependency. Pass dependsOnTaskId for 'task_id waits on dependsOnTaskId', or dependencyOfTaskId for the reverse. Provide exactly one.",
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
    dependsOnTaskId: Property.ShortText({ displayName: 'Depends On (task waits on this)', required: false }),
    dependencyOfTaskId: Property.ShortText({ displayName: 'Dependency Of (this task blocks)', required: false }),
  },
  async run({ auth, propsValue }) {
    if (!propsValue.dependsOnTaskId && !propsValue.dependencyOfTaskId) {
      throw new Error('Provide either dependsOnTaskId or dependencyOfTaskId.');
    }
    const body: Record<string, string> = {};
    if (propsValue.dependsOnTaskId) body['depends_on'] = propsValue.dependsOnTaskId;
    if (propsValue.dependencyOfTaskId) body['dependency_of'] = propsValue.dependencyOfTaskId;
    await callClickUpApi(
      HttpMethod.POST,
      `task/${propsValue.taskId}/dependency`,
      getAccessTokenOrThrow(auth),
      body,
    );
    return { ok: true };
  },
});

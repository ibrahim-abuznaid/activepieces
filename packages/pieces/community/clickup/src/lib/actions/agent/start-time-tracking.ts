import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const startTimeTracking = createAction({
  auth: clickupAuth,
  name: 'start_time_tracking',
  displayName: 'Start Time Tracking',
  description: 'Start a timer on a ClickUp task for the authenticated user.',
  llmDescription:
    'POST /team/{workspace_id}/time_entries/start with body { tid }. Begins tracking time against the task for the current user. Pair with stop_time_tracking.',
  audience: 'agent',
  idempotent: false,
  sampleData: { data: { id: 'te-1', task: { id: 'abc' }, start: 1764970000000 } },
  props: {
    workspaceId: Property.ShortText({ displayName: 'Workspace ID', required: true }),
    taskId: Property.ShortText({ displayName: 'Task ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.POST,
      `team/${propsValue.workspaceId}/time_entries/start`,
      getAccessTokenOrThrow(auth),
      { tid: propsValue.taskId },
    );
    return res.body;
  },
});

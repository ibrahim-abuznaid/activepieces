import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const stopTimeTracking = createAction({
  auth: clickupAuth,
  name: 'stop_time_tracking',
  displayName: 'Stop Time Tracking',
  description: 'Stop the running timer for the authenticated user.',
  llmDescription:
    'POST /team/{workspace_id}/time_entries/stop — stops the currently-running time entry. Returns the finalized entry.',
  audience: 'agent',
  idempotent: true,
  sampleData: { data: { id: 'te-1', end: 1764973600000, duration: 3600000 } },
  props: {
    workspaceId: Property.ShortText({ displayName: 'Workspace ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.POST,
      `team/${propsValue.workspaceId}/time_entries/stop`,
      getAccessTokenOrThrow(auth),
      {},
    );
    return res.body;
  },
});

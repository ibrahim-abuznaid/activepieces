import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const getWorkspaceMembers = createAction({
  auth: clickupAuth,
  name: 'get_workspace_members',
  displayName: 'Get Workspace Members',
  description: 'List members of a ClickUp workspace.',
  llmDescription:
    'GET /team — returns the workspace including its members[] array (each with id, username, email). Filter client-side to the workspace_id of interest. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { members: [{ user: { id: 1, username: 'alice', email: 'alice@example.com' } }] },
  props: {
    workspaceId: Property.ShortText({ displayName: 'Workspace ID', required: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi<{ teams: Array<{ id: string; members: unknown[] }> }>(
      HttpMethod.GET,
      'team',
      getAccessTokenOrThrow(auth),
      undefined,
    );
    const team = res.body.teams?.find((t) => t.id === propsValue.workspaceId);
    return { workspaceId: propsValue.workspaceId, members: team?.members ?? [] };
  },
});

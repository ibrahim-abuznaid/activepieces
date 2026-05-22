import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const listWorkspaces = createAction({
  auth: clickupAuth,
  name: 'list_workspaces',
  displayName: 'List Workspaces',
  description: 'List ClickUp workspaces (teams) the user belongs to.',
  llmDescription:
    'GET /team — list all ClickUp workspaces (teams) the authenticated user is a member of. Returns id, name, color, avatar, members. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { teams: [{ id: '123', name: 'My Workspace', members: [] }] },
  props: {},
  async run({ auth }) {
    const res = await callClickUpApi(HttpMethod.GET, 'team', getAccessTokenOrThrow(auth), undefined);
    return res.body;
  },
});

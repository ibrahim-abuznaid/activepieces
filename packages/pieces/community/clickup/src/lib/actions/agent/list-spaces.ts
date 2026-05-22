import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const listSpaces = createAction({
  auth: clickupAuth,
  name: 'list_spaces',
  displayName: 'List Spaces',
  description: 'List the spaces in a ClickUp workspace.',
  llmDescription:
    'GET /team/{workspace_id}/space — list spaces in the given workspace. Read-only. Pass archived=true to include archived spaces.',
  audience: 'agent',
  idempotent: true,
  sampleData: { spaces: [{ id: '789', name: 'Engineering', private: false }] },
  props: {
    workspaceId: Property.ShortText({ displayName: 'Workspace ID', required: true }),
    archived: Property.Checkbox({ displayName: 'Include Archived', required: false, defaultValue: false }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.GET,
      `team/${propsValue.workspaceId}/space`,
      getAccessTokenOrThrow(auth),
      undefined,
      { archived: propsValue.archived ?? false },
    );
    return res.body;
  },
});

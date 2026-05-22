import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const listFolders = createAction({
  auth: clickupAuth,
  name: 'list_folders',
  displayName: 'List Folders',
  description: 'List folders in a ClickUp space.',
  llmDescription:
    'GET /space/{space_id}/folder — list folders in a space. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { folders: [{ id: '111', name: 'Q4 Initiatives', lists: [] }] },
  props: {
    spaceId: Property.ShortText({ displayName: 'Space ID', required: true }),
    archived: Property.Checkbox({ displayName: 'Include Archived', required: false, defaultValue: false }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.GET,
      `space/${propsValue.spaceId}/folder`,
      getAccessTokenOrThrow(auth),
      undefined,
      { archived: propsValue.archived ?? false },
    );
    return res.body;
  },
});

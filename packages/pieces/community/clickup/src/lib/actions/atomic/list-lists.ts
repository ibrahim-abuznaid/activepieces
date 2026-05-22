import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const listLists = createAction({
  auth: clickupAuth,
  name: 'list_lists',
  displayName: 'List Lists',
  description: 'List lists in a folder, or folderless lists in a space.',
  llmDescription:
    'List lists. If folderId is given, calls GET /folder/{folder_id}/list (lists inside that folder). Otherwise calls GET /space/{space_id}/list (folderless lists in the space). Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { lists: [{ id: '222', name: 'Backlog', task_count: 17 }] },
  props: {
    spaceId: Property.ShortText({ displayName: 'Space ID', required: false }),
    folderId: Property.ShortText({ displayName: 'Folder ID', required: false }),
    archived: Property.Checkbox({ displayName: 'Include Archived', required: false, defaultValue: false }),
  },
  async run({ auth, propsValue }) {
    const path = propsValue.folderId
      ? `folder/${propsValue.folderId}/list`
      : `space/${propsValue.spaceId}/list`;
    if (!propsValue.folderId && !propsValue.spaceId) {
      throw new Error('Provide spaceId (for folderless lists) or folderId (for lists in a folder).');
    }
    const res = await callClickUpApi(
      HttpMethod.GET,
      path,
      getAccessTokenOrThrow(auth),
      undefined,
      { archived: propsValue.archived ?? false },
    );
    return res.body;
  },
});

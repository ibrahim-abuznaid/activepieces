import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const getUserMe = createAction({
  auth: clickupAuth,
  name: 'get_user_me',
  displayName: 'Get My User',
  description: 'Return the authenticated user.',
  llmDescription:
    'GET /user — returns the currently authenticated ClickUp user (id, username, email, color). Useful to discover the agent identity. Read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { user: { id: 1, username: 'me', email: 'me@example.com' } },
  props: {},
  async run({ auth }) {
    const res = await callClickUpApi(HttpMethod.GET, 'user', getAccessTokenOrThrow(auth), undefined);
    return res.body;
  },
});

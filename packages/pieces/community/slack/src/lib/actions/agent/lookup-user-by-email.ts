import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const lookupUserByEmail = createAction({
  auth: slackAuth,
  name: 'lookup_user_by_email_agent',
  displayName: 'Lookup User By Email (Agent)',
  description: 'Find a Slack user by email.',
  llmDescription: "users.lookupByEmail — return user id + profile. Useful to resolve an email to a user id before mentioning. Read-only.",
  audience: 'agent',
  idempotent: true,
  sampleData: { user: { id: 'U0123', name: 'alice' } },
  props: {
    email: Property.ShortText({ displayName: 'Email', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.users.lookupByEmail({ email: propsValue.email });
  },
});

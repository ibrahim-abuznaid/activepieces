import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const listPins = createAction({
  auth: slackAuth,
  name: 'list_pinned_messages',
  displayName: 'List Pinned Messages',
  description: 'List pinned messages in a Slack channel.',
  llmDescription: 'pins.list — read-only.',
  audience: 'agent',
  idempotent: true,
  sampleData: { items: [{ type: 'message', message: { ts: '1716345600.001' } }] },
  props: { channel: Property.ShortText({ displayName: 'Channel ID', required: true }) },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.pins.list({ channel: propsValue.channel });
  },
});

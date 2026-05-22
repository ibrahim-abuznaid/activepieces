import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const removeReaction = createAction({
  auth: slackAuth,
  name: 'remove_reaction',
  displayName: 'Remove Reaction',
  description: 'Remove an emoji reaction from a Slack message.',
  llmDescription: 'reactions.remove — idempotent.',
  audience: 'agent',
  idempotent: true,
  sampleData: { ok: true },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    timestamp: Property.ShortText({ displayName: 'Message TS', required: true }),
    name: Property.ShortText({ displayName: 'Emoji Name (no colons)', required: true }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    return await slack.reactions.remove({
      channel: propsValue.channel,
      timestamp: propsValue.timestamp,
      name: propsValue.name,
    });
  },
});

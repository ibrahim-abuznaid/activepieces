import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from './agent-common';

export const addReaction = createAction({
  auth: slackAuth,
  name: 'add_reaction_agent',
  displayName: 'Add Reaction',
  description: 'Add an emoji reaction to a Slack message.',
  llmDescription: "reactions.add — emoji name without colons (e.g. 'thumbsup'). Idempotent (already-reacted is no-op).",
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
    return await slack.reactions.add({
      channel: propsValue.channel,
      timestamp: propsValue.timestamp,
      name: propsValue.name,
    });
  },
});

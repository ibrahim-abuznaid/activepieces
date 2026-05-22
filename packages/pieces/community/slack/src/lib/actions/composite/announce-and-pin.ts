import { createAction, Property } from '@activepieces/pieces-framework';
import { slackAuth } from '../../auth';
import { slackAgentCommon } from '../atomic/agent-common';

export const announceAndPin = createAction({
  auth: slackAuth,
  name: 'announce_and_pin_message',
  displayName: 'Announce And Pin',
  description:
    'Composite: post a message to a channel, react with a configurable emoji, then pin it.',
  llmDescription:
    "Canvas-facing composite. Chains Slack atomic API calls: chat.postMessage → reactions.add → pins.add. Returns the new message ts + permalink.",
  audience: 'canvas',
  idempotent: false,
  sampleData: { ok: true, channel: 'C0123', ts: '1716345600.001', permalink: 'https://example.slack.com/...' },
  props: {
    channel: Property.ShortText({ displayName: 'Channel ID', required: true }),
    text: Property.LongText({ displayName: 'Announcement Text', required: true }),
    reactionEmoji: Property.ShortText({
      displayName: 'Reaction Emoji (no colons)',
      required: false,
      defaultValue: 'mega',
    }),
  },
  async run({ auth, propsValue }) {
    const slack = slackAgentCommon.slackClient(auth);
    const post = await slack.chat.postMessage({
      channel: propsValue.channel,
      text: propsValue.text,
    });
    const ts = post.ts;
    if (!ts) throw new Error('Failed to post message.');
    await slack.reactions.add({
      channel: propsValue.channel,
      timestamp: ts,
      name: propsValue.reactionEmoji ?? 'mega',
    });
    await slack.pins.add({ channel: propsValue.channel, timestamp: ts });
    const link = await slack.chat.getPermalink({
      channel: propsValue.channel,
      message_ts: ts,
    });
    return { ok: true, channel: propsValue.channel, ts, permalink: link.permalink };
  },
});

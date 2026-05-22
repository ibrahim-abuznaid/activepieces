import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from '../atomic/agent-common';

export const triageInbox = createAction({
  auth: gmailAuth,
  name: 'triage_inbox_unread',
  displayName: 'Triage Inbox',
  description:
    'Composite: find unread messages, optionally label them, then mark read or archive.',
  llmDescription:
    'Canvas-facing composite. Chains atomic Gmail API calls: messages.list (q=is:unread) → batchModify (addLabelIds=[labelId], removeLabelIds=[UNREAD/INBOX]). Returns counts.',
  audience: 'canvas',
  idempotent: false,
  sampleData: { matched: 12, modified: 12 },
  props: {
    q: Property.ShortText({
      displayName: 'Gmail Query',
      required: false,
      defaultValue: 'is:unread',
    }),
    labelId: Property.ShortText({
      displayName: 'Label ID to Add',
      required: false,
    }),
    markRead: Property.Checkbox({
      displayName: 'Mark as Read',
      required: false,
      defaultValue: true,
    }),
    archive: Property.Checkbox({
      displayName: 'Archive (remove INBOX)',
      required: false,
      defaultValue: false,
    }),
    limit: Property.Number({
      displayName: 'Max Messages',
      required: false,
      defaultValue: 25,
    }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const list = await gmail.users.messages.list({
      userId: 'me',
      q: propsValue.q ?? 'is:unread',
      maxResults: propsValue.limit ?? 25,
    });
    const ids = (list.data.messages ?? [])
      .map((m) => m.id)
      .filter((v): v is string => !!v);
    if (ids.length === 0) return { matched: 0, modified: 0 };

    const addLabelIds = propsValue.labelId ? [propsValue.labelId] : [];
    const removeLabelIds: string[] = [];
    if (propsValue.markRead) removeLabelIds.push('UNREAD');
    if (propsValue.archive) removeLabelIds.push('INBOX');

    await gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: { ids, addLabelIds, removeLabelIds },
    });
    return { matched: ids.length, modified: ids.length };
  },
});

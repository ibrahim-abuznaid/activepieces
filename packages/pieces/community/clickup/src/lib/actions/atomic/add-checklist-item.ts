import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const addChecklistItem = createAction({
  auth: clickupAuth,
  name: 'add_checklist_item',
  displayName: 'Add Checklist Item',
  description: 'Add an item to a ClickUp checklist.',
  llmDescription:
    'POST /checklist/{checklist_id}/checklist_item with body { name, assignee? }. Returns the new item with its id.',
  audience: 'agent',
  idempotent: false,
  sampleData: { checklist_item: { id: 'ci-1', name: 'Item', resolved: false } },
  props: {
    checklistId: Property.ShortText({ displayName: 'Checklist ID', required: true }),
    name: Property.ShortText({ displayName: 'Item Name', required: true }),
    assigneeUserId: Property.Number({ displayName: 'Assignee User ID', required: false }),
  },
  async run({ auth, propsValue }) {
    const body: Record<string, unknown> = { name: propsValue.name };
    if (propsValue.assigneeUserId) body['assignee'] = propsValue.assigneeUserId;
    const res = await callClickUpApi(
      HttpMethod.POST,
      `checklist/${propsValue.checklistId}/checklist_item`,
      getAccessTokenOrThrow(auth),
      body,
    );
    return res.body;
  },
});

import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod, getAccessTokenOrThrow } from '@activepieces/pieces-common';
import { clickupAuth } from '../../auth';
import { callClickUpApi } from '../../common';

export const resolveChecklistItem = createAction({
  auth: clickupAuth,
  name: 'resolve_checklist_item',
  displayName: 'Resolve Checklist Item',
  description: 'Mark a checklist item as resolved or unresolved.',
  llmDescription:
    'PUT /checklist/{checklist_id}/checklist_item/{checklist_item_id} with body { resolved }. Set resolved=true to check off.',
  audience: 'agent',
  idempotent: true,
  sampleData: { checklist_item: { id: 'ci-1', resolved: true } },
  props: {
    checklistId: Property.ShortText({ displayName: 'Checklist ID', required: true }),
    itemId: Property.ShortText({ displayName: 'Item ID', required: true }),
    resolved: Property.Checkbox({ displayName: 'Resolved', required: true, defaultValue: true }),
  },
  async run({ auth, propsValue }) {
    const res = await callClickUpApi(
      HttpMethod.PUT,
      `checklist/${propsValue.checklistId}/checklist_item/${propsValue.itemId}`,
      getAccessTokenOrThrow(auth),
      { resolved: propsValue.resolved },
    );
    return res.body;
  },
});

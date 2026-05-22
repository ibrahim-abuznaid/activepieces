import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const createLabel = createAction({
  auth: gmailAuth,
  name: 'create_label',
  displayName: 'Create Label',
  description: 'Create a Gmail label.',
  llmDescription:
    'users.labels.create — create a user-defined label. Returns the new label including its generated id. Fails if a label with the same name exists.',
  audience: 'agent',
  idempotent: false,
  sampleData: { id: 'Label_42', name: 'Followups', type: 'user' },
  props: {
    name: Property.ShortText({ displayName: 'Label Name', required: true }),
    labelListVisibility: Property.StaticDropdown({
      displayName: 'Label List Visibility',
      required: false,
      defaultValue: 'labelShow',
      options: {
        disabled: false,
        options: ['labelShow', 'labelHide', 'labelShowIfUnread'].map((v) => ({
          label: v,
          value: v,
        })),
      },
    }),
    messageListVisibility: Property.StaticDropdown({
      displayName: 'Message List Visibility',
      required: false,
      defaultValue: 'show',
      options: {
        disabled: false,
        options: ['show', 'hide'].map((v) => ({ label: v, value: v })),
      },
    }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const res = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: propsValue.name,
        labelListVisibility: propsValue.labelListVisibility ?? 'labelShow',
        messageListVisibility: propsValue.messageListVisibility ?? 'show',
      },
    });
    return res.data;
  },
});

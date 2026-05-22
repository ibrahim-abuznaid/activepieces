import { createAction, Property } from '@activepieces/pieces-framework';
import { gmailAuth } from '../../auth';
import { gmailAgentCommon } from './agent-common';

export const updateLabel = createAction({
  auth: gmailAuth,
  name: 'update_label',
  displayName: 'Update Label',
  description: 'Rename or recolor a Gmail label.',
  llmDescription:
    'users.labels.patch — partially update a label (name and/or color). Color requires background+text RGB hex.',
  audience: 'agent',
  idempotent: true,
  sampleData: { id: 'Label_42', name: 'Renamed' },
  props: {
    id: Property.ShortText({ displayName: 'Label ID', required: true }),
    newName: Property.ShortText({ displayName: 'New Name', required: false }),
    backgroundHex: Property.ShortText({
      displayName: 'Background Color (#RRGGBB)',
      required: false,
    }),
    textHex: Property.ShortText({
      displayName: 'Text Color (#RRGGBB)',
      required: false,
    }),
  },
  async run({ auth, propsValue }) {
    const gmail = await gmailAgentCommon.gmailClient(auth);
    const body: Record<string, unknown> = {};
    if (propsValue.newName) body['name'] = propsValue.newName;
    if (propsValue.backgroundHex && propsValue.textHex) {
      body['color'] = {
        backgroundColor: propsValue.backgroundHex,
        textColor: propsValue.textHex,
      };
    }
    const res = await gmail.users.labels.patch({
      userId: 'me',
      id: propsValue.id,
      requestBody: body,
    });
    return res.data;
  },
});

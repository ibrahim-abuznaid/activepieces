import { createAction, Property } from '@activepieces/pieces-framework';
import { googleDocsAuth } from '../../auth';
import { agentCommon } from './agent-common';

export const createBulletedList = createAction({
  auth: googleDocsAuth,
  name: 'create_bulleted_list',
  displayName: 'Create Bulleted List',
  description: 'Insert a list of items as a bulleted list.',
  llmDescription:
    'Insert each item as its own paragraph at the end of the document, then apply bullet formatting via batchUpdate createParagraphBullets. Use bulletPreset to control the marker style (default BULLET_DISC_CIRCLE_SQUARE).',
  audience: 'agent',
  idempotent: false,
  sampleData: { documentId: '1A2bC3', replies: [{}, {}, {}] },
  props: {
    documentId: Property.ShortText({ displayName: 'Document ID', required: true }),
    items: Property.Array({ displayName: 'List Items', required: true }),
    bulletPreset: Property.StaticDropdown({
      displayName: 'Bullet Style',
      required: false,
      defaultValue: 'BULLET_DISC_CIRCLE_SQUARE',
      options: {
        disabled: false,
        options: [
          { label: 'Disc / Circle / Square', value: 'BULLET_DISC_CIRCLE_SQUARE' },
          { label: 'Arrow / Diamond / Disc', value: 'BULLET_ARROW_DIAMOND_DISC' },
          { label: 'Checkbox', value: 'BULLET_CHECKBOX' },
          { label: 'Star / Circle / Square', value: 'BULLET_STAR_CIRCLE_SQUARE' },
        ],
      },
    }),
  },
  async run({ auth, propsValue }) {
    const docs = await agentCommon.docsClient(auth);
    const doc = await docs.documents.get({ documentId: propsValue.documentId });
    const endIndex = (doc.data.body?.content ?? []).reduce(
      (max, el) => Math.max(max, el.endIndex ?? 0),
      1,
    );
    const insertAt = Math.max(endIndex - 1, 1);
    const items = (propsValue.items ?? []).map((i) => String(i));
    const text = items.map((i) => `${i}\n`).join('');
    return await agentCommon.batchUpdate({
      auth,
      documentId: propsValue.documentId,
      requests: [
        { insertText: { location: { index: insertAt }, text } },
        {
          createParagraphBullets: {
            range: { startIndex: insertAt, endIndex: insertAt + text.length },
            bulletPreset: propsValue.bulletPreset ?? 'BULLET_DISC_CIRCLE_SQUARE',
          },
        },
      ],
    });
  },
});

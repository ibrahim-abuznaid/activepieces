import { createAction, Property } from '@activepieces/pieces-framework';
import { google, docs_v1 } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { createGoogleClient, googleDocsAuth } from '../../auth';

export const createMeetingNotesDoc = createAction({
  auth: googleDocsAuth,
  name: 'create_meeting_notes_doc',
  displayName: 'Create Meeting Notes Doc',
  description:
    'Composite: create a doc with title + heading + agenda bullets + action items, in one call.',
  llmDescription:
    'Canvas-facing composite. Sequences four atomic calls under the hood: documents.create, then batchUpdate with insertText+updateParagraphStyle (heading), insertText (paragraph), insertText+createParagraphBullets (bullets). Returns the new document.',
  audience: 'canvas',
  idempotent: false,
  sampleData: {
    documentId: '1A2bC3',
    title: 'Meeting Notes',
    url: 'https://docs.google.com/document/d/1A2bC3/edit',
  },
  props: {
    title: Property.ShortText({ displayName: 'Document Title', required: true }),
    agendaHeading: Property.ShortText({
      displayName: 'Agenda Heading',
      required: false,
      defaultValue: 'Agenda',
    }),
    agendaItems: Property.Array({ displayName: 'Agenda Items', required: false }),
    actionsHeading: Property.ShortText({
      displayName: 'Action Items Heading',
      required: false,
      defaultValue: 'Action Items',
    }),
    actionItems: Property.Array({ displayName: 'Action Items', required: false }),
  },
  async run({ auth, propsValue }) {
    const authClient: OAuth2Client = await createGoogleClient(auth);
    const docs = google.docs({ version: 'v1', auth: authClient });

    const created = await docs.documents.create({ requestBody: { title: propsValue.title } });
    const documentId = created.data.documentId;
    if (!documentId) throw new Error('Failed to create document');

    const agendaItems = ((propsValue.agendaItems ?? []) as string[]).map(String).filter(Boolean);
    const actionItems = ((propsValue.actionItems ?? []) as string[]).map(String).filter(Boolean);
    const agendaHeading = propsValue.agendaHeading ?? 'Agenda';
    const actionsHeading = propsValue.actionsHeading ?? 'Action Items';

    let cursor = 1;
    const requests: docs_v1.Schema$Request[] = [];

    const insertHeading = (text: string) => {
      const start = cursor;
      requests.push({ insertText: { location: { index: cursor }, text: `${text}\n` } });
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: start, endIndex: start + text.length + 1 },
          paragraphStyle: { namedStyleType: 'HEADING_2' },
          fields: 'namedStyleType',
        },
      });
      cursor += text.length + 1;
    };

    const insertBullets = (items: string[]) => {
      if (items.length === 0) return;
      const start = cursor;
      const text = items.map((i) => `${i}\n`).join('');
      requests.push({ insertText: { location: { index: cursor }, text } });
      requests.push({
        createParagraphBullets: {
          range: { startIndex: start, endIndex: start + text.length },
          bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
        },
      });
      cursor += text.length;
    };

    insertHeading(agendaHeading);
    insertBullets(agendaItems);
    insertHeading(actionsHeading);
    insertBullets(actionItems);

    if (requests.length > 0) {
      await docs.documents.batchUpdate({ documentId, requestBody: { requests } });
    }

    return {
      documentId,
      title: propsValue.title,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  },
});

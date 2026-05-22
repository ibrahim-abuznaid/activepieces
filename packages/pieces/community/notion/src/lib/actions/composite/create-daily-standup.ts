import { createAction, Property } from '@activepieces/pieces-framework';
import { notionAuth } from '../../auth';
import { notionAgentCommon } from '../atomic/agent-common';

export const createDailyStandup = createAction({
  auth: notionAuth,
  name: 'create_daily_standup_page',
  displayName: 'Create Daily Standup Page',
  description:
    'Composite: create a child page with a heading, agenda bullets, and a to-do checklist in one canvas action.',
  llmDescription:
    "Canvas-facing composite. Sequences atomic Notion API calls: pages.create (child page with title) → blocks.children.append (heading_2, bulleted_list_items, to_do blocks).",
  audience: 'canvas',
  idempotent: false,
  sampleData: { id: 'page-new', url: 'https://notion.so/...' },
  props: {
    parentPageId: Property.ShortText({ displayName: 'Parent Page ID', required: true }),
    title: Property.ShortText({ displayName: 'Title', required: true }),
    agendaHeading: Property.ShortText({
      displayName: 'Agenda Heading',
      required: false,
      defaultValue: "Yesterday's wins",
    }),
    agenda: Property.Array({ displayName: 'Agenda Items (bullets)', required: false }),
    todoHeading: Property.ShortText({
      displayName: 'To-do Heading',
      required: false,
      defaultValue: 'Today',
    }),
    todos: Property.Array({ displayName: 'To-do Items', required: false }),
  },
  async run({ auth, propsValue }) {
    const notion = notionAgentCommon.notionClient(auth);
    const page = await notion.pages.create({
      parent: { type: 'page_id', page_id: propsValue.parentPageId },
      properties: {
        title: { type: 'title', title: notionAgentCommon.richText(propsValue.title) },
      },
    });
    const children = [
      {
        object: 'block' as const,
        type: 'heading_2' as const,
        heading_2: { rich_text: notionAgentCommon.richText(propsValue.agendaHeading ?? "Yesterday's wins") },
      },
      ...((propsValue.agenda as string[]) ?? []).map((t) => ({
        object: 'block' as const,
        type: 'bulleted_list_item' as const,
        bulleted_list_item: { rich_text: notionAgentCommon.richText(String(t)) },
      })),
      {
        object: 'block' as const,
        type: 'heading_2' as const,
        heading_2: { rich_text: notionAgentCommon.richText(propsValue.todoHeading ?? 'Today') },
      },
      ...((propsValue.todos as string[]) ?? []).map((t) => ({
        object: 'block' as const,
        type: 'to_do' as const,
        to_do: { rich_text: notionAgentCommon.richText(String(t)), checked: false },
      })),
    ];
    if ('id' in page) {
      await notion.blocks.children.append({ block_id: page.id, children });
    }
    return page;
  },
});

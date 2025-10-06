import { FlowPlan, ChecklistItem } from '@flowpilot/flow-builder';
import { flowPlanSchema } from '@flowpilot/flow-builder';

import { PieceCatalog } from './piece-catalog';

export interface PlannerResult {
  plan: FlowPlan;
  checklist: ChecklistItem[];
  notes: string[];
}

function sanitizeName(prompt: string) {
  return prompt
    .split('\n')[0]
    .replace(/["']/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export async function planFromPrompt(
  prompt: string,
  catalog: PieceCatalog,
): Promise<PlannerResult> {
  const text = prompt.trim();
  if (!text) {
    throw new Error('Prompt is required');
  }

  const lower = text.toLowerCase();

  if (lower.includes('trello') && lower.includes('slack')) {
    return planTrelloToSlack(text, catalog);
  }

  if (lower.includes('webhook') && lower.includes('email')) {
    return planWebhookToEmail(text, catalog);
  }

  return planFallback(text, catalog);
}

async function planTrelloToSlack(prompt: string, catalog: PieceCatalog) {
  await catalog.ensurePieces(['trello', 'slack']);
  const plan: FlowPlan = {
    name: sanitizeName(prompt) || 'Trello to Slack',
    trigger: {
      kind: 'app_trigger',
      piece: 'trello',
      triggerName: 'new_card',
      inputs: {
        boardId: '<ASK_USER: Trello board ID or URL>',
        listId: '<ASK_USER: Trello list ID in the selected board>',
      },
    },
    steps: [
      {
        kind: 'piece_action',
        piece: 'slack',
        actionName: 'send_message',
        inputs: {
          channel: '<ASK_USER: Slack channel to notify (e.g. #ops)>',
          text: '{{trigger.card.name}}',
        },
      },
    ],
    enableAfterBuild: true,
    __needsOptions: [
      {
        piece: 'trello',
        targetType: 'trigger',
        targetName: 'new_card',
        property: 'boardId',
      },
      {
        piece: 'trello',
        targetType: 'trigger',
        targetName: 'new_card',
        property: 'listId',
      },
    ],
    checklist: [
      {
        field: 'trello.boardId',
        description: 'Select the Trello board to monitor for new cards.',
      },
      {
        field: 'trello.listId',
        description: 'Select the Trello list within the board.',
      },
      {
        field: 'slack.channel',
        description: 'Slack channel or conversation ID that should receive notifications.',
      },
    ],
  };
  const parsed = flowPlanSchema.parse(plan);
  return {
    plan: parsed,
    checklist: parsed.checklist ?? [],
    notes: ['Review Trello authentication requirements before building.'],
  };
}

async function planWebhookToEmail(prompt: string, catalog: PieceCatalog) {
  await catalog.ensurePieces(['webhook', 'gmail']);
  const plan: FlowPlan = {
    name: sanitizeName(prompt) || 'Webhook to Email',
    trigger: {
      kind: 'webhook',
      inputs: {
        authType: 'none',
      },
    },
    steps: [
      {
        kind: 'code',
        name: 'Transform Text',
        language: 'ts',
        sourceCode: `export async function run({ text }: { text: string }) {\n  const upper = text?.toUpperCase?.() ?? '';\n  return { upper };\n}`,
        inputs: {
          text: '{{trigger.body.text}}',
        },
      },
      {
        kind: 'piece_action',
        piece: 'gmail',
        actionName: 'send_email',
        inputs: {
          to: '<ASK_USER: Recipient email address>',
          subject: 'Webhook update',
          body: 'Processed text: {{steps.Transform Text.upper}}',
        },
      },
    ],
    enableAfterBuild: true,
    checklist: [
      {
        field: 'gmail.connection',
        description: 'Connect Gmail account with send permissions.',
      },
      {
        field: 'gmail.to',
        description: 'Email recipient(s) for webhook notifications.',
      },
    ],
  };
  const parsed = flowPlanSchema.parse(plan);
  return {
    plan: parsed,
    checklist: parsed.checklist ?? [],
    notes: ['Consider adding authentication to the webhook trigger if required.'],
  };
}

async function planFallback(prompt: string, catalog: PieceCatalog) {
  await catalog.ensurePieces(['webhook']);
  const plan: FlowPlan = {
    name: sanitizeName(prompt) || 'FlowPilot Draft Plan',
    trigger: {
      kind: 'webhook',
      inputs: {},
    },
    steps: [
      {
        kind: 'code',
        name: 'ReviewRequest',
        language: 'ts',
        sourceCode: `export async function run(input: unknown) {\n  // TODO: Implement logic for: ${prompt.replace(/`/g, '')}\n  return { input };\n}`,
      },
    ],
    checklist: [
      {
        field: 'flow.requirements',
        description: 'Clarify trigger and action requirements for: ' + prompt,
      },
    ],
  };
  const parsed = flowPlanSchema.parse(plan);
  return {
    plan: parsed,
    checklist: parsed.checklist ?? [],
    notes: ['Fallback plan generated. Provide more specifics for a complete automation.'],
  };
}

import { FlowPlan } from '@flowpilot/flow-builder';

export const PLANNER_SYSTEM_PROMPT = `You translate a user request into a JSON FlowPlan.

1. Discover pieces/actions/triggers using the piece catalog.
2. Choose the most direct trigger and actions.
3. Emit inputs with placeholders if unknown.
4. If dropdown data is likely required, add a __needsOptions array listing { piece, targetType, targetName, property }.
5. Never invent IDs. Keep unknowns as "<ASK_USER: …>".
6. Prefer native pieces over code; use code steps for glue logic only.`;

export interface FewShotExample {
  readonly user: string;
  readonly plan: FlowPlan;
}

export const FEWSHOT_EXAMPLES: FewShotExample[] = [
  {
    user: 'When a Trello card is created in list “Incoming”, post its title to Slack #ops.',
    plan: {
      name: 'Trello → Slack notify',
      trigger: {
        kind: 'app_trigger',
        piece: 'trello',
        triggerName: 'new_card',
        inputs: {
          boardId: '<ASK_USER: Choose board>',
          listId: '<ASK_USER: Choose list in board>',
        },
      },
      steps: [
        {
          kind: 'piece_action',
          piece: 'slack',
          actionName: 'send_message',
          inputs: {
            channel: '#ops',
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
          description: 'Which Trello board should we monitor?',
        },
        {
          field: 'trello.listId',
          description: 'Which list inside the selected board?',
        },
        {
          field: 'slack.channel',
          description: 'Slack channel to notify (e.g. #ops).',
        },
      ],
    },
  },
];

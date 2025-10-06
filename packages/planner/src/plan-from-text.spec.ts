import { flowPlanSchema } from '@flowpilot/flow-builder';

import { planFromPrompt } from './plan-from-text';
import { PieceCatalog } from './piece-catalog';

class MockCatalog implements Pick<PieceCatalog, 'ensurePieces'> {
  ensurePieces = jest.fn(async () => undefined);
}

describe('planFromPrompt', () => {
  it('produces a Trello → Slack plan', async () => {
    const catalog = new MockCatalog();
    const result = await planFromPrompt(
      'When a Trello card is created, send a Slack message',
      catalog as unknown as PieceCatalog,
    );
    expect(result.plan.trigger.kind).toBe('app_trigger');
    expect(result.plan.steps).toHaveLength(1);
    expect(() => flowPlanSchema.parse(result.plan)).not.toThrow();
    expect(result.checklist.length).toBeGreaterThan(0);
  });

  it('falls back when prompt is ambiguous', async () => {
    const catalog = new MockCatalog();
    const result = await planFromPrompt('Do something interesting', catalog as unknown as PieceCatalog);
    expect(result.plan.steps[0].kind).toBe('code');
  });
});

import { verdictFor, nextTier, weeklyMetrics } from '../review';
import { dateKey, daysAgo } from '../dates';

describe('verdictFor', () => {
  test('buckets completion rates', () => {
    expect(verdictFor(0.95)).toBe('excellent');
    expect(verdictFor(0.9)).toBe('excellent');
    expect(verdictFor(0.7)).toBe('strong');
    expect(verdictFor(0.5)).toBe('struggling');
    expect(verdictFor(0.2)).toBe('failing');
  });
});

describe('nextTier', () => {
  test('two sustained high weeks tiers up and resets the counter', () => {
    expect(nextTier('C', 0.9, 0)).toEqual({ newTier: 'C', direction: 'hold', sustainedHighWeeks: 1 });
    expect(nextTier('C', 0.9, 1)).toEqual({ newTier: 'B', direction: 'up', sustainedHighWeeks: 0 });
  });

  test('cannot tier up past S', () => {
    expect(nextTier('S', 0.95, 5)).toEqual({ newTier: 'S', direction: 'hold', sustainedHighWeeks: 6 });
  });

  test('very low completion tiers down (recalibration)', () => {
    expect(nextTier('C', 0.3, 0)).toEqual({ newTier: 'D', direction: 'down', sustainedHighWeeks: 0 });
  });

  test('cannot tier down past E, and mid completion holds', () => {
    expect(nextTier('E', 0.2, 0)).toEqual({ newTier: 'E', direction: 'hold', sustainedHighWeeks: 0 });
    expect(nextTier('C', 0.6, 3)).toEqual({ newTier: 'C', direction: 'hold', sustainedHighWeeks: 0 });
  });
});

describe('weeklyMetrics', () => {
  const now = new Date(2026, 6, 15, 12, 0, 0); // fixed local noon
  const today = dateKey(now);
  const yesterday = dateKey(daysAgo(1, now));

  const state = {
    registry: { qA: { title: 'A', attr: 'STR', xp: 50 }, qB: { title: 'B', attr: 'INT', xp: 30 } },
    progress: {
      [today]: { __assigned: ['qA', 'qB'], qA: true, qB: true }, // cleared
      [yesterday]: { __assigned: ['qA'] }, // missed
    },
  };

  test('aggregates the last 7 days', () => {
    const m = weeklyMetrics(state, now);
    expect(m.assignedTotal).toBe(3);
    expect(m.completedTotal).toBe(2);
    expect(m.completion).toBeCloseTo(2 / 3, 5);
    expect(m.daysActive).toBe(2);
    expect(m.daysCleared).toBe(1);
    expect(m.xpGained).toBe(80);
    expect(m.repeatedlySkipped).toEqual([]); // only 1 miss, threshold is 3
  });
});

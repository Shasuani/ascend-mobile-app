import { dailyXpSeries, dailyCompletionSeries } from '../history';
import { dateKey, daysAgo } from '../dates';

const now = new Date(2026, 6, 15, 12, 0, 0);
const today = dateKey(now);
const yest = dateKey(daysAgo(1, now));

const state = {
  registry: { q1: { xp: 50 }, q2: { xp: 30 }, q3: { xp: 40 } },
  progress: {
    [today]: { __assigned: ['q1', 'q2'], q1: true, q2: true },
    [yest]: { __assigned: ['q3'], q3: false },
  },
};

describe('dailyXpSeries', () => {
  test('sums completed XP per day, newest last', () => {
    const s = dailyXpSeries(state, 3, now);
    expect(s).toHaveLength(3);
    expect(s[s.length - 1].xp).toBe(80); // today
    expect(s[s.length - 2].xp).toBe(0); // yesterday: q3 not done
  });
});

describe('dailyCompletionSeries', () => {
  test('ratio of assigned quests done', () => {
    const s = dailyCompletionSeries(state, 2, now);
    expect(s[s.length - 1].pct).toBe(1); // today fully cleared
    expect(s[s.length - 2].pct).toBe(0); // yesterday missed
  });
});

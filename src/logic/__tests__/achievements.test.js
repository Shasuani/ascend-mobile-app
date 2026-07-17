import { titleFor, achievementCounts, evaluateAchievements } from '../achievements';

const state = {
  progress: {
    '2026-07-14': { __assigned: ['q1', 'q2'], q1: true, q2: true },
    '2026-07-13': { __assigned: ['q3'], q3: true },
  },
  library: { shelf: { 'deep-work': { finished: true }, range: { finished: false } } },
  practices: { done: { 'str-plank5': true } },
  journal: { '2026-07-14': 'Good day.', '2026-07-13': '   ' },
  longestStreak: 4,
};

describe('titleFor', () => {
  test('maps ranks to titles', () => {
    expect(titleFor('E')).toBe('Awakened');
    expect(titleFor('S')).toBe('Sovereign');
    expect(titleFor('X')).toBe('Awakened');
  });
});

describe('achievementCounts', () => {
  test('counts completed quests, books, practices, journal days', () => {
    const c = achievementCounts(state);
    expect(c.totalQuests).toBe(3);
    expect(c.booksCleared).toBe(1);
    expect(c.practicesDone).toBe(1);
    expect(c.journalDays).toBe(1); // blank entry does not count
  });
});

describe('evaluateAchievements', () => {
  const list = evaluateAchievements(state, { level: 6 });
  const byId = Object.fromEntries(list.map((a) => [a.id, a]));

  test('unlocks are derived from thresholds', () => {
    expect(byId['first-quest'].unlocked).toBe(true);
    expect(byId['first-book'].unlocked).toBe(true);
    expect(byId['level-5'].unlocked).toBe(true); // level 6 >= 5
    expect(byId['streak-7'].unlocked).toBe(false); // longest 4 < 7
    expect(byId['streak-3'].unlocked).toBe(true);
  });

  test('progress is clamped 0..1', () => {
    expect(byId['streak-30'].progress).toBeCloseTo(4 / 30, 5);
    expect(byId['first-quest'].progress).toBe(1);
  });
});

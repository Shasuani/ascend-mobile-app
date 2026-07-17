import { baseXpForDuration, questXp, shiftTier, tierLoad } from '../tiers';

describe('baseXpForDuration', () => {
  test('brackets by minutes', () => {
    expect(baseXpForDuration(5)).toBe(15);
    expect(baseXpForDuration(6)).toBe(25);
    expect(baseXpForDuration(15)).toBe(25);
    expect(baseXpForDuration(16)).toBe(40);
    expect(baseXpForDuration(30)).toBe(40);
    expect(baseXpForDuration(45)).toBe(50);
  });
});

describe('questXp', () => {
  test('scales base by tier multiplier and rounds', () => {
    expect(questXp(30, 'C')).toBe(40); // 40 * 1.0
    expect(questXp(30, 'E')).toBe(32); // 40 * 0.8
    expect(questXp(30, 'S')).toBe(52); // round(40 * 1.3)
  });
});

describe('tierLoad', () => {
  test('quests per day per tier', () => {
    expect(tierLoad('E')).toBe(3);
    expect(tierLoad('C')).toBe(5);
    expect(tierLoad('S')).toBe(8);
  });
});

describe('shiftTier', () => {
  test('moves within bounds and clamps at the ends', () => {
    expect(shiftTier('C', +1)).toBe('B');
    expect(shiftTier('C', -1)).toBe('D');
    expect(shiftTier('S', +1)).toBe('S');
    expect(shiftTier('E', -1)).toBe('E');
  });
});

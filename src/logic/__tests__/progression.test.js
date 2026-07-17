import { levelsFromXp, hunterRank, computeStats } from '../progression';

describe('levelsFromXp', () => {
  test('no levels below the first threshold', () => {
    expect(levelsFromXp(0, 100, 1.12)).toEqual({ lv: 0, into: 0, need: 100 });
    expect(levelsFromXp(99, 100, 1.12)).toEqual({ lv: 0, into: 99, need: 100 });
  });

  test('crosses one threshold at exactly base', () => {
    // need becomes floor(100 * 1.12) = 112 after the first level.
    expect(levelsFromXp(100, 100, 1.12)).toEqual({ lv: 1, into: 0, need: 112 });
  });

  test('rising cost compounds across levels', () => {
    // thresholds: 100 (->0), 112 (->100), 125 (->212) ...
    const r = levelsFromXp(212, 100, 1.12);
    expect(r.lv).toBe(2);
    expect(r.into).toBe(0);
    expect(r.need).toBe(125); // floor(112 * 1.12)
  });
});

describe('hunterRank', () => {
  test('maps level bands to E..S', () => {
    expect(hunterRank(1)).toBe('E');
    expect(hunterRank(9)).toBe('E');
    expect(hunterRank(10)).toBe('D');
    expect(hunterRank(20)).toBe('C');
    expect(hunterRank(30)).toBe('B');
    expect(hunterRank(40)).toBe('A');
    expect(hunterRank(50)).toBe('S');
    expect(hunterRank(99)).toBe('S');
  });
});

describe('computeStats', () => {
  const state = {
    registry: {
      q1: { title: 'A', attr: 'STR', xp: 50 },
      q2: { title: 'B', attr: 'STR', xp: 40 },
      q3: { title: 'C', attr: 'INT', xp: 30 },
    },
    progress: {
      '2026-07-14': { __assigned: ['q1', 'q2'], q1: true, q2: true },
      '2026-07-13': { __assigned: ['q3'], q3: true },
    },
    pointsSpent: { STR: 0, INT: 0, WLTH: 0, VIT: 0, FOC: 0 },
    penaltyXp: 0,
  };

  test('sums completed XP across all dates', () => {
    const s = computeStats(state);
    expect(s.playerXp).toBe(120); // 50 + 40 + 30
    expect(s.level).toBe(2); // 120 XP crosses the 100 threshold once -> level 2
  });

  test('penalty reduces player XP but never below zero', () => {
    const s = computeStats({ ...state, penaltyXp: 1000 });
    expect(s.playerXp).toBe(0);
    expect(s.level).toBe(1);
  });

  test('attributes derive from tagged quest XP and spent points', () => {
    const s = computeStats(state);
    expect(s.attributes.STR.xp).toBe(90);
    expect(s.attributes.INT.xp).toBe(30);
    // STR (90 XP) has the highest value → strongest.
    expect(s.strongest).toBe('STR');
    // base 10 + levels earned + points spent
    expect(s.attributes.STR.value).toBeGreaterThanOrEqual(10);
  });

  test('spent points raise both the value and the free-point ledger', () => {
    const spent = computeStats({ ...state, pointsSpent: { STR: 1, INT: 0, WLTH: 0, VIT: 0, FOC: 0 } });
    const base = computeStats(state);
    expect(spent.attributes.STR.value).toBe(base.attributes.STR.value + 1);
    expect(spent.freePoints).toBe(base.freePoints - 1);
  });
});

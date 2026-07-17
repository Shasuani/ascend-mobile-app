// Framework-agnostic game constants shared across the logic modules.

export const ATTR_KEYS = ['STR', 'INT', 'WLTH', 'VIT', 'FOC'];

// Difficulty tiers, easiest → hardest (§4).
export const TIERS = ['E', 'D', 'C', 'B', 'A', 'S'];

// Quests per day and XP multiplier per tier (§4).
export const TIER_LOAD = { E: 3, D: 4, C: 5, B: 6, A: 7, S: 8 };
export const TIER_MULT = { E: 0.8, D: 0.9, C: 1.0, B: 1.1, A: 1.2, S: 1.3 };
export const TIER_INTENSITY = {
  E: 'gentle', D: 'easy', C: 'moderate', B: 'hard', A: 'very hard', S: 'brutal',
};

// Soft XP penalty by tier for a missed day (§8). Final loss adds level*3.
export const TIER_PENALTY = { E: 15, D: 25, C: 40, B: 55, A: 70, S: 90 };

// The weekly boss is worth a large fixed reward (§6).
export const BOSS_XP = 200;

export const STARTING_ATTR_VALUE = 10; // every attribute starts at 10 (§2)

// Humane penalty math (§8). Soft XP loss on a missed day — never a wipe.

import { TIER_PENALTY } from './constants';

export function penaltyAmount(tier, level) {
  const base = TIER_PENALTY[tier] ?? TIER_PENALTY.C;
  return base + level * 3;
}

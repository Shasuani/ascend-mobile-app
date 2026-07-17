// Tier math: how many quests a day holds and how much XP each quest is worth (§4).

import { TIERS, TIER_LOAD, TIER_MULT } from './constants';

export function tierLoad(tier) {
  return TIER_LOAD[tier] ?? TIER_LOAD.C;
}

export function tierMultiplier(tier) {
  return TIER_MULT[tier] ?? 1.0;
}

// Base XP by quest duration in minutes (§4).
export function baseXpForDuration(min) {
  if (min <= 5) return 15;
  if (min <= 15) return 25;
  if (min <= 30) return 40;
  return 50;
}

// Final quest XP: base scaled by the tier multiplier, rounded.
export function questXp(durationMin, tier) {
  return Math.round(baseXpForDuration(durationMin) * tierMultiplier(tier));
}

// Step a tier up/down within bounds. dir = +1 (harder) or -1 (easier).
export function shiftTier(tier, dir) {
  const i = TIERS.indexOf(tier);
  if (i === -1) return tier;
  const next = Math.min(TIERS.length - 1, Math.max(0, i + dir));
  return TIERS[next];
}

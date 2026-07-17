// Progression math (§3). EVERYTHING is derived from the completion log,
// never from mutated counters — so it stays reversible and drift-free.

import { ATTR_KEYS, STARTING_ATTR_VALUE } from './constants';

// How many level-thresholds an XP total crosses, with rising cost per level.
// Returns { lv, into, need }: levels crossed, XP into the current level, XP the
// current level needs. Reproduce exactly — the whole economy depends on it.
export function levelsFromXp(xp, base, growth) {
  let lv = 0;
  let need = base;
  let acc = 0;
  while (xp >= acc + need) {
    acc += need;
    lv++;
    need = Math.floor(need * growth);
  }
  return { lv, into: xp - acc, need };
}

// Display "Hunter Rank" derived from player level (§3).
export function hunterRank(level) {
  if (level >= 50) return 'S';
  if (level >= 40) return 'A';
  if (level >= 30) return 'B';
  if (level >= 20) return 'C';
  if (level >= 10) return 'D';
  return 'E';
}

// Walk the completion log once and total XP overall and per attribute.
// A completed quest is any truthy key in a day's entry other than "__assigned".
function tallyXp(registry, progress) {
  let total = 0;
  const byAttr = { STR: 0, INT: 0, WLTH: 0, VIT: 0, FOC: 0 };
  for (const dayKey of Object.keys(progress || {})) {
    const entry = progress[dayKey] || {};
    for (const qid of Object.keys(entry)) {
      if (qid === '__assigned' || !entry[qid]) continue;
      const def = registry?.[qid];
      if (!def) continue;
      const xp = Number(def.xp) || 0;
      total += xp;
      if (byAttr[def.attr] != null) byAttr[def.attr] += xp;
    }
  }
  return { total, byAttr };
}

// Derive the full player + attribute snapshot from state.
// state: { registry, progress, pointsSpent, penaltyXp }
export function computeStats(state) {
  const registry = state.registry || {};
  const progress = state.progress || {};
  const pointsSpent = state.pointsSpent || {};
  const penaltyXp = Number(state.penaltyXp) || 0;

  const { total, byAttr } = tallyXp(registry, progress);
  const playerXp = Math.max(0, total - penaltyXp);

  const player = levelsFromXp(playerXp, 100, 1.12);
  const level = player.lv + 1;

  const pointsEarned = player.lv * 2; // +2 attribute points per level (§3)
  const pointsSpentTotal = ATTR_KEYS.reduce(
    (s, k) => s + (Number(pointsSpent[k]) || 0),
    0
  );
  const freePoints = Math.max(0, pointsEarned - pointsSpentTotal);

  const attributes = {};
  for (const k of ATTR_KEYS) {
    const prog = levelsFromXp(byAttr[k] || 0, 60, 1.18);
    attributes[k] = {
      value: STARTING_ATTR_VALUE + prog.lv + (Number(pointsSpent[k]) || 0),
      xp: byAttr[k] || 0,
      into: prog.into,
      need: prog.need,
    };
  }

  // Strongest / weakest attribute by value (ties broken by attr order).
  let strongest = ATTR_KEYS[0];
  let weakest = ATTR_KEYS[0];
  for (const k of ATTR_KEYS) {
    if (attributes[k].value > attributes[strongest].value) strongest = k;
    if (attributes[k].value < attributes[weakest].value) weakest = k;
  }

  return {
    playerXp,
    level,
    rank: hunterRank(level),
    xpInto: player.into,
    xpNeed: player.need,
    xpPct: player.need > 0 ? player.into / player.need : 0,
    pointsEarned,
    freePoints,
    attributes,
    strongest,
    weakest,
  };
}

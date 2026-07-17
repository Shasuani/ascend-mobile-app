// Derived time-series for the progress charts. All computed from the log.

import { dateKey, daysAgo } from './dates';

// XP earned per day over the last `days` days (oldest → newest).
export function dailyXpSeries(state, days = 14, now = new Date()) {
  const registry = state.registry || {};
  const progress = state.progress || {};
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dateKey(daysAgo(i, now));
    const entry = progress[key] || {};
    let xp = 0;
    for (const qid of Object.keys(entry)) {
      if (qid === '__assigned' || !entry[qid]) continue;
      xp += Number(registry[qid]?.xp) || 0;
    }
    out.push({ key, label: key.slice(8), xp });
  }
  return out;
}

// Daily completion ratio of assigned quests over the last `days` days.
export function dailyCompletionSeries(state, days = 14, now = new Date()) {
  const progress = state.progress || {};
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dateKey(daysAgo(i, now));
    const entry = progress[key];
    const assigned = entry?.__assigned || [];
    const done = assigned.filter((id) => entry[id]).length;
    out.push({ key, label: key.slice(8), pct: assigned.length ? done / assigned.length : 0 });
  }
  return out;
}

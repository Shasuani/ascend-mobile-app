// Achievements + titles, all derived from state/stats (no separate tracking).

const TITLES = {
  E: 'Awakened',
  D: 'Novice Hunter',
  C: 'Rising Hunter',
  B: 'Elite Hunter',
  A: 'Master Hunter',
  S: 'Sovereign',
};

export function titleFor(rank) {
  return TITLES[rank] || 'Awakened';
}

// Roll up the counts achievements care about.
export function achievementCounts(state) {
  let totalQuests = 0;
  for (const day of Object.keys(state.progress || {})) {
    const e = state.progress[day] || {};
    for (const k of Object.keys(e)) if (k !== '__assigned' && e[k]) totalQuests++;
  }
  const booksCleared = Object.values(state.library?.shelf || {}).filter((b) => b.finished).length;
  const practicesDone = Object.keys(state.practices?.done || {}).length;
  const journalDays = Object.values(state.journal || {}).filter((t) => t && t.trim()).length;
  return { totalQuests, booksCleared, practicesDone, journalDays };
}

// [id, name, desc, target, value(ctx)] — unlocked when value >= target.
const DEFS = [
  { id: 'first-quest', name: 'First Steps', desc: 'Complete your first quest', target: 1, value: (c) => c.counts.totalQuests },
  { id: 'quests-50', name: 'Committed', desc: 'Complete 50 quests', target: 50, value: (c) => c.counts.totalQuests },
  { id: 'quests-200', name: 'Relentless', desc: 'Complete 200 quests', target: 200, value: (c) => c.counts.totalQuests },
  { id: 'streak-3', name: 'Ignition', desc: 'Reach a 3-day streak', target: 3, value: (c) => c.state.longestStreak || 0 },
  { id: 'streak-7', name: 'On Fire', desc: 'Reach a 7-day streak', target: 7, value: (c) => c.state.longestStreak || 0 },
  { id: 'streak-30', name: 'Unbreakable', desc: 'Reach a 30-day streak', target: 30, value: (c) => c.state.longestStreak || 0 },
  { id: 'level-5', name: 'Ascending', desc: 'Reach level 5', target: 5, value: (c) => c.stats.level },
  { id: 'rank-c', name: 'Rising', desc: 'Reach Rank C', target: 20, value: (c) => c.stats.level },
  { id: 'first-book', name: 'Reader', desc: 'Clear your first book', target: 1, value: (c) => c.counts.booksCleared },
  { id: 'books-5', name: 'Scholar', desc: 'Clear 5 books', target: 5, value: (c) => c.counts.booksCleared },
  { id: 'practices-5', name: 'Challenger', desc: 'Complete 5 challenges', target: 5, value: (c) => c.counts.practicesDone },
  { id: 'journal-7', name: 'Reflective', desc: 'Journal on 7 days', target: 7, value: (c) => c.counts.journalDays },
];

export function evaluateAchievements(state, stats) {
  const ctx = { state, stats, counts: achievementCounts(state) };
  return DEFS.map((d) => {
    const value = d.value(ctx);
    return {
      id: d.id,
      name: d.name,
      desc: d.desc,
      target: d.target,
      value,
      unlocked: value >= d.target,
      progress: Math.min(1, value / d.target),
    };
  });
}

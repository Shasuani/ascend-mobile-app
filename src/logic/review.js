// Adaptive weekly review — the "System Report" (§9). The primary retention hook.
// Pure: computes metrics + the next tier from the log. Caller persists the result.

import { dateKey, daysAgo } from './dates';
import { shiftTier } from './tiers';

// Roll up the last 7 days of the completion log into metrics.
export function weeklyMetrics(state, now = new Date()) {
  const progress = state.progress || {};
  const registry = state.registry || {};

  let assignedTotal = 0;
  let completedTotal = 0;
  let daysActive = 0;
  let daysCleared = 0;
  let xpGained = 0;
  const skipCounts = {}; // title -> times assigned-but-missed

  for (let i = 0; i < 7; i++) {
    const key = dateKey(daysAgo(i, now));
    const entry = progress[key];
    if (!entry) continue;
    const assigned = entry.__assigned || [];
    if (assigned.length === 0) continue;

    daysActive++;
    let dayDone = 0;
    for (const qid of assigned) {
      assignedTotal++;
      const done = !!entry[qid];
      if (done) {
        completedTotal++;
        dayDone++;
        xpGained += Number(registry[qid]?.xp) || 0;
      } else {
        const title = registry[qid]?.title || qid;
        skipCounts[title] = (skipCounts[title] || 0) + 1;
      }
    }
    if (dayDone === assigned.length) daysCleared++;
  }

  const completion = assignedTotal > 0 ? completedTotal / assignedTotal : 0;
  const repeatedlySkipped = Object.entries(skipCounts)
    .filter(([, n]) => n >= 3)
    .map(([title, missed]) => ({ title, missed }));

  return {
    completion,
    daysActive,
    daysCleared,
    xpGained,
    assignedTotal,
    completedTotal,
    repeatedlySkipped,
  };
}

// Bucket a completion rate into a verdict label (§9).
export function verdictFor(completion) {
  if (completion >= 0.9) return 'excellent';
  if (completion >= 0.65) return 'strong';
  if (completion >= 0.4) return 'struggling';
  return 'failing';
}

// Decide the next tier and the updated sustained-high-weeks counter (§9).
// Returns { newTier, direction: 'up'|'down'|'hold', sustainedHighWeeks }.
export function nextTier(currentTier, completion, sustainedHighWeeks = 0) {
  let sustained = sustainedHighWeeks;

  if (completion >= 0.85) {
    sustained += 1;
    if (sustained >= 2 && currentTier !== 'S') {
      return { newTier: shiftTier(currentTier, +1), direction: 'up', sustainedHighWeeks: 0 };
    }
    return { newTier: currentTier, direction: 'hold', sustainedHighWeeks: sustained };
  }

  sustained = 0;
  if (completion < 0.4 && currentTier !== 'E') {
    return { newTier: shiftTier(currentTier, -1), direction: 'down', sustainedHighWeeks: 0 };
  }
  return { newTier: currentTier, direction: 'hold', sustainedHighWeeks: 0 };
}

// Full review: metrics + verdict + tier decision, ready to store in `lastReport`.
export function computeReview(state, stats, now = new Date()) {
  const metrics = weeklyMetrics(state, now);
  const verdict = verdictFor(metrics.completion);
  const oldTier = state.profile?.tier || 'C';
  const tier = nextTier(oldTier, metrics.completion, state.sustainedHighWeeks || 0);

  return {
    metrics,
    verdict,
    oldTier,
    newTier: tier.newTier,
    direction: tier.direction,
    sustainedHighWeeks: tier.sustainedHighWeeks,
    strongest: stats?.strongest,
    weakest: stats?.weakest,
    date: dateKey(now),
  };
}

// Local templated recap in the System's stern voice (fallback when AI is off) (§9).
export function localRecap(review, goalText) {
  const pct = Math.round(review.metrics.completion * 100);
  const { daysCleared, daysActive, xpGained } = review.metrics;
  const dir =
    review.direction === 'up'
      ? 'Your load has been increased.'
      : review.direction === 'down'
      ? 'Your load has been recalibrated downward.'
      : 'Your load holds steady.';
  const goalLine = goalText ? ` Your objective — "${goalText}" — remains.` : '';
  return (
    `Completion: ${pct}%. You cleared ${daysCleared} of ${daysActive} active days and gained ${xpGained} XP. ` +
    `${dir}${goalLine} The quests have been recalibrated. Do not fall behind.`
  );
}

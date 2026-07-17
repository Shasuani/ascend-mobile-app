// Local quest generator (§6 fallback). Runs fully offline so the app never
// breaks when the AI proxy is unreachable. Produces a workday template, a
// rest-day template, and a weekly boss — the same shape the AI would return.

import { ATTR_KEYS, BOSS_XP } from './constants';
import { tierLoad, questXp } from './tiers';
import { timeToMinutes, minutesToTime } from './dates';
import { ATTRS } from '../theme/tokens';

// Curated pool: ~5 quests per attribute as [title, duration_min, slot].
const POOL = {
  STR: [
    ['30 push-ups', 8, 'morning'],
    ['20-min run', 20, 'morning'],
    ['50 squats', 10, 'evening'],
    ['2-min plank', 5, 'evening'],
    ['15-min mobility', 15, 'morning'],
  ],
  INT: [
    ['Read 15 pages', 20, 'evening'],
    ['30-min course', 30, 'evening'],
    ['Learn 10 words', 10, 'lunch'],
    ['Watch 1 lecture', 25, 'evening'],
    ['Write 200 words', 15, 'morning'],
  ],
  WLTH: [
    ['Track spending', 5, 'evening'],
    ['30-min side work', 30, 'evening'],
    ['Read finance piece', 10, 'lunch'],
    ['Send 3 cold emails', 20, 'lunch'],
    ['Review budget', 15, 'evening'],
  ],
  VIT: [
    ['Drink 2L water', 5, 'morning'],
    ['Sleep on time', 5, 'evening'],
    ['Eat one clean meal', 10, 'lunch'],
    ['10-min stretch', 10, 'morning'],
    ['No junk today', 5, 'morning'],
  ],
  FOC: [
    ['10-min meditation', 10, 'morning'],
    ['25-min deep work', 25, 'morning'],
    ['Phone-free hour', 5, 'evening'],
    ['Cold shower', 5, 'morning'],
    ['Plan tomorrow', 10, 'evening'],
  ],
};

let idCounter = 0;
function makeId(attr) {
  idCounter += 1;
  return `${attr.toLowerCase()}-${Date.now().toString(36)}-${idCounter}`;
}

// Compute the "HH:MM" window for a slot from the user's rhythm (§6).
function windowFor(slot, profile) {
  const wake = timeToMinutes(profile.wake) ?? 7 * 60;
  const workEnd = timeToMinutes(profile.workEnd) ?? 17 * 60;
  if (slot === 'morning') return minutesToTime(wake + 15);
  if (slot === 'lunch') return '13:00';
  return minutesToTime(workEnd + 60); // evening
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build an ordered list of attribute keys to draw from: ~70% focus, rest baseline.
function weightedAttrOrder(focusAreas, count) {
  const focus = (focusAreas && focusAreas.length ? focusAreas : ['FOC']).slice();
  const others = ATTR_KEYS.filter((k) => !focus.includes(k));
  const order = [];
  const focusTarget = Math.max(1, Math.round(count * 0.7));
  for (let i = 0; i < count; i++) {
    if (i < focusTarget) {
      order.push(focus[i % focus.length]);
    } else {
      // When every attribute is a focus, there are no "others" — draw from focus.
      const pool = others.length ? others : focus;
      order.push(pool[(i - focusTarget) % pool.length]);
    }
  }
  return shuffle(order);
}

// Pick `count` quests, honoring the daily-minutes cap and avoiding duplicates.
function pickQuests(profile, count, tier, minutesCap) {
  const order = weightedAttrOrder(profile.focusAreas, count);
  const used = new Set();
  const picks = [];
  let minutes = 0;

  for (const attr of order) {
    const options = shuffle(POOL[attr] || POOL.FOC);
    const choice = options.find((o) => {
      const dur = o[1];
      return !used.has(o[0]) && minutes + dur <= minutesCap;
    });
    if (!choice) continue;
    used.add(choice[0]);
    minutes += choice[1];
    const [title, duration_min, slot] = choice;
    const label = ATTRS[attr]?.label ?? attr;
    picks.push({
      id: makeId(attr),
      title,
      attr,
      duration_min,
      xp: questXp(duration_min, tier),
      window: windowFor(slot, profile),
      why: `The System demands progress in ${label}.`,
    });
  }
  return picks;
}

// Public API: generate the week's templates locally.
export function generateLocalWeek(profile) {
  const tier = profile.tier || 'C';
  const cap = profile.dailyMinutes || 60;
  const load = tierLoad(tier);

  const workday = pickQuests(profile, load, tier, cap);
  // Rest days: lighter load, ~1.6x minute budget for recovery-style quests (§6).
  const restLoad = Math.max(2, load - 1);
  const restday = pickQuests(profile, restLoad, tier, Math.round(cap * 1.6));

  const bossAttr = (profile.focusAreas && profile.focusAreas[0]) || 'FOC';
  const bossLabel = ATTRS[bossAttr]?.label ?? bossAttr;
  const boss = {
    id: makeId(bossAttr),
    title: `Weekly Trial: ${bossLabel}`,
    attr: bossAttr,
    xp: BOSS_XP,
    why: `Prove your growth in ${bossLabel}. Clear the trial before the week ends.`,
  };

  return {
    workday,
    restday,
    boss,
    note: 'The System has assigned your path. Do not deviate.',
    source: 'local',
    generatedAt: Date.now(),
  };
}

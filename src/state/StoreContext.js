// Central state store: load/persist the JSON blob and expose actions + derived
// stats to the whole app. Everything funnels through here so the completion log
// stays the single source of truth (§3, §10).

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY, makeDefaultState } from './defaultState';
import { PROGRESS_RETENTION_DAYS, REVIEW_INTERVAL_DAYS } from '../config';
import { computeStats } from '../logic/progression';
import { penaltyAmount } from '../logic/penalty';
import { computeReview } from '../logic/review';
import { weeklyMetrics } from '../logic/review';
import { dateKey, dayCode, daysBetween, daysAgo } from '../logic/dates';
import { generateWeek } from '../ai/generateWeek';
import { generateRecap } from '../ai/generateRecap';
import { setupNotifications } from '../notifications';

const StoreContext = createContext(null);

const COMEBACK_BONUS = 40;     // XP refunded on the first completion after a miss (§8)
const GRACE_INTERVAL_DAYS = 7; // auto grace-day frequency (§8)

// ---- pure helpers -------------------------------------------------------

// Today's quest list: workday template on work days, else rest-day template.
export function boardFor(state, now = new Date()) {
  const week = state.week;
  if (!week) return [];
  const isWork = state.profile.workDays.includes(dayCode(now));
  return (isWork ? week.workday : week.restday) || [];
}

function addQuestsToRegistry(registry, quests) {
  const next = { ...registry };
  for (const q of quests) {
    if (q && q.id) next[q.id] = { title: q.title, attr: q.attr, xp: q.xp };
  }
  return next;
}

function registerWeek(state, week) {
  let registry = addQuestsToRegistry(state.registry, week.workday || []);
  registry = addQuestsToRegistry(registry, week.restday || []);
  if (week.boss) registry = addQuestsToRegistry(registry, [week.boss]);
  return registry;
}

// Drop progress entries older than the retention window (§10).
function prune(progress) {
  const today = dateKey();
  const out = {};
  for (const key of Object.keys(progress || {})) {
    if (daysBetween(key, today) <= PROGRESS_RETENTION_DAYS) out[key] = progress[key];
  }
  return out;
}

// Snapshot today's assigned quest ids on first view so past-day completion is
// always judged against what was actually assigned, even after regeneration (§7).
function ensureToday(state, now = new Date()) {
  const today = dateKey(now);
  const board = boardFor(state, now);
  const progress = { ...state.progress };
  const entry = { ...(progress[today] || {}) };
  if (!entry.__assigned) {
    entry.__assigned = board.map((q) => q.id);
  }
  progress[today] = entry;
  const registry = addQuestsToRegistry(state.registry, board);
  return { ...state, progress, registry, lastActiveDate: today };
}

// On rollover, softly penalize the previous active day if it wasn't cleared (§8).
function applyRolloverPenalty(state, now = new Date()) {
  const today = dateKey(now);
  const last = state.lastActiveDate;
  if (!last || last === today) return state;

  const entry = state.progress[last];
  if (!entry || !entry.__assigned || entry.__assigned.length === 0) return state;

  const allDone = entry.__assigned.every((id) => entry[id]);
  if (allDone) return state;

  // Auto grace-day once per week: pause the penalty and keep the streak (§8).
  const graceAvailable =
    !state.lastGraceDate || daysBetween(state.lastGraceDate, today) >= GRACE_INTERVAL_DAYS;
  if (graceAvailable) {
    return {
      ...state,
      lastGraceDate: today,
      penalty: {
        active: true,
        message: 'The System granted a grace day. Your streak holds — do not lean on it.',
      },
    };
  }

  const stats = computeStats(state);
  const loss = penaltyAmount(state.profile.tier, stats.level);
  return {
    ...state,
    penaltyXp: (state.penaltyXp || 0) + loss,
    streak: 0,
    comebackPending: true,
    penalty: {
      active: true,
      message: `You missed the last cycle. −${loss} XP. Complete a quest today for a comeback bonus.`,
    },
  };
}

// Recompute streak from today's board completion (§7).
function refreshStreak(state, now = new Date()) {
  const today = dateKey(now);
  const entry = state.progress[today];
  if (!entry || !entry.__assigned || entry.__assigned.length === 0) return state;

  const allDone = entry.__assigned.every((id) => entry[id]);
  if (!allDone) return state;
  if (state.lastStreakDate === today) return state; // already counted today

  // Continue the run if yesterday was the last streak day, else restart at 1.
  const yesterday = dateKey(daysAgo(1, now));
  const streak = state.lastStreakDate === yesterday ? state.streak + 1 : 1;
  return {
    ...state,
    streak,
    longestStreak: Math.max(state.longestStreak || 0, streak),
    lastStreakDate: today,
  };
}

// ---- provider -----------------------------------------------------------

export function StoreProvider({ children, userId = 'default', userName }) {
  const KEY = `${STORAGE_KEY}::${userId}`;
  const [state, setState] = useState(null); // null = still loading
  const stateRef = useRef(state);
  stateRef.current = state;
  const notifRef = useRef(false);

  // Load once on mount, then run rollover + snapshot + prune.
  useEffect(() => {
    (async () => {
      let loaded;
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          loaded = { ...makeDefaultState(), ...JSON.parse(raw) };
        } else {
          loaded = makeDefaultState();
          if (userName) loaded.name = userName.toUpperCase().slice(0, 16); // seed from account
        }
      } catch (e) {
        loaded = makeDefaultState();
      }
      loaded.progress = prune(loaded.progress);
      if (loaded.calibrated) {
        loaded = applyRolloverPenalty(loaded);
        loaded = ensureToday(loaded);
      }
      setState(loaded);
    })();
  }, []);

  // Persist whenever state changes (after initial load).
  useEffect(() => {
    if (!state) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  // Once calibrated, install the daily reminder + penalty warning (§7).
  useEffect(() => {
    if (state?.calibrated && !notifRef.current) {
      notifRef.current = true;
      setupNotifications();
    }
  }, [state?.calibrated]);

  // Merge a partial update into state immutably.
  const patch = (updater) =>
    setState((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));

  // Recent performance block for the AI payload / regeneration (§6).
  const recentPerformance = (s) => {
    const m = weeklyMetrics(s);
    return {
      completion_7d: Number(m.completion.toFixed(2)),
      skipped_quests: m.repeatedlySkipped,
    };
  };

  // ---- actions ----------------------------------------------------------

  const actions = {
    // Finish onboarding: store the profile and generate the first week (§5).
    async calibrate(profile) {
      const base = { ...stateRef.current, profile: { ...stateRef.current.profile, ...profile } };
      const week = await generateWeek(base.profile, null);
      let next = {
        ...base,
        week,
        registry: registerWeek(base, week),
        calibrated: true,
        lastReviewDate: dateKey(),
      };
      next = ensureToday(next);
      setState(next);
    },

    // Toggle a quest's completion for today, then refresh streak.
    toggleQuest(quest) {
      patch((prev) => {
        const today = dateKey();
        const progress = { ...prev.progress };
        const entry = { ...(progress[today] || { __assigned: boardFor(prev).map((q) => q.id) }) };
        const completing = !entry[quest.id];
        if (completing) entry[quest.id] = true;
        else delete entry[quest.id];
        progress[today] = entry;
        const registry = addQuestsToRegistry(prev.registry, [quest]);

        let next = { ...prev, progress, registry };

        // Comeback bonus: the first completion after a missed day refunds XP (§8).
        if (completing && prev.comebackPending) {
          const refund = Math.min(COMEBACK_BONUS, prev.penaltyXp || 0);
          next = {
            ...next,
            penaltyXp: (prev.penaltyXp || 0) - refund,
            comebackPending: false,
            penalty: {
              active: true,
              message: `Comeback bonus: +${refund} XP restored. Momentum returns — continue.`,
            },
          };
        }

        return refreshStreak(next, new Date());
      });
    },

    // Claim the weekly boss (big XP, separate from the daily all-clear) (§7).
    claimBoss() {
      patch((prev) => {
        if (!prev.week?.boss) return prev;
        const boss = prev.week.boss;
        const today = dateKey();
        const progress = { ...prev.progress };
        const entry = { ...(progress[today] || {}) };
        entry[boss.id] = true;
        progress[today] = entry;
        return { ...prev, progress, registry: addQuestsToRegistry(prev.registry, [boss]) };
      });
    },

    // Spend a free attribute point (§3).
    allocatePoint(attr) {
      patch((prev) => {
        const stats = computeStats(prev);
        if (stats.freePoints <= 0) return prev;
        return { ...prev, pointsSpent: { ...prev.pointsSpent, [attr]: (prev.pointsSpent[attr] || 0) + 1 } };
      });
    },

    setName(name) {
      patch({ name: (name || 'PLAYER').toUpperCase().slice(0, 16) });
    },

    dismissPenalty() {
      patch((prev) => ({ ...prev, penalty: { active: false, message: '' } }));
    },

    // Regenerate the week's quests (keeps the registry so past XP still resolves).
    async regenerate() {
      const s = stateRef.current;
      const week = await generateWeek(s.profile, recentPerformance(s));
      let next = { ...s, week, registry: registerWeek(s, week) };
      // Re-snapshot today against the fresh board only if nothing done yet today.
      const today = dateKey();
      const entry = next.progress[today];
      if (!entry || Object.keys(entry).filter((k) => k !== '__assigned').length === 0) {
        const progress = { ...next.progress };
        progress[today] = { __assigned: boardFor(next).map((q) => q.id) };
        next = { ...next, progress };
      }
      setState(next);
    },

    // Run the weekly System Report: adapt tier, regenerate, store the report (§9).
    async runReview() {
      const s = stateRef.current;
      const stats = computeStats(s);
      const review = computeReview(s, stats);
      const recap = await generateRecap(review, s.profile.goalText);
      const profile = { ...s.profile, tier: review.newTier };
      const week = await generateWeek(profile, recentPerformance(s));
      const report = { ...review, recap, week: (s.reviewCount || 0) + 1 };
      const next = {
        ...s,
        profile,
        week,
        registry: registerWeek(s, week),
        sustainedHighWeeks: review.sustainedHighWeeks,
        lastReviewDate: dateKey(),
        reviewCount: (s.reviewCount || 0) + 1,
        lastReport: report,
      };
      setState(ensureToday(next));
      return report;
    },

    clearReport() {
      patch({ lastReport: null });
    },

    // Re-open calibration to edit the profile (progress is preserved).
    recalibrate() {
      patch({ calibrated: false });
    },

    // ---- Library (Intelligence) ----

    // Put a book on the "currently reading" shelf.
    addBook(book) {
      patch((prev) => {
        const shelf = { ...prev.library.shelf };
        if (shelf[book.id]) return prev;
        shelf[book.id] = {
          pages: book.pages,
          pagesRead: 0,
          finished: false,
          finishedAt: null,
          added: Date.now(),
        };
        return { ...prev, library: { ...prev.library, shelf } };
      });
    },

    // Log a reading session (default one chapter's worth of pages).
    logReading(bookId, pages = 25) {
      patch((prev) => {
        const entry = prev.library.shelf[bookId];
        if (!entry || entry.finished) return prev;
        const shelf = { ...prev.library.shelf };
        shelf[bookId] = { ...entry, pagesRead: Math.min(entry.pages, entry.pagesRead + pages) };
        return { ...prev, library: { ...prev.library, shelf } };
      });
    },

    // Finish a book → award Intelligence XP through the completion log (§3).
    finishBook(book) {
      patch((prev) => {
        const entry = prev.library.shelf[book.id];
        if (!entry || entry.finished) return prev;

        const qid = `book-${book.id}`;
        const registry = addQuestsToRegistry(prev.registry, [
          { id: qid, title: `Read: ${book.title}`, attr: 'INT', xp: book.xp },
        ]);
        const today = dateKey();
        const progress = { ...prev.progress };
        const dayEntry = { ...(progress[today] || {}) };
        dayEntry[qid] = true;
        progress[today] = dayEntry;

        const shelf = { ...prev.library.shelf };
        shelf[book.id] = { ...entry, finished: true, finishedAt: Date.now(), pagesRead: entry.pages };
        return { ...prev, registry, progress, library: { ...prev.library, shelf } };
      });
    },

    // Remove a book from the shelf (finished books stay for the record).
    removeBook(bookId) {
      patch((prev) => {
        const shelf = { ...prev.library.shelf };
        delete shelf[bookId];
        return { ...prev, library: { ...prev.library, shelf } };
      });
    },

    // Complete an attribute "practice"/challenge → award that attribute's XP once.
    completePractice(practice) {
      patch((prev) => {
        if (prev.practices.done[practice.id]) return prev;
        const qid = `practice-${practice.id}`;
        const registry = addQuestsToRegistry(prev.registry, [
          { id: qid, title: practice.title, attr: practice.attr, xp: practice.xp },
        ]);
        const today = dateKey();
        const progress = { ...prev.progress };
        const entry = { ...(progress[today] || {}) };
        entry[qid] = true;
        progress[today] = entry;
        const done = { ...prev.practices.done, [practice.id]: true };
        return { ...prev, registry, progress, practices: { done } };
      });
    },

    // Save today's journal reflection (Focus). First entry of the day grants FOC XP.
    saveJournal(text) {
      patch((prev) => {
        const today = dateKey();
        const firstToday = !prev.journal[today];
        const journal = { ...prev.journal, [today]: text };
        let next = { ...prev, journal };
        if (firstToday && text.trim()) {
          const qid = `journal-${today}`;
          const registry = addQuestsToRegistry(prev.registry, [
            { id: qid, title: 'Daily reflection', attr: 'FOC', xp: 20 },
          ]);
          const progress = { ...prev.progress };
          const entry = { ...(progress[today] || {}) };
          entry[qid] = true;
          progress[today] = entry;
          next = { ...next, registry, progress };
        }
        return next;
      });
    },

    async resetAll() {
      const fresh = makeDefaultState();
      setState(fresh);
    },
  };

  const stats = state ? computeStats(state) : null;
  const reviewReady =
    state?.calibrated &&
    state.lastReviewDate &&
    daysBetween(state.lastReviewDate, dateKey()) >= REVIEW_INTERVAL_DAYS;

  const value = {
    state,
    stats,
    ready: !!state,
    board: state ? boardFor(state) : [],
    isWorkToday: state ? state.profile.workDays.includes(dayCode()) : false,
    reviewReady,
    actions,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}

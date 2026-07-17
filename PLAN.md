# Implementation Plan — "THE SYSTEM" (Solo-Leveling-style self-improvement RPG)

Rebuild the existing single-file React web prototype as a **downloadable phone app** (Expo / React Native). Source of truth: `THE SYSTEM build prompt.md`. This plan translates that spec into an ordered, buildable roadmap.

---

## Build status (updated 2026-07-15)

**All 10 MVP phases implemented.** App name: **ASCEND**. Runs fully offline (local quest generator); AI is an optional upgrade via a deployable proxy.

| Phase | Status |
|-------|--------|
| 1. Scaffold & design (Expo, fonts, tokens, `SystemWindow`) | ✅ Done |
| 2. Pure logic modules **+ 20 unit tests (all passing)** | ✅ Done |
| 3. State / persistence (AsyncStorage, registry, snapshots, pruning) | ✅ Done |
| 4. Onboarding — 5-step calibration | ✅ Done |
| 5. Main board & daily loop (status/radar, attributes, quests, streak, boss) | ✅ Done |
| 6. Local notifications (reset reminder + penalty warning) | ✅ Done |
| 7. AI generation client + fallback **+ deployable proxy** (`proxy/`) | ✅ Done (proxy not yet deployed) |
| 8. Weekly review — System Report + AI recap (local fallback) | ✅ Done |
| 9. Humane penalty + comeback bonus + auto grace-day | ✅ Done |
| 10. Polish — level-up modal, animations, settings, reduce-motion | ✅ Done |

**Verified:** `npm test` green (20/20); iOS bundle builds clean.
**Pending user action:** deploy `proxy/` and set `AI_PROXY_URL` to enable AI (optional). Everything below the line is post-MVP.

---

## 0. Guiding decisions (locked, do not regress)

- **Stack:** Expo (React Native) + `AsyncStorage` (single JSON blob) + `expo-notifications` + `expo-font`. One serverless AI proxy for Anthropic; **never ship the API key in the client**.
- **Offline-first:** all state on-device; AI is an enhancement with a local fallback so the app never breaks.
- **MVP scope:** onboarding → AI board → complete quests → XP/level/streak → local notification at reset → humane penalty → adaptive weekly review. **No** accounts, sync, leaderboards, or anti-cheat in MVP (trust device time).
- **Product principles:** fast first win (~60s to board), focus over breadth (1–2 attrs), consistency over novelty (workday/rest-day templates), humane penalty (pause, never crush), AI's edge = scheduling into real free windows, weekly report = retention.
- **Legal:** original app name + original assets. No "Solo Leveling" name/characters/art. Genre conventions only.
- **Naming clarity:** rename the two E–S concepts → **Hunter Rank** (derived from level) vs **Difficulty Tier** (set at onboarding, drives quest load).

---

## Phase 1 — Scaffold & design foundation

**Goal:** empty app boots with fonts, tokens, and the signature "System Window" frame.

- [ ] Init Expo app (portrait-locked, single column, TypeScript).
- [ ] Install deps: `@react-native-async-storage/async-storage`, `expo-notifications`, `expo-font`, `react-native-svg` (radar + clipped frames), animation lib (Reanimated).
- [ ] Load fonts via `expo-font`: **Rajdhani** (headers/labels/body) + **Share Tech Mono** (all numbers/XP/timers).
- [ ] Design tokens module (§12 palette): `void #04060c`, panels, lines, `cyan #4fdcff`, `red #ff3d5e`, `gold #ffcf5c`, `green #43e6a0`, text/muted, + 5 attribute accents (§2).
- [ ] **`SystemWindow` component** — reusable angular clipped-corner frame (top-left + bottom-right corners cut), glowing cyan border, animated scan line sweeping down, respects reduced-motion. This is the product's visual signature; get it right early since every window uses it.

**Deliverable:** app boots, shows a themed `SystemWindow` with correct fonts and glow.

---

## Phase 2 — Pure logic modules (framework-agnostic + unit-tested)

**Goal:** port the game engine as pure JS/TS with tests, before any UI depends on it.

- [ ] **Progression math (§3)** — reproduce exactly:
  - `levelsFromXp(xp, base, growth)` threshold helper.
  - Player level: `levelsFromXp(playerXp, 100, 1.12)` → `level = lv+1`; `playerXp = Σ completed quest xp − penaltyXp`, clamped ≥ 0.
  - Points: `pointsEarned = lv*2`; `freePoints = pointsEarned − pointsSpent`.
  - Attribute value: `levelsFromXp(attrXp, 60, 1.18)` → `value = 10 + lv + pointsSpentOnAttr`; base 10 each.
  - Hunter Rank from level: E 1–9, D 10–19, C 20–29, B 30–39, A 40–49, S 50+.
  - **Everything derived from the completion log** (no mutated counters) → reversible, drift-free.
- [ ] **Tier tables (§4):** tier → quests/day + XP multiplier; quest base XP by duration (≤5→15, ≤15→25, ≤30→40, else 50); `xp = round(base × tierMult)`.
- [ ] **Local quest generator (§6 fallback):** curated pool ~5 quests/attr `[title, duration_min, slot]`; ~70% from focus areas + baseline, up to tier load, within time budget; windows from wake/work-end (morning = wake+15m, lunch = 13:00, evening = work_end+1h).
- [ ] **Weekly review engine (§9):** last-7-day metrics (completion rate, days cleared, XP gained, strongest/weakest attr, quests skipped ≥3×); verdict buckets (≥.90 / ≥.65 / ≥.40 / else); tier change logic (≥.85 → `sustainedHighWeeks++`, ≥2 & not S → tier up; <.40 & not E → tier down "recalibration"; else hold).
- [ ] **Penalty calc (§8):** `{E:15,D:25,C:40,B:55,A:70,S:90}[tier] + level*3`.
- [ ] **Unit tests** on all math (progression, tier, review thresholds, penalty).

**Deliverable:** `npm test` green; engine usable headless.

---

## Phase 3 — State layer & persistence

**Goal:** the on-device data model (§10) with load/save/migrate.

- [ ] Single JSON blob under one AsyncStorage key, matching §10 schema (`profile`, `week`, `registry`, `progress`, `pointsSpent`, `penaltyXp`, streak fields, review fields, `lastReport`).
- [ ] **Quest registry** (`qid → {title, attr, xp}`) — every quest ever, so completed quests always resolve for XP even after regeneration.
- [ ] `progress["YYYY-MM-DD"]` with `__assigned:[ids]` snapshot + `qid:true` completions.
- [ ] Prune `progress` entries older than ~45 days on load.
- [ ] Selectors that feed the progression math from the log.

**Deliverable:** state read/write round-trips; derived stats compute from stored log.

---

## Phase 4 — Onboarding "System Calibration" (§5)

**Goal:** 5-step assessment → first board in ~60s.

- [ ] Step 1 Focus: pick **1–2** attributes (enforce cap).
- [ ] Step 2 Work days: multi-select Mon–Sun.
- [ ] Step 3 Daily rhythm: wake / work start / work end / sleep.
- [ ] Step 4 Time budget: 15/30/60/90 min (hard cap).
- [ ] Step 5 Discipline self-rating → starting **Difficulty Tier** (E–S) + optional goal text; tell user it's provisional.
- [ ] On finish → **local generation** first (instant win), show board. (AI swap comes in Phase 7.)
- [ ] Phase-2 onboarding fields (commute, gym/equipment, injuries, preferred times) — stub for later unlock.

**Deliverable:** fresh install → calibrate → board visible fast.

---

## Phase 5 — Main board & daily loop (§7, §11)

**Goal:** the core play loop, all on AsyncStorage.

- [ ] **Status window:** Hunter Rank badge, editable name, level, XP bar, 5-axis attribute **radar** (SVG).
- [ ] **Attributes panel:** bars + value + allocate `+` when free points exist; ◆ marks focus areas.
- [ ] **Daily Quest window:** ⚠ header, reset countdown, progress N/total, quest rows (checkbox / title / why / time / attr tag / xp).
- [ ] Today's board = workday vs rest-day template based on `work_days`.
- [ ] On first view of a day, snapshot assigned quest ids → `__assigned`.
- [ ] Tap toggles completion; XP/level/attrs recompute from log.
- [ ] **Streak:** increments when all today's assigned complete; resets on miss.
- [ ] **Weekly Trial (boss):** separate claimable card (~200 XP, primary focus attr), not part of daily "all clear."
- [ ] **Live countdown** to local midnight.
- [ ] Footer: streak, Regenerate, Edit, Settings.

**Deliverable:** complete quests → see XP/level/streak/attribute changes live.

---

## Phase 6 — Local notifications (§7)

**Goal:** the "mandatory" enforcement loop, offline.

- [ ] `expo-notifications` permission + scheduling.
- [ ] Reminder some hours before reset if quests remain.
- [ ] Penalty warning near midnight.
- [ ] Reschedule on board changes / day rollover.

**Deliverable:** device fires reset reminder + penalty warning with no backend.

---

## Phase 7 — Serverless AI proxy + AI generation (§6)

**Goal:** swap local generation for AI, keep local fallback.

- [ ] Deploy one serverless proxy (Cloudflare Worker / Vercel / Supabase Edge) holding the Anthropic key; calls Messages API (`claude-sonnet-4-6` or current Sonnet), `max_tokens` ~1500.
- [ ] App → proxy → Anthropic. Use the **verbatim system prompt** (§6) + JSON user payload (focus_areas, times, work_days, tier, goal, constraints, recent_performance).
- [ ] Generate **once per week**: workday + rest-day templates + weekly boss + note.
- [ ] **Parse robustly:** strip code fences, `JSON.parse`, validate `workday` non-empty array (else local fallback); assign stable ids, clamp xp, coerce `attr` to valid key; store defs in registry.
- [ ] "Generating/Assessing" loader overlay.

**Deliverable:** onboarding + weekly regen use AI; any failure silently falls back to local.

---

## Phase 8 — Adaptive weekly review "System Report" (§9)

**Goal:** the primary retention hook.

- [ ] Auto-run every 7 days + manual trigger.
- [ ] Compute metrics, verdict, tier change (Phase 2 engine).
- [ ] Regenerate next week with new tier + `recent_performance` (skipped quests move/replace).
- [ ] **System Report modal:** completion ring, days-cleared / XP / strongest stat / tier-change (▲/▼) + **AI-written recap** (stern voice, 3–4 sentences, real numbers; plain text, local templated fallback).
- [ ] Review-ready banner (top).

**Deliverable:** week boundary → report modal with adaptive tier + AI recap.

---

## Phase 9 — Humane penalty (§8)

**Goal:** pause momentum, never crush.

- [ ] On app open, if day rolled over and previous active day's assigned quests weren't all complete → soft XP loss (`penaltyXp`), reset streak.
- [ ] Red System warning that **promises a comeback bonus** for returning today.
- [ ] Penalty banner (fixed bottom).
- [ ] Never zero-out progress or berate.

**Deliverable:** miss a day → soft, encouraging penalty; progress preserved.

---

## Phase 10 — Polish (§12 visual language)

**Goal:** ship the signature feel.

- [ ] Radar chart refinement (5-axis SVG).
- [ ] **Level-Up modal:** gold number, rotating conic light rays, four L-shaped corner brackets, spring-in.
- [ ] Animations: checkbox "pop", XP/track bar width tweens, streak fire glow, scan lines, faint radial cyan background glows.
- [ ] Settings modal: recalibrate, run review now, reset.
- [ ] Respect reduced-motion throughout.
- [ ] Extensions: comeback-bonus XP on return, auto grace-day once/week.

**Deliverable:** app matches the holographic "System" aesthetic.

---

## Later (post-MVP, ask before building)

- Accounts + cross-device sync + server-side reset / anti-cheat.
- Leaderboards / social.
- Phase-2 onboarding unlock (commute, equipment, injuries, preferred times).
- `expo-sqlite` migration if the JSON blob outgrows AsyncStorage.

> **Per spec:** ask before adding any backend beyond the single AI proxy in the MVP.

---

## Open questions / confirm before starting

1. **App name & assets** — need an original name (legal requirement). Placeholder for now?
2. **Proxy host** — Cloudflare Worker vs Vercel vs Supabase Edge preference?
3. **Existing prototype** — is the single-file React prototype available to port logic/UI from, or rebuild from this spec only?
4. **Target platforms** — iOS + Android both at MVP, or one first?

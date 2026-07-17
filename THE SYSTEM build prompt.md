# Build Prompt — "THE SYSTEM": a Solo-Leveling-style self-improvement RPG (phone app)

> Paste this whole document to Claude Code as the project brief. It is self-contained: every mechanic, number, schema, and design token needed to build the app is included. A working web prototype already exists (single-file React); this spec is for rebuilding it as a **downloadable phone app**.

---

## 0. What you are building

A mobile self-improvement app that turns real-life discipline into an RPG. The user completes **mandatory daily quests** across five life domains and levels up, styled after the "System" interface from progression anime (glowing holographic blue UI, ranks, XP, stat allocation). An AI generates each user's quests around their **real weekly schedule**, and an adaptive weekly review raises or lowers difficulty based on actual completion.

**Audience & tone:** aimed at men focused on self-improvement — fitness, finances, learning, discipline. The voice of "the System" is stern and terse, but the product must be **motivating, never a shame engine** (see §9). Frame it as capability and growth, not punishment.

**Platform:** phone-only, installable from the App Store / Google Play. Portrait, single column, large tap targets, thumb-reachable primary actions.

**⚠️ Legal note:** "Solo Leveling" is copyrighted IP. Do **not** use that name, its characters, or copied art. Use an original app name and original assets. Genre conventions (XP, ranks, stat windows) are fine; specific trademarked names/artwork are not.

---

## 1. Recommended stack

- **Expo (React Native)** — the game logic below is pure JS and ports directly; rebuild only the UI in RN components.
- **On-device storage:** `AsyncStorage` (or `expo-sqlite` if it grows). Single JSON blob under one key, mirroring the prototype.
- **Local notifications:** `expo-notifications` for daily-reset reminders and penalty warnings. These work **offline with no backend** and deliver the "mandatory" enforcement loop.
- **One serverless AI proxy** (Cloudflare Worker / Vercel function / Supabase Edge Function) that holds the Anthropic API key and calls the Messages API. **Never ship the API key in the client** — the app calls your proxy, the proxy calls Anthropic.
- **Defer to later (not in MVP):** user accounts, cross-device sync, server-side reset/anti-cheat, leaderboards, social. Trust device time at MVP.

**MVP definition of done:** onboarding → AI-generated daily board → complete quests → XP/level/streak → local notification at reset → humane penalty on miss → weekly review that adapts difficulty. All state on-device; AI via the proxy.

---

## 2. The five attributes

| Key | Label | Domain | Accent color |
|-----|-------|--------|--------------|
| STR | Strength | Body / physical training | `#ff8a5c` |
| INT | Intelligence | Mind / learning & reading | `#7aa8ff` |
| WLTH | Wealth | Finances | `#ffcf5c` |
| VIT | Vitality | Health (sleep, water, diet) | `#43e6a0` |
| FOC | Focus | Discipline (meditation, deep work) | `#c98aff` |

Each attribute starts at **value 10**.

---

## 3. Progression math (reproduce exactly)

Everything is **derived from a completion log**, not mutated counters, so it stays reversible and drift-free.

**Threshold helper** — number of level-thresholds an XP total crosses, with rising cost:
```
levelsFromXp(xp, base, growth):
  lv=0, need=base, acc=0
  while xp >= acc + need: acc += need; lv++; need = floor(need * growth)
  return { lv, into: xp-acc, need }
```

**Player level:** `levelsFromXp(playerXp, base=100, growth=1.12)` → `level = lv + 1`.
- `playerXp = (sum of xp of all completed quests, all dates) − penaltyXp`, clamped ≥ 0.
- Each level grants **+2 attribute points** (`pointsEarned = lv * 2`). `freePoints = pointsEarned − pointsSpent`.

**Attribute value:** for each attribute, `levelsFromXp(attrXp, base=60, growth=1.18)`; `value = 10 + lv + pointsSpentOnThatAttr`. `attrXp` = sum of xp of completed quests tagged to that attribute.

**Display "Hunter Rank"** (derived from player level, shown in status window):
`E` 1–9, `D` 10–19, `C` 20–29, `B` 30–39, `A` 40–49, `S` 50+.

> **Design note — two rank concepts exist.** The *display rank* above (from level) is separate from the *difficulty tier* (§6, set at onboarding, drives quest load). They share the E–S letters, which is confusing. **Recommend renaming** in the real build: call the level-derived one **Hunter Rank** and the difficulty one **Difficulty Tier**, so they're clearly distinct.

---

## 4. Difficulty tier → quest load

Set at onboarding, adjusted by the weekly review.

| Tier | Quests/day | XP multiplier | Intensity |
|------|-----------|---------------|-----------|
| E | 3 | ×0.8 | gentle |
| D | 4 | ×0.9 | easy |
| C | 5 | ×1.0 | moderate |
| B | 6 | ×1.1 | hard |
| A | 7 | ×1.2 | very hard |
| S | 8 | ×1.3 | brutal |

**Quest base XP by duration:** ≤5 min → 15; ≤15 → 25; ≤30 → 40; else → 50. Then `xp = round(base × tierMultiplier)`.

---

## 5. Onboarding — "System Calibration" (5 steps)

Themed as the System *assessing* the user, not a form. **Phase 1 = minimum to generate a first board**, then an instant win (show the board within ~60 seconds — long setup is the #1 cause of early churn).

1. **Focus** — pick **1–2** of the five attributes. Enforce the cap; focus beats spreading thin.
2. **Work days** — multi-select Mon–Sun.
3. **Daily rhythm** — time inputs: wake, work start, work end, sleep. (This is how the AI knows the user's free windows.)
4. **Time budget** — 15 / 30 / 60 / 90 min. **Hard cap** on daily quest minutes.
5. **Discipline self-rating** → starting **difficulty tier** (E–S) + optional free-text goal (e.g. "get lean and start earning online"). Tell the user this is provisional: "The System recalibrates as it observes you."

Then generate → show the board.

**Phase 2 (unlock after a few days, optional):** commute time, gym/equipment access, injuries/constraints, preferred quest times.

---

## 6. AI quest generation

Generate **once per week** (not daily). Output a **workday template** and a **rest-day template** (consistency beats novelty for habit formation, and it fits the token budget), applied to days based on the user's selected work days.

**Call flow:** app → your serverless proxy → Anthropic Messages API (`claude-sonnet-4-6` or current Sonnet), `max_tokens` ~1500. On any failure, fall back to a **local generator** (curated quest pool per attribute) so the app never breaks.

**System prompt (use verbatim):**
```
You are THE SYSTEM — the entity that assigns quests to a Player to force their
growth. You generate a concrete quest plan, not advice.

RULES:
1. Respect daily_minutes as a hard cap on total quest minutes for a workday.
   Rest days may be ~1.6x.
2. Schedule into free windows only: morning (wake→work_start), lunch, or evening
   (work_end→sleep). Never during work hours.
3. ~70% of quests target focus_areas; keep a light baseline in the others.
4. Quests are specific and imperative. "40 push-ups", not "get fit". Title <= 5 words.
5. Number of workday quests = tier load: E=3, D=4, C=5, B=6, A=7, S=8. Rest days
   may add 1-2.
6. Provide a "workday" template and a "restday" template (not 7 distinct days).
7. Consider goal_text and constraints. If recent_performance shows repeated skips,
   change timing or replace the quest.
8. Output ONLY valid minified JSON. No markdown, no prose, no code fences.

Schema:
{"workday":[{"title":"","attr":"STR|INT|WLTH|VIT|FOC","duration_min":0,"xp":0,
"window":"HH:MM","why":""}],"restday":[...same...],
"boss":{"title":"","attr":"","xp":0,"why":""},
"note":"one line in the System's stern voice"}
```

**User message = JSON payload:**
```json
{
  "focus_areas": ["STR","WLTH"],
  "wake_time": "06:30",
  "work_days": ["MO","TU","WE","TH","FR"],
  "work_hours": {"start":"08:00","end":"17:00"},
  "sleep_time": "23:00",
  "daily_minutes": 60,
  "tier": "D",
  "goal_text": "Get lean and start earning online",
  "constraints": ["home workouts only"],
  "recent_performance": {"completion_7d": 0.72,
    "skipped_quests": [{"title":"6am run","missed":4}]}
}
```

**After parsing:** strip any code fences, `JSON.parse`, validate `workday` is a non-empty array (else fall back to local). Assign each quest a stable unique id, clamp xp to a number, coerce `attr` to a valid key. Store quest definitions in a **registry** (`id → {title, attr, xp}`) so completed quests always resolve for XP even after regeneration. The **weekly boss** is worth ~200 XP, tied to the primary focus attribute.

**Local fallback:** curated pool of ~5 quests per attribute with `[title, duration_min, slot]`; pick ~70% from focus areas + baseline from others up to the tier's load, respecting the time budget; compute windows from wake/work-end times (morning = wake+15min, lunch = 13:00, evening = work_end+1h).

---

## 7. Daily loop

- Today's board = workday template if today ∈ work_days, else rest-day template.
- On first view of a day, snapshot the assigned quest ids for that date (`__assigned`) so past-day completion is judged against what was actually assigned, even after regeneration.
- Tapping a quest toggles completion for today; XP/level/attributes recompute from the log.
- **Streak** increments when *all* of today's assigned quests are complete; resets on a missed day.
- **Weekly boss** is a separate claimable quest (big XP), not part of the daily "all clear."
- **Live countdown** to local midnight (the reset).
- Schedule **local notifications**: a reminder some hours before reset if quests remain, and a penalty warning near midnight.

---

## 8. Penalty (humane — important)

On app open, if the day rolled over and the **previous active day's** assigned quests were not all complete:
- Soft XP loss by difficulty tier: `{E:15, D:25, C:40, B:55, A:70, S:90}[tier] + level*3`.
- Reset streak.
- Show a red System warning that also **promises a comeback bonus** for returning today.

Do **not** zero-out progress or berate the user. One bad day pauses momentum; it does not crush it. (Intended extension: an auto grace-day once per week, and an actual comeback-bonus XP on return.)

---

## 9. Adaptive weekly review — "System Report"

Runs automatically every 7 days (offer a manual trigger too). This is the primary retention hook.

**Compute last-7-days metrics:** completion rate, days fully cleared, XP gained, strongest/weakest attribute, and quests skipped ≥3 times.

**Verdict buckets:** ≥0.90 excellent · ≥0.65 strong · ≥0.40 struggling · else failing.

**Tier change:**
- If completion ≥ 0.85 → `sustainedHighWeeks++`; if sustained ≥ 2 and not at S → **tier up**, reset counter.
- Else `sustainedHighWeeks = 0`; if completion < 0.40 and not at E → **tier down** (framed as "recalibration", never "demotion").
- Otherwise **hold**.

**Then:** regenerate next week with the new tier + `recent_performance` (so skipped quests move/replace). Show a **System Report modal**: a completion ring, days-cleared / XP / strongest stat / tier-change (▲/▼), and an **AI-written recap in the System's stern voice** (3–4 sentences referencing the real numbers; local templated fallback if the call fails).

**AI recap prompt (plain text out, no JSON):** give it completion %, days cleared/active, XP gained, strongest/weakest attr, tier change, repeatedly-skipped quests, and the user's goal; ask for a terse second-person report ending by stating the quests were recalibrated.

---

## 10. Data model (on-device, one JSON blob)

```
{
  name: "PLAYER",
  calibrated: bool,
  profile: { focusAreas:[], workDays:[], wake, workStart, workEnd, sleep,
             dailyMinutes, tier, goalText, constraints:[] },
  week: { workday:[quest], restday:[quest], boss:{}, note, source:"ai"|"local", generatedAt },
  registry: { qid: {title, attr, xp} },     // every quest ever, for XP lookup
  progress: { "YYYY-MM-DD": { qid:true, __assigned:[ids] } },
  pointsSpent: { STR,INT,WLTH,VIT,FOC },
  penaltyXp: number,
  streak, longestStreak, lastStreakDate, lastActiveDate,
  penalty: { active, message },
  lastReviewDate, reviewCount, sustainedHighWeeks,
  lastReport: { text, metrics, oldTier, newTier, direction, date, week }
}
quest = { id, title, attr, duration_min, xp, window:"HH:MM", why }
```
Prune `progress` entries older than ~45 days.

---

## 11. Screens

1. **Calibration** — 5-step stepper (§5).
2. **Main** — top-to-bottom: Status window (Hunter Rank badge, editable name, level, XP bar, 5-axis attribute **radar**), Attributes panel (bars + value + allocate `+` when free points exist, ◆ marks focus areas), Daily Quest window (⚠ header, reset countdown, progress N/total, quest rows with checkbox / title / "why" / time / attr tag / xp), Weekly Trial (boss) card, footer (streak, Regenerate, Edit, Settings).
3. **Overlays/modals:** Generating/Assessing loader, Level-Up (holographic burst with corner brackets + rotating rays), System Report, Settings (recalibrate, run review now, reset), Penalty banner (fixed bottom), Review-ready banner (top).

---

## 12. Design system

**Palette (CSS var names → hex):**
```
void #04060c · panel #080f1e / #0b1526 · line #173556 / line2 #0f2740
cyan #4fdcff · cyan-dim #2b8fd0 · cyan-deep #0e4a6e
red #ff3d5e · gold #ffcf5c · green #43e6a0
text #d6ecff · muted #5f7ea6
```
Attribute accents in §2.

**Type:** `Rajdhani` (condensed, HUD — headers, labels, body) + `Share Tech Mono` (all numbers/XP/timers). In Expo, load via `expo-font`.

**Visual language (this is the product's signature — get it right):**
- Dark holographic feel: void background with faint radial cyan glows.
- **Angular clipped-corner frames** on every "window" (top-left + bottom-right corners cut — a polygon clip; in RN emulate with an SVG/masked border or a custom bordered container).
- Animated **scan line** sweeping down inside windows.
- Glowing cyan borders/box-shadows; bars use a cyan gradient with glow.
- **Level-up** modal: gold number, rotating conic light rays, four L-shaped corner brackets, spring-in.
- Respect reduced-motion.
- Micro-interactions: checkbox "pop" on complete; XP/track bars animate width; streak fire glows.

---

## 13. Product principles (baked-in decisions — don't regress)

- **Fast first win:** board visible within ~60s of starting onboarding.
- **Focus over breadth:** 1–2 attributes, not all five.
- **Consistency over novelty:** repeating workday/rest-day templates, not 7 unique days.
- **Humane penalty:** pause and recover, never crush; especially for this audience.
- **The AI's real edge** is scheduling quests into the user's *actual* free windows around work — lean into that; generic templates are the commodity.
- **Weekly report = retention.** It's the reason to come back every week.

---

## 14. Suggested build order

1. Scaffold Expo app + fonts + design tokens + one reusable "System Window" frame component.
2. Port the pure logic (progression math §3, generators §6 local fallback, review engine §9) as framework-agnostic modules with unit tests on the math.
3. Calibration flow → local generation → main board → complete/level/streak, all on `AsyncStorage`.
4. Local notifications (reset reminder + penalty warning).
5. Serverless AI proxy; swap local generation for AI with local fallback.
6. Weekly review + System Report.
7. Polish: radar, level-up modal, animations, penalty/comeback bonus, grace-day.
8. (Later) accounts + sync + server-side reset when competition/leaderboards arrive.

Ask me before adding any backend beyond the single AI proxy in the MVP.

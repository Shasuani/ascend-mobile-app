# ASCEND — Product Vision

> Your AI life-coach that hands you a done-for-you daily plan and gets you off the
> feed — so you stop scrolling and start becoming.

---

## The problem

People don't fail from lack of willpower. They fail from lack of a **plan**. Faced
with an empty day and an infinite feed, the feed wins — hours vanish into Instagram
and TikTok. The gap between who you are and who you could be stays a gap.

## The user

Primarily young men into self-improvement — fitness, finances, a side project,
learning, discipline. The exact crowd that already loves progression stories like
Solo Leveling. They want to change; they lack structure and accountability.

## The core promise

**We remove the decisions.** Every week, the System hands you a concrete plan built
around your real schedule. Every day, you open the app and know *exactly* what to do
right now — not a blank checklist, a timed plan. You execute, you level up, and the
System pushes you one step further. Repeat until you've become the person. Then you
leave.

---

## Positioning — why we're not another RPG habit tracker

The market is crowded with **Solo-Leveling clones** and gamified habit trackers
(Habitica, MainQuest, KUBBO, LifeUp, and a swarm of "Solo X" apps). They share one
flaw: **you still decide what to do and build your own system** — they just paint XP
and stats on top of tasks you invent.

ASCEND is a different category. Not an RPG skin on a to-do list — a **done-for-you AI
coaching system that removes the decisions and gets you off the feed.** Our moat:

- **Done-for-you plan** — expert AI coaches decide *what* you do (the exact book, the
  exact workout), not you.
- **A real daily schedule**, not a checklist.
- **Personalized to your baseline** — meets you where you are, one step up.
- **An enemy and a mission** — beating the scroll, not just collecting points.
- **Built to graduate you**, not to farm your attention.
- **An original brand** — not clone #37 borrowing someone else's IP.

The game layer (levels, ranks, XP) stays — but as the *motivation*, not the product.

## The Council of Coaches (specialized AI agents)

Each life domain has its own **expert AI coach** — a distinct persona that builds
that domain's precise weekly plan. A **Head Coach ("The System")** merges their
plans into one daily, time-boxed schedule that fits the user's real free windows and
time budget (never overloads).

| Coach | Domain | What it produces |
|-------|--------|------------------|
| 📚 **The Scholar** | Mind / learning | Picks *the* book for your level & goal; sets a weekly chapter/page target |
| 💪 **The Trainer** | Body / fitness | A concrete weekly workout program (home or gym, per your access) |
| 💰 **The Strategist** | Wealth / finances | Weekly money moves: budgeting, learning, side-hustle steps |
| 🧘 **The Ascetic** | Focus / discipline | Meditation, deep-work blocks, and **anti-scroll** disciplines |
| 🥗 **The Healer** | Health / vitality | Sleep, hydration, nutrition protocols |

We start with **2–3 coaches** (Scholar + Trainer first — the clearest wins) and add
the rest with the same pattern.

**Technically:** we already have an AI proxy that generates a weekly plan from one
system prompt, with a local fallback. We generalize it into *N* specialized agent
prompts (one per coach) + the merge step. The existing **Hubs** become each coach's
home. It always degrades gracefully to on-device generation.

---

## Meet the user where they are (per-domain assessment)

**Critical rule: never assign what the user already does.** A blanket "level 0 for
everyone" is wrong — it bores the advanced and can overwhelm the true beginner.

At onboarding, each active coach runs a short "where are you now?" assessment
(e.g. Trainer: *Never / Sometimes / 2–3×/week / 4+×*). From that baseline the coach
starts the user **one step above their current level** — a stretch, not a repeat,
not a crush.

Level is tracked **per domain**, not globally: you can be advanced in fitness and a
beginner in reading. (The app already derives a separate level per attribute — this
is the foundation we build on.)

---

## The ramp: Level 0 → graduation

- Start at the **gentlest** intensity, with **one keystone coach active** (typically
  a wake + movement anchor), personalized to the user's real baseline.
- **Proving consistency wakes the next coach** — one at a time — and raises
  difficulty. The adaptive weekly review (already built) drives this: it now
  *unlocks habits*, not just raises intensity.
- **Endgame:** you reach the life you were aiming for, hit the top rank, and the
  System tells you to go live it.

## The anti-addiction principle (our soul, and our marketing)

Most apps are built to keep you hooked — absurd for an anti-scroll product. **ASCEND
is built to make you not need it.** We are genuinely happy when a graduate deletes
the app. That honesty is rare, ethical, and drives trust and word of mouth. Brand
line: *"We don't want you forever. We want you to become."*

## The anti-scroll pillar

The reason to open ASCEND instead of the feed:
- A **focus / deep-work timer** (phone-free minutes → XP).
- An **"urge attack"** button: feel like scrolling? Get a 2-minute alternative on the
  spot (push-ups, breathing, your next quest).
- A **phone-free streak** we track and celebrate.

Honest limit: an app can't truly block Instagram on iOS. We win by offering a
*better* alternative and by tracking/celebrating time reclaimed — not by force.

---

## What we keep vs. add

**Keep (already built):** the System aesthetic + holographic UI, XP / levels / ranks
derived from a completion log, adaptive weekly review, accounts, Hubs, Library,
Journal, achievements, local notifications, the AI proxy + local fallback.

**Add:** the Council of Coaches (multi-agent weekly planning), per-domain baseline
assessment, a **daily time-boxed schedule** view, the progressive coach-unlock ramp,
and the anti-scroll toolkit.

## Safety & responsibility

Fitness, health, and nutrition advice carries real-world risk. Coaches stay
**safe, beginner-appropriate, and non-extreme**, with clear disclaimers ("not
medical advice — consult a professional"). We never hand a level-0 user a risky
program. Agents run weekly, keeping AI cost low.

---

## Methodology — how real results happen (3–4 months)

Results in 3–4 months require three things true at once: **(1)** proven progressive
methods, **(2)** adherence (the game layer's job), and **(3)** measuring baseline →
now so change is *visible*. The efficacy engine:

**Measurable baselines** at onboarding, per ring — captured as numbers so we can
show change: Fire (max push-ups, can you run 1 km?), Water (pages/week, a skill
goal), Wind (do you budget? savings rate?), Earth (sleep hours, steps, meals), Void
(daily screen time, meditation?).

**Progression ladders** — each coach escalates with a proven method, not generic
tips:
- Fire → progressive overload: daily movement → structured program → *+X push-ups,
  run 5 km by week 12* (progressive resistance guarantees strength gains in 8–12 wks).
- Water → 15 pages/day → 3–4 books in 3 months + one skill milestone.
- Wind → track spending → automate savings → launch one income stream → *saved €X,
  earned first €*.
- Earth → consistent sleep window → hydration → whole-food meals → *avg sleep ↑, steps ↑*.
- Void → 10-min meditation + one deep-work block + cut 30 min screen time → *phone-free hours ↑*.

**The First Ascent — a 12-week periodized arc.** Wk 1–2: baseline + install 2
keystones (small). Wk 3–6: build consistency + one spotlight ring. Wk 7–11:
progressive overload + rotating spotlight → first visible results. Wk 12: re-test vs
baseline → the app shows "you went from X to Y."

**Visible progress** — a baseline → now dashboard plus light **monthly check-ins**
("re-measure yourself"). This is the "I see change" moment.

**Streaks (adherence signals):** a **presence streak** (consecutive days the user
opens the app — showing up is the first win against the scroll) alongside the
perfect-day streak (all of today's path cleared).

**Honest constraints:** what the app can't observe (weight, lifts, savings, screen
time) is user-logged via the light monthly check-ins. Results depend on consistency
and honest self-report. Fitness/health stays progressive, beginner-safe, disclaimed.

## First build (vertical slice)

1. **Per-domain assessment** in onboarding for the first coaches.
2. **Scholar + Trainer** agents (proxy prompts + local fallback) producing a real
   weekly plan from the user's baseline.
3. **Daily time-boxed schedule** surfacing the merged plan.
4. **Progressive unlock** wired to the weekly review.

If the slice feels right, we add the remaining coaches and the anti-scroll toolkit.

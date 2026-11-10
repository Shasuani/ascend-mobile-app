# ASCEND — Self-Improvement App

A React Native (Expo) app that turns long-term goals into a **done-for-you daily plan**. Instead of building your own system, you get a weekly plan built around your real schedule. You complete daily quests, earn XP and climb ranks, and the plan adapts to how you actually perform.

## Features

- **Calibration onboarding.** Captures your baseline and weekly schedule, then generates a personalised first week.
- **Daily quests across life domains.** A timed plan for each day, with XP, levels, rank tiers and an attribute radar chart.
- **Adaptive weekly review.** Difficulty goes up or down based on your real completion rate. Missed days cost a small amount of XP, never a full reset.
- **AI plan generation with offline fallback.** When an AI proxy is configured, weekly plans and recaps are generated with Claude. Otherwise an on-device generator produces them, so the app works **100% offline**.
- **Secure AI proxy.** A Cloudflare Worker ([`proxy/`](proxy)) holds the API key, so it never ships in the mobile client.
- **Library, journal and journey views.** Curated self-improvement books, daily reflections and a history of your progress.
- **Local accounts with per-account progress,** persisted with AsyncStorage, and **local notifications** for reminders.

## Tech stack

React Native 0.81 · Expo SDK 54 · React 19 · react-native-svg · AsyncStorage · Expo Notifications · Jest (`jest-expo`) · Cloudflare Workers

## Architecture

```
App.js
src/
├── screens/      # Auth, Calibration, Main, Journal, Journey, Library, Hubs
├── components/   # SystemWindow, XpBar, AttributeRadar, LevelUpModal, …
├── logic/        # pure game logic: progression, tiers, review, penalty, achievements
│   └── __tests__/   # Jest unit tests for the core rules
├── ai/           # weekly plan + recap generation (AI proxy or local fallback)
├── state/        # store context, persistence, default state
├── auth/         # local accounts
└── theme/        # design tokens
proxy/            # Cloudflare Worker that calls the Anthropic Messages API
```

The game rules live in **pure, framework-free modules** under `src/logic/`. This keeps them unit-testable and independent of the UI.

## Getting started

```bash
npm install
npm start         # Expo dev server: scan the QR code with Expo Go
npm test          # run the unit tests
```

To enable AI-generated plans, deploy the worker in [`proxy/`](proxy/README.md) and set `AI_PROXY_URL` in `src/config.js`.

More background on the product idea is in [VISION.md](VISION.md).

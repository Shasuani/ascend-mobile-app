// Design system — the visual signature of ASCEND.
// Dark holographic "System" interface: void background, glowing cyan, angular frames.
// Palette values come straight from the product spec (§12).

// FORGE palette — molten amber signature accent on a near-black ground.
// NOTE: the accent keys are still named `cyan*` for backwards-compat with all the
// components that reference them; they now hold the Forge orange values. (Rename to
// `accent*` later if desired — a pure find/replace.)
export const colors = {
  void: '#08090d',       // deepest background (near-black)
  panel: '#12141d',      // window background
  panel2: '#191c27',     // raised window background
  line: '#2a2e3a',       // primary border
  line2: '#1a1e27',      // faint divider

  cyan: '#ff6a2c',       // FORGE primary accent / glow (molten orange)
  cyanDim: '#c2531f',    // secondary / dimmer accent
  cyanDeep: '#4a1e0e',   // deep ember (fills, tracks)

  red: '#ff3d5e',        // warnings, penalty
  gold: '#ffcf5c',       // level-up, boss
  green: '#43e6a0',      // success, vitality

  text: '#eaf0f8',       // primary text
  muted: '#8b93a6',      // secondary text

  cyanBright: '#ffb24c', // highlight / hottest part of a glow (amber)
  ink: '#0a0705',        // near-black for text on bright fills
};

// Gradient stop pairs used across panels, bars, buttons, and badges.
export const gradients = {
  panel: ['#161822', '#0c0e15'],       // window fill
  panelHot: ['#221d16', '#12100c'],    // raised / active window fill
  cyan: ['#ffb24c', '#ff6a2c'],        // buttons, badges (amber → orange)
  cyanFill: ['#ff9d5c', '#4a1e0e'],    // progress-bar fill
  gold: ['#ffe6a0', '#d99a20'],        // level-up / boss
  red: ['#ff7089', '#c01530'],         // penalty
  screen: ['#0b0d14', '#050608'],      // app background base
};

// Consistent neon glow (iOS shadow + Android elevation).
export function glow(color = '#ff6a2c', radius = 14, opacity = 0.55) {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  };
}

// The five attributes (§2). Order is fixed and used everywhere (radar, bars, tags).
export const ATTRS = {
  STR:  { key: 'STR',  label: 'Strength',     domain: 'Body',      accent: '#ff8a5c' },
  INT:  { key: 'INT',  label: 'Intelligence', domain: 'Mind',      accent: '#7aa8ff' },
  WLTH: { key: 'WLTH', label: 'Wealth',       domain: 'Finances',  accent: '#ffcf5c' },
  VIT:  { key: 'VIT',  label: 'Vitality',     domain: 'Health',    accent: '#43e6a0' },
  FOC:  { key: 'FOC',  label: 'Focus',        domain: 'Discipline',accent: '#c98aff' },
};

// Canonical attribute order — reused by the radar, attribute panel, and defaults.
export const ATTR_ORDER = ['STR', 'INT', 'WLTH', 'VIT', 'FOC'];

// Shared spacing / radius scale so every screen feels like one system.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 4, md: 8 };

// Font family names — must match the keys used when loading fonts in App.js.
export const fonts = {
  display: 'Rajdhani_600SemiBold',  // headers / labels / body (condensed HUD)
  displayBold: 'Rajdhani_700Bold',
  body: 'Rajdhani_500Medium',
  mono: 'ShareTechMono_400Regular', // all numbers / XP / timers
};

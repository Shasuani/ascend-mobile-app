// Design system — the visual signature of ASCEND.
// Musashi / ink direction: near-black ground, a single blood-crimson accent (hinomaru),
// bone-white text, elegant serif + mono. Palette matched to the Musashi prototype.
//
// NOTE: the accent keys are still named `cyan*` for backwards-compat with every
// component that references them; they now hold the Crimson values. (Rename to
// `accent*` later if desired — a pure find/replace.)
export const colors = {
  ground: '#050403',     // deepest base (behind everything)
  void: '#0c0908',       // screen / app ground
  panel: '#100c0a',      // flat card / inset
  panel2: '#15100e',     // raised card (top of the card gradient)
  card: '#0e0a09',       // list-row background
  line: '#2b211c',       // primary border (warm-tinted)
  line2: '#1c1512',      // faint divider / track

  cyan: '#e01e37',       // CRIMSON primary accent / glow (blood red)
  cyanDim: '#d0495a',    // dimmer crimson — readable secondary
  cyanDeep: '#1c0d10',   // deep blood (crimson-tinted fills / bg)
  cyanBright: '#f0455a', // highlight / hover crimson
  crimsonLine: '#4a1420',// crimson-tinted border (trial, badges)

  red: '#e01e37',        // warnings, penalty (same crimson family)
  gold: '#e01e37',       // level-up / boss — single-accent design, folds into crimson
  green: '#43e6a0',      // success, vitality (rare positive)

  text: '#ece3d2',       // bone / shironeri primary text
  text2: '#c9bda9',      // secondary reading text
  text3: '#d6cab6',      // slightly brighter secondary
  muted: '#6b5f52',      // mono micro-labels / captions
  muted2: '#9a8d7b',     // italic secondary (ring meanings, subtitles)
  muted3: '#a89a86',     // stage subtitle italic
  faint: '#4a3f36',      // faintest strokes / chevrons

  ink: '#0c0908',        // dark text on crimson fills
};

// Gradient stop pairs used across panels, bars, buttons, and badges.
export const gradients = {
  panel: ['#15100e', '#0c0908'],       // window fill (150deg)
  panelHot: ['#1c0d10', '#0c0908'],    // crimson-tinted window (weekly trial)
  cyan: ['#e01e37', '#e01e37'],        // solid crimson button
  cyanFill: ['#e01e37', '#e01e37'],    // progress-bar fill
  gold: ['#e01e37', '#e01e37'],        // level-up / boss (folds into crimson)
  red: ['#e01e37', '#c01530'],         // penalty
  screen: ['#1a1310', '#0a0705', '#050403'], // app background base
};

// A restrained accent glow (iOS shadow + Android elevation). Kept subtle — this is
// an ink world, not a neon HUD.
export function glow(color = '#e01e37', radius = 9, opacity = 0.3) {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  };
}

// The five attributes (§2). Order is fixed and used everywhere (rings, bars, tags).
// Single-accent design: every ring glows the same crimson. `ring` = Musashi element.
export const ATTRS = {
  STR:  { key: 'STR',  label: 'Strength',     domain: 'Body',       accent: '#e01e37' },
  INT:  { key: 'INT',  label: 'Intelligence', domain: 'Mind',       accent: '#e01e37' },
  WLTH: { key: 'WLTH', label: 'Wealth',       domain: 'Finances',   accent: '#e01e37' },
  VIT:  { key: 'VIT',  label: 'Vitality',     domain: 'Health',     accent: '#e01e37' },
  FOC:  { key: 'FOC',  label: 'Focus',        domain: 'Discipline', accent: '#e01e37' },
};

// Canonical attribute order — reused by the rings, attribute panel, and defaults.
export const ATTR_ORDER = ['STR', 'INT', 'WLTH', 'VIT', 'FOC'];

// Shared spacing / radius scale so every screen feels like one system.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 0, md: 0 }; // the prototype is square-edged — no rounding

// Font family names — must match the keys used when loading fonts in App.js.
// Musashi/ink direction: an elegant serif carries titles + wisdom; JetBrains Mono
// carries data (times, counts, XP, labels); Noto Serif JP carries the kanji.
export const fonts = {
  serif: 'EBGaramond_600SemiBold',             // titles, name, headings
  serifMed: 'EBGaramond_500Medium',
  serifItalic: 'EBGaramond_400Regular_Italic', // Dokkōdō precepts (the wisdom voice)
  mono: 'JetBrainsMono_500Medium',             // data: numbers / times / XP / labels
  monoBold: 'JetBrainsMono_600SemiBold',
  kanji: 'NotoSerifJP_600SemiBold',            // brush-serif kanji
  kanjiHeavy: 'NotoSerifJP_900Black',          // heavy display kanji (昇, 試)
  body: 'System',                              // clean neutral sans for reading text
  // legacy (still loaded, used by a few micro-labels)
  display: 'Rajdhani_600SemiBold',
  displayBold: 'Rajdhani_700Bold',
};

// Samurai framing on top of the level/attribute engine.
//   - Stages of mastery replace the E–S "rank" display.
//   - Musashi's Five Rings map onto the five domains.
//   - Each domain has an expert "coach" (the Council of Coaches, per VISION.md).

// Stages, low → high. kanji = the traditional glyph shown inside the ensō.
export const STAGES = [
  { name: 'Student',     kanji: '初', title: 'The beginner’s mind', min: 0,  index: 1 },
  { name: 'Ronin',       kanji: '浪', title: 'The masterless',           min: 10, index: 2 },
  { name: 'Adept',       kanji: '練', title: 'The tempered',             min: 20, index: 3 },
  { name: 'Master',      kanji: '達', title: 'The arrived',              min: 30, index: 4 },
  { name: 'Grandmaster', kanji: '聖', title: 'The sword-saint',          min: 40, index: 5 },
];

// Stage of mastery from player level.
export function stageForLevel(level) {
  let stage = STAGES[0];
  for (const s of STAGES) if (level >= s.min) stage = s;
  return stage;
}

// The next stage above the current one (or the top stage if already there).
export function nextStage(level) {
  const cur = stageForLevel(level);
  return STAGES[Math.min(cur.index, STAGES.length - 1)];
}

// Musashi's Five Rings ↔ the five attributes.
export const RINGS = {
  STR: 'Fire',   // Body / action
  INT: 'Water',  // Mind / adaptability
  WLTH: 'Wind',  // Wealth / the world
  VIT: 'Earth',  // Health / foundation
  FOC: 'Void',   // Focus / stillness
};

// Ring kanji + the one-line meaning shown on the Five Rings screen.
export const RING_KANJI = { STR: '火', INT: '水', WLTH: '風', VIT: '地', FOC: '空' };
export const RING_MEANING = {
  STR: 'Intensity in the deed',
  INT: 'Adaptable, formless',
  WLTH: 'Knowing other ways',
  VIT: 'The unshaken foundation',
  FOC: 'Beyond form and thought',
};

// The Council of Coaches — the expert persona that owns each domain (VISION.md).
export const COACH = {
  STR: 'TRAINER',
  INT: 'SCHOLAR',
  WLTH: 'STRATEGIST',
  VIT: 'HEALER',
  FOC: 'ASCETIC',
};

export function ringFor(attr) {
  return RINGS[attr] || 'Void';
}

export function ringKanji(attr) {
  return RING_KANJI[attr] || '空';
}

export function coachFor(attr) {
  return COACH[attr] || 'THE SYSTEM';
}

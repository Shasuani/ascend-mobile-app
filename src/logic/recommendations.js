// Personalized book recommendations (pure, testable). Ranks the library by how
// well each book matches the user's focus attributes and goal text.

import { BOOKS } from '../data/books';

function scoreBook(book, focusAreas = [], goalWords = []) {
  let score = 0;
  if (focusAreas.includes(book.domain)) score += 10; // matches a chosen focus
  for (const w of goalWords) {
    if (!w) continue;
    if (book.tags.some((t) => t.includes(w) || w.includes(t))) score += 4;
    if (book.title.toLowerCase().includes(w)) score += 2;
  }
  return score;
}

function goalToWords(goalText) {
  return (goalText || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4); // ignore short filler words
}

// Ranked recommendations, excluding books already on the shelf.
// Returns [{ ...book, score }] sorted best-first (stable for equal scores).
export function recommendBooks(profile, shelfIds = [], limit = 6) {
  const goalWords = goalToWords(profile?.goalText);
  const focus = profile?.focusAreas || [];
  const scored = BOOKS.filter((b) => !shelfIds.includes(b.id)).map((b, i) => ({
    ...b,
    score: scoreBook(b, focus, goalWords),
    _i: i,
  }));
  scored.sort((a, b) => (b.score - a.score) || (a._i - b._i));
  return scored.slice(0, limit).map(({ _i, ...b }) => b);
}

// Group the remaining (un-shelved) books by domain for a browse section.
export function booksByDomain(shelfIds = []) {
  const groups = {};
  for (const b of BOOKS) {
    if (shelfIds.includes(b.id)) continue;
    (groups[b.domain] = groups[b.domain] || []).push(b);
  }
  return groups;
}

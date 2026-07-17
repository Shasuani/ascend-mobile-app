// Local-time date helpers. The app trusts device time at MVP (no server).

const DOW = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

// "YYYY-MM-DD" key in LOCAL time (not UTC), used to index the progress log.
export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Two-letter weekday code (MO..SU) matching the onboarding work-day selector.
export function dayCode(d = new Date()) {
  return DOW[d.getDay()];
}

// Milliseconds until the next local midnight — powers the reset countdown.
export function msUntilMidnight(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

// Returns the date `n` days before `d` (n may be negative for the future).
export function daysAgo(n, d = new Date()) {
  const out = new Date(d);
  out.setDate(out.getDate() - n);
  return out;
}

// Number of whole days between two date keys (b - a).
export function daysBetween(aKey, bKey) {
  const a = new Date(aKey + 'T00:00:00');
  const b = new Date(bKey + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

// "HH:MM" -> minutes since midnight; null-safe.
export function timeToMinutes(hhmm) {
  if (!hhmm || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// minutes since midnight -> "HH:MM"
export function minutesToTime(mins) {
  const clamped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

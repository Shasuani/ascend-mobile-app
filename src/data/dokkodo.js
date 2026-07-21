// The Dokkōdō ("The Path of Aloneness") — Miyamoto Musashi's 21 precepts, written
// days before his death in 1645 (public domain). One is shown per day as the
// System's directive — and its anti-desire spirit is our anti-scroll creed.

export const DOKKODO = [
  'Accept everything just the way it is.',
  'Do not seek pleasure for its own sake.',
  'Do not, under any circumstances, depend on a partial feeling.',
  'Think lightly of yourself and deeply of the world.',
  'Be detached from desire your whole life long.',
  'Do not regret what you have done.',
  'Never be jealous.',
  'Never let yourself be saddened by a separation.',
  'Resentment and complaint are appropriate neither for oneself nor others.',
  'Do not let yourself be guided by the feeling of lust or love.',
  'In all things have no preferences.',
  'Be indifferent to where you live.',
  'Do not pursue the taste of good food.',
  'Do not hold on to possessions you no longer need.',
  'Do not act following customary beliefs.',
  'Do not collect weapons or practice with weapons beyond what is useful.',
  'Do not fear death.',
  'Do not seek to possess either goods or fiefs for your old age.',
  'Respect the gods without counting on their help.',
  'You may abandon your own body, but you must preserve your honour.',
  'Never stray from the Way.',
];

// Deterministic precept for a given day (changes ~daily). Returns { text, number }.
export function preceptForToday(dateKeyStr) {
  let sum = 0;
  for (let i = 0; i < (dateKeyStr || '').length; i++) sum += dateKeyStr.charCodeAt(i);
  const idx = sum % DOKKODO.length;
  return { text: DOKKODO[idx], number: idx + 1 };
}

// Roman numeral for 1..21 (the precept index), e.g. 4 → "IV".
export function romanize(n) {
  const map = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  let v = n;
  for (const [val, sym] of map) while (v >= val) { out += sym; v -= val; }
  return out;
}

// Kanji numeral for 1..21, e.g. 4 → "四", 21 → "廿一".
export function kanjiNum(n) {
  const d = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (n <= 10) return n === 10 ? '十' : d[n];
  if (n < 20) return '十' + d[n - 10];
  if (n === 20) return '廿';
  return '廿' + d[n - 20];
}

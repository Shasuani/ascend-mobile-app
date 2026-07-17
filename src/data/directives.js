// A pool of short "System Directives" — flavor lines shown on the home screen.
// One is chosen per day (deterministic) so it feels alive without being random.

export const DIRECTIVES = [
  'Discipline is a weapon. Sharpen it daily.',
  'The gap between who you are and who you could be is called work.',
  'Motivation fades. The System does not.',
  'You are not behind. You are exactly one action from progress.',
  'Comfort is the enemy. Seek the harder path.',
  'Small quests, repeated, become a different man.',
  'The Player who shows up on the worst day levels fastest.',
  'Weakness is temporary. So is the effort to remove it.',
  'Do not negotiate with the quest. Execute it.',
  'Consistency is the rarest stat. Train it.',
  'Every completed quest is evidence you can be trusted.',
  'The System rewards action, never intention.',
  'Rest is earned, then taken — not the reverse.',
  'You have survived every hard day so far. Continue.',
];

// Deterministic pick based on the calendar day so it changes ~daily.
export function directiveForToday(dateKeyStr) {
  let sum = 0;
  for (let i = 0; i < (dateKeyStr || '').length; i++) sum += dateKeyStr.charCodeAt(i);
  return DIRECTIVES[sum % DIRECTIVES.length];
}

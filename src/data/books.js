// Curated self-improvement library. Each book is tagged with a `domain`
// (which attribute it speaks to — used for personalized recommendations) and a
// keyword list matched against the user's goal text. Reading any book always
// rewards Intelligence XP (reading = learning), `xp` scaled to length.

export const BOOKS = [
  // ---- Mind / Learning (INT) ----
  { id: 'deep-work', title: 'Deep Work', author: 'Cal Newport', domain: 'INT', pages: 296, xp: 150,
    blurb: 'Focused success in a distracted world — train the ability to concentrate.', tags: ['focus', 'learning', 'productivity'] },
  { id: 'ultralearning', title: 'Ultralearning', author: 'Scott Young', domain: 'INT', pages: 304, xp: 150,
    blurb: 'Aggressive self-directed learning strategies to master hard skills fast.', tags: ['learning', 'skills', 'career'] },
  { id: 'make-it-stick', title: 'Make It Stick', author: 'Brown, Roediger', domain: 'INT', pages: 336, xp: 160,
    blurb: 'The science of successful learning and memory that actually lasts.', tags: ['learning', 'memory', 'study'] },
  { id: 'range', title: 'Range', author: 'David Epstein', domain: 'INT', pages: 352, xp: 160,
    blurb: 'Why generalists triumph in a specialized world.', tags: ['learning', 'career'] },

  // ---- Discipline / Focus (FOC) ----
  { id: 'atomic-habits', title: 'Atomic Habits', author: 'James Clear', domain: 'FOC', pages: 320, xp: 160,
    blurb: 'Tiny changes, remarkable results — the definitive habit-building system.', tags: ['habits', 'discipline', 'systems'] },
  { id: 'discipline-destiny', title: 'Discipline Is Destiny', author: 'Ryan Holiday', domain: 'FOC', pages: 320, xp: 160,
    blurb: 'Self-control as the foundation of a life well lived.', tags: ['discipline', 'stoicism'] },
  { id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', domain: 'FOC', pages: 256, xp: 130,
    blurb: 'The private notes of a Roman emperor on virtue and self-mastery.', tags: ['stoicism', 'discipline', 'mindset'] },
  { id: 'war-of-art', title: 'The War of Art', author: 'Steven Pressfield', domain: 'FOC', pages: 190, xp: 100,
    blurb: 'Break through resistance and do the work you were meant to do.', tags: ['discipline', 'creativity'] },
  { id: 'dopamine-nation', title: 'Dopamine Nation', author: 'Anna Lembke', domain: 'FOC', pages: 304, xp: 150,
    blurb: 'Finding balance in the age of indulgence and cheap dopamine.', tags: ['discipline', 'focus', 'health'] },

  // ---- Wealth / Finances (WLTH) ----
  { id: 'psychology-money', title: 'The Psychology of Money', author: 'Morgan Housel', domain: 'WLTH', pages: 256, xp: 130,
    blurb: 'Timeless lessons on wealth, greed, and lasting happiness.', tags: ['money', 'finance', 'investing'] },
  { id: 'i-will-teach', title: 'I Will Teach You to Be Rich', author: 'Ramit Sethi', domain: 'WLTH', pages: 352, xp: 160,
    blurb: 'A practical 6-week program for automating money and living rich.', tags: ['money', 'finance', 'saving'] },
  { id: 'millionaire-fastlane', title: 'The Millionaire Fastlane', author: 'MJ DeMarco', domain: 'WLTH', pages: 336, xp: 160,
    blurb: 'Reject slow-lane thinking and build wealth through business.', tags: ['money', 'business', 'online', 'earning'] },
  { id: 'your-money-life', title: 'Your Money or Your Life', author: 'Robin, Dominguez', domain: 'WLTH', pages: 400, xp: 170,
    blurb: 'Transform your relationship with money and achieve independence.', tags: ['money', 'finance', 'freedom'] },

  // ---- Body / Training (STR) ----
  { id: 'bigger-leaner', title: 'Bigger Leaner Stronger', author: 'Michael Matthews', domain: 'STR', pages: 480, xp: 170,
    blurb: 'A simple science-based approach to building muscle and losing fat.', tags: ['fitness', 'muscle', 'lean', 'training'] },
  { id: 'cant-hurt-me', title: "Can't Hurt Me", author: 'David Goggins', domain: 'STR', pages: 364, xp: 160,
    blurb: 'Master your mind and defy the odds through relentless effort.', tags: ['discipline', 'fitness', 'mindset'] },
  { id: 'comfort-crisis', title: 'The Comfort Crisis', author: 'Michael Easter', domain: 'STR', pages: 320, xp: 150,
    blurb: 'Embrace discomfort to reclaim a wild, healthy, happy self.', tags: ['fitness', 'health', 'discipline'] },

  // ---- Health / Vitality (VIT) ----
  { id: 'why-we-sleep', title: 'Why We Sleep', author: 'Matthew Walker', domain: 'VIT', pages: 368, xp: 160,
    blurb: 'Unlocking the power of sleep and dreams for health and performance.', tags: ['sleep', 'health', 'recovery'] },
  { id: 'outlive', title: 'Outlive', author: 'Peter Attia', domain: 'VIT', pages: 496, xp: 180,
    blurb: 'The science and art of longevity — living better, longer.', tags: ['health', 'longevity', 'fitness'] },
  { id: 'breath', title: 'Breath', author: 'James Nestor', domain: 'VIT', pages: 304, xp: 150,
    blurb: 'The new science of a lost art — how you breathe changes everything.', tags: ['health', 'recovery', 'calm'] },
];

export function bookById(id) {
  return BOOKS.find((b) => b.id === id) || null;
}

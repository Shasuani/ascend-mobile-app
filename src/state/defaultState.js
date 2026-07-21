// The single on-device state blob (§10). One JSON object, one storage key.

export const STORAGE_KEY = 'ascend.state.v1';

export function makeDefaultState() {
  return {
    name: 'PLAYER',
    calibrated: false,
    profile: {
      focusAreas: [],
      workDays: [],
      wake: '06:30',
      workStart: '08:00',
      workEnd: '17:00',
      sleep: '23:00',
      dailyMinutes: 60,
      tier: 'C',
      goalText: '',
      constraints: [],
    },
    week: null, // { workday, restday, boss, note, source, generatedAt }
    registry: {}, // qid -> { title, attr, xp } — every quest ever, for XP lookup
    progress: {}, // "YYYY-MM-DD" -> { qid:true, __assigned:[ids] }
    library: { shelf: {} }, // bookId -> { pages, pagesRead, finished, finishedAt, added }
    practices: { done: {} }, // practiceId -> true (completed attribute challenges)
    journal: {}, // "YYYY-MM-DD" -> reflection text
    pointsSpent: { STR: 0, INT: 0, WLTH: 0, VIT: 0, FOC: 0 },
    penaltyXp: 0,
    streak: 0,          // perfect-day streak: all of today's path cleared
    longestStreak: 0,
    lastStreakDate: null,
    visitStreak: 0,     // presence streak: consecutive days the app was opened
    longestVisitStreak: 0,
    lastVisitDate: null,
    lastActiveDate: null,
    penalty: { active: false, message: '' },
    bossClaimedDate: null,  // last Weekly Trial claim — gates re-claiming to once/week
    comebackPending: false, // set on a miss; grants bonus XP on return (§8)
    lastGraceDate: null,    // last auto grace-day used (once/week) (§8)
    lastReviewDate: null,
    reviewCount: 0,
    sustainedHighWeeks: 0,
    lastReport: null,
  };
}

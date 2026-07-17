// Attribute "practices" — one-time challenges that deepen each domain and award
// that attribute's XP when completed. Intelligence uses the Library (books)
// instead, so it has no practices here.

export const PRACTICES = {
  STR: [
    { id: 'str-100pushups', attr: 'STR', title: '100 push-ups challenge', xp: 60, desc: 'Complete 100 push-ups today, in as many sets as needed.' },
    { id: 'str-5krun', attr: 'STR', title: 'Run 5 kilometers', xp: 70, desc: 'One continuous 5K run, or your longest run yet.' },
    { id: 'str-plank5', attr: 'STR', title: '5-minute plank total', xp: 50, desc: 'Accumulate five minutes of plank across the day.' },
    { id: 'str-week-gym', attr: 'STR', title: 'Train 4x this week', xp: 90, desc: 'Four resistance sessions in seven days.' },
    { id: 'str-pullups', attr: 'STR', title: 'First unassisted pull-up', xp: 80, desc: 'Achieve one strict pull-up (or add one rep to your max).' },
  ],
  WLTH: [
    { id: 'wl-budget', attr: 'WLTH', title: 'Build a monthly budget', xp: 70, desc: 'List income and every expense category for the month.' },
    { id: 'wl-nospend', attr: 'WLTH', title: 'No-spend day', xp: 40, desc: 'Spend nothing beyond essentials for a full day.' },
    { id: 'wl-sidehustle', attr: 'WLTH', title: 'Launch a side income', xp: 120, desc: 'Publish a gig, listing, or offer that could earn money.' },
    { id: 'wl-invest', attr: 'WLTH', title: 'Open an investment account', xp: 90, desc: 'Set up a brokerage or index-fund account.' },
    { id: 'wl-subs', attr: 'WLTH', title: 'Cancel 2 subscriptions', xp: 40, desc: 'Cut two recurring costs you do not need.' },
  ],
  VIT: [
    { id: 'vit-sleep7', attr: 'VIT', title: '7 nights, 7+ hours', xp: 90, desc: 'Sleep at least seven hours for seven nights straight.' },
    { id: 'vit-water', attr: 'VIT', title: 'Hydration week', xp: 60, desc: 'Hit your water target every day for a week.' },
    { id: 'vit-nosugar', attr: 'VIT', title: 'No added sugar, 3 days', xp: 60, desc: 'Three days with zero added sugar.' },
    { id: 'vit-walk10k', attr: 'VIT', title: '10,000 steps', xp: 40, desc: 'Reach ten thousand steps in a day.' },
    { id: 'vit-cook', attr: 'VIT', title: 'Cook 5 meals from scratch', xp: 70, desc: 'Prepare five whole-food meals yourself.' },
  ],
  FOC: [
    { id: 'foc-meditate7', attr: 'FOC', title: 'Meditate 7 days', xp: 80, desc: 'Ten minutes of meditation daily for a week.' },
    { id: 'foc-digitaldetox', attr: 'FOC', title: 'Digital detox day', xp: 70, desc: 'One day with no social media.' },
    { id: 'foc-coldshower', attr: 'FOC', title: '7 cold showers', xp: 60, desc: 'End your shower cold, every day for a week.' },
    { id: 'foc-deepwork', attr: 'FOC', title: '90-minute deep work block', xp: 60, desc: 'One uninterrupted, phone-free focus session.' },
    { id: 'foc-wake', attr: 'FOC', title: 'Wake at target, 5 days', xp: 70, desc: 'Hit your wake time five days running.' },
  ],
};

export function practicesFor(attr) {
  return PRACTICES[attr] || [];
}

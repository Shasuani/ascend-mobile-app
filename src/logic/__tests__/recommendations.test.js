import { recommendBooks, booksByDomain } from '../recommendations';

describe('recommendBooks', () => {
  test('ranks focus-area domains first', () => {
    const recs = recommendBooks({ focusAreas: ['WLTH'], goalText: '' }, [], 3);
    expect(recs.every((b) => b.domain === 'WLTH')).toBe(true);
  });

  test('goal keywords boost matching books', () => {
    const recs = recommendBooks({ focusAreas: [], goalText: 'start earning online' }, [], 5);
    // "The Millionaire Fastlane" is tagged online/earning/business.
    expect(recs.map((b) => b.id)).toContain('millionaire-fastlane');
  });

  test('excludes books already on the shelf', () => {
    const recs = recommendBooks({ focusAreas: ['INT'], goalText: '' }, ['deep-work'], 10);
    expect(recs.map((b) => b.id)).not.toContain('deep-work');
  });

  test('respects the limit', () => {
    expect(recommendBooks({ focusAreas: [], goalText: '' }, [], 4)).toHaveLength(4);
  });
});

describe('booksByDomain', () => {
  test('groups un-shelved books by domain', () => {
    const groups = booksByDomain([]);
    expect(Object.keys(groups)).toEqual(expect.arrayContaining(['INT', 'WLTH', 'STR', 'VIT', 'FOC']));
    expect(groups.INT.length).toBeGreaterThan(0);
  });
});

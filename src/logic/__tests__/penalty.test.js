import { penaltyAmount } from '../penalty';

describe('penaltyAmount', () => {
  test('tier base plus level scaling', () => {
    expect(penaltyAmount('E', 0)).toBe(15); // 15 + 0
    expect(penaltyAmount('C', 10)).toBe(70); // 40 + 30
    expect(penaltyAmount('S', 5)).toBe(105); // 90 + 15
  });

  test('unknown tier falls back to the C base', () => {
    expect(penaltyAmount('Z', 0)).toBe(40);
  });
});

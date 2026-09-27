const { applyDiscount } = require('../../src/applyDiscount');

describe('applyDiscount(price, percent)', () => {
  describe('normal cases', () => {
    test.each([
      [100, 20, 80],
      [49.99, 10, 44.99], // 44.991 -> rounded to 2 dp
      [19.99, 15, 16.99], // 16.9915 -> rounded to 2 dp
    ])('applyDiscount(%p, %p) returns %p', (price, percent, expected) => {
      expect(applyDiscount(price, percent)).toBe(expected);
    });
  });

  describe('boundary values', () => {
    test('0% (lower bound, inclusive) returns the original price', () => {
      expect(applyDiscount(49.99, 0)).toBe(49.99);
    });

    test('100% (upper bound, inclusive) returns 0', () => {
      expect(applyDiscount(49.99, 100)).toBe(0);
    });

    test('just below the lower bound (-0.01%) throws', () => {
      expect(() => applyDiscount(100, -0.01)).toThrow('Invalid discount');
    });

    test('just above the upper bound (100.01%) throws', () => {
      expect(() => applyDiscount(100, 100.01)).toThrow('Invalid discount');
    });
  });

  describe('invalid input', () => {
    test.each([-10, 150])('out-of-range percent %p throws "Invalid discount"', (percent) => {
      expect(() => applyDiscount(100, percent)).toThrow(new Error('Invalid discount'));
    });

    // Known defect: NaN fails both range comparisons, so a non-numeric percent slips through the
    // guard and the function returns NaN. test.failing passes while the defect exists and fails
    // once it is fixed, which is the reminder to turn this into a normal test.
    test.failing.each(['abc', undefined, NaN])('non-numeric percent %p should throw (currently returns NaN)', (percent) => {
      expect(() => applyDiscount(100, percent)).toThrow('Invalid discount');
    });
  });
});

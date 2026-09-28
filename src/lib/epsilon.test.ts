import { describe, expect, it } from 'vitest';
import { phanTuDauTienVuot } from './epsilon';

describe('phanTuDauTienVuot', () => {
  it('là n nhỏ nhất với 1/n < ε', () => {
    for (const eps of [0.6, 0.5, 0.3, 0.2, 0.1, 0.07, 0.02, 0.001]) {
      const n = phanTuDauTienVuot(eps);
      expect(1 / n).toBeLessThan(eps);
      if (n > 1) expect(1 / (n - 1)).toBeGreaterThanOrEqual(eps);
    }
  });
  it('ví dụ cụ thể', () => {
    expect(phanTuDauTienVuot(0.2)).toBe(6); // 1/5 = 0,2 chưa nhỏ hơn 0,2
    expect(phanTuDauTienVuot(0.1)).toBe(11);
    expect(phanTuDauTienVuot(0.6)).toBe(2);
  });
  it('ε phải dương', () => {
    expect(() => phanTuDauTienVuot(0)).toThrow();
    expect(() => phanTuDauTienVuot(-1)).toThrow();
  });
});

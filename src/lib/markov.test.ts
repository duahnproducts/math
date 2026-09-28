import { describe, expect, it } from 'vitest';
import { nhanVector } from './ma-tran';
import { P_VI_DU_2_9_1, dayTrangThai, laNgauNhien } from './markov';

describe('xích Markov của §2.9', () => {
  it('Ví dụ 2.9.1: s₁, s₂, s₃ đúng như sách, s₇ ≈ (0.19998, 0.80002)', () => {
    const s = dayTrangThai(P_VI_DU_2_9_1, [0.5, 0.5], 7);
    expect(s[1]).toEqual([0.125, 0.875]);
    expect(s[2]).toEqual([0.21875, 0.78125]);
    expect(s[3]).toEqual([0.1953125, 0.8046875]);
    expect(s[7][0]).toBeCloseTo(0.19998, 5);
    expect(s[7][1]).toBeCloseTo(0.80002, 5);
  });

  it('Ví dụ 2.9.1: s = (0.2, 0.8) là vector trạng thái dừng', () => {
    const s = nhanVector(P_VI_DU_2_9_1, [0.2, 0.8]);
    expect(s[0]).toBeCloseTo(0.2, 12);
    expect(s[1]).toBeCloseTo(0.8, 12);
  });

  it('Ví dụ 2.9.3: bầy sói ở R₁ vào thứ Năm với xác suất 11/32', () => {
    const P = [
      [1 / 2, 1 / 4, 1 / 4],
      [0, 1 / 2, 1 / 4],
      [1 / 2, 1 / 4, 1 / 2],
    ];
    expect(laNgauNhien(P)).toBe(true);
    expect(dayTrangThai(P, [1, 0, 0], 3)[3]).toEqual([11 / 32, 6 / 32, 15 / 32]);
  });

  it('Ví dụ 2.9.4: súp bò sau hai ngày 2/3, dài hạn (0.4, 0.3, 0.3)', () => {
    const P = [
      [0, 2 / 3, 2 / 3],
      [1 / 2, 0, 1 / 3],
      [1 / 2, 1 / 3, 0],
    ];
    expect(laNgauNhien(P)).toBe(true);
    const s2 = dayTrangThai(P, [1, 0, 0], 2)[2];
    expect(s2[0]).toBeCloseTo(2 / 3, 12);
    expect(s2[1]).toBeCloseTo(1 / 6, 12);
    const dai = dayTrangThai(P, [1, 0, 0], 200)[200];
    [0.4, 0.3, 0.3].forEach((x, i) => expect(dai[i]).toBeCloseTo(x, 9));
  });

  it('ma trận có cột không cộng thành 1 thì không ngẫu nhiên', () => {
    expect(laNgauNhien([[0.5, 1], [0.4, 0]])).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { MA_TRAN_KE_2_3, cacCanh, demDuongDi, luyThua } from './do-thi';

describe('đồ thị có hướng của §2.3', () => {
  const A = MA_TRAN_KE_2_3;

  it('lũy thừa khớp A², A³ in trong sách', () => {
    expect(luyThua(A, 2)).toEqual([
      [2, 1, 1],
      [2, 1, 0],
      [1, 1, 0],
    ]);
    expect(luyThua(A, 3)).toEqual([
      [4, 2, 1],
      [3, 2, 1],
      [2, 1, 1],
    ]);
  });

  it('hình có đúng 5 cạnh: khuyên ở v₁, v₁ ⇄ v₂, v₃ → v₂, v₁ → v₃', () => {
    expect(cacCanh(A)).toEqual([
      { tu: 0, den: 0 },
      { tu: 1, den: 0 },
      { tu: 0, den: 1 },
      { tu: 2, den: 1 },
      { tu: 0, den: 2 },
    ]);
  });

  it('Định lý 2.3.6: phần tử (i, j) của A^r là số r-đường v_j → v_i', () => {
    for (let r = 1; r <= 5; r++) {
      const Ar = luyThua(A, r);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(Ar[i][j]).toBe(demDuongDi(A, r, j, i));
    }
    // Ví dụ trong sách: hai 2-đường v₁ → v₂, không có 2-đường v₃ → v₂
    expect(demDuongDi(A, 2, 0, 1)).toBe(2);
    expect(demDuongDi(A, 2, 2, 1)).toBe(0);
  });

  it('r phải ≥ 1', () => {
    expect(() => luyThua(A, 0)).toThrow();
  });
});

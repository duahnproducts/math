import { describe, expect, it } from 'vitest';
import { MANG_VI_DU_1_4_1, canBangNgoai, giuaCanh, phuongTrinhNut } from './mang';

describe('sơ đồ mạng Ví dụ 1.4.1', () => {
  it('quy tắc nút cho đúng bốn phương trình trong sách', () => {
    const pt = Object.fromEntries(phuongTrinhNut(MANG_VI_DU_1_4_1).map((p) => [p.nut, p]));
    // Giao lộ A: 500 = f1 + f2 + f3
    expect(pt.A.vao).toEqual(['500']);
    expect(pt.A.ra.sort()).toEqual(['f1', 'f2', 'f3']);
    // Giao lộ B: f1 + f4 + f6 = 400
    expect(pt.B.vao.sort()).toEqual(['f1', 'f4', 'f6']);
    expect(pt.B.ra).toEqual(['400']);
    // Giao lộ C: f3 + f5 = f6 + 100
    expect(pt.C.vao.sort()).toEqual(['f3', 'f5']);
    expect(pt.C.ra.sort()).toEqual(['100', 'f6']);
    // Giao lộ D: f2 = f4 + f5
    expect(pt.D.vao).toEqual(['f2']);
    expect(pt.D.ra.sort()).toEqual(['f4', 'f5']);
  });

  it('tổng dòng vào bằng tổng dòng ra (500 = 400 + 100)', () => {
    expect(canBangNgoai(MANG_VI_DU_1_4_1)).toBe(true);
    expect(canBangNgoai({ ...MANG_VI_DU_1_4_1, ngoai: [{ nut: 'A', vao: true, giaTri: 1, huong: [1, 0] }] })).toBe(false);
  });

  it('mỗi dòng chảy có đúng một cạnh', () => {
    const ten = MANG_VI_DU_1_4_1.canh.map((c) => c.ten);
    expect(new Set(ten).size).toBe(ten.length);
  });
});

describe('giuaCanh', () => {
  it('điểm giữa và góc', () => {
    expect(giuaCanh({ x: 0, y: 0 }, { x: 10, y: 0 })).toEqual({ x: 5, y: 0, goc: 0 });
    expect(giuaCanh({ x: 0, y: 0 }, { x: 0, y: 10 }).goc).toBe(90);
  });
});

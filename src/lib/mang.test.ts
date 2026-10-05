import { describe, expect, it } from 'vitest';
import { MANG_BAI_GIANG_1_4, MANG_VI_DU_1_4_1, canBangNgoai, giuaCanh, phuongTrinhNut } from './mang';

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

describe('sơ đồ mạng của Bài giảng 4, Chương 1', () => {
  it('quy tắc nút cho đúng ba phương trình trong bài', () => {
    const pt = Object.fromEntries(phuongTrinhNut(MANG_BAI_GIANG_1_4).map((p) => [p.nut, p]));
    expect(pt.A.vao).toEqual(['50']);
    expect(pt.A.ra.sort()).toEqual(['f1', 'f2']);
    expect(pt.B.vao).toEqual(['f1']);
    expect(pt.B.ra.sort()).toEqual(['30', 'f3']);
    expect(pt.C.vao.sort()).toEqual(['f2', 'f3']);
    expect(pt.C.ra).toEqual(['20']);
    expect(canBangNgoai(MANG_BAI_GIANG_1_4)).toBe(true);
  });

  it('nghiệm f1 = 30 + t, f2 = 20 − t, f3 = t thoả mọi nút với 0 ≤ t ≤ 20', () => {
    for (const t of [0, 5, 20]) {
      const f: Record<string, number> = { f1: 30 + t, f2: 20 - t, f3: t };
      const gia = (x: string) => f[x] ?? Number(x);
      for (const p of phuongTrinhNut(MANG_BAI_GIANG_1_4)) {
        const tong = (ds: string[]) => ds.reduce((s, x) => s + gia(x), 0);
        expect(tong(p.vao), `nút ${p.nut}, t = ${t}`).toBe(tong(p.ra));
      }
      expect(Object.values(f).every((v) => v >= 0)).toBe(true);
    }
  });
});

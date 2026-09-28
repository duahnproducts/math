// Sơ đồ mạng dòng chảy (Đại số §1.4): nút, cạnh có hướng, dòng vào/ra từ bên ngoài.
// Hàm thuần — dùng để vẽ hình và để test rằng hình khớp các phương trình trong sách.

export interface Nut {
  x: number;
  y: number;
}

export interface Canh {
  tu: string;
  den: string;
  /** nhãn dòng chảy, ví dụ "f1" */
  ten: string;
}

export interface DongNgoai {
  nut: string;
  /** dòng từ ngoài vào (true) hay ra ngoài (false) */
  vao: boolean;
  giaTri: number;
  /** hướng vẽ mũi tên ngoài, vector đơn vị gần đúng */
  huong: [number, number];
}

export interface Mang {
  nut: Record<string, Nut>;
  canh: Canh[];
  ngoai: DongNgoai[];
}

export interface PhuongTrinhNut {
  nut: string;
  vao: string[];
  ra: string[];
}

/** Quy tắc nút giao: với mỗi nút, liệt kê những gì chảy vào và chảy ra. */
export function phuongTrinhNut(mang: Mang): PhuongTrinhNut[] {
  return Object.keys(mang.nut).map((nut) => ({
    nut,
    vao: [
      ...mang.ngoai.filter((d) => d.nut === nut && d.vao).map((d) => String(d.giaTri)),
      ...mang.canh.filter((c) => c.den === nut).map((c) => c.ten),
    ],
    ra: [
      ...mang.ngoai.filter((d) => d.nut === nut && !d.vao).map((d) => String(d.giaTri)),
      ...mang.canh.filter((c) => c.tu === nut).map((c) => c.ten),
    ],
  }));
}

/** Tổng dòng từ ngoài vào bằng tổng dòng ra ngoài — điều kiện để mạng có nghiệm. */
export function canBangNgoai(mang: Mang): boolean {
  const tong = (vao: boolean) => mang.ngoai.filter((d) => d.vao === vao).reduce((s, d) => s + d.giaTri, 0);
  return tong(true) === tong(false);
}

/** Điểm giữa cạnh và góc của cạnh (độ) — để đặt mũi tên và nhãn. */
export function giuaCanh(a: Nut, b: Nut): { x: number; y: number; goc: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, goc: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
}

/** Mạng đường một chiều của Ví dụ 1.4.1 (vẽ lại từ các phương trình của ví dụ). */
export const MANG_VI_DU_1_4_1: Mang = {
  nut: { A: { x: 100, y: 120 }, D: { x: 215, y: 120 }, B: { x: 340, y: 40 }, C: { x: 340, y: 200 } },
  canh: [
    { tu: 'A', den: 'B', ten: 'f1' },
    { tu: 'A', den: 'D', ten: 'f2' },
    { tu: 'A', den: 'C', ten: 'f3' },
    { tu: 'D', den: 'B', ten: 'f4' },
    { tu: 'D', den: 'C', ten: 'f5' },
    { tu: 'C', den: 'B', ten: 'f6' },
  ],
  ngoai: [
    { nut: 'A', vao: true, giaTri: 500, huong: [-1, 0] },
    { nut: 'B', vao: false, giaTri: 400, huong: [1, 0] },
    { nut: 'C', vao: false, giaTri: 100, huong: [1, 0] },
  ],
};

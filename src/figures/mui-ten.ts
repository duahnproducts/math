// Mũi tên vector cho hình SVG: thân kết thúc ngay sau đầu mũi tên, đầu mũi tên
// (đỉnh tại gốc toạ độ của path DAU_MUI_TEN) xoay theo hướng vector.

export const DAU_MUI_TEN = 'M-9 -4.5 L0 0 L-9 4.5 Z';

const lam = (x: number) => Math.round(x * 10) / 10;

export function muiTen(x1: number, y1: number, x2: number, y2: number) {
  const goc = Math.atan2(y2 - y1, x2 - x1);
  return {
    x1: lam(x1),
    y1: lam(y1),
    x2: lam(x2 - Math.cos(goc) * 6),
    y2: lam(y2 - Math.sin(goc) * 6),
    dau: `translate(${lam(x2)} ${lam(y2)}) rotate(${lam((goc * 180) / Math.PI)})`,
  };
}

/** Cung tròn tâm (cx, cy), bán kính r, đi ngược chiều kim đồng hồ (theo toán) từ góc a đến góc b (radian). */
export function cung(cx: number, cy: number, r: number, a: number, b: number): string {
  const diem = (t: number) => `${lam(cx + r * Math.cos(t))} ${lam(cy - r * Math.sin(t))}`;
  return `M${diem(a)} A${r} ${r} 0 ${b - a > Math.PI ? 1 : 0} 0 ${diem(b)}`;
}

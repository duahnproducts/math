// Đồ thị có hướng và ma trận kề (Đại số §2.3). Quy ước của sách: a_ij = 1 khi có
// cạnh đi từ v_j đến v_i (chú ý thứ tự). Hàm thuần — dùng để vẽ hình và để test
// rằng hình khớp ma trận kề và Định lý 2.3.6 trong sách.

import { type MaTran, nhanMaTran } from './ma-tran';

/** Ma trận kề của đồ thị ba đỉnh trong §2.3. */
export const MA_TRAN_KE_2_3: MaTran = [
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, 0],
];

/** A^r với r ≥ 1. */
export function luyThua(a: MaTran, r: number): MaTran {
  if (r < 1) throw new Error('r phải ≥ 1');
  let kq = a;
  for (let i = 1; i < r; i++) kq = nhanMaTran(kq, a);
  return kq;
}

/** Các cạnh của đồ thị, đỉnh đánh số từ 0: a[i][j] = 1 cho cạnh j → i. */
export function cacCanh(a: MaTran): { tu: number; den: number }[] {
  const ds: { tu: number; den: number }[] = [];
  a.forEach((hang, i) => hang.forEach((x, j) => x && ds.push({ tu: j, den: i })));
  return ds;
}

/** Đếm các r-đường tu → den bằng cách đi thử mọi dãy cạnh (không dùng phép nhân ma trận). */
export function demDuongDi(a: MaTran, r: number, tu: number, den: number): number {
  const canh = cacCanh(a);
  const di = (dinh: number, conLai: number): number =>
    conLai === 0 ? (dinh === den ? 1 : 0) : canh.filter((c) => c.tu === dinh).reduce((t, c) => t + di(c.den, conLai - 1), 0);
  return di(tu, r);
}

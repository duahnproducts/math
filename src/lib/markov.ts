// Xích Markov (Đại số §2.9): s_(m+1) = P·s_m. Hàm thuần — dùng để vẽ hình hội tụ và
// để test các vector trạng thái in trong sách.
import { type MaTran, nhanVector } from './ma-tran';

/** Ma trận chuyển của Ví dụ 2.9.1 (hai nhà hàng A, B; cột = bữa hiện tại). */
export const P_VI_DU_2_9_1: MaTran = [
  [0, 0.25],
  [1, 0.75],
];

/** s_0, s_1, …, s_k. */
export function dayTrangThai(P: MaTran, s0: number[], k: number): number[][] {
  const day = [s0];
  for (let m = 0; m < k; m++) day.push(nhanVector(P, day[m]));
  return day;
}

/** Các cột của P đều có tổng bằng 1 và mọi phần tử nằm trong [0, 1]. */
export function laNgauNhien(P: MaTran, saiSo = 1e-12): boolean {
  const ok = P.every((hang) => hang.every((x) => x >= 0 && x <= 1));
  return ok && P[0].every((_, j) => Math.abs(P.reduce((t, hang) => t + hang[j], 0) - 1) < saiSo);
}

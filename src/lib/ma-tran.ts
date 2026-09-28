// Phép tính ma trận nhỏ dùng cho hình vẽ và test của Đại số Chương 2.
// Hàm thuần: hình lấy toạ độ từ đây, test kiểm rằng chúng khớp công thức trong sách.

export type MaTran = number[][];

export function nhanMaTran(a: MaTran, b: MaTran): MaTran {
  return a.map((hang) => b[0].map((_, j) => hang.reduce((t, x, k) => t + x * b[k][j], 0)));
}

/** Tích A·x với x là vector cột viết thành mảng. */
export function nhanVector(a: MaTran, x: number[]): number[] {
  return a.map((hang) => hang.reduce((t, v, k) => t + v * x[k], 0));
}

/** Ma trận của phép quay R_θ ngược chiều kim đồng hồ (Định lý 2.6.4). */
export function maTranQuay(theta: number): MaTran {
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return [
    [c, -s],
    [s, c],
  ];
}

/** Ma trận của phép đối xứng Q_m qua đường thẳng y = mx (Định lý 2.6.5). */
export function maTranDoiXung(m: number): MaTran {
  const k = 1 / (1 + m * m);
  return [
    [k * (1 - m * m), k * 2 * m],
    [k * 2 * m, k * (m * m - 1)],
  ];
}

/** Ma trận của phép chiếu P_m lên đường thẳng y = mx (Định lý 2.6.6). */
export function maTranChieu(m: number): MaTran {
  const k = 1 / (1 + m * m);
  return [
    [k, k * m],
    [k * m, k * m * m],
  ];
}

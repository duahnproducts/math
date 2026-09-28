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

/** Định thức bằng khử Gauss có chọn trụ (Định lý 3.1.2 và 3.1.4). */
export function dinhThuc(A: MaTran): number {
  const M = A.map((hang) => [...hang]);
  const n = M.length;
  let det = 1;
  for (let k = 0; k < n; k++) {
    let tru = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[tru][k])) tru = i;
    if (M[tru][k] === 0) return 0;
    if (tru !== k) {
      [M[tru], M[k]] = [M[k], M[tru]];
      det = -det;
    }
    det *= M[k][k];
    for (let i = k + 1; i < n; i++) {
      const he = M[i][k] / M[k][k];
      for (let j = k; j < n; j++) M[i][j] -= he * M[k][j];
    }
  }
  return det;
}

/** Nghiệm duy nhất của Ax = b (A vuông khả nghịch), bằng khử Gauss có chọn trụ. */
export function giaiHe(A: MaTran, b: number[]): number[] {
  const n = A.length;
  const M = A.map((hang, i) => [...hang, b[i]]);
  for (let k = 0; k < n; k++) {
    let tru = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[tru][k])) tru = i;
    if (M[tru][k] === 0) throw new Error('Ma trận không khả nghịch');
    [M[tru], M[k]] = [M[k], M[tru]];
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      const he = M[i][k] / M[k][k];
      for (let j = k; j <= n; j++) M[i][j] -= he * M[k][j];
    }
  }
  return M.map((hang, i) => hang[n] / hang[i]);
}

/** Hệ số r₀, r₁, …, r_(n−1) của đa thức nội suy qua các điểm (xᵢ, yᵢ) (Định lý 3.2.6). */
export function heSoNoiSuy(xs: number[], ys: number[]): number[] {
  return giaiHe(
    xs.map((x) => xs.map((_, k) => x ** k)),
    ys,
  );
}

export function giaTriDaThuc(heSo: number[], x: number): number {
  return heSo.reduceRight((t, r) => t * x + r, 0);
}

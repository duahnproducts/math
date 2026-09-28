// Tính toán cho các hình tương tác về ε: "Mẹo ε cho sup" (Chương 1) và
// "Trò chơi ε–N" (Chương 2).

/**
 * Số n nhỏ nhất để phần tử 1 − 1/n vượt qua 1 − ε, tức 1/n < ε.
 * Đây đúng là Tính chất Archimedes: với mọi ε > 0 luôn có n với 1/n < ε.
 */
export function phanTuDauTienVuot(epsilon: number): number {
  if (!(epsilon > 0)) throw new RangeError('ε phải dương');
  let n = Math.floor(1 / epsilon) + 1;
  // Sửa sai số làm tròn của số thực dấu phẩy động
  while (n > 1 && 1 / (n - 1) < epsilon) n--;
  while (!(1 / n < epsilon)) n++;
  return n;
}

/**
 * Trò chơi ε–N với dãy aₙ = 1/√n → 0: mốc N nhỏ nhất sao cho mọi n ≥ N đều có
 * |aₙ − 0| < ε. Vì 1/√n giảm dần nên chỉ cần 1/√N < ε, tức N > 1/ε².
 */
export function mocNCanBac(epsilon: number): number {
  if (!(epsilon > 0)) throw new RangeError('ε phải dương');
  const ngoai = (n: number) => 1 / Math.sqrt(n) < epsilon;
  let n = Math.max(1, Math.floor(1 / (epsilon * epsilon)) + 1);
  // Sửa sai số làm tròn của số thực dấu phẩy động
  while (n > 1 && ngoai(n - 1)) n--;
  while (!ngoai(n)) n++;
  return n;
}

/** Dãy của trò chơi ε–N: aₙ = 1/√n. */
export function soHangCanBac(n: number): number {
  return 1 / Math.sqrt(n);
}

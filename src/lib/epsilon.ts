// Tính toán cho hình tương tác "Mẹo ε cho sup" với A = {1 − 1/n : n ∈ N}, sup A = 1.

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

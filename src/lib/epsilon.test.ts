import { describe, expect, it } from 'vitest';
import { mocNCanBac, phanTuDauTienVuot, soHangCanBac } from './epsilon';

describe('phanTuDauTienVuot', () => {
  it('là n nhỏ nhất với 1/n < ε', () => {
    for (const eps of [0.6, 0.5, 0.3, 0.2, 0.1, 0.07, 0.02, 0.001]) {
      const n = phanTuDauTienVuot(eps);
      expect(1 / n).toBeLessThan(eps);
      if (n > 1) expect(1 / (n - 1)).toBeGreaterThanOrEqual(eps);
    }
  });
  it('ví dụ cụ thể', () => {
    expect(phanTuDauTienVuot(0.2)).toBe(6); // 1/5 = 0,2 chưa nhỏ hơn 0,2
    expect(phanTuDauTienVuot(0.1)).toBe(11);
    expect(phanTuDauTienVuot(0.6)).toBe(2);
  });
  it('ε phải dương', () => {
    expect(() => phanTuDauTienVuot(0)).toThrow();
    expect(() => phanTuDauTienVuot(-1)).toThrow();
  });
});

describe('trò chơi ε–N với aₙ = 1/√n', () => {
  it('N là mốc nhỏ nhất: từ N trở đi mọi số hạng cách 0 dưới ε, số hạng ngay trước N thì chưa', () => {
    for (const eps of [0.9, 0.5, 0.33, 0.25, 0.2, 0.13, 0.1, 0.05, 0.011]) {
      const N = mocNCanBac(eps);
      for (let n = N; n < N + 200; n++) expect(soHangCanBac(n)).toBeLessThan(eps);
      if (N > 1) expect(soHangCanBac(N - 1)).toBeGreaterThanOrEqual(eps);
    }
  });
  it('khớp nháp của Ví dụ A: cần n > 1/ε²', () => {
    expect(mocNCanBac(0.5)).toBe(5); // 1/√4 = 0,5 chưa nhỏ hơn 0,5
    expect(mocNCanBac(0.25)).toBe(17);
    expect(mocNCanBac(0.1)).toBe(101);
  });
  it('ε lớn thì ngay số hạng đầu đã đủ gần', () => {
    expect(mocNCanBac(2)).toBe(1);
    expect(mocNCanBac(1)).toBe(2); // a₁ = 1 chưa nhỏ hơn 1
  });
  it('ε càng nhỏ, N càng lớn (không bao giờ giảm)', () => {
    let truoc = 0;
    for (let eps = 0.8; eps > 0.1; eps -= 0.01) {
      const N = mocNCanBac(eps);
      expect(N).toBeGreaterThanOrEqual(truoc);
      truoc = N;
    }
  });
  it('ε phải dương', () => {
    expect(() => mocNCanBac(0)).toThrow();
  });
});

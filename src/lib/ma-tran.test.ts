import { describe, expect, it } from 'vitest';
import { type MaTran, dinhThuc, maTranChieu, maTranDoiXung, maTranQuay, nhanMaTran, nhanVector } from './ma-tran';

const Q0: MaTran = [
  [1, 0],
  [0, -1],
];
const I: MaTran = [
  [1, 0],
  [0, 1],
];
const gan = (a: MaTran, b: MaTran) => a.forEach((hang, i) => hang.forEach((x, j) => expect(x).toBeCloseTo(b[i][j], 12)));

describe('phép biến đổi hình học của §2.6', () => {
  it('R_θ đưa e₁ tới (cos θ, sin θ) và e₂ tới (−sin θ, cos θ)', () => {
    const t = 0.6;
    const R = maTranQuay(t);
    expect(nhanVector(R, [1, 0])).toEqual([Math.cos(t), Math.sin(t)]);
    expect(nhanVector(R, [0, 1])).toEqual([-Math.sin(t), Math.cos(t)]);
    gan(maTranQuay(Math.PI / 2), [
      [0, -1],
      [1, 0],
    ]);
  });

  it('Ví dụ 2.6.8: R_θ ∘ R_φ = R_(θ+φ)', () => {
    gan(nhanMaTran(maTranQuay(0.4), maTranQuay(1.1)), maTranQuay(1.5));
  });

  it('Ví dụ 2.6.7: quay π/2 sau đối xứng qua trục x là đối xứng qua y = x', () => {
    gan(nhanMaTran(maTranQuay(Math.PI / 2), Q0), maTranDoiXung(1));
  });

  it('Định lý 2.6.5: Q_m = R_θ ∘ Q₀ ∘ R_(−θ) với tan θ = m', () => {
    for (const m of [-2, -1, 0, 0.6, 3]) {
      const t = Math.atan(m);
      gan(nhanMaTran(nhanMaTran(maTranQuay(t), Q0), maTranQuay(-t)), maTranDoiXung(m));
    }
  });

  it('Ví dụ 2.6.9: quay −π/2 rồi đối xứng qua trục y là đối xứng qua y = −x', () => {
    const doiXungTrucY: MaTran = [
      [-1, 0],
      [0, 1],
    ];
    gan(nhanMaTran(doiXungTrucY, maTranQuay(-Math.PI / 2)), maTranDoiXung(-1));
  });

  it('Ví dụ 2.6.10 và nhận xét cuối §2.6: P_m² = P_m, Q_m = 2P_m − I', () => {
    for (const m of [-1.5, 0, 0.6, 2]) {
      const P = maTranChieu(m);
      gan(nhanMaTran(P, P), P);
      gan(
        maTranDoiXung(m),
        P.map((hang, i) => hang.map((x, j) => 2 * x - I[i][j])),
      );
    }
  });
});

describe('phân tích LU trong các ví dụ của §2.7', () => {
  const nua = 0.5;
  const tu = 0.25;
  it('Ví dụ 2.7.2–2.7.4: L·U = A', () => {
    expect(
      nhanMaTran(
        [
          [2, 0, 0],
          [-1, 2, 0],
          [-1, 6, 1],
        ],
        [
          [0, 1, -3, -1, 2],
          [0, 0, 0, 1, 2],
          [0, 0, 0, 0, 0],
        ],
      ),
    ).toEqual([
      [0, 2, -6, -2, 4],
      [0, -1, 3, 3, 2],
      [0, -1, 3, 7, 10],
    ]);
    expect(
      nhanMaTran(
        [
          [5, 0, 0, 0],
          [-3, 8, 0, 0],
          [-2, 4, -2, 0],
          [1, 8, 0, 1],
        ],
        [
          [1, -1, 2, 0, 1],
          [0, 0, 1, tu, nua],
          [0, 0, 0, 1, 0],
          [0, 0, 0, 0, 0],
        ],
      ),
    ).toEqual([
      [5, -5, 10, 0, 5],
      [-3, 3, 2, 2, 1],
      [-2, 2, 0, -1, 0],
      [1, -1, 10, 2, 5],
    ]);
    expect(
      nhanMaTran(
        [
          [2, 0, 0],
          [1, -1, 0],
          [-1, 2, 5],
        ],
        [
          [1, 2, 1],
          [0, 1, -1],
          [0, 0, 1],
        ],
      ),
    ).toEqual([
      [2, 4, 2],
      [1, 1, 2],
      [-1, 0, 2],
    ]);
  });

  it('Ví dụ 2.7.5: P·A = L·U', () => {
    const A = [
      [0, 0, -1, 2],
      [-1, -1, 1, 2],
      [2, 1, -3, 6],
      [0, 1, -1, 4],
    ];
    const P = [
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 1],
    ];
    const L = [
      [-1, 0, 0, 0],
      [2, -1, 0, 0],
      [0, 0, -1, 0],
      [0, 1, -2, 10],
    ];
    const U = [
      [1, 1, -1, -2],
      [0, 1, 1, -10],
      [0, 0, 1, -2],
      [0, 0, 0, 1],
    ];
    expect(nhanMaTran(P, A)).toEqual(nhanMaTran(L, U));
  });
});

describe('định thức (§3.1)', () => {
  it('khớp các ví dụ của sách', () => {
    expect(dinhThuc([[2, 3, 7], [-4, 0, 6], [1, 5, 0]])).toBeCloseTo(-182, 9);
    expect(dinhThuc([[3, 4, 5], [1, 7, 2], [9, 8, -6]])).toBeCloseTo(-353, 9);
    expect(dinhThuc([[3, 0, 0, 0], [5, 1, 2, 0], [2, 6, 0, -1], [-6, 3, 1, 0]])).toBeCloseTo(-15, 9);
    expect(dinhThuc([[1, -1, 3], [1, 0, -1], [2, 1, 6]])).toBeCloseTo(12, 9);
    expect(dinhThuc([[2, 3, 1, 3], [1, -2, -1, 1], [0, 1, 0, 1], [0, 4, 0, 1]])).toBeCloseTo(-9, 9);
  });

  it('Ví dụ 3.1.7: det = (1 − x)²(2x + 1); Ví dụ 3.1.8: Vandermonde', () => {
    for (const x of [-2, -0.5, 0.3, 1, 4]) {
      expect(dinhThuc([[1, x, x], [x, 1, x], [x, x, 1]])).toBeCloseTo((1 - x) ** 2 * (2 * x + 1), 9);
    }
    const [a1, a2, a3] = [2, -1, 5];
    expect(dinhThuc([[1, a1, a1 ** 2], [1, a2, a2 ** 2], [1, a3, a3 ** 2]])).toBeCloseTo((a3 - a1) * (a3 - a2) * (a2 - a1), 9);
  });

  it('Định lý 3.1.3: det(uA) = uⁿ det A; hàng trùng nhau cho 0', () => {
    const A = [[3, 4, 5], [1, 7, 2], [9, 8, -6]];
    expect(dinhThuc(A.map((h) => h.map((x) => 2 * x)))).toBeCloseTo(8 * -353, 9);
    expect(dinhThuc([[2, 1, 2], [4, 0, 4], [1, 3, 1]])).toBeCloseTo(0, 12);
  });
});

import { describe, expect, it } from 'vitest';
import {
  type MaTran,
  dinhThuc,
  giaTriDaThuc,
  giaiHe,
  heSoNoiSuy,
  maTranChieu,
  maTranDoiXung,
  maTranQuay,
  nhanMaTran,
  nhanVector,
} from './ma-tran';

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

describe('nội suy đa thức (§3.2)', () => {
  it('Ví dụ 3.2.10: p(x) = 0.7x − 0.02x², p(12) = 5.52', () => {
    const r = heSoNoiSuy([5, 10, 15], [3, 5, 6]);
    [0, 0.7, -0.02].forEach((x, i) => expect(r[i]).toBeCloseTo(x, 12));
    expect(giaTriDaThuc(r, 12)).toBeCloseTo(5.52, 12);
  });

  it('Ví dụ 3.2.9 (quy tắc Cramer): x₁ = −3/4', () => {
    const A = [[5, 1, -1], [9, 1, -1], [1, -1, 5]];
    expect(dinhThuc(A)).toBeCloseTo(-16, 9);
    expect(giaiHe(A, [4, 1, 2])[0]).toBeCloseTo(-0.75, 12);
  });

  it('Ví dụ 3.2.6: A·adj A = 3I; Ví dụ 3.2.7: phần tử (2, 3) của A⁻¹ là 13/180', () => {
    const A = [[1, 3, -2], [0, 1, 5], [-2, -6, 7]];
    expect(nhanMaTran(A, [[37, -9, 17], [-10, 3, -5], [2, 0, 1]])).toEqual([[3, 0, 0], [0, 3, 0], [0, 0, 3]]);
    const B = [[2, 1, 3], [5, -7, 1], [3, 0, -6]];
    expect(dinhThuc(B)).toBeCloseTo(180, 9);
    // cột 3 của B⁻¹ là nghiệm của Bx = e₃
    expect(giaiHe(B, [0, 0, 1])[1]).toBeCloseTo(13 / 180, 12);
  });

  it('ma trận suy biến thì báo lỗi', () => {
    expect(() => giaiHe([[1, 2], [2, 4]], [1, 2])).toThrow();
  });
});

describe('giá trị riêng và vector riêng (§3.3)', () => {
  const tru = (l: number, A: MaTran) => A.map((h, i) => h.map((x, j) => (i === j ? l : 0) - x));
  it('Ví dụ 3.3.2–3.3.3: λ = 4, −2 với vector riêng (5, 1), (−1, 1)', () => {
    const A = [[3, 5], [1, -1]];
    expect(nhanVector(A, [5, 1])).toEqual([20, 4]);
    expect(nhanVector(A, [-1, 1])).toEqual([2, -2]);
    for (const l of [4, -2]) expect(dinhThuc(tru(l, A))).toBeCloseTo(0, 12);
  });

  it('Ví dụ 3.3.4: λ = 2, 1, −1 với vector riêng cơ bản (1,1,1), (0,1,1), (0,1,3)', () => {
    const A = [[2, 0, 0], [1, 2, -1], [1, 3, -2]];
    const cap: [number, number[]][] = [
      [2, [1, 1, 1]],
      [1, [0, 1, 1]],
      [-1, [0, 1, 3]],
    ];
    for (const [l, x] of cap) {
      expect(dinhThuc(tru(l, A))).toBeCloseTo(0, 12);
      nhanVector(A, x).forEach((y, i) => expect(y).toBeCloseTo(l * x[i], 12));
    }
  });
});

describe('chéo hoá (§3.4)', () => {
  const cheo = (d: number[]) => d.map((x, i) => d.map((_, j) => (i === j ? x : 0)));
  it('Ví dụ 3.4.1 và 3.4.2: AP = PD, P khả nghịch', () => {
    const cases: [MaTran, MaTran, number[]][] = [
      [[[2, 0, 0], [1, 2, -1], [1, 3, -2]], [[1, 0, 0], [1, 1, 1], [1, 1, 3]], [2, 1, -1]],
      [[[0, 1, 1], [1, 0, 1], [1, 1, 0]], [[1, -1, -1], [1, 1, 0], [1, 0, 1]], [2, -1, -1]],
    ];
    for (const [A, P, d] of cases) {
      expect(nhanMaTran(A, P)).toEqual(nhanMaTran(P, cheo(d)));
      expect(dinhThuc(P)).not.toBeCloseTo(0, 9);
    }
  });
});

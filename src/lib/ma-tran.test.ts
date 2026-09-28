import { describe, expect, it } from 'vitest';
import { type MaTran, maTranChieu, maTranDoiXung, maTranQuay, nhanMaTran, nhanVector } from './ma-tran';

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

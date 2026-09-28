// Hình tương tác — Mẹo ε cho sup: A = {1 − 1/n}, sup A = 1.
// Kéo ε: luôn có phần tử của A vượt qua 1 − ε. Tính toán nằm trong src/lib/epsilon.ts (có test).
import { useId, useState } from 'react';
import { phanTuDauTienVuot } from '../lib/epsilon';

const RONG = 520;
const TRAI = 30;
const PHAI = 490;
const x = (v: number) => TRAI + (v / 1.05) * (PHAI - TRAI);
const soVN = (v: number, chuSo = 3) => v.toFixed(chuSo).replace('.', ',');

export default function EpsilonSup() {
  const [epsilon, datEpsilon] = useState(0.2);
  const ma = useId();
  const n = phanTuDauTienVuot(epsilon);
  const a = 1 - 1 / n;
  const cacDiem = Array.from({ length: 40 }, (_, i) => 1 - 1 / (i + 1));

  return (
    <figure className="hinh" aria-labelledby={`${ma}-cap`}>
      <svg viewBox={`0 0 ${RONG} 120`} width={RONG} role="img" aria-label="Trục số với các phần tử 1 − 1/n và dải từ 1 − ε đến 1">
        <rect x={x(1 - epsilon)} y="30" width={x(1) - x(1 - epsilon)} height="50" className="to-nhan-nhat" />
        <line x1={TRAI - 10} y1="55" x2={PHAI + 10} y2="55" className="net" strokeWidth="1.5" />
        {cacDiem.map((v, i) => (
          <circle
            key={i}
            cx={x(v)}
            cy="55"
            r={i + 1 === n ? 6 : 3}
            className={i + 1 === n ? 'to-nhan' : v > 1 - epsilon ? 'ok' : 'diem-mo'}
          />
        ))}
        <line x1={x(1)} y1="20" x2={x(1)} y2="90" className="nhan-manh" strokeWidth="2" />
        <text x={x(1)} y="108" textAnchor="middle" className="chu-nhan">
          sup A = 1
        </text>
        <line x1={x(1 - epsilon)} y1="24" x2={x(1 - epsilon)} y2="86" className="net-mo" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={x(1 - epsilon)} y="18" textAnchor="middle" className="chu-mo">
          1 − ε
        </text>
        <text x={x(0)} y="80" textAnchor="middle" className="chu-mo">
          0
        </text>
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <label htmlFor={`${ma}-eps`}>ε =</label>
        <input
          id={`${ma}-eps`}
          type="range"
          min="0.02"
          max="0.6"
          step="0.01"
          value={epsilon}
          onChange={(e) => datEpsilon(Number(e.target.value))}
          style={{ width: 220, accentColor: 'var(--accent)' }}
        />
        <output htmlFor={`${ma}-eps`} style={{ fontFamily: 'var(--font-mono)', minWidth: '3.5em' }}>
          {soVN(epsilon, 2)}
        </output>
      </div>
      <figcaption id={`${ma}-cap`} aria-live="polite">
        Hạ trần từ 1 xuống 1 − ε = {soVN(1 - epsilon, 2)}: phần tử <b>a = 1 − 1/{n} ≈ {soVN(a)}</b> đã vượt qua.
        ε càng nhỏ thì n càng lớn — nhưng <b>luôn tìm được</b>.
      </figcaption>
    </figure>
  );
}

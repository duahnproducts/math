// Hình tương tác — Trò chơi ε–N với dãy aₙ = 1/√n → 0 (Chương 2, Bài 1).
// Kéo ε (đối thủ ra đòn), xem mốc N (bạn đáp trả) nhảy theo.
// Tính toán nằm trong src/lib/epsilon.ts (có test).
import { useId, useState } from 'react';
import { mocNCanBac, soHangCanBac } from '../lib/epsilon';

const RONG = 540;
const CAO = 250;
const SO_HANG = 110;
const TRAI = 48;
const PHAI = 520;
const TREN = 22;
const DUOI = 212;
const x = (n: number) => TRAI + ((n - 1) / (SO_HANG - 1)) * (PHAI - TRAI);
const y = (v: number) => TREN + ((1.05 - v) / 1.4) * (DUOI - TREN);
const soVN = (v: number, chuSo = 2) => v.toFixed(chuSo).replace('.', ',');

export default function TroChoiEpsilonN() {
  const [epsilon, datEpsilon] = useState(0.25);
  const ma = useId();
  const N = mocNCanBac(epsilon);
  const cacN = Array.from({ length: SO_HANG }, (_, i) => i + 1);

  return (
    <figure className="hinh" aria-labelledby={`${ma}-cap`} data-tro-choi-epsilon-n>
      <svg
        viewBox={`0 0 ${RONG} ${CAO}`}
        width={RONG}
        role="img"
        aria-label="Các số hạng 1/√n trên đồ thị, dải từ −ε đến ε quanh 0 và mốc N"
      >
        <rect x={TRAI} y={y(epsilon)} width={PHAI - TRAI} height={y(-epsilon) - y(epsilon)} className="to-nhan-nhat" />
        <line x1={TRAI} y1={y(0)} x2={PHAI + 6} y2={y(0)} className="net" strokeWidth="1.5" />
        <line x1={TRAI} y1={TREN - 6} x2={TRAI} y2={DUOI} className="net-mo" strokeWidth="1" />
        <text x={TRAI - 6} y={y(epsilon) + 4} textAnchor="end" className="chu-mo">
          ε
        </text>
        <text x={TRAI - 6} y={y(0) + 4} textAnchor="end" className="chu-nhan">
          0
        </text>
        <text x={TRAI - 6} y={y(-epsilon) + 4} textAnchor="end" className="chu-mo">
          −ε
        </text>
        <text x={TRAI - 6} y={y(1) + 4} textAnchor="end" className="chu-mo">
          1
        </text>
        {cacN.map((n) => (
          <circle
            key={n}
            cx={x(n)}
            cy={y(soHangCanBac(n))}
            r={n === N ? 5 : 2.6}
            className={n >= N ? 'ok' : 'diem-mo'}
          />
        ))}
        <line x1={x(N)} y1={TREN - 6} x2={x(N)} y2={DUOI} className="nhan-manh" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Gần mép phải thì đặt nhãn bên trái nét đứt để khỏi đè lên nhau */}
        <text
          x={x(N) > PHAI - 70 ? x(N) - 6 : x(N) + 6}
          y={TREN + 6}
          textAnchor={x(N) > PHAI - 70 ? 'end' : 'start'}
          className="chu-nhan"
        >
          N = {N}
        </text>
        <text x={PHAI} y={DUOI + 26} textAnchor="end" className="chu-mo">
          n →
        </text>
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <label htmlFor={`${ma}-eps`}>Đối thủ ra ε =</label>
        <input
          id={`${ma}-eps`}
          type="range"
          min="0.1"
          max="0.8"
          step="0.01"
          value={epsilon}
          onChange={(e) => datEpsilon(Number(e.target.value))}
          style={{ width: 220, accentColor: 'var(--accent)' }}
        />
        <output htmlFor={`${ma}-eps`} style={{ fontFamily: 'var(--font-mono)', minWidth: '3.5em' }}>
          {soVN(epsilon)}
        </output>
      </div>
      <figcaption id={`${ma}-cap`} aria-live="polite">
        Bạn đáp <b data-moc-n>N = {N}</b>: từ số hạng thứ {N} trở đi, <b>mọi</b> điểm đều nằm trong dải (−ε, ε). Kéo ε
        nhỏ lại — N phải lớn lên, nhưng lúc nào cũng đáp được. Vì thế 1/√n → 0.
      </figcaption>
    </figure>
  );
}

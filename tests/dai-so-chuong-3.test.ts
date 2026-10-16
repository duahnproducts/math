import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { kiemTraTamMuc, trichTieuDeCap2 } from '../src/lib/noi-dung';
import { dinhThuc, giaiHe, heSoNoiSuy, nhanMaTran, nhanVector } from '../src/lib/ma-tran';

const root = fileURLToPath(new URL('../content/dai-so/chuong-3/', import.meta.url));
const read = (folder: string, file: string) => {
  const text = readFileSync(`${root}/${folder}/${file}`, 'utf8');
  const [, front, body] = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text)!;
  return { data: parse(front), body };
};

describe('Đại số chương 3: lộ trình học đầy đủ', () => {
  it('có tám bài, phủ từng mục §3.1-§3.8, đúng khung và sáu bước', () => {
    expect(readdirSync(`${root}/giang-day`).filter((f) => f.endsWith('.mdx'))).toHaveLength(8);
    for (let i = 1; i <= 8; i++) {
      const { data, body } = read('giang-day', `bai-${i}.mdx`);
      expect(data.phu_muc).toEqual([`3.${i}`]);
      expect(trichTieuDeCap2(body)).toHaveLength(8);
      expect(kiemTraTamMuc(trichTieuDeCap2(body))).toEqual([]);
      for (let step = 1; step <= 6; step++) expect(body).toContain(`### Bước ${step}`);
      expect(body.match(/<BaiLuyen /g)).toHaveLength(3);
    }
  });

  it('24 bài luyện ghi rõ tự soạn, mỗi mục có đủ ba mức và đủ hướng dẫn', () => {
    expect(readdirSync(`${root}/bai-tap`).filter((f) => f.endsWith('.mdx') && read('bai-tap',f).data.tu_soan)).toHaveLength(24);
    for (let i = 1; i <= 8; i++) {
      for (let j = 1; j <= 3; j++) {
        const { data, body } = read('bai-tap', `3-${i}-${1000+j}.mdx`);
        expect(data.so).toBe(`3.${i}.${1000+j}`);
        expect(data.tu_soan).toBe(true);
        expect(data.de_tom_tat).toBeUndefined();
        expect(data.do_kho).toBe(['de', 'vua', 'kho'][j - 1]);
        for (const tag of ['<De>', '<GoiY so={1}>', '<GoiY so={2}>', '<LoiGiai>', '<LoiHayMac>']) {
          expect(body).toContain(tag);
        }
      }
    }
  });
});

describe('đối chiếu số liệu ví dụ và lời giải chương 3', () => {
  it('định thức, Cramer và nội suy khớp kết quả trong bài', () => {
    expect(dinhThuc([[2,0,1],[1,3,0],[0,2,4]] )).toBeCloseTo(26);
    expect(dinhThuc([[1,2,0],[0,3,4],[5,0,6]])).toBeCloseTo(58);
    expect(dinhThuc([[1,0,2],[0,3,0],[4,0,5]])).toBeCloseTo(-9);
    const [x,y] = giaiHe([[2,1],[1,-1]], [7,2]);
    expect(x).toBeCloseTo(3); expect(y).toBeCloseTo(1);
    heSoNoiSuy([0,1,2], [1,3,7]).forEach((v) => expect(v).toBeCloseTo(1));
  });

  it('P, D đúng thứ tự; công thức lũy thừa và ví dụ mũ ba đúng', () => {
    const A = [[3,1],[1,3]], P = [[1,1],[1,-1]], D = [[4,0],[0,2]];
    expect(nhanMaTran(A,P)).toEqual(nhanMaTran(P,D));
    expect(nhanMaTran(nhanMaTran(A,A),A)).toEqual([[36,28],[28,36]]);
    expect(nhanVector(A,[1,-1])).toEqual([2,-2]);
  });

  it('công thức động lực đúng từng bước và bảo toàn tổng', () => {
    const A = [[.75,.25],[.25,.75]];
    let state = [80,20];
    for (let k = 0; k <= 8; k++) {
      const expected = [50+30*.5**k, 50-30*.5**k];
      state.forEach((v,i) => expect(v).toBeCloseTo(expected[i]));
      expect(state[0]+state[1]).toBeCloseTo(100);
      state = nhanVector(A,state);
    }
  });

  it('các công thức truy hồi đúng cả điều kiện đầu và chuyển bước', () => {
    const cases = [
      { a:4,b:-3,first:[2,4],u:(k:number) => 3**k+1 },
      { a:5,b:-6,first:[2,5],u:(k:number) => 2**k+3**k },
      { a:4,b:-4,first:[1,4],u:(k:number) => (k+1)*2**k },
    ];
    for (const c of cases) {
      expect([c.u(0),c.u(1)]).toEqual(c.first);
      for (let k = 0; k < 8; k++) expect(c.u(k+2)).toBe(c.a*c.u(k+1)+c.b*c.u(k));
    }
  });

  it('nghiệm vi phân thỏa đạo hàm và điều kiện đầu', () => {
    for (const t of [0,.5,1,3]) {
      const x = [Math.exp(-t)+Math.exp(-3*t), Math.exp(-t)-Math.exp(-3*t)];
      const derivative = [-Math.exp(-t)-3*Math.exp(-3*t),-Math.exp(-t)+3*Math.exp(-3*t)];
      nhanVector([[-2,1],[1,-2]],x).forEach((v,i) => expect(v).toBeCloseTo(derivative[i]));
      if (t===0) expect(x).toEqual([2,0]);
    }
  });
});

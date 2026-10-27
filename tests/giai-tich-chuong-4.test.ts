import { readFileSync, readdirSync } from 'node:fs';
import { expect, test } from 'vitest';
import { parse } from 'yaml';
import katex from 'katex';
import { chuongCuaMuc, kiemTraTamMuc, trichTieuDeCap2 } from '../src/lib/noi-dung';

const chapters = [
  { chapter: 1, first: 1, last: 6 },
  { chapter: 2, first: 7, last: 16 },
  { chapter: 3, first: 17, last: 22 },
  { chapter: 4, first: 23, last: 27 },
];

test('hết chương 4 Ross là §27; giữ các mục mở rộng và đúng ranh giới chương', () => {
  for (const { chapter, first, last } of chapters) {
    expect(chuongCuaMuc(String(first), 'giai-tich')).toBe(chapter);
    expect(chuongCuaMuc(String(last), 'giai-tich')).toBe(chapter);
  }
  expect(chuongCuaMuc('28', 'giai-tich')).toBe(5);
  expect(chuongCuaMuc('32', 'giai-tich')).toBe(6);
  expect(chuongCuaMuc('37', 'giai-tich')).toBe(7);
  expect(chuongCuaMuc('3.8', 'dai-so')).toBe(3);
});

for (const { chapter, first, last } of chapters) {
  test(`chương ${chapter}: đủ từng §, 8 mục, ba bài tự luyện và công thức hợp lệ`, () => {
    const dir = `content/giai-tich/chuong-${chapter}/giang-day`;
    expect(readdirSync(dir)).toHaveLength(last - first + 1);
    for (let section = first; section <= last; section++) {
      const body = readFileSync(`${dir}/bai-${section-first+1}.mdx`, 'utf8');
      const front = parse(body.split('---')[1]);
      expect(front).toMatchObject({ mon: 'giai-tich', chuong: chapter, bai: section-first+1, phu_muc: [String(section)] });
      expect(front.tieu_de).toContain(`§${section}.`);
      expect(kiemTraTamMuc(trichTieuDeCap2(body))).toEqual([]);
      expect(body).not.toContain('@figure');
      expect(body).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
      const practice = body.split('## Bài tập')[1];
      expect([...practice.matchAll(/<LoiGiai>/g)]).toHaveLength(3);
      for (const [, solution] of practice.matchAll(/<LoiGiai>([\s\S]*?)<\/LoiGiai>/g)) {
        expect([...solution.matchAll(/\*\*Bước ([1-6])\./g)].map(m=>m[1])).toEqual(['1','2','3','4','5','6']);
      }
      for (const match of body.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g)) {
        expect(() => katex.renderToString(match[1] ?? match[2], { throwOnError: true, strict: false })).not.toThrow();
      }
    }
  });
}

test('nội dung mới giữ các điều kiện quan trọng của hội tụ đều và biên chuỗi', () => {
  const lesson = (n:number)=>readFileSync(`content/giai-tich/chuong-4/giang-day/bai-${n}.mdx`,'utf8');
  expect(lesson(1)).toContain('[-1,5)');
  expect(lesson(2)).toContain('N=N(\\varepsilon)');
  expect(lesson(3)).toContain('n/[2(n+1)]');
  expect(lesson(4)).toMatch(/hội tụ tại đầu mút là giả thiết/i);
  expect(lesson(5)).toContain('M/(2n\\delta^2)');
  // Đối chiếu moment Bernstein và chặn sai số x² ở một lưới hữu hạn.
  const choose = (n:number,k:number)=>{let c=1;for(let j=1;j<=k;j++)c=c*(n-j+1)/j;return c;};
  for (const n of [2,5,12]) for (let i=0;i<=20;i++) {
    const x=i/20;
    const b=Array.from({length:n+1},(_,k)=>(k/n)**2*choose(n,k)*x**k*(1-x)**(n-k)).reduce((a,b)=>a+b,0);
    expect(b).toBeCloseTo(x*x+x*(1-x)/n,12);
    expect(Math.abs(b-x*x)).toBeLessThanOrEqual(1/(4*n)+1e-12);
  }
});

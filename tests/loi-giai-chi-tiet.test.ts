import { readdirSync,readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect,test } from 'vitest';
import { mdSangHtml } from '../src/lib/tu-tao/hien-thi';
import { dinhThuc,nhanMaTran } from '../src/lib/ma-tran';

function mdx(dir:string):string[]{
  return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?mdx(join(dir,e.name)):e.name.endsWith('.mdx')?[join(dir,e.name)]:[]);
}
const files=mdx('content');
const originals=files.filter(f=>f.includes('bai-tap'));
const solutions=(s:string)=>[...s.matchAll(/<LoiGiai>([\s\S]*?)<\/LoiGiai>/g)].map(m=>m[1]);

test('mọi trang bài tập hiện có đều có lời giải chia bước, không mất đề và hai tầng gợi ý',()=>{
  expect(originals).toHaveLength(434);
  for(const file of originals){
    const text=readFileSync(file,'utf8');
    expect(text,file).toContain('<De>');
    expect(text,file).toContain('<GoiY so={1}>');
    expect(text,file).toContain('<GoiY so={2}>');
    expect(solutions(text),file).toHaveLength(1);
    expect(solutions(text)[0],file).toMatch(/\*\*Bước \d+\./);
  }
});

test('30 bài Giải tích và 42 bài luyện Đại số có phần mở lời giải riêng, gợi ý còn nguyên',()=>{
  const calculus=files.filter(f=>f.includes('giai-tich')&&f.includes('giang-day'));
  expect(calculus).toHaveLength(10);
  for(const f of calculus){
    const text=readFileSync(f,'utf8').split('## Bài tập')[1];
    expect(solutions(text),f).toHaveLength(3);
    for(const solution of solutions(text)){
      expect([...solution.matchAll(/\*\*Bước ([1-6])\./g)].map(m=>m[1]),f).toEqual(['1','2','3','4','5','6']);
    }
  }
  const algebra=files.filter(f=>f.includes('dai-so')&&/chuong-[12]/.test(f)&&f.includes('giang-day'));
  expect(algebra).toHaveLength(14);
  for(const f of algebra){
    const text=readFileSync(f,'utf8');
    const cards=[...text.matchAll(/<BaiLuyen[^>]*>([\s\S]*?)<\/BaiLuyen>/g)];
    expect(cards,f).toHaveLength(3);
    for(const card of cards){expect(card[1]).toContain('<GoiYNho');expect(solutions(card[1])).toHaveLength(1);}
  }
});

test('sáu câu thảo luận Vi mô có hướng dẫn riêng, tách khỏi bản dịch slide',()=>{
  const micro=files.filter(f=>f.includes('vi-mo'));
  let count=0;
  for(const f of micro){
    const text=readFileSync(f,'utf8');
    expect(text).not.toMatch(/<Slide[^>]*>(?:(?!<\/Slide>)[\s\S])*<LoiGiai>/);
    const questions=[...text.matchAll(/<Slide[^>]*>(?:(?!<\/Slide>)[\s\S])*Câu hỏi thảo luận(?:(?!<\/Slide>)[\s\S])*<\/Slide>/g)];
    expect(solutions(text),f).toHaveLength(questions.length);
    for(const q of questions)expect(text.slice(q.index!+q[0].length)).toMatch(/^\s*<div data-loi-giai-thao-luan=/);
    count+=questions.length;
  }
  expect(count).toBe(6);
  const post=readFileSync('content/vi-mo/chuong-3/sach/3-3.mdx','utf8');
  expect(post).toContain('giá có thể tăng, giảm hoặc giữ nguyên');
});

const allAnswers=files.flatMap(f=>solutions(readFileSync(f,'utf8')).map((s,i)=>({file:f,index:i,text:s})));
test.each(allAnswers)('$file lời giải $index: công thức và Markdown dựng được',({text})=>{
  expect(text.replaceAll('\r\n','\n')).not.toMatch(/[\x00-\x09\x0b-\x1f]/);
  expect(text).not.toMatch(/@@M\d+@@/);
  expect(mdSangHtml(text)).not.toContain('katex-error');
});

const bank=JSON.parse(readFileSync('scripts/data/loi-giai-nicholson.json','utf8')) as Record<string,{loi_giai:string}>;
const cell=(s:string)=>{
  const frac=/^\s*(-?)\s*\\frac\{(-?\d+)\}\{(-?\d+)\}\s*$/.exec(s);
  return frac?(frac[1]?-1:1)*Number(frac[2])/Number(frac[3]):Number(s.trim());
};
const numericMatrices=(s:string)=>[...s.matchAll(/\\begin\{bmatrix\}([\s\S]*?)\\end\{bmatrix\}/g)]
  .map(m=>m[1].split(/\\\\/).map(r=>r.split('&').map(cell))).filter(a=>a.every(r=>r.every(Number.isFinite)));

test('3.1.5: mọi ma trận sau khử vẫn có định thức đúng, không nhảy thẳng đến tam giác',()=>{
  const expected=[1,-17,2,106];
  for(let i=0;i<4;i++){
    const part=bank['3.1.5'].loi_giai.split(`**${String.fromCharCode(97+i)}.**`)[1].split(/\*\*[a-d]\.\*\*/)[0];
    const matrices=numericMatrices(part);
    expect(matrices.length).toBeGreaterThanOrEqual(i<2?3:4);
    matrices.forEach(a=>expect(dinhThuc(a)).toBeCloseTo(expected[i]));
    expect(part).toContain('ô ở hàng');
    expect(part).toContain('không đổi định thức');
  }
});

test('3.1.7 giải thích nguồn gốc hai hệ số khử và hai lần đổi hàng',()=>{
  const s=bank['3.1.7'].loi_giai;
  expect(s).toContain('\\frac32');expect(s).toContain('\\frac13');
  expect(s).toContain('Đổi hàng 1 và 2');expect(s).toContain('Đổi hàng 2 và 3');
  expect(s).toContain('\\boxed{2}');expect(s).toContain('\\boxed{12}');
});

test('2.3.27 g: phản ví dụ thật sự không có bất kỳ hàng 0 nào trong BA',()=>{
  const a=[[0,0],[0,1]],b=[[1,1],[1,1]];
  expect(a.some(r=>r.every(v=>v===0))).toBe(true);
  expect(nhanMaTran(b,a).every(r=>r.some(v=>v!==0))).toBe(true);
  const g=bank['2.3.27'].loi_giai.split('**g. Sai.**')[1].split('**h.')[0];
  expect(g).toContain('không có hàng nào toàn 0');
});

test('hệ có chỉ số x1…x4 được khử theo bốn ẩn riêng, không đọc nhầm thành bội của x',()=>{
  const text=readFileSync('content/dai-so/chuong-1/bai-tap/1-1-1.mdx','utf8');
  expect(text).toContain('\\begin{bmatrix}2&5&9&3&-1\\\\1&2&4&0&1\\end{bmatrix}');
  expect(text).toContain('(x_{1},x_{2},x_{3},x_{4})');
  expect(text).not.toContain('\\begin{bmatrix}51&-1\\\\17&1\\end{bmatrix}');
});

test('Cayley–Hamilton: các lũy thừa và tổng ma trận của cả hai ví dụ khớp dữ kiện',()=>{
  const cases=[{a:[[3,2],[1,-1]],coeff:[1,-2,-5]},{a:[[1,-1,1],[0,1,0],[8,2,2]],coeff:[1,-4,-3,6]}];
  cases.forEach(({a,coeff},index)=>{
    const block=bank['3.1.27'].loi_giai.split(`**a.${index+1}.**`)[1].split(/\*\*(?:a\.\d+|b)\.\*\*/)[0];
    expect(block).toContain('B=xI-A');
    const matrices=numericMatrices(block);
    expect(matrices[0]).toEqual(nhanMaTran(a,a));
    const n=a.length;
    const identity=a.map((r,i)=>r.map((_,j)=>i===j?1:0));
    let value=a.map(r=>r.map(()=>0));
    for(const coefficient of coeff){
      value=nhanMaTran(value,a).map((r,i)=>r.map((v,j)=>v+coefficient*identity[i][j]));
    }
    expect(value).toEqual(a.map(r=>r.map(()=>0)));
    expect(matrices.at(-1)).toEqual(value);
    for(const x of [-2,0,2]){
      expect(dinhThuc(a.map((r,i)=>r.map((v,j)=>(i===j?x:0)-v)))).toBeCloseTo(coeff.reduce((v,c)=>v*x+c,0));
    }
    expect(matrices[0]).toHaveLength(n);
  });
});

test('nhãn năm ngăn mê cung tương phản với nút ở cả hai giao diện',()=>{
  const svg=readFileSync('src/figures/sach/ds-do-thi-2-9-8.svg','utf8');
  for(const n of ['1','2','3','4','5'])expect(svg).toContain(`data-text="${n}" fill="var(--paper)"`);
});

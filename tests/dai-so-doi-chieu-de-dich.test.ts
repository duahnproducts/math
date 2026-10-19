import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { dinhThuc, nhanMaTran, nhanVector } from '../src/lib/ma-tran';

const de=JSON.parse(readFileSync('scripts/data/de-bai-nicholson-tieng-viet.json','utf8')) as Record<string,string>;
const giai=JSON.parse(readFileSync('scripts/data/loi-giai-nicholson.json','utf8')) as Record<string,{loi_giai:string}>;
const matrices=(text:string):string[][][]=>[...text.matchAll(/\\begin\{(?:bmatrix|array)\}(?:\{[^}]*\})?([\s\S]*?)\\end\{(?:bmatrix|array)\}/g)]
  .map(m=>m[1].trim().split(/\\\\/).filter(r=>r.trim()).map(r=>r.split('&').map(c=>c.trim())));
const number=(t:string):number=>{
  const fraction=/^(-?)\s*\\frac\{(-?\d+)\}\{(-?\d+)\}$/.exec(t);
  return fraction ? (fraction[1] ? -1:1)*Number(fraction[2])/Number(fraction[3]) : Number(t.replace(/\s/g,''));
};
const numeric=(m:string[][])=>m.map(r=>r.map(number));
const close=(a:number[][],b:number[][])=>{
  expect(a).toHaveLength(b.length);
  a.forEach((row,i)=>{expect(row).toHaveLength(b[i].length);row.forEach((v,j)=>expect(v).toBeCloseTo(b[i][j]));});
};

test('2.4.5 b và f: vị trí dấu nghịch đảo trong đề và kết quả khớp nhau',()=>{
  const b=numeric(matrices(giai['2.4.5'].loi_giai.split('**b.**')[1].split('**c.**')[0])[0]);
  const f=numeric(matrices(giai['2.4.5'].loi_giai.split('**f.**')[1].split('**g.**')[0]).at(-1)!);
  close(b,[[.3,-.2],[.1,.1]]);
  close(f,[[1,0],[-3,.5]]);
  close(nhanMaTran(nhanMaTran([[1,0],[2,1]],f),[[1,0],[2,2]]),[[1,0],[0,1]]);
  expect(de['2.4.5']).toContain('^{-1}');
});

test('2.4.2 j: nghịch đảo giải theo đúng dấu âm ở hàng 3, cột 2',()=>{
  const input=numeric(matrices(de['2.4.2'].split('**j.**')[1].split('**k.**')[0])[0]);
  expect(input[2][1]).toBe(-2);
  const block=giai['2.4.2'].loi_giai.split('**j.**')[1].split('**k.**')[0];
  const inv=numeric(matrices(block.split('A^{-1}=')[1])[0]);
  close(nhanMaTran(input,inv),[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]);
});

test('2.7.3: hai ma trận U đầu có bốn cột, ý d có nghiệm và không đổi dữ kiện',()=>{
  for(const part of ['a','b']){
    const block=de['2.7.3'].split(`**${part}.**`)[1].split(/\*\*[a-z]\.\*\*/)[0];
    expect(matrices(block)[1][0]).toHaveLength(4);
    const solution=giai['2.7.3'].loi_giai.split(`**${part}.**`)[1].split(/\*\*[a-z]\.\*\*/)[0];
    expect(matrices(solution.split(/\$\$\s*x=/)[1])[0]).toHaveLength(4);
  }
  const d=matrices(de['2.7.3'].split('**d.**')[1]).map(numeric);
  expect(d[0][1][0]).toBe(1);
  close(nhanMaTran(d[0],d[1]),[[2,-2,0,2],[1,-2,2,2],[-1,2,0,0],[3,-3,1,4]]);
  expect(nhanVector(nhanMaTran(d[0],d[1]),[8,6,-1,0])).toEqual([4,-6,4,5]);
  expect(giai['2.7.3'].loi_giai.split('**d.**')[1]).not.toContain('vô nghiệm');
});

test('3.4.14: B đúng theo đề, đa thức đặc trưng bằng (x+1)^2(x−2)',()=>{
  const B=numeric(matrices(de['3.4.14'])[1]);
  expect(B).toEqual([[0,1,0],[3,0,1],[2,0,0]]);
  for(const x of [-3,-1,0,1,2,4]){
    expect(dinhThuc(B.map((r,i)=>r.map((v,j)=>(i===j?x:0)-v)))).toBeCloseTo((x+1)**2*(x-2));
  }
  expect(giai['3.4.14'].loi_giai).not.toContain('Lỗi');
});

test('đọc đúng hai mũi tên cạnh v2–v4 và hai cửa của đường hầm vòng',()=>{
  const [A,A3]=matrices(giai['2.3.26'].loi_giai).slice(0,2).map(numeric);
  expect(A[1][3]).toBe(1);expect(A[3][1]).toBe(1);
  close(nhanMaTran(nhanMaTran(A,A),A),A3);
  const P=numeric(matrices(giai['2.9.8'].loi_giai)[0]);
  expect(P[2][2]).toBeCloseTo(2/5);expect(P[3][3]).toBeCloseTo(1/2);
  const stationary=[3/16,2/16,5/16,4/16,2/16];
  nhanVector(P,stationary).forEach((v,i)=>expect(v).toBeCloseTo(stationary[i]));
  expect(nhanMaTran(nhanMaTran(P,P),P)[0][0]).toBeCloseTo(7/75);
});

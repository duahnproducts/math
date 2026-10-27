import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { parse } from 'yaml';
import { chuongCuaBaiTap, chuongCuaMuc, kiemTraChuong, mucCuaSo, nhanBaiTap, type DuLieuChuong } from '../src/lib/noi-dung';
import { docBoLoc } from '../src/lib/loc-bai-tap';
import { mdSangHtml } from '../src/lib/tu-tao/hien-thi';

const counts = [12,8,8,16,7,5,5,10,18,12,11,14,15,14,8];
const inventory = JSON.parse(readFileSync('content/giai-tich/bai-tap-goc.json','utf8')) as {so:string;muc:string;chuong:number}[];
const mon = JSON.parse(readFileSync('content/giai-tich/mon.json','utf8'));
const content = (so:string) => readFileSync(`content/giai-tich/chuong-${chuongCuaBaiTap(so,'giai-tich')}/bai-tap/${so.replaceAll('.','-')}.mdx`,'utf8');

test('163 bài Ross liền số đúng từng §, không để lại bài Abbott hoặc file ngoài danh mục',()=>{
  const expected=counts.flatMap((count,i)=>Array.from({length:count},(_,j)=>`${i+1}.${j+1}`));
  expect(inventory.map(b=>b.so)).toEqual(expected);
  for(const chapter of [1,2]){
    const files=readdirSync(`content/giai-tich/chuong-${chapter}/bai-tap`).sort();
    expect(files).toEqual(inventory.filter(b=>b.chuong===chapter).map(b=>b.so.replaceAll('.','-')+'.mdx').sort());
  }
  expect(mon.chuong.flatMap((c:{muc:{so:string}[]})=>c.muc.map(m=>m.so))).toEqual(Array.from({length:27},(_,i)=>String(i+1)));
});

test.each(inventory)('$so: đề, hai gợi ý, lời giải sáu bước, lỗi và công thức đầy đủ',({so,muc,chuong})=>{
  const text=content(so), front=parse(text.split('---')[1]);
  expect(front).toMatchObject({so,muc,so_sach:so,de_tom_tat:true});
  expect(chuongCuaBaiTap(so,'giai-tich')).toBe(chuong);
  expect(mucCuaSo(so)).toBe(muc);
  for(const tag of ['De','GoiY so={1}','GoiY so={2}','LoiGiai','LoiHayMac'])expect(text).toContain(`<${tag}>`);
  const solution=/<LoiGiai>([\s\S]*?)<\/LoiGiai>/.exec(text)![1];
  expect([...solution.matchAll(/\*\*Bước ([1-6])\./g)].map(m=>m[1])).toEqual(['1','2','3','4','5','6']);
  expect(text).not.toMatch(/@(?:SETS|EXTREMA)|TODO|Chưa có hướng dẫn/);
  // Check every formula in the statement and hints too, including the 23-set tables.
  const html=mdSangHtml(text.slice(text.indexOf('---',3)+3).replace(/<\/?[A-Z][^>]*>/g,''));
  expect(html).not.toContain('katex-error');
});

test('Ross giữ đúng nhãn và chương, bộ lọc đọc một số; Nicholson giữ dạng cũ',()=>{
  expect(nhanBaiTap('12.14')).toBe('Bài 12.14');
  expect(chuongCuaMuc('6','giai-tich')).toBe(1);
  expect(chuongCuaMuc('7','giai-tich')).toBe(2);
  expect(chuongCuaBaiTap('12.14','giai-tich')).toBe(2);
  expect(chuongCuaBaiTap('3.2.14','dai-so')).toBe(3);
  expect(docBoLoc('?muc=12').muc).toBe('12');
  expect(docBoLoc('?muc=2.1').muc).toBe('2.1');
  expect(docBoLoc('?muc=12x').muc).toBeNull();
});

test('bài Ross liên kết đúng § dù chưa có trang Theo sách; chương sai vẫn bị bắt',()=>{
  const du:DuLieuChuong={mon:'giai-tich',chuong:2,cacMuc:[{so:'12',ten:'Limsup'}],sach:[],baiGiang:[],baiTap:[{
    so:'12.14',muc:'12',do_kho:'kho',nen_lam:false,can_dung:[],tep:'12-14.mdx',noiDung:'<De>Đề</De>',
  }]};
  expect(kiemTraChuong(du)).toEqual([]);
  du.chuong=1;
  expect(kiemTraChuong(du).join(' ')).toContain('không thuộc chương 1');
});

test('10 bài giảng nối bài tập đúng §, giữ riêng 30 bài tự luyện',()=>{
  for(let section=1;section<=10;section++){
    const chapter=section<=6?1:2,lesson=section<=6?section:section-6;
    const text=readFileSync(`content/giai-tich/chuong-${chapter}/giang-day/bai-${lesson}.mdx`,'utf8');
    expect(parse(text.split('---')[1]).phu_muc).toEqual([String(section)]);
    expect(text.match(/<LoiGiai>/g)).toHaveLength(3);
  }
});

test('các đề dẫn chiếu giữ đủ dữ kiện và các kết luận nhạy cảm',()=>{
  for(const so of ['4.1','4.2','4.3','4.4']){
    const text=content(so);
    for(const label of 'abcdefghijklmnopqrstuvw')expect(text).toContain(`| ${label} |`);
  }
  for(const so of ['7.3'])for(const label of 'abcdefghijklmnopqrst')expect(content(so)).toContain(`(${label})`);
  expect(content('11.10')).toContain('ô hàng $i$, cột $j$ bằng $1/j$');
  expect(content('13.15')).toContain('khoảng cách nhỏ hơn $1+1=2$');
  expect(content('15.5')).toContain('so sánh các nhóm với một chuỗi hình học');
  expect(content('15.6')).toContain('(-1)^n/\\sqrt n');
  expect(content('9.6')).toContain('3^{2^{n-1}-1}');
});

test('đối chiếu số: tổng quy nạp, truy hồi và các ví dụ tuần hoàn',()=>{
  for(let n=1;n<=20;n++){
    const indices=Array.from({length:n},(_,j)=>j+1);
    expect(indices.reduce((s,k)=>s+k*k,0)).toBe(n*(n+1)*(2*n+1)/6);
    expect(indices.reduce((s,k)=>s+k**3,0)).toBe((n*(n+1)/2)**2);
    expect(indices.reduce((s,k)=>s+8*k-5,0)).toBe(4*n*n-n);
    expect((11n**BigInt(n)-4n**BigInt(n))%7n).toBe(0n);
    expect((7n**BigInt(n)-6n*BigInt(n)-1n)%36n).toBe(0n);
    expect(2**n>n*n).toBe(n===1||n>=5);
  }
  let t=1;
  for(let n=1;n<100;n++){
    t*=1-1/(4*n*n);
    if(n===9)expect(t).toBeCloseTo(.65359,5);
    if(n===99)expect(t).toBeCloseTo(.63822,5);
  }
  let v=1;
  for(let n=1;n<=20;n++){
    expect(v).toBeCloseTo((n+1)/(2*n),12);
    v*=1-1/(n+1)**2;
  }
  const s=[0,1,2,1],u=[2,1,1,0],sum=s.map((v,i)=>v+u[i]),product=s.map((v,i)=>v*u[i]);
  expect([Math.min(...sum),Math.max(...sum),Math.min(...product),Math.max(...product)]).toEqual([1,3,0,2]);
});

import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { expect, test } from 'vitest';
import { nhanBaiTap, nhanMuc } from '../src/lib/noi-dung';
import { chuyenBaiLuyenChuong3, docTienDo, ghiTienDo, tienDoRong } from '../src/lib/tien-do';
import { mdSangHtml } from '../src/lib/tu-tao/hien-thi';

const bank=JSON.parse(readFileSync('content/dai-so/bai-tap-goc.json','utf8')).bai_tap as {so:string;so_sach:string;muc:string;trang:number[]}[];
const counts:Record<string,number>={'2.1':24,'2.2':23,'2.3':35,'2.4':42,'2.5':23,'2.6':25,'2.7':11,'2.8':12,'2.9':12,'2.0':13,'3.1':27,'3.2':34,'3.3':12,'3.4':17,'3.5':5,'3.6':13,'3.7':7,'3.8':3,'3.0':6};
const solutions=JSON.parse(readFileSync('scripts/data/loi-giai-nicholson.json','utf8')) as Record<string,Record<string,string>>;

test.each(Object.entries(solutions))('lời giải %s: đủ tầng, không lỗi công thức hay ký tự điều khiển',(number,answer)=>{
  expect(Object.keys(answer).sort()).toEqual(['goi_y_1','goi_y_2','loi_giai','loi_hay_mac']);
  for(const text of Object.values(answer)){
    expect(text,number).not.toMatch(/[\x00-\x09\x0b-\x1f]/);
    expect(mdSangHtml(text),number).not.toContain('katex-error');
  }
});

test('đủ 344 đề Nicholson, không thiếu số, gồm cả phần bổ sung của hai chương',()=>{
  expect(bank).toHaveLength(344);
  expect(new Set(bank.map(b=>b.so)).size).toBe(344);
  for(const [section,count]of Object.entries(counts)){
    const list=bank.filter(b=>b.muc===section);
    expect(list,section).toHaveLength(count);
    expect(list.map(b=>Number(b.so.split('.').at(-1))).sort((a,b)=>a-b)).toEqual(Array.from({length:count},(_,i)=>i+1));
  }
  expect(bank.filter(b=>b.so.startsWith('2.'))).toHaveLength(220);
  expect(bank.filter(b=>b.so.startsWith('3.'))).toHaveLength(124);
});

test.each(bank)('$so: trang đề tồn tại, đúng số sách, nguồn và dữ liệu hình đầy đủ',(b)=>{
  const chapter=b.so.split('.')[0];
  const text=readFileSync(`content/dai-so/chuong-${chapter}/bai-tap/${b.so.replaceAll('.','-')}.mdx`,'utf8');
  const match=/^---\r?\n([\s\S]*?)\r?\n---/.exec(text)!;
  const data=parse(match[1]);
  expect(data.so).toBe(b.so);
  expect(data.tu_soan).not.toBe(true);
  if(['2.1','2.2'].includes(b.muc))return;
  expect(data.de_goc_tieng_anh).toBe(true);
  expect(data.so_sach).toBe(b.so_sach);
  for(const tag of ['<GoiY so={1}>','<GoiY so={2}>','<LoiGiai>','<LoiHayMac>'])expect(text).toContain(tag);
  expect(text).not.toContain('chưa có bản dịch đề và hướng dẫn giải tiếng Việt');
  const names=[...text.matchAll(/<HinhSach ten="([^"]+)"/g)].map(m=>m[1]);
  expect(names.length).toBeGreaterThan(0);
  const pages=new Set<number>();
  const source=JSON.parse(readFileSync('src/figures/sach/nguon.json','utf8')).hinh;
  for(const name of names){
    pages.add(source[name].trang);
    const svg=readFileSync(`src/figures/sach/${name}.svg`,'utf8');
    expect(svg).toContain('fill="currentColor"');
    expect(svg).not.toMatch(/<path[^>]*d="M0 0H[\d.]+V[\d.]+H0Z"[^>]*fill="currentColor"/);
    expect(svg).toContain('<use');
    for(const id of svg.matchAll(/\bid="([^"]+)"/g))expect(id[1].startsWith(name+'-')).toBe(true);
  }
  expect([...pages].sort((a,b)=>a-b)).toEqual(b.trang);
});

test('24 bài tự soạn có số riêng, nhãn không lộ số định danh, bộ gốc không bị ghi đè',()=>{
  let count=0;
  for(const file of readdirSync('content/dai-so/chuong-3/bai-tap')){
    const text=readFileSync(`content/dai-so/chuong-3/bai-tap/${file}`,'utf8');
    if(!text.includes('tu_soan: true'))continue;
    count++;
    const data=parse(/^---\r?\n([\s\S]*?)\r?\n---/.exec(text)![1]);
    expect(Number(data.so.split('.')[2])).toBeGreaterThanOrEqual(1001);
    expect(bank.some(b=>b.so===data.so)).toBe(false);
  }
  expect(count).toBe(24);
  expect(nhanBaiTap('3.1.1001',true)).toBe('Bài luyện 3.1.1');
  expect(nhanBaiTap('2.0.13')).toBe('Bài bổ sung 2.13');
  expect(nhanMuc('3.0')).toBe('Bổ sung');
});

test('di chuyển tự đánh giá và Học tiếp cũ sang đúng bài luyện; không đổi tiến độ mới lần sau',()=>{
  const pos={href:'/math/dai-so/chuong-3/bai-tap/3-4-2/',tieuDe:'Bài luyện',duongDan:'Đại số',chuong:'dai-so/3',luc:1};
  const old={...tienDoRong(),tuDanhGia:{'dai-so/3/bai-tap/3.4.2':{ketQua:'lam-duoc' as const,luc:1},'dai-so/2/bai-tap/2.1.1':{ketQua:'can-goi-y' as const,luc:2}},lanCuoi:pos,lanCuoiTheoChuong:{'dai-so/3':pos}};
  const migrated=chuyenBaiLuyenChuong3(old);
  expect(migrated.tuDanhGia['dai-so/3/bai-tap/3.4.1002'].ketQua).toBe('lam-duoc');
  expect(migrated.tuDanhGia['dai-so/3/bai-tap/3.4.2']).toBeUndefined();
  expect(migrated.tuDanhGia['dai-so/2/bai-tap/2.1.1']).toEqual(old.tuDanhGia['dai-so/2/bai-tap/2.1.1']);
  expect(migrated.lanCuoi?.href).toBe('/math/dai-so/chuong-3/bai-tap/3-4-1002/');
  migrated.tuDanhGia['dai-so/3/bai-tap/3.4.2']={ketQua:'chua-lam-duoc',luc:3};
  expect(chuyenBaiLuyenChuong3(docTienDo(ghiTienDo(migrated)))).toEqual(migrated);
  expect(old.tuDanhGia['dai-so/3/bai-tap/3.4.2'].ketQua).toBe('lam-duoc');
});

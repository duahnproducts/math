import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { chuyenSangRoss, docTienDo, ghiTienDo, tienDoRong } from '../src/lib/tien-do';

test('Ross §1–§10 chia đúng hai chương, giữ chương Abbott và bản dịch sách gốc ngoài web', () => {
  const mon = JSON.parse(readFileSync('content/giai-tich/mon.json', 'utf8'));
  expect(mon.giao_trinh).toContain('Kenneth A. Ross');
  expect(mon.chuong.map((c: {so:number})=>c.so)).toEqual([1,2]);
  for (const [chapter,count] of [[1,6],[2,4]]) {
    expect(readdirSync(`content/giai-tich/chuong-${chapter}/giang-day`)).toHaveLength(count);
  }
  expect(readdirSync('public/tai-ve').filter(f=>f.startsWith('giai-tich-'))).toEqual(['giai-tich-ross-bai-giang-1-10.pdf']);
});

test('đổi từ Abbott sang Ross chỉ xóa tiến độ Giải tích một lần, giữ các môn khác và tiến độ mới', () => {
  const old = {...tienDoRong(), daHoc:{'giai-tich/1/giang-day/1':1,'dai-so/1/giang-day/1':1}};
  const migrated=chuyenSangRoss(old);
  expect(migrated.daHoc).toEqual({'dai-so/1/giang-day/1':1});
  migrated.daHoc['giai-tich/2/giang-day/1']=2;
  const restored=docTienDo(ghiTienDo(migrated));
  expect(chuyenSangRoss(restored)).toEqual(migrated);
});

test('các bản dịch mới khai báo tải về, PDF hợp lệ và có ghi nguồn / giấy phép', () => {
  for (const [subject,chapters] of [['dai-so',[4,5,6,7,8]],['vi-mo',[5,7,8]]] as const) {
    const mon=JSON.parse(readFileSync(`content/${subject}/mon.json`,'utf8'));
    for (const n of chapters) {
      const chapter=mon.chuong.find((c:{so:number})=>c.so===n);
      expect(chapter.tai_ve).toHaveLength(1);
      const file=chapter.tai_ve[0];
      expect(file.mo_ta).toContain('CC BY-NC-SA 4.0');
      expect(readFileSync(`public/tai-ve/${file.tep}`).subarray(0,5).toString()).toBe('%PDF-');
    }
  }
});

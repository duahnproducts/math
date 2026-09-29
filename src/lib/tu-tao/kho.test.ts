import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { DAN_Y_MAU, baiMau } from '../../../tests/fixtures/tu-tao';
import { docFileMon, taoIdMon, taoKho, taoMonMoi, tenFileXuat, xuatMon, type KhoMon, type ThongTinMonMoi } from './kho';

const TT: ThongTinMonMoi = {
  ten: 'Kinh tế vĩ mô',
  ten_en: 'Macroeconomics',
  giao_trinh: 'OpenStax',
  mo_ta: 'GDP, lạm phát.',
  ten_file: 'macro.pdf',
  tong_so_trang: 300,
  chuong: [
    { so: 1, ten: 'Đo lường', ten_en: 'Measuring', trang_dau: 15, trang_cuoi: 44 },
    { so: 2, ten: 'Lạm phát', ten_en: 'Inflation', trang_dau: 45, trang_cuoi: 80 },
  ],
};
const LUC = new Date('2026-09-29T08:00:00Z');

describe('taoIdMon', () => {
  it('tên không dấu + đuôi ngẫu nhiên', () => {
    expect(taoIdMon('Kinh tế vĩ mô', () => 0)).toBe('kinh-te-vi-mo-00000');
    expect(taoIdMon('Đại số!!', () => 0.5)).toMatch(/^dai-so-[a-z0-9]{5}$/);
    expect(taoIdMon('???', () => 0)).toBe('mon-00000');
  });
});

describe('taoMonMoi', () => {
  it('tạo môn với các chương chưa có bài', () => {
    const m = taoMonMoi(TT, LUC, () => 0);
    expect(m.id).toBe('kinh-te-vi-mo-00000');
    expect(m.tao_luc).toBe('2026-09-29T08:00:00.000Z');
    expect(m.chuong.map((c) => [c.so, c.dan_y, c.bai.length])).toEqual([
      [1, null, 0],
      [2, null, 0],
    ]);
  });

  it('khoảng trang sai thì không tạo', () => {
    expect(() => taoMonMoi({ ...TT, chuong: [{ ...TT.chuong[0], trang_dau: 50, trang_cuoi: 10 }] })).toThrow(/khoảng trang sai/);
  });
});

describe('kho IndexedDB', () => {
  let kho: KhoMon;
  beforeEach(() => {
    kho = taoKho(new IDBFactory());
  });

  it('lưu, đọc lại, liệt kê mới nhất trước, xoá', async () => {
    const a = await kho.luu(taoMonMoi(TT, LUC, () => 0.1), new Date('2026-09-29T09:00:00Z'));
    const b = await kho.luu(taoMonMoi({ ...TT, ten: 'Toán rời rạc' }, LUC, () => 0.2), new Date('2026-09-29T10:00:00Z'));
    expect((await kho.danhSach()).map((m) => m.id)).toEqual([b.id, a.id]);
    expect(await kho.doc(a.id)).toEqual(a);
    await kho.xoa(b.id);
    expect((await kho.danhSach()).map((m) => m.id)).toEqual([a.id]);
    expect(await kho.doc(b.id)).toBeNull();
  });

  it('lưu cả dàn ý và bài giảng', async () => {
    const m = taoMonMoi(TT, LUC);
    m.chuong[0] = { ...m.chuong[0], dan_y: DAN_Y_MAU, bai: [baiMau(1)] };
    await kho.luu(m);
    const doc = await kho.doc(m.id);
    expect(doc?.chuong[0].bai[0].tieu_de).toBe('Bài mẫu số 1');
    expect(doc?.chuong[0].dan_y).toEqual(DAN_Y_MAU);
  });

  it('bỏ qua bản ghi hỏng thay vì làm hỏng cả danh sách', async () => {
    const idb = new IDBFactory();
    const k = taoKho(idb);
    await k.luu(taoMonMoi(TT, LUC));
    await new Promise<void>((xong) => {
      const req = idb.open('hochanh-tu-tao', 1);
      req.onsuccess = () => {
        const gd = req.result.transaction('mon', 'readwrite');
        gd.objectStore('mon').put({ id: 'hong', ten: 1 });
        gd.oncomplete = () => {
          req.result.close();
          xong();
        };
      };
    });
    expect(await k.danhSach()).toHaveLength(1);
  });
});

describe('sao lưu ra file .json', () => {
  it('tải về rồi nhập lại được y nguyên', () => {
    const m = taoMonMoi(TT, LUC, () => 0);
    m.chuong[0] = { ...m.chuong[0], dan_y: DAN_Y_MAU, bai: [baiMau(1), baiMau(2)] };
    expect(docFileMon(xuatMon(m))).toEqual(m);
    expect(tenFileXuat(m)).toBe('kinh-te-vi-mo-00000.hochanh.json');
  });

  it('báo lỗi dễ hiểu với file lạ', () => {
    expect(() => docFileMon('không phải json')).toThrow('File không phải JSON.');
    expect(() => docFileMon('{"a":1}')).toThrow(/không phải file môn học/);
    expect(() => docFileMon(JSON.stringify({ loai: 'hochanh-mon-tu-tao', mon: { id: 'x' } }))).toThrow(/Môn học không hợp lệ/);
  });
});

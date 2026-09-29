import { describe, expect, it } from 'vitest';
import {
  DUNG_LUONG_TOI_DA,
  TRANG_TOI_DA_MOT_CHUONG,
  khoangMucLuc,
  loiDungLuong,
  loiKhoangTrang,
  tinhKhoangTrang,
} from './trang';

describe('khoangMucLuc', () => {
  it('lấy 40 trang đầu, file ngắn hơn thì lấy cả file', () => {
    expect(khoangMucLuc(500)).toEqual({ trang_dau: 1, trang_cuoi: 40 });
    expect(khoangMucLuc(12)).toEqual({ trang_dau: 1, trang_cuoi: 12 });
  });
});

describe('tinhKhoangTrang', () => {
  it('cộng độ lệch; chương kết thúc ngay trước chương sau; chương cuối tới hết file', () => {
    const k = tinhKhoangTrang([{ trang_in: 1 }, { trang_in: 31 }, { trang_in: 70 }], 14, 120);
    expect(k).toEqual([
      { trang_dau: 15, trang_cuoi: 44, can_kiem_tra: false },
      { trang_dau: 45, trang_cuoi: 83, can_kiem_tra: false },
      { trang_dau: 84, trang_cuoi: 120, can_kiem_tra: false },
    ]);
  });

  it('không biết độ lệch thì coi như 0 và đánh dấu cần kiểm tra', () => {
    const k = tinhKhoangTrang([{ trang_in: 1 }, { trang_in: 10 }], null, 20);
    expect(k.map((x) => [x.trang_dau, x.trang_cuoi])).toEqual([
      [1, 9],
      [10, 20],
    ]);
    expect(k.every((x) => x.can_kiem_tra)).toBe(true);
  });

  it('chương thiếu số trang được đặt ngay sau chương trước', () => {
    const k = tinhKhoangTrang([{ trang_in: 5 }, { trang_in: null }, { trang_in: 20 }], 0, 30);
    expect(k[1]).toEqual({ trang_dau: 5, trang_cuoi: 19, can_kiem_tra: true });
    expect(k[0].trang_cuoi).toBe(5);
  });

  it('số trang vượt quá file thì kẹp lại trong file', () => {
    const k = tinhKhoangTrang([{ trang_in: 1 }, { trang_in: 900 }], 0, 50);
    expect(k[1]).toEqual({ trang_dau: 50, trang_cuoi: 50, can_kiem_tra: false });
  });

  it('một chương không có số trang: cả file', () => {
    expect(tinhKhoangTrang([{ trang_in: null }], null, 33)).toEqual([{ trang_dau: 1, trang_cuoi: 33, can_kiem_tra: true }]);
  });
});

describe('loiKhoangTrang', () => {
  it('nhận khoảng hợp lệ', () => {
    expect(loiKhoangTrang(3, 40, 100)).toBeNull();
  });

  it('báo lỗi dễ hiểu', () => {
    expect(loiKhoangTrang(0, 5, 100)).toMatch(/từ 1/);
    expect(loiKhoangTrang(5, 101, 100)).toMatch(/chỉ có 100 trang/);
    expect(loiKhoangTrang(9, 5, 100)).toMatch(/sau trang đầu/);
    expect(loiKhoangTrang(1.5, 5, 100)).toMatch(/số nguyên/);
    expect(loiKhoangTrang(1, TRANG_TOI_DA_MOT_CHUONG + 1, 999)).toMatch(/chia thành hai chương/);
  });
});

describe('loiDungLuong', () => {
  it('chặn phần PDF quá nặng cho một yêu cầu 32 MB', () => {
    expect(loiDungLuong(DUNG_LUONG_TOI_DA)).toBeNull();
    expect(loiDungLuong(DUNG_LUONG_TOI_DA + 1)).toMatch(/quá 22,0 MB/);
    // base64 to thêm 4/3 mà vẫn dưới 32 MB
    expect((DUNG_LUONG_TOI_DA * 4) / 3).toBeLessThan(32 * 1024 * 1024);
  });
});

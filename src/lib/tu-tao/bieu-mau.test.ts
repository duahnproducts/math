import { describe, expect, it } from 'vitest';
import { MUC_LUC_MAU } from '../../../tests/fixtures/tu-tao';
import { bieuMauTuMucLuc, bieuMauTuNhap, dongMoi, kiemTraBieuMau, type DongChuong } from './bieu-mau';

const TT = { ten: 'Kinh tế vĩ mô', ten_en: '', giao_trinh: '', mo_ta: '' };
const dong = (so: string, ten: string, dau: string, cuoi: string): DongChuong => ({
  so,
  ten,
  ten_en: '',
  trang_dau: dau,
  trang_cuoi: cuoi,
  can_kiem_tra: false,
});

describe('điền sẵn biểu mẫu', () => {
  it('từ mục lục: thông tin môn và khoảng trang đã cộng độ lệch', () => {
    const { thong_tin, chuong } = bieuMauTuMucLuc(MUC_LUC_MAU, 10);
    expect(thong_tin.ten).toBe('Kinh tế vĩ mô');
    expect(chuong.map((c) => [c.so, c.trang_dau, c.trang_cuoi])).toEqual([
      ['1', '3', '4'],
      ['2', '5', '10'],
    ]);
  });

  it('tự nhập: một chương cả file, tên lấy từ tên file', () => {
    const { thong_tin, chuong } = bieuMauTuNhap('kinh_te-vi-mo.PDF', 42);
    expect(thong_tin.ten).toBe('kinh te vi mo');
    expect(chuong).toEqual([dong('1', '', '1', '42')]);
  });

  it('thêm dòng: số chương và trang đầu nối tiếp dòng trước', () => {
    expect(dongMoi([dong('3', 'A', '10', '20')], 50)).toEqual(dong('4', '', '21', '50'));
    expect(dongMoi([], 50)).toEqual(dong('1', '', '1', '50'));
  });
});

describe('kiemTraBieuMau', () => {
  it('hợp lệ thì đọc thành số', () => {
    const kq = kiemTraBieuMau(TT, [dong('1', ' Cung cầu ', '3', '30'), dong('2', 'Co giãn', '31', '60')], 100);
    expect(kq).toEqual({
      hop_le: true,
      chuong: [
        { so: 1, ten: 'Cung cầu', ten_en: '', trang_dau: 3, trang_cuoi: 30 },
        { so: 2, ten: 'Co giãn', ten_en: '', trang_dau: 31, trang_cuoi: 60 },
      ],
    });
  });

  it('báo lỗi từng dòng: số chương, tên, trang, trùng số', () => {
    const kq = kiemTraBieuMau(
      TT,
      [dong('x', 'A', '1', '2'), dong('2', '', '1', '2'), dong('3', 'C', '9', '5'), dong('4', 'D', '1', '2'), dong('4', 'E', '3', '4')],
      100,
    );
    expect(kq.hop_le).toBe(false);
    if (kq.hop_le) return;
    expect(kq.loi_dong[0]).toMatch(/số nguyên dương/);
    expect(kq.loi_dong[1]).toMatch(/Chưa có tên chương/);
    expect(kq.loi_dong[2]).toMatch(/sau trang đầu/);
    expect(kq.loi_dong[3]).toBe('');
    expect(kq.loi_dong[4]).toMatch(/trùng số/);
  });

  it('thiếu tên môn hoặc không có chương nào', () => {
    expect(kiemTraBieuMau({ ...TT, ten: ' ' }, [dong('1', 'A', '1', '2')], 9)).toMatchObject({ loi_chung: 'Chưa có tên môn.' });
    expect(kiemTraBieuMau(TT, [], 9)).toMatchObject({ loi_chung: 'Cần ít nhất một chương.' });
  });

  it('trang ngoài file', () => {
    const kq = kiemTraBieuMau(TT, [dong('1', 'A', '1', '120')], 100);
    expect(kq.hop_le === false && kq.loi_dong[0]).toMatch(/chỉ có 100 trang/);
  });
});

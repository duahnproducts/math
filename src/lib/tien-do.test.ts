import { describe, expect, it } from 'vitest';
import {
  baiCanLamLai,
  boDanhDauDaHoc,
  capNhatViTri,
  chuongGanDay,
  daHoc,
  danhDauDaHoc,
  docTienDo,
  ghiTienDo,
  ketQuaTuDanhGia,
  khoaBaiGiang,
  khoaBaiTap,
  khoaChuong,
  khoaSach,
  luuTuDanhGia,
  tienDoBaiTap,
  tienDoDoc,
  tienDoRong,
  type ViTri,
} from './tien-do';

const viTri = (href: string, chuong: string, luc: number): ViTri => ({
  href,
  tieuDe: href,
  duongDan: 'Giải tích › Chương 1',
  chuong,
  luc,
});

describe('khoá', () => {
  it('không phụ thuộc URL', () => {
    expect(khoaChuong('giai-tich', 1)).toBe('giai-tich/1');
    expect(khoaBaiGiang('giai-tich', 1, 2)).toBe('giai-tich/1/giang-day/2');
    expect(khoaSach('giai-tich', 1, '1.3')).toBe('giai-tich/1/sach/1.3');
    expect(khoaBaiTap('giai-tich', 1, '1.2.5')).toBe('giai-tich/1/bai-tap/1.2.5');
  });
});

describe('đọc / ghi', () => {
  it('chuỗi rỗng, hỏng, sai dạng → tiến độ rỗng, không lỗi', () => {
    expect(docTienDo(null)).toEqual(tienDoRong());
    expect(docTienDo('{hỏng')).toEqual(tienDoRong());
    expect(docTienDo('[1,2]')).toEqual(tienDoRong());
    expect(docTienDo('"chuoi"')).toEqual(tienDoRong());
  });

  it('ghi rồi đọc lại giữ nguyên', () => {
    let td = tienDoRong();
    td = danhDauDaHoc(td, 'a', 10);
    td = luuTuDanhGia(td, 'b', 'can-goi-y', 20);
    td = capNhatViTri(td, viTri('/math/x/', 'giai-tich/1', 30));
    expect(docTienDo(ghiTienDo(td))).toEqual(td);
  });

  it('bỏ phần dữ liệu hỏng, giữ phần tốt', () => {
    const td = docTienDo(
      JSON.stringify({
        daHoc: { a: 1, b: 'x' },
        tuDanhGia: { c: { ketQua: 'lam-duoc', luc: 2 }, d: { ketQua: 'bừa' } },
        lanCuoi: { href: 3 },
      }),
    );
    expect(td.daHoc).toEqual({ a: 1 });
    expect(Object.keys(td.tuDanhGia)).toEqual(['c']);
    expect(td.lanCuoi).toBeNull();
  });
});

describe('cập nhật là hàm thuần', () => {
  it('không sửa trạng thái cũ', () => {
    const cu = tienDoRong();
    const moi = danhDauDaHoc(cu, 'a', 1);
    expect(cu.daHoc).toEqual({});
    expect(daHoc(moi, 'a')).toBe(true);
    expect(daHoc(boDanhDauDaHoc(moi, 'a'), 'a')).toBe(false);
  });

  it('tự đánh giá lần sau ghi đè lần trước', () => {
    let td = luuTuDanhGia(tienDoRong(), 'x', 'chua-lam-duoc', 1);
    td = luuTuDanhGia(td, 'x', 'lam-duoc', 2);
    expect(ketQuaTuDanhGia(td, 'x')).toBe('lam-duoc');
    expect(ketQuaTuDanhGia(td, 'y')).toBeNull();
  });

  it('vị trí cuối cùng cập nhật cả theo chương', () => {
    let td = capNhatViTri(tienDoRong(), viTri('/a/', 'giai-tich/1', 1));
    td = capNhatViTri(td, viTri('/b/', 'dai-so/1', 2));
    td = capNhatViTri(td, viTri('/c/', 'giai-tich/1', 3));
    expect(td.lanCuoi?.href).toBe('/c/');
    expect(td.lanCuoiTheoChuong['giai-tich/1'].href).toBe('/c/');
    expect(td.lanCuoiTheoChuong['dai-so/1'].href).toBe('/b/');
    expect(chuongGanDay(td).map((v) => v.chuong)).toEqual(['giai-tich/1', 'dai-so/1']);
    expect(chuongGanDay(td, 1)).toHaveLength(1);
  });
});

describe('tổng hợp', () => {
  it('tiến độ đọc theo phần trăm làm tròn', () => {
    const td = danhDauDaHoc(tienDoRong(), 'a', 1);
    expect(tienDoDoc(td, ['a', 'b', 'c'])).toEqual({ xong: 1, tong: 3, phanTram: 33 });
    expect(tienDoDoc(td, [])).toEqual({ xong: 0, tong: 0, phanTram: 0 });
  });

  it('tiến độ bài tập chỉ đếm "Làm được"', () => {
    let td = luuTuDanhGia(tienDoRong(), 'a', 'lam-duoc', 1);
    td = luuTuDanhGia(td, 'b', 'can-goi-y', 1);
    expect(tienDoBaiTap(td, ['a', 'b']).xong).toBe(1);
  });

  it('bài cần làm lại: chưa làm được trước, mới nhất trước', () => {
    let td = tienDoRong();
    td = luuTuDanhGia(td, 'a', 'can-goi-y', 5);
    td = luuTuDanhGia(td, 'b', 'chua-lam-duoc', 1);
    td = luuTuDanhGia(td, 'c', 'lam-duoc', 9);
    td = luuTuDanhGia(td, 'd', 'chua-lam-duoc', 3);
    expect(baiCanLamLai(td, ['a', 'b', 'c', 'd', 'e'])).toEqual(['d', 'b', 'a']);
  });
});

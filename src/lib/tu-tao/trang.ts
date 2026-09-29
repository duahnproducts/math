// Khoảng trang của từng chương trong file PDF và các giới hạn khi gửi PDF cho Claude.
// Trang ở đây luôn là trang PDF (đếm từ 1 theo thứ tự trong file), khác với số trang
// in trên sách: lời nói đầu, mục lục thường làm hai số này lệch nhau.
import type { ChuongTrongMucLuc } from './khung';

/** Đọc mục lục: gửi bấy nhiêu trang đầu file, đủ để thấy mục lục và trang đầu Chương 1. */
export const SO_TRANG_MUC_LUC = 40;

/** Một chương gửi đi tối đa bấy nhiêu trang — dài hơn thì chia nhỏ để đỡ tốn và đỡ loãng. */
export const TRANG_TOI_DA_MOT_CHUONG = 120;

/**
 * Giới hạn một yêu cầu của API là 32 MB, tính cả PDF đã mã hoá base64 (to thêm 4/3).
 * Chừa chỗ cho lời nhắc hệ thống nên PDF gốc tối đa khoảng 22 MB.
 */
export const DUNG_LUONG_TOI_DA = 22 * 1024 * 1024;

export interface KhoangTrang {
  trang_dau: number;
  trang_cuoi: number;
  /** true khi phải đoán (thiếu số trang in hoặc độ lệch) — người học nên kiểm tra lại */
  can_kiem_tra: boolean;
}

/** Khoảng trang để đọc mục lục: [1, min(40, tổng)]. */
export function khoangMucLuc(tongSoTrang: number): { trang_dau: number; trang_cuoi: number } {
  return { trang_dau: 1, trang_cuoi: Math.max(1, Math.min(SO_TRANG_MUC_LUC, tongSoTrang)) };
}

/**
 * Từ số trang in trong mục lục và độ lệch, tính khoảng trang PDF của từng chương.
 * Chương kết thúc ngay trước trang đầu của chương sau; chương cuối kéo tới hết file
 * (phụ lục, chỉ mục ở cuối sách thì người học tự cắt bớt).
 */
export function tinhKhoangTrang(
  chuong: Pick<ChuongTrongMucLuc, 'trang_in'>[],
  doLech: number | null,
  tongSoTrang: number,
): KhoangTrang[] {
  const tong = Math.max(1, tongSoTrang);
  const kep = (n: number) => Math.min(tong, Math.max(1, n));
  const lech = doLech ?? 0;
  const dau = chuong.map((c) => (c.trang_in === null ? null : kep(c.trang_in + lech)));

  // Chương thiếu số trang: đặt ngay sau chương trước (hoặc trang 1)
  const dauDu: number[] = [];
  dau.forEach((d, i) => {
    const truoc = i > 0 ? dauDu[i - 1] : 1;
    dauDu.push(d === null || d < truoc ? truoc : d);
  });

  return dauDu.map((d, i) => {
    const sau = dauDu[i + 1];
    const cuoi = sau === undefined ? tong : Math.max(d, sau - 1);
    return { trang_dau: d, trang_cuoi: cuoi, can_kiem_tra: doLech === null || dau[i] === null };
  });
}

/** Kiểm tra khoảng trang người học nhập. Trả về câu báo lỗi, hoặc null nếu hợp lệ. */
export function loiKhoangTrang(trangDau: number, trangCuoi: number, tongSoTrang: number): string | null {
  if (!Number.isInteger(trangDau) || !Number.isInteger(trangCuoi)) return 'Số trang phải là số nguyên.';
  if (trangDau < 1) return 'Trang đầu phải từ 1 trở lên.';
  if (trangCuoi > tongSoTrang) return `File chỉ có ${tongSoTrang} trang.`;
  if (trangCuoi < trangDau) return 'Trang cuối phải sau trang đầu.';
  const so = trangCuoi - trangDau + 1;
  if (so > TRANG_TOI_DA_MOT_CHUONG) {
    return `Chương dài ${so} trang, quá ${TRANG_TOI_DA_MOT_CHUONG} trang. Hãy chia thành hai chương nhỏ hơn.`;
  }
  return null;
}

/** Báo lỗi khi phần PDF cắt ra quá nặng để gửi trong một yêu cầu. */
export function loiDungLuong(soByte: number): string | null {
  if (soByte <= DUNG_LUONG_TOI_DA) return null;
  const mb = (n: number) => (n / 1024 / 1024).toFixed(1).replace('.', ',');
  return `Phần PDF này nặng ${mb(soByte)} MB, quá ${mb(DUNG_LUONG_TOI_DA)} MB. Hãy chia chương thành khoảng trang ngắn hơn.`;
}

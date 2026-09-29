// Biểu mẫu "Tạo môn mới": bảng chương người học sửa tay sau khi đọc mục lục
// (hoặc tự nhập từ đầu). Ô nhập luôn là chuỗi; đọc thành số và báo lỗi từng dòng.
import type { MucLucSach } from './khung';
import { loiKhoangTrang, tinhKhoangTrang } from './trang';

export interface DongChuong {
  so: string;
  ten: string;
  ten_en: string;
  trang_dau: string;
  trang_cuoi: string;
  /** Số trang do máy đoán — nhắc người học mở PDF kiểm tra lại */
  can_kiem_tra: boolean;
}

export interface ThongTinBieuMau {
  ten: string;
  ten_en: string;
  giao_trinh: string;
  mo_ta: string;
}

export interface ChuongDaDoc {
  so: number;
  ten: string;
  ten_en: string;
  trang_dau: number;
  trang_cuoi: number;
}

export type KetQuaBieuMau =
  | { hop_le: true; chuong: ChuongDaDoc[] }
  | { hop_le: false; loi_chung: string | null; loi_dong: string[] };

/** Mục lục Claude đọc được → thông tin môn và bảng chương để người học sửa. */
export function bieuMauTuMucLuc(ml: MucLucSach, tongSoTrang: number): { thong_tin: ThongTinBieuMau; chuong: DongChuong[] } {
  const khoang = tinhKhoangTrang(ml.chuong, ml.do_lech_trang, tongSoTrang);
  return {
    thong_tin: { ten: ml.ten_mon, ten_en: ml.ten_mon_en, giao_trinh: ml.giao_trinh, mo_ta: ml.mo_ta },
    chuong: ml.chuong.map((c, i) => ({
      so: String(c.so),
      ten: c.ten,
      ten_en: c.ten_en,
      trang_dau: String(khoang[i].trang_dau),
      trang_cuoi: String(khoang[i].trang_cuoi),
      can_kiem_tra: khoang[i].can_kiem_tra,
    })),
  };
}

/** Tự nhập: một chương là cả file, tên môn lấy theo tên file. */
export function bieuMauTuNhap(tenFile: string, tongSoTrang: number): { thong_tin: ThongTinBieuMau; chuong: DongChuong[] } {
  const ten = tenFile.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
  return {
    thong_tin: { ten, ten_en: '', giao_trinh: ten, mo_ta: '' },
    chuong: [{ so: '1', ten: '', ten_en: '', trang_dau: '1', trang_cuoi: String(tongSoTrang), can_kiem_tra: false }],
  };
}

/** Thêm một dòng mới sau dòng cuối: số chương kế tiếp, bắt đầu sau trang cuối của dòng trước. */
export function dongMoi(cac: DongChuong[], tongSoTrang: number): DongChuong {
  const cuoi = cac.at(-1);
  const so = cuoi ? (Number(cuoi.so) || cac.length) + 1 : 1;
  const dau = cuoi ? Math.min(tongSoTrang, (Number(cuoi.trang_cuoi) || 0) + 1) : 1;
  return { so: String(so), ten: '', ten_en: '', trang_dau: String(dau), trang_cuoi: String(tongSoTrang), can_kiem_tra: false };
}

const soNguyen = (s: string) => (/^\s*\d+\s*$/.test(s) ? Number(s) : Number.NaN);

export function kiemTraBieuMau(tt: ThongTinBieuMau, cac: DongChuong[], tongSoTrang: number): KetQuaBieuMau {
  const loiDong = cac.map((d) => {
    const so = soNguyen(d.so);
    if (!Number.isInteger(so) || so < 1) return 'Số chương phải là số nguyên dương.';
    if (!d.ten.trim()) return 'Chưa có tên chương.';
    return loiKhoangTrang(soNguyen(d.trang_dau), soNguyen(d.trang_cuoi), tongSoTrang) ?? '';
  });
  const soDaGap = new Set<string>();
  cac.forEach((d, i) => {
    const khoa = String(soNguyen(d.so));
    if (!loiDong[i] && soDaGap.has(khoa)) loiDong[i] = `Chương ${khoa} bị trùng số.`;
    soDaGap.add(khoa);
  });

  let loiChung: string | null = null;
  if (!tt.ten.trim()) loiChung = 'Chưa có tên môn.';
  else if (cac.length === 0) loiChung = 'Cần ít nhất một chương.';

  if (loiChung || loiDong.some(Boolean)) return { hop_le: false, loi_chung: loiChung, loi_dong: loiDong };
  return {
    hop_le: true,
    chuong: cac.map((d) => ({
      so: soNguyen(d.so),
      ten: d.ten.trim(),
      ten_en: d.ten_en.trim(),
      trang_dau: soNguyen(d.trang_dau),
      trang_cuoi: soNguyen(d.trang_cuoi),
    })),
  };
}

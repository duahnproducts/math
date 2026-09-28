// Tiến độ học, lưu trong localStorage (product_design.md, mục 10).
// Mọi hàm ở đây là hàm thuần: nhận trạng thái cũ, trả trạng thái mới.

export const KHOA_TIEN_DO = 'hochanh:tien-do';

export type TuDanhGia = 'lam-duoc' | 'can-goi-y' | 'chua-lam-duoc';

export const NHAN_TU_DANH_GIA: Record<TuDanhGia, string> = {
  'lam-duoc': 'Làm được',
  'can-goi-y': 'Cần gợi ý',
  'chua-lam-duoc': 'Chưa làm được',
};

/** Chỗ người học đang đứng — để nút Học tiếp đưa về đúng chỗ. */
export interface ViTri {
  href: string;
  tieuDe: string;
  /** Môn › Chương › Bài, để hiện trên nút Học tiếp */
  duongDan: string;
  /** Khoá chương, ví dụ 'giai-tich/1' */
  chuong: string;
  luc: number;
}

export interface TienDo {
  phienBan: 1;
  /** khoá bài giảng / mục § → thời điểm đánh dấu đã học */
  daHoc: Record<string, number>;
  /** khoá bài tập → kết quả tự đánh giá */
  tuDanhGia: Record<string, { ketQua: TuDanhGia; luc: number }>;
  lanCuoi: ViTri | null;
  /** chỗ dừng gần nhất của từng chương */
  lanCuoiTheoChuong: Record<string, ViTri>;
}

export function tienDoRong(): TienDo {
  return { phienBan: 1, daHoc: {}, tuDanhGia: {}, lanCuoi: null, lanCuoiTheoChuong: {} };
}

// ---- khoá ----

export function khoaChuong(mon: string, chuong: number): string {
  return `${mon}/${chuong}`;
}
export function khoaBaiGiang(mon: string, chuong: number, bai: number): string {
  return `${mon}/${chuong}/giang-day/${bai}`;
}
export function khoaSach(mon: string, chuong: number, muc: string): string {
  return `${mon}/${chuong}/sach/${muc}`;
}
export function khoaBaiTap(mon: string, chuong: number, so: string): string {
  return `${mon}/${chuong}/bai-tap/${so}`;
}

// ---- đọc / ghi ----

const LA_TU_DANH_GIA = new Set<string>(['lam-duoc', 'can-goi-y', 'chua-lam-duoc']);

function laDoiTuong(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function docViTri(x: unknown): ViTri | null {
  if (!laDoiTuong(x)) return null;
  const { href, tieuDe, duongDan, chuong, luc } = x;
  if (typeof href !== 'string' || typeof tieuDe !== 'string' || typeof luc !== 'number') return null;
  return {
    href,
    tieuDe,
    duongDan: typeof duongDan === 'string' ? duongDan : '',
    chuong: typeof chuong === 'string' ? chuong : '',
    luc,
  };
}

/** Đọc chuỗi JSON đã lưu. Hỏng, thiếu hoặc sai dạng thì bỏ phần hỏng, không ném lỗi. */
export function docTienDo(chuoi: string | null | undefined): TienDo {
  const td = tienDoRong();
  if (!chuoi) return td;
  let du: unknown;
  try {
    du = JSON.parse(chuoi);
  } catch {
    return td;
  }
  if (!laDoiTuong(du)) return td;

  if (laDoiTuong(du.daHoc)) {
    for (const [k, v] of Object.entries(du.daHoc)) {
      if (typeof v === 'number') td.daHoc[k] = v;
    }
  }
  if (laDoiTuong(du.tuDanhGia)) {
    for (const [k, v] of Object.entries(du.tuDanhGia)) {
      if (laDoiTuong(v) && typeof v.ketQua === 'string' && LA_TU_DANH_GIA.has(v.ketQua)) {
        td.tuDanhGia[k] = { ketQua: v.ketQua as TuDanhGia, luc: typeof v.luc === 'number' ? v.luc : 0 };
      }
    }
  }
  td.lanCuoi = docViTri(du.lanCuoi);
  if (laDoiTuong(du.lanCuoiTheoChuong)) {
    for (const [k, v] of Object.entries(du.lanCuoiTheoChuong)) {
      const vt = docViTri(v);
      if (vt) td.lanCuoiTheoChuong[k] = vt;
    }
  }
  return td;
}

export function ghiTienDo(td: TienDo): string {
  return JSON.stringify(td);
}

// ---- cập nhật ----

export function danhDauDaHoc(td: TienDo, khoa: string, luc: number): TienDo {
  return { ...td, daHoc: { ...td.daHoc, [khoa]: luc } };
}

export function boDanhDauDaHoc(td: TienDo, khoa: string): TienDo {
  const daHoc = { ...td.daHoc };
  delete daHoc[khoa];
  return { ...td, daHoc };
}

export function daHoc(td: TienDo, khoa: string): boolean {
  return khoa in td.daHoc;
}

export function luuTuDanhGia(td: TienDo, khoa: string, ketQua: TuDanhGia, luc: number): TienDo {
  return { ...td, tuDanhGia: { ...td.tuDanhGia, [khoa]: { ketQua, luc } } };
}

export function ketQuaTuDanhGia(td: TienDo, khoa: string): TuDanhGia | null {
  return td.tuDanhGia[khoa]?.ketQua ?? null;
}

export function capNhatViTri(td: TienDo, viTri: ViTri): TienDo {
  const lanCuoiTheoChuong = viTri.chuong
    ? { ...td.lanCuoiTheoChuong, [viTri.chuong]: viTri }
    : td.lanCuoiTheoChuong;
  return { ...td, lanCuoi: viTri, lanCuoiTheoChuong };
}

// ---- tổng hợp ----

export interface TomTatTienDo {
  xong: number;
  tong: number;
  phanTram: number;
}

function tomTat(xong: number, tong: number): TomTatTienDo {
  return { xong, tong, phanTram: tong === 0 ? 0 : Math.round((xong / tong) * 100) };
}

/** Bao nhiêu bài giảng / mục § trong danh sách đã được đánh dấu đã học. */
export function tienDoDoc(td: TienDo, cacKhoa: string[]): TomTatTienDo {
  return tomTat(cacKhoa.filter((k) => daHoc(td, k)).length, cacKhoa.length);
}

/** Bao nhiêu bài tập đã tự đánh giá "Làm được". */
export function tienDoBaiTap(td: TienDo, cacKhoa: string[]): TomTatTienDo {
  return tomTat(cacKhoa.filter((k) => ketQuaTuDanhGia(td, k) === 'lam-duoc').length, cacKhoa.length);
}

/** Bài nên làm lại: tự đánh giá "Chưa làm được" trước, rồi "Cần gợi ý"; mới nhất lên đầu. */
export function baiCanLamLai(td: TienDo, cacKhoa: string[]): string[] {
  const uuTien: Record<TuDanhGia, number> = { 'chua-lam-duoc': 0, 'can-goi-y': 1, 'lam-duoc': 2 };
  return cacKhoa
    .filter((k) => {
      const kq = ketQuaTuDanhGia(td, k);
      return kq === 'chua-lam-duoc' || kq === 'can-goi-y';
    })
    .sort((a, b) => {
      const ea = td.tuDanhGia[a];
      const eb = td.tuDanhGia[b];
      return uuTien[ea.ketQua] - uuTien[eb.ketQua] || eb.luc - ea.luc;
    });
}

/** Các chương đã ghé, mới nhất trước. */
export function chuongGanDay(td: TienDo, gioiHan = 3): ViTri[] {
  return Object.values(td.lanCuoiTheoChuong)
    .sort((a, b) => b.luc - a.luc)
    .slice(0, gioiHan);
}

// Logic nội dung: số hiệu, khối có số hiệu, liên kết chéo Bài ↔ § ↔ Bài tập,
// kiểm tra dữ liệu. Hàm thuần — dùng chung cho trang web và test dữ liệu.

export const CAC_MON = ['giai-tich', 'dai-so', 'vi-mo'] as const;
export type Mon = (typeof CAC_MON)[number];

export type DoKho = 'de' | 'vua' | 'kho';
export type LoaiSach = 'dich-nguyen-van' | 'theo-sach';

export interface ThongTinBaiGiang {
  mon: string;
  chuong: number;
  bai: number;
  tieu_de: string;
  phu_muc: string[];
}

export interface ThongTinMucSach {
  mon: string;
  chuong: number;
  muc: string;
  tieu_de: string;
  loai: LoaiSach;
  nguon: string;
}

export interface ThongTinBaiTap {
  so: string;
  muc: string;
  do_kho: DoKho;
  nen_lam: boolean;
  can_dung: string[];
  tieu_de?: string;
}

export interface MucTrongChuong {
  so: string;
  ten: string;
}

// ---- nhãn hiển thị ----

export const NHAN_DO_KHO: Record<DoKho, string> = { de: 'Dễ', vua: 'Vừa', kho: 'Khó' };

export function nhanLoaiSach(loai: LoaiSach): string {
  return loai === 'theo-sach' ? 'Theo sách' : 'Dịch nguyên văn';
}

// ---- khung 8 mục của bài giảng (product_design.md, mục 5.1) ----

export const TAM_MUC = [
  'Ý tưởng trong 1 câu',
  'Hình dung trực quan',
  'Kiến thức cần biết',
  'Công thức',
  'Ví dụ mẫu',
  'Lỗi dễ mắc',
  'Tóm tắt 30 giây',
  'Bài tập',
] as const;

/** Các tiêu đề cấp 2 ('## …') của một file Markdown/MDX, bỏ qua khối code. */
export function trichTieuDeCap2(vanBan: string): string[] {
  const ketQua: string[] = [];
  let trongCode = false;
  for (const dong of vanBan.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(dong)) {
      trongCode = !trongCode;
      continue;
    }
    if (trongCode) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(dong);
    if (m) ketQua.push(m[1]);
  }
  return ketQua;
}

/**
 * Kiểm tra bài giảng có đủ 8 mục, đúng thứ tự. Tiêu đề được phép có phần đuôi
 * (ví dụ "Công thức — định nghĩa sup"). Trả về danh sách lỗi, rỗng nếu đạt.
 */
export function kiemTraTamMuc(tieuDe: string[]): string[] {
  const loi: string[] = [];
  let viTri = 0;
  for (const muc of TAM_MUC) {
    const tim = tieuDe.findIndex((t, i) => i >= viTri && t.startsWith(muc));
    if (tim === -1) {
      loi.push(tieuDe.some((t) => t.startsWith(muc)) ? `mục "${muc}" sai thứ tự` : `thiếu mục "${muc}"`);
    } else {
      viTri = tim + 1;
    }
  }
  return loi;
}

// ---- số hiệu ----

/** So sánh số hiệu theo từng phần số: 1.2.9 < 1.2.10. */
export function soSanhSo(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1);
    if (d !== 0) return d;
  }
  return 0;
}

/** '1.2.5' → '1.2' (mục § chứa nó). */
export function mucCuaSo(so: string): string {
  return so.split('.').slice(0, 2).join('.');
}

/** '1.2' → 1 */
export function chuongCuaMuc(muc: string): number {
  return Number(muc.split('.')[0]);
}

// ---- khối có số hiệu (đích của liên kết chéo) ----

/** Tên component trong MDX → loại khối dùng trong `can_dung`. */
export const LOAI_KHOI: Record<string, string> = {
  DinhNghia: 'dinh-nghia',
  DinhLy: 'dinh-ly',
  BoDe: 'bo-de',
  HeQua: 'he-qua',
  TienDe: 'tien-de',
  ViDu: 'vi-du',
};

export const TEN_LOAI_KHOI: Record<string, string> = {
  'dinh-nghia': 'Định nghĩa',
  'dinh-ly': 'Định lý',
  'bo-de': 'Bổ đề',
  'he-qua': 'Hệ quả',
  'tien-de': 'Tiên đề',
  'vi-du': 'Ví dụ',
};

export interface KhoiSo {
  loai: string;
  so?: string;
  /** Mã khối — cũng là id của phần tử HTML để trỏ tới (#dinh-ly-1.4.3). */
  id: string;
  /** Tên riêng nếu có, ví dụ "Tính chất Archimedes" */
  ten?: string;
}

export function idKhoi(loai: string, so?: string, id?: string): string {
  if (id) return id;
  if (!so) throw new Error(`Khối ${loai} phải có so hoặc id`);
  return `${loai}-${so}`;
}

function docThuocTinh(thuocTinh: string, ten: string): string | undefined {
  const m = new RegExp(`\\b${ten}\\s*=\\s*["']([^"']+)["']`).exec(thuocTinh);
  return m?.[1];
}

/** Tìm mọi khối có số hiệu trong nội dung MDX: <DinhLy so="1.4.3" …>. */
export function trichKhoiSo(mdx: string): KhoiSo[] {
  const ketQua: KhoiSo[] = [];
  const mau = /<(DinhNghia|DinhLy|BoDe|HeQua|TienDe|ViDu)\b([^>]*)>/g;
  for (const m of mdx.matchAll(mau)) {
    const loai = LOAI_KHOI[m[1]];
    const so = docThuocTinh(m[2], 'so');
    const id = docThuocTinh(m[2], 'id');
    if (!so && !id) continue; // khối không số hiệu (ví dụ minh hoạ) không là đích liên kết
    ketQua.push({ loai, so, id: idKhoi(loai, so, id), ten: docThuocTinh(m[2], 'ten') });
  }
  return ketQua;
}

/**
 * Chương chứa một khối, đọc từ số hiệu: 'dinh-ly-1.4.2' → 1. Khối không số hiệu
 * ('tien-de-day-du') thì không biết → undefined.
 */
export function chuongCuaKhoi(ma: string): number | undefined {
  const so = phanTichCanDung(ma)?.so;
  return so ? chuongCuaMuc(so) : undefined;
}

/** 'dinh-ly-1.4.3' → { loai: 'dinh-ly', so: '1.4.3' }; 'tien-de-day-du' → { loai: 'tien-de' }. */
export function phanTichCanDung(ma: string): { loai: string; so?: string } | null {
  const cacLoai = Object.values(LOAI_KHOI).sort((a, b) => b.length - a.length);
  for (const loai of cacLoai) {
    if (ma.startsWith(`${loai}-`)) {
      const phanSau = ma.slice(loai.length + 1);
      return /^\d+(\.\d+)*$/.test(phanSau) ? { loai, so: phanSau } : { loai };
    }
  }
  return null;
}

/** Tên đọc được của một mã khối: 'dinh-ly-1.4.3' → 'Định lý 1.4.3'. */
export function tenKhoi(ma: string, tenRieng?: string): string {
  const p = phanTichCanDung(ma);
  if (!p) return ma;
  const loai = TEN_LOAI_KHOI[p.loai] ?? p.loai;
  if (p.so) return tenRieng ? `${loai} ${p.so} (${tenRieng})` : `${loai} ${p.so}`;
  return tenRieng ?? loai;
}

// ---- liên kết và thuật ngữ viết trong nội dung ----

export interface LienKetTrongBai {
  muc?: string;
  bai?: number;
  baiTap?: string;
  /** Chỉ dùng với `bai`: bài giảng ở chương khác (`<XemMuc chuong={1} bai={4} />`). */
  chuong?: number;
}

/**
 * Các <XemMuc muc="1.3" /> · <XemMuc bai={2} /> · <XemMuc bai-tap="1.3.6" /> trong MDX.
 * Mục § và bài tập tự mang số chương; bài giảng ở chương khác thì thêm `chuong={n}`.
 */
export function trichXemMuc(mdx: string): LienKetTrongBai[] {
  const ketQua: LienKetTrongBai[] = [];
  for (const m of mdx.matchAll(/<XemMuc\b([^>]*)>/g)) {
    const tt = m[1];
    const muc = docThuocTinh(tt, 'muc');
    const baiTap = /\bbai-tap\s*=\s*["']([^"']+)["']/.exec(tt)?.[1];
    const bai = /\bbai\s*=\s*\{\s*(\d+)\s*\}/.exec(tt)?.[1];
    const chuong = /\bchuong\s*=\s*\{\s*(\d+)\s*\}/.exec(tt)?.[1];
    if (muc) ketQua.push({ muc });
    else if (baiTap) ketQua.push({ baiTap });
    else if (bai) ketQua.push(chuong ? { bai: Number(bai), chuong: Number(chuong) } : { bai: Number(bai) });
  }
  return ketQua;
}

/** Các mã thuật ngữ dùng trong <ThuatNgu id="…">. */
export function trichThuatNgu(mdx: string): string[] {
  return [...mdx.matchAll(/<ThuatNgu\b[^>]*\bid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
}

// ---- liên kết chéo ----

/** Các bài giảng phủ mục § này (để hiện nút "Học dễ hiểu ở Bài n"). */
export function baiGiangPhuMuc<T extends Pick<ThongTinBaiGiang, 'phu_muc' | 'bai'>>(
  dsBaiGiang: T[],
  muc: string,
): T[] {
  return dsBaiGiang.filter((b) => b.phu_muc.includes(muc)).sort((a, b) => a.bai - b.bai);
}

/** Tìm mục § chứa một khối có mã cho trước. */
export function timMucCuaKhoi(khoiTheoMuc: Record<string, KhoiSo[]>, ma: string): string | undefined {
  for (const [muc, ds] of Object.entries(khoiTheoMuc)) {
    if (ds.some((k) => k.id === ma)) return muc;
  }
  return undefined;
}

export interface DongDoiChieu {
  muc: string;
  tenMuc: string;
  coSach: boolean;
  baiGiang: number[];
  soBaiTap: number;
  soNenLam: number;
}

/** Bảng đối chiếu Bài ↔ § ↔ Bài tập của một chương (product_design.md, mục 5.3). */
export function bangDoiChieu(
  cacMuc: MucTrongChuong[],
  dsBaiGiang: Pick<ThongTinBaiGiang, 'bai' | 'phu_muc'>[],
  mucCoSach: string[],
  dsBaiTap: Pick<ThongTinBaiTap, 'muc' | 'nen_lam'>[],
): DongDoiChieu[] {
  return cacMuc.map(({ so, ten }) => {
    const baiTapCuaMuc = dsBaiTap.filter((b) => b.muc === so);
    return {
      muc: so,
      tenMuc: ten,
      coSach: mucCoSach.includes(so),
      baiGiang: baiGiangPhuMuc(dsBaiGiang, so).map((b) => b.bai),
      soBaiTap: baiTapCuaMuc.length,
      soNenLam: baiTapCuaMuc.filter((b) => b.nen_lam).length,
    };
  });
}

/** Bài có hướng dẫn (gợi ý / lời giải) hay mới chỉ có đề. */
export function coHuongDan(noiDungMdx: string): boolean {
  return /<(GoiY|LoiGiai)\b/.test(noiDungMdx);
}

// ---- kiểm tra dữ liệu một chương ----

export interface DuLieuChuong {
  mon: string;
  chuong: number;
  cacMuc: MucTrongChuong[];
  baiGiang: (ThongTinBaiGiang & { tep: string; noiDung: string })[];
  sach: (ThongTinMucSach & { tep: string; noiDung: string })[];
  baiTap: (ThongTinBaiTap & { tep: string; noiDung: string })[];
}

/**
 * Những gì có thật ở mọi chương của một môn — để kiểm tra liên kết trỏ sang
 * chương khác (Chương 2 dựa nhiều vào Chương 1).
 */
export interface ChiMucMon {
  /** Mục § có trang: '1.4' */
  muc: Set<string>;
  /** Bài giảng: '1/4' (chương/bài) */
  baiGiang: Set<string>;
  /** Bài tập: '1.4.3' */
  baiTap: Set<string>;
  /** Khối có số hiệu: 'dinh-ly-1.4.2' */
  khoi: Set<string>;
}

export function taoChiMucMon(cacChuong: Pick<DuLieuChuong, 'chuong' | 'baiGiang' | 'sach' | 'baiTap'>[]): ChiMucMon {
  const chiMuc: ChiMucMon = { muc: new Set(), baiGiang: new Set(), baiTap: new Set(), khoi: new Set() };
  for (const c of cacChuong) {
    for (const b of c.baiGiang) chiMuc.baiGiang.add(`${c.chuong}/${b.bai}`);
    for (const b of c.baiTap) chiMuc.baiTap.add(b.so);
    for (const s of c.sach) {
      chiMuc.muc.add(s.muc);
      for (const k of trichKhoiSo(s.noiDung)) chiMuc.khoi.add(k.id);
    }
  }
  return chiMuc;
}

/**
 * Kiểm tra toàn bộ ràng buộc của một chương (docs/tech_stack.md, mục 8):
 * liên kết chéo trỏ tới mục có thật, không trùng số hiệu, mục § nào cũng có
 * nguồn, bài giảng đủ 8 mục. Liên kết sang chương khác được đối chiếu với
 * `mon` (chỉ mục của cả môn); không có `mon` thì coi như chương khác chưa có gì.
 * Trả về danh sách lỗi, rỗng nếu đạt.
 */
export function kiemTraChuong(du: DuLieuChuong, mon?: ChiMucMon): string[] {
  const loi: string[] = [];
  const mucHopLe = new Set(du.cacMuc.map((m) => m.so));
  const mucCoSach = new Set(du.sach.map((s) => s.muc));

  // Bài giảng
  const soBai = new Set<number>();
  for (const b of du.baiGiang) {
    if (b.mon !== du.mon || b.chuong !== du.chuong) loi.push(`${b.tep}: khai báo mon/chuong không khớp thư mục`);
    if (soBai.has(b.bai)) loi.push(`${b.tep}: trùng số bài ${b.bai}`);
    soBai.add(b.bai);
    for (const m of b.phu_muc) {
      if (!mucCoSach.has(m)) loi.push(`${b.tep}: phu_muc "${m}" chưa có trang mục §`);
    }
    for (const l of kiemTraTamMuc(trichTieuDeCap2(b.noiDung))) loi.push(`${b.tep}: ${l}`);
  }

  // Mục §
  const khoiTheoMuc: Record<string, KhoiSo[]> = {};
  const maKhoi = new Set<string>();
  for (const s of du.sach) {
    if (s.mon !== du.mon || s.chuong !== du.chuong) loi.push(`${s.tep}: khai báo mon/chuong không khớp thư mục`);
    if (!mucHopLe.has(s.muc)) loi.push(`${s.tep}: mục ${s.muc} không có trong danh sách mục của chương`);
    if (!s.nguon || s.nguon.trim().length < 10) loi.push(`${s.tep}: thiếu ghi công / giấy phép (nguon)`);
    khoiTheoMuc[s.muc] = trichKhoiSo(s.noiDung);
    for (const k of khoiTheoMuc[s.muc]) {
      if (maKhoi.has(k.id)) loi.push(`${s.tep}: trùng khối ${k.id}`);
      maKhoi.add(k.id);
    }
  }

  // Bài tập
  const soBaiTap = new Set<string>();
  for (const bt of du.baiTap) {
    if (soBaiTap.has(bt.so)) loi.push(`${bt.tep}: trùng số bài tập ${bt.so}`);
    soBaiTap.add(bt.so);
    if (chuongCuaMuc(bt.so) !== du.chuong) loi.push(`${bt.tep}: bài ${bt.so} không thuộc chương ${du.chuong}`);
    if (mucCuaSo(bt.so) !== bt.muc) loi.push(`${bt.tep}: số ${bt.so} không khớp muc ${bt.muc}`);
    if (!mucHopLe.has(bt.muc)) loi.push(`${bt.tep}: mục ${bt.muc} không có trong chương`);
    for (const ma of bt.can_dung) {
      // Khối có số hiệu: tìm đúng chương của nó. Khối không số hiệu (tien-de-day-du):
      // tìm ở chương này trước, rồi ở cả môn.
      const chuongKhoi = chuongCuaKhoi(ma);
      const coThat =
        chuongKhoi === du.chuong
          ? maKhoi.has(ma)
          : chuongKhoi === undefined
            ? maKhoi.has(ma) || (mon?.khoi.has(ma) ?? false)
            : (mon?.khoi.has(ma) ?? false);
      if (!phanTichCanDung(ma)) loi.push(`${bt.tep}: can_dung "${ma}" sai dạng`);
      else if (!coThat) loi.push(`${bt.tep}: can_dung "${ma}" không trỏ tới khối nào có thật`);
    }
  }

  // Liên kết <XemMuc> trong mọi file của chương phải trỏ tới trang có thật
  const soBaiGiang = new Set(du.baiGiang.map((b) => b.bai));
  const cacTep = [...du.baiGiang, ...du.sach, ...du.baiTap];
  for (const tep of cacTep) {
    for (const lk of trichXemMuc(tep.noiDung)) {
      if (lk.muc) {
        const coThat = chuongCuaMuc(lk.muc) === du.chuong ? mucCoSach.has(lk.muc) : mon?.muc.has(lk.muc);
        if (!coThat) loi.push(`${tep.tep}: XemMuc tới §${lk.muc} chưa có trang`);
      }
      if (lk.bai) {
        const chuong = lk.chuong ?? du.chuong;
        const coThat = chuong === du.chuong ? soBaiGiang.has(lk.bai) : mon?.baiGiang.has(`${chuong}/${lk.bai}`);
        if (!coThat) loi.push(`${tep.tep}: XemMuc tới Bài ${lk.bai} (Chương ${chuong}) không có`);
      }
      if (lk.baiTap) {
        const coThat = chuongCuaMuc(lk.baiTap) === du.chuong ? soBaiTap.has(lk.baiTap) : mon?.baiTap.has(lk.baiTap);
        if (!coThat) loi.push(`${tep.tep}: XemMuc tới bài tập ${lk.baiTap} không có`);
      }
    }
  }

  return loi;
}

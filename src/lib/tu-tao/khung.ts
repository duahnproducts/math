// Khung dữ liệu của tính năng "Tự tạo bài giảng từ PDF" (product_design.md, mục 15).
// Ba loại câu trả lời Claude phải trả về đúng khuôn JSON (structured outputs):
// mục lục sách → dàn ý một chương → từng bài giảng 8 mục. Schema ở đây vừa gửi
// cho API, vừa dùng để kiểm tra lại câu trả lời và file .json người học nhập vào.
import { NHAN_DO_KHO, TAM_MUC, type DoKho } from '../noi-dung';

// ---- kiểu dữ liệu ----

export interface ChuongTrongMucLuc {
  so: number;
  ten: string;
  ten_en: string;
  /** Số trang in trong mục lục của sách; không đọc được thì null */
  trang_in: number | null;
}

/** Câu trả lời khi đọc mục lục ở đầu file PDF. */
export interface MucLucSach {
  ten_mon: string;
  ten_mon_en: string;
  giao_trinh: string;
  mo_ta: string;
  /** Trang PDF = trang in + độ lệch; không xác định được thì null */
  do_lech_trang: number | null;
  chuong: ChuongTrongMucLuc[];
}

export interface MucTrongSach {
  so: string;
  ten: string;
}

export interface BaiTrongDanY {
  so: number;
  tieu_de: string;
  y_tuong: string;
  phu_muc: string[];
  trong_tam: string;
}

/** Dàn ý một chương: các mục § của sách và cách chia thành bài giảng. */
export interface DanYChuong {
  muc: MucTrongSach[];
  bai: BaiTrongDanY[];
}

export interface CongThuc {
  ten: string;
  dung_de: string;
  /** LaTeX, không kèm dấu $. Môn không có công thức thì để rỗng */
  bieu_thuc: string;
  ky_hieu: { ky_hieu: string; nghia: string }[];
  khi_nao_dung: string;
}

export interface ViDuMau {
  de: string;
  cho_gi: string;
  hoi_gi: string;
  chon_kien_thuc: string;
  giai: string;
  kiem_tra: string;
  tom_tat_cach_lam: string;
}

/** Một bài giảng theo khung 8 mục (product_design.md, mục 5.1). Văn bản là Markdown + công thức $…$. */
export interface BaiGiangTuTao {
  so: number;
  tieu_de: string;
  phu_muc: string[];
  /** 1. Ý tưởng trong 1 câu */
  y_tuong: string;
  /** 2. Hình dung trực quan */
  hinh_dung: string;
  /** 3. Kiến thức cần biết */
  kien_thuc: string;
  /** 4. Công thức */
  cong_thuc: CongThuc[];
  /** 5. Ví dụ mẫu — đủ 6 bước giải bài của GIA_SU.md */
  vi_du_mau: ViDuMau;
  /** 6. Lỗi dễ mắc */
  loi_de_mac: { tieu_de: string; noi_dung: string }[];
  /** 7. Tóm tắt 30 giây, kèm Hiểu · Nhớ · Làm */
  tom_tat: string[];
  hieu: string;
  nho: string;
  lam: string;
  /** 8. Bài tập dễ → vừa → khó */
  bai_tap: { do_kho: DoKho; de: string; goi_y: string }[];
}

export interface ChuongTuTao {
  so: number;
  ten: string;
  ten_en: string;
  /** Khoảng trang trong file PDF (đếm từ 1) */
  trang_dau: number;
  trang_cuoi: number;
  dan_y: DanYChuong | null;
  bai: BaiGiangTuTao[];
}

export const PHIEN_BAN_MON = 1;

/** Một môn người học tự tạo — chỉ lưu trong trình duyệt của họ (IndexedDB). */
export interface MonTuTao {
  phien_ban: typeof PHIEN_BAN_MON;
  id: string;
  ten: string;
  ten_en: string;
  giao_trinh: string;
  mo_ta: string;
  ten_file: string;
  tong_so_trang: number;
  tao_luc: string;
  cap_nhat_luc: string;
  chuong: ChuongTuTao[];
}

// ---- JSON schema (tập con mà structured outputs hỗ trợ) ----

export type Schema =
  | { type: 'string'; description?: string; enum?: readonly string[] }
  | { type: 'integer'; description?: string }
  | { type: 'array'; description?: string; items: Schema }
  | {
      type: 'object';
      description?: string;
      properties: Record<string, Schema>;
      required: string[];
      additionalProperties: false;
    }
  | { anyOf: Schema[]; description?: string }
  | { type: 'null' };

const chuoi = (description: string): Schema => ({ type: 'string', description });
const soNguyen = (description: string): Schema => ({ type: 'integer', description });
const mang = (items: Schema, description: string): Schema => ({ type: 'array', items, description });
const coTheRong = (s: Schema, description: string): Schema => ({ anyOf: [s, { type: 'null' }], description });
/** Mọi thuộc tính đều bắt buộc và không cho thêm thuộc tính lạ — structured outputs yêu cầu vậy. */
function doiTuong(properties: Record<string, Schema>, description?: string): Schema {
  return { type: 'object', description, properties, required: Object.keys(properties), additionalProperties: false };
}

const MD = 'Markdown tiếng Việt; công thức viết $…$ hoặc $$…$$; không dùng HTML.';

export const SCHEMA_MUC_LUC: Schema = doiTuong({
  ten_mon: chuoi('Tên môn học bằng tiếng Việt, ví dụ "Kinh tế vĩ mô".'),
  ten_mon_en: chuoi('Tên môn học bằng tiếng Anh, lấy theo sách.'),
  giao_trinh: chuoi('Tên sách, tác giả, lần xuất bản, nhà xuất bản — như in trên sách.'),
  mo_ta: chuoi('Một câu tiếng Việt: môn này học những gì.'),
  do_lech_trang: coTheRong(
    soNguyen('Số trang PDF trừ đi số trang in, tính ở một trang bất kỳ có in số trang.'),
    'null nếu không thấy trang nào có in số trang.',
  ),
  chuong: mang(
    doiTuong({
      so: soNguyen('Số chương như in trong sách.'),
      ten: chuoi('Tên chương dịch sang tiếng Việt.'),
      ten_en: chuoi('Tên chương nguyên văn.'),
      trang_in: coTheRong(soNguyen('Số trang in của trang đầu chương, lấy trong mục lục.'), 'null nếu mục lục không ghi.'),
    }),
    'Các chương chính của sách theo thứ tự; bỏ lời nói đầu, phụ lục, đáp án, chỉ mục.',
  ),
});

export const SCHEMA_DAN_Y: Schema = doiTuong({
  muc: mang(
    doiTuong({ so: chuoi('Số hiệu mục như trong sách, ví dụ "2.3".'), ten: chuoi('Tên mục dịch sang tiếng Việt.') }),
    'Các mục của chương, đúng thứ tự và số hiệu của sách.',
  ),
  bai: mang(
    doiTuong({
      so: soNguyen('Số thứ tự bài, bắt đầu từ 1.'),
      tieu_de: chuoi('Tiêu đề bài: ngắn, dễ hiểu, có thể là một câu hỏi.'),
      y_tuong: chuoi('Bản chất của bài trong một câu đơn giản.'),
      phu_muc: mang(chuoi('Số hiệu mục'), 'Các mục § của sách mà bài này phủ.'),
      trong_tam: chuoi('Bài này dạy khái niệm hoặc kỹ năng nào, cần kiến thức nền gì, ví dụ đời thường định dùng.'),
    }),
    'Từ 3 đến 7 bài. Mỗi bài chỉ tập trung vào một khái niệm hoặc một kỹ năng; bài sau dựa trên bài trước.',
  ),
});

export const SCHEMA_BAI_GIANG: Schema = doiTuong({
  so: soNguyen('Số thứ tự bài như trong dàn ý.'),
  tieu_de: chuoi('Tiêu đề bài như trong dàn ý.'),
  phu_muc: mang(chuoi('Số hiệu mục'), 'Các mục § của sách mà bài này phủ.'),
  y_tuong: chuoi(`Mục 1 — Ý tưởng trong 1 câu. ${MD}`),
  hinh_dung: chuoi(`Mục 2 — Hình dung trực quan: ví dụ đời thường liên quan trực tiếp tới bài. ${MD}`),
  kien_thuc: chuoi(`Mục 3 — Kiến thức cần biết: chỉ những gì thực sự cần, chia ý bằng tiêu đề ###. ${MD}`),
  cong_thuc: mang(
    doiTuong({
      ten: chuoi('Tên công thức, định nghĩa hoặc quy tắc.'),
      dung_de: chuoi(`Công thức dùng để làm gì, mô tả điều gì, tại sao lại có nó — viết TRƯỚC công thức. ${MD}`),
      bieu_thuc: chuoi('Công thức bằng LaTeX, không kèm dấu $. Để rỗng nếu đây là quy tắc bằng lời.'),
      ky_hieu: mang(
        doiTuong({ ky_hieu: chuoi('Ký hiệu bằng LaTeX, không kèm dấu $.'), nghia: chuoi(`Nghĩa của ký hiệu. ${MD}`) }),
        'Giải thích từng ký hiệu có trong công thức.',
      ),
      khi_nao_dung: chuoi(`Khi nào dùng công thức này. ${MD}`),
    }),
    'Mục 4 — Công thức: 1 đến 3 công thức hoặc quy tắc quan trọng nhất của bài.',
  ),
  vi_du_mau: doiTuong(
    {
      de: chuoi(`Đề bài của ví dụ mẫu. ${MD}`),
      cho_gi: chuoi(`Bước 1 — Đề cho gì. ${MD}`),
      hoi_gi: chuoi(`Bước 2 — Đề hỏi gì. ${MD}`),
      chon_kien_thuc: chuoi(`Bước 3 — Chọn kiến thức, công thức nào và vì sao. ${MD}`),
      giai: chuoi(`Bước 4 — Giải từng bước, không nhảy bước. ${MD}`),
      kiem_tra: chuoi(`Bước 5 — Kiểm tra kết quả. ${MD}`),
      tom_tat_cach_lam: chuoi(`Bước 6 — Tóm tắt cách làm để tự áp dụng cho bài khác. ${MD}`),
    },
    'Mục 5 — Ví dụ mẫu, giải từ đầu đến cuối theo 6 bước.',
  ),
  loi_de_mac: mang(
    doiTuong({
      tieu_de: chuoi('Tên lỗi, ví dụ "Lỗi 1: Nhầm … với …".'),
      noi_dung: chuoi(`Sai ở đâu, vì sao sai, cách tránh. ${MD}`),
    }),
    'Mục 6 — Lỗi dễ mắc: 2 đến 3 lỗi phổ biến nhất.',
  ),
  tom_tat: mang(chuoi(`Một dòng tóm tắt. ${MD}`), 'Mục 7 — Tóm tắt 30 giây: 3 đến 5 dòng cực dễ nhớ.'),
  hieu: chuoi(`HIỂU: bản chất của khái niệm, một câu. ${MD}`),
  nho: chuoi(`NHỚ: công thức hoặc quy tắc cần nhớ. ${MD}`),
  lam: chuoi(`LÀM: cách áp dụng vào bài tập. ${MD}`),
  bai_tap: mang(
    doiTuong({
      do_kho: { type: 'string', enum: ['de', 'vua', 'kho'], description: 'de = dễ, vua = vừa, kho = khó.' },
      de: chuoi(`Đề bài. ${MD}`),
      goi_y: chuoi(`Gợi ý hướng đi, không phải lời giải. ${MD}`),
    }),
    'Mục 8 — Bài tập: đúng 3 bài theo thứ tự dễ, vừa, khó.',
  ),
});

// ---- kiểm tra dữ liệu theo schema ----

function kieuCua(x: unknown): string {
  if (x === null) return 'null';
  if (Array.isArray(x)) return 'mảng';
  if (Number.isInteger(x)) return 'số nguyên';
  return typeof x;
}

/** Kiểm tra giá trị theo schema ở trên. Trả về danh sách lỗi (rỗng là đạt). */
export function kiemTraSchema(schema: Schema, giaTri: unknown, duongDan = '$'): string[] {
  if ('anyOf' in schema) {
    const moi = schema.anyOf.map((s) => kiemTraSchema(s, giaTri, duongDan));
    return moi.some((l) => l.length === 0) ? [] : moi[0];
  }
  switch (schema.type) {
    case 'null':
      return giaTri === null ? [] : [`${duongDan}: phải là null, đang là ${kieuCua(giaTri)}`];
    case 'string':
      if (typeof giaTri !== 'string') return [`${duongDan}: phải là chuỗi, đang là ${kieuCua(giaTri)}`];
      if (schema.enum && !schema.enum.includes(giaTri)) return [`${duongDan}: "${giaTri}" không thuộc ${schema.enum.join(', ')}`];
      return [];
    case 'integer':
      return Number.isInteger(giaTri) ? [] : [`${duongDan}: phải là số nguyên, đang là ${kieuCua(giaTri)}`];
    case 'array':
      if (!Array.isArray(giaTri)) return [`${duongDan}: phải là mảng, đang là ${kieuCua(giaTri)}`];
      return giaTri.flatMap((x, i) => kiemTraSchema(schema.items, x, `${duongDan}[${i}]`));
    case 'object': {
      if (typeof giaTri !== 'object' || giaTri === null || Array.isArray(giaTri)) {
        return [`${duongDan}: phải là đối tượng, đang là ${kieuCua(giaTri)}`];
      }
      const dt = giaTri as Record<string, unknown>;
      const loi = schema.required.filter((k) => !(k in dt)).map((k) => `${duongDan}.${k}: thiếu`);
      for (const [k, s] of Object.entries(schema.properties)) {
        if (k in dt) loi.push(...kiemTraSchema(s, dt[k], `${duongDan}.${k}`));
      }
      return loi;
    }
  }
}

// ---- kiểm tra nội dung (ngoài phần khuôn) và chuẩn hoá ----

const rong = (s: string) => s.trim().length === 0;
const THU_TU_DO_KHO: Record<DoKho, number> = { de: 0, vua: 1, kho: 2 };

export class LoiDuLieu extends Error {
  constructor(
    public readonly loai: string,
    public readonly chiTiet: string[],
  ) {
    super(`${loai} không hợp lệ: ${chiTiet.slice(0, 3).join('; ')}${chiTiet.length > 3 ? '; …' : ''}`);
    this.name = 'LoiDuLieu';
  }
}

export function kiemTraMucLuc(x: unknown): MucLucSach {
  const loi = kiemTraSchema(SCHEMA_MUC_LUC, x);
  if (loi.length === 0) {
    const m = x as MucLucSach;
    if (rong(m.ten_mon)) loi.push('$.ten_mon: rỗng');
  }
  if (loi.length > 0) throw new LoiDuLieu('Mục lục', loi);
  return x as MucLucSach;
}

export function kiemTraDanY(x: unknown): DanYChuong {
  const loi = kiemTraSchema(SCHEMA_DAN_Y, x);
  if (loi.length === 0) {
    const d = x as DanYChuong;
    if (d.bai.length === 0) loi.push('$.bai: dàn ý chưa có bài nào');
    d.bai.forEach((b, i) => {
      if (rong(b.tieu_de)) loi.push(`$.bai[${i}].tieu_de: rỗng`);
    });
  }
  if (loi.length > 0) throw new LoiDuLieu('Dàn ý', loi);
  const d = x as DanYChuong;
  // Đánh số lại 1…n để bài k luôn là phần tử thứ k của dàn ý
  return { muc: d.muc, bai: d.bai.map((b, i) => ({ ...b, so: i + 1 })) };
}

/** Các mục bắt buộc phải có chữ — thiếu mục nào thì bài giảng không đủ 8 mục. */
function loiNoiDungBaiGiang(b: BaiGiangTuTao): string[] {
  const loi: string[] = [];
  const batBuoc: [string, string][] = [
    ['tieu_de', b.tieu_de],
    ['y_tuong', b.y_tuong],
    ['hinh_dung', b.hinh_dung],
    ['kien_thuc', b.kien_thuc],
    ['vi_du_mau.de', b.vi_du_mau.de],
    ['vi_du_mau.giai', b.vi_du_mau.giai],
  ];
  for (const [ten, giaTri] of batBuoc) if (rong(giaTri)) loi.push(`$.${ten}: rỗng`);
  if (b.cong_thuc.length === 0) loi.push('$.cong_thuc: chưa có công thức hay quy tắc nào');
  if (b.loi_de_mac.length === 0) loi.push('$.loi_de_mac: chưa có lỗi nào');
  if (b.tom_tat.length === 0) loi.push('$.tom_tat: rỗng');
  if (b.bai_tap.length === 0) loi.push('$.bai_tap: chưa có bài tập nào');
  return loi;
}

/** Kiểm tra một bài giảng rồi chuẩn hoá: số bài theo dàn ý, bài tập xếp dễ → vừa → khó. */
export function kiemTraBaiGiang(x: unknown, soBai?: number): BaiGiangTuTao {
  const loi = kiemTraSchema(SCHEMA_BAI_GIANG, x);
  if (loi.length === 0) loi.push(...loiNoiDungBaiGiang(x as BaiGiangTuTao));
  if (loi.length > 0) throw new LoiDuLieu('Bài giảng', loi);
  const b = x as BaiGiangTuTao;
  return {
    ...b,
    so: soBai ?? b.so,
    bai_tap: [...b.bai_tap].sort((p, q) => THU_TU_DO_KHO[p.do_kho] - THU_TU_DO_KHO[q.do_kho]),
  };
}

const SCHEMA_CHUONG_TU_TAO: Schema = doiTuong({
  so: soNguyen(''),
  ten: chuoi(''),
  ten_en: chuoi(''),
  trang_dau: soNguyen(''),
  trang_cuoi: soNguyen(''),
  dan_y: coTheRong(SCHEMA_DAN_Y, ''),
  bai: mang(SCHEMA_BAI_GIANG, ''),
});

const SCHEMA_MON_TU_TAO: Schema = doiTuong({
  phien_ban: soNguyen(''),
  id: chuoi(''),
  ten: chuoi(''),
  ten_en: chuoi(''),
  giao_trinh: chuoi(''),
  mo_ta: chuoi(''),
  ten_file: chuoi(''),
  tong_so_trang: soNguyen(''),
  tao_luc: chuoi(''),
  cap_nhat_luc: chuoi(''),
  chuong: mang(SCHEMA_CHUONG_TU_TAO, ''),
});

/** Kiểm tra một môn đọc từ kho hoặc từ file .json người học nhập vào. */
export function kiemTraMon(x: unknown): MonTuTao {
  const loi = kiemTraSchema(SCHEMA_MON_TU_TAO, x);
  if (loi.length === 0) {
    const m = x as MonTuTao;
    if (m.phien_ban !== PHIEN_BAN_MON) loi.push(`$.phien_ban: chỉ đọc được phiên bản ${PHIEN_BAN_MON}`);
    if (!/^[a-z0-9-]{4,64}$/.test(m.id)) loi.push('$.id: sai dạng');
    if (rong(m.ten)) loi.push('$.ten: rỗng');
    m.chuong.forEach((c, i) => {
      if (c.trang_dau < 1 || c.trang_cuoi < c.trang_dau) loi.push(`$.chuong[${i}]: khoảng trang sai`);
      c.bai.forEach((b, j) => loi.push(...loiNoiDungBaiGiang(b).map((l) => `$.chuong[${i}].bai[${j}]${l.slice(1)}`)));
    });
  }
  if (loi.length > 0) throw new LoiDuLieu('Môn học', loi);
  return x as MonTuTao;
}

// ---- trạng thái một chương ----

export type TrangThaiChuong =
  | { loai: 'chua-tao' }
  | { loai: 'dang-do'; xong: number; tong: number }
  | { loai: 'xong'; tong: number };

export function trangThaiChuong(c: ChuongTuTao): TrangThaiChuong {
  if (!c.dan_y) return { loai: 'chua-tao' };
  const tong = c.dan_y.bai.length;
  return c.bai.length >= tong ? { loai: 'xong', tong } : { loai: 'dang-do', xong: c.bai.length, tong };
}

/** Bài tiếp theo cần viết trong dàn ý (theo số bài), hoặc null khi đã đủ. */
export function baiCanViet(c: ChuongTuTao): BaiTrongDanY | null {
  if (!c.dan_y) return null;
  const daCo = new Set(c.bai.map((b) => b.so));
  return c.dan_y.bai.find((b) => !daCo.has(b.so)) ?? null;
}

/** Tên 8 mục, dùng chung với trang bài giảng tĩnh. */
export { NHAN_DO_KHO, TAM_MUC };

// Ước tính và cộng dồn chi phí gọi Claude. Người học trả tiền bằng khoá API của mình,
// nên web phải nói trước khoảng bao nhiêu tiền, và nói lại đã tốn bao nhiêu.
//
// Giá Claude Opus 5.5 (USD cho 1 triệu token), theo bảng giá của Anthropic 09/2026.
// Ghi bộ nhớ đệm 5 phút tính 1,25 lần giá đầu vào.
export const GIA = { vao: 4, ra: 20, ghi_cache: 5, doc_cache: 0.2 } as const;

/** Một trang PDF tốn khoảng 1.500–3.000 token (chữ và ảnh của trang). */
export const TOKEN_MOI_TRANG = { thap: 1500, cao: 3000 } as const;

/** Lời nhắc hệ thống (phương pháp dạy + hai bài giảng mẫu) — xem loi-nhac.test.ts. */
export const TOKEN_HE_THONG = 14_000;

/** Đầu ra ước tính: một bài giảng, một dàn ý, một mục lục (tính cả phần suy nghĩ). */
const RA = {
  bai: { thap: 7_000, cao: 14_000 },
  danY: { thap: 2_000, cao: 5_000 },
  mucLuc: { thap: 1_500, cao: 4_000 },
} as const;

export interface KhoangTien {
  thap: number;
  cao: number;
}

export interface SoToken {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

const trieu = (n: number) => n / 1_000_000;

/** Chi phí thật của một lần gọi, tính từ `usage` API trả về. */
export function chiPhiTheoToken(t: SoToken): number {
  return (
    trieu(t.input_tokens) * GIA.vao +
    trieu(t.output_tokens) * GIA.ra +
    trieu(t.cache_creation_input_tokens ?? 0) * GIA.ghi_cache +
    trieu(t.cache_read_input_tokens ?? 0) * GIA.doc_cache
  );
}

/** Đọc mục lục: lần đầu ghi lời nhắc hệ thống vào bộ nhớ đệm, PDF gửi thẳng. */
export function uocTinhMucLuc(soTrang: number): KhoangTien {
  const mot = (muc: 'thap' | 'cao') =>
    chiPhiTheoToken({
      input_tokens: soTrang * TOKEN_MOI_TRANG[muc] + 500,
      cache_creation_input_tokens: TOKEN_HE_THONG,
      output_tokens: RA.mucLuc[muc],
    });
  return { thap: mot('thap'), cao: mot('cao') };
}

/**
 * Tạo bài giảng cho một chương: một lần lập dàn ý (ghi PDF vào bộ nhớ đệm), rồi mỗi bài
 * một lần gọi, đọc lại PDF từ bộ nhớ đệm với giá rẻ hơn nhiều.
 */
export function uocTinhChuong(soTrang: number, soBai = 5): KhoangTien {
  const mot = (muc: 'thap' | 'cao') => {
    const pdf = soTrang * TOKEN_MOI_TRANG[muc];
    const danY = chiPhiTheoToken({
      input_tokens: 800,
      cache_creation_input_tokens: pdf,
      cache_read_input_tokens: TOKEN_HE_THONG,
      output_tokens: RA.danY[muc],
    });
    const bai = chiPhiTheoToken({
      input_tokens: 1_500,
      cache_read_input_tokens: pdf + TOKEN_HE_THONG,
      output_tokens: RA.bai[muc],
    });
    return danY + soBai * bai;
  };
  return { thap: mot('thap'), cao: mot('cao') };
}

/** 0.4567 → "0,46 USD"; số rất nhỏ vẫn hiện "dưới 0,01 USD". */
export function dinhDangUSD(x: number): string {
  if (x > 0 && x < 0.01) return 'dưới 0,01 USD';
  return `${x.toFixed(2).replace('.', ',')} USD`;
}

export function dinhDangKhoang(k: KhoangTien): string {
  return `khoảng ${k.thap.toFixed(2).replace('.', ',')}–${dinhDangUSD(k.cao)}`;
}

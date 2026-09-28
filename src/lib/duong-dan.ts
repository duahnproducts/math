// Đường dẫn nội bộ. Web chạy dưới base '/math/' (docs/tech_stack.md, mục 9),
// nên mọi link phải ghép với base qua các hàm ở đây.

/** '1.2.5' → '1-2-5' (dùng trong tên file và URL). */
export function soSangSlug(so: string): string {
  return so.replaceAll('.', '-');
}

/** '1-2-5' → '1.2.5'. */
export function slugSangSo(slug: string): string {
  return slug.replaceAll('-', '.');
}

export function slugChuong(chuong: number): string {
  return `chuong-${chuong}`;
}

/** 'chuong-3' → 3; sai dạng thì trả về NaN. */
export function soChuongTuSlug(slug: string): number {
  const m = /^chuong-(\d+)$/.exec(slug);
  return m ? Number(m[1]) : Number.NaN;
}

/**
 * Ghép base với các đoạn đường dẫn, luôn có dấu '/' cuối (trailingSlash: 'always').
 * noi('/math/', 'giai-tich', 'chuong-1') → '/math/giai-tich/chuong-1/'
 */
export function noi(base: string, ...doan: string[]): string {
  const phan = [base, ...doan]
    .flatMap((d) => d.split('/'))
    .filter((d) => d.length > 0);
  return phan.length === 0 ? '/' : `/${phan.join('/')}/`;
}

/** Ghép đường dẫn tới file (không thêm '/' cuối), ví dụ PDF tải về. */
export function noiFile(base: string, ...doan: string[]): string {
  const duongDan = noi(base, ...doan);
  return duongDan.length > 1 ? duongDan.slice(0, -1) : duongDan;
}

export function taoDuongDan(base: string) {
  return {
    trangChu: () => noi(base),
    thuatNgu: () => noi(base, 'thuat-ngu'),
    mon: (mon: string) => noi(base, mon),
    chuong: (mon: string, chuong: number) => noi(base, mon, slugChuong(chuong)),
    baiGiang: (mon: string, chuong: number, bai: number) =>
      noi(base, mon, slugChuong(chuong), 'giang-day', `bai-${bai}`),
    sach: (mon: string, chuong: number, muc: string) =>
      noi(base, mon, slugChuong(chuong), 'sach', soSangSlug(muc)),
    dsBaiTap: (mon: string, chuong: number) => noi(base, mon, slugChuong(chuong), 'bai-tap'),
    baiTap: (mon: string, chuong: number, so: string) =>
      noi(base, mon, slugChuong(chuong), 'bai-tap', soSangSlug(so)),
    taiVe: (tenFile: string) => noiFile(base, 'tai-ve', tenFile),
  };
}

export type DuongDan = ReturnType<typeof taoDuongDan>;

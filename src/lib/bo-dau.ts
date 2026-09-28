// Bỏ dấu tiếng Việt để tìm kiếm khi gõ không dấu (docs/tech_stack.md, mục 6).
// Dùng cho cả nội dung cần tìm lẫn từ khoá.

export function boDau(chuoi: string): string {
  return chuoi
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/** Bỏ dấu, chữ thường, gộp khoảng trắng. */
export function chuanHoa(chuoi: string): string {
  return boDau(chuoi).toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Mọi từ trong từ khoá đều xuất hiện trong văn bản (không phân biệt dấu, hoa thường). */
export function khop(vanBan: string, tuKhoa: string): boolean {
  const tu = chuanHoa(tuKhoa).split(' ').filter(Boolean);
  if (tu.length === 0) return true;
  const nguon = chuanHoa(vanBan);
  return tu.every((t) => nguon.includes(t));
}

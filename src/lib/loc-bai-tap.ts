// Bộ lọc danh sách bài tập: theo mục §, độ khó, "nên làm", "cần làm lại".
// Trạng thái bộ lọc nằm trên URL (?muc=1.3&do-kho=vua) để bảng đối chiếu trỏ thẳng tới.

export interface BoLoc {
  muc: string | null;
  doKho: 'de' | 'vua' | 'kho' | null;
  nenLam: boolean;
  lamLai: boolean;
}

export interface TheDeLoc {
  muc: string;
  doKho: string;
  nenLam: boolean;
  /** kết quả tự đánh giá, '' nếu chưa có */
  ketQua: string;
}

export const BO_LOC_TRONG: BoLoc = { muc: null, doKho: null, nenLam: false, lamLai: false };

export function khopBoLoc(the: TheDeLoc, bl: BoLoc): boolean {
  if (bl.muc && the.muc !== bl.muc) return false;
  if (bl.doKho && the.doKho !== bl.doKho) return false;
  if (bl.nenLam && !the.nenLam) return false;
  if (bl.lamLai && the.ketQua !== 'chua-lam-duoc' && the.ketQua !== 'can-goi-y') return false;
  return true;
}

export function docBoLoc(search: string): BoLoc {
  const q = new URLSearchParams(search);
  const muc = q.get('muc');
  const doKho = q.get('do-kho');
  return {
    muc: muc && /^\d+\.\d+$/.test(muc) ? muc : null,
    doKho: doKho === 'de' || doKho === 'vua' || doKho === 'kho' ? doKho : null,
    nenLam: q.get('nen-lam') === '1',
    lamLai: q.get('lam-lai') === '1',
  };
}

export function ghiBoLoc(bl: BoLoc): string {
  const q = new URLSearchParams();
  if (bl.muc) q.set('muc', bl.muc);
  if (bl.doKho) q.set('do-kho', bl.doKho);
  if (bl.nenLam) q.set('nen-lam', '1');
  if (bl.lamLai) q.set('lam-lai', '1');
  const s = q.toString();
  return s ? `?${s}` : '';
}

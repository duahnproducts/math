// Khoá API Claude của người học. Khoá chỉ nằm trong trình duyệt của họ và chỉ được
// gửi tới api.anthropic.com. Mặc định nhớ trong phiên (sessionStorage: đóng thẻ là
// quên); người học tự chọn "Nhớ trên máy này" thì mới lưu vào localStorage.
// Kho bị chặn (chế độ ẩn danh) thì coi như chưa có khoá — web không được lỗi.

export const KHOA_LUU = 'hochanh:khoa-claude';

type Kho = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | undefined;

function doc(kho: Kho): string | null {
  try {
    return kho?.getItem(KHOA_LUU) ?? null;
  } catch {
    return null;
  }
}

function ghi(kho: Kho, giaTri: string | null): void {
  try {
    if (giaTri === null) kho?.removeItem(KHOA_LUU);
    else kho?.setItem(KHOA_LUU, giaTri);
  } catch {
    // bị chặn hoặc hết chỗ: bỏ qua
  }
}

export function docKhoa(phien: Kho, lau: Kho): { khoa: string; nho: boolean } | null {
  const trongPhien = doc(phien);
  if (trongPhien) return { khoa: trongPhien, nho: false };
  const trenMay = doc(lau);
  return trenMay ? { khoa: trenMay, nho: true } : null;
}

export function luuKhoa(khoa: string, nho: boolean, phien: Kho, lau: Kho): void {
  const sach = khoa.trim();
  ghi(nho ? lau : phien, sach);
  ghi(nho ? phien : lau, null);
}

export function xoaKhoa(phien: Kho, lau: Kho): void {
  ghi(phien, null);
  ghi(lau, null);
}

/** Câu báo lỗi khi khoá nhìn đã biết là sai, hoặc null. */
export function loiKhoa(khoa: string): string | null {
  const k = khoa.trim();
  if (!k) return 'Chưa nhập khoá API.';
  if (/\s/.test(k)) return 'Khoá API không có dấu cách. Hãy dán lại.';
  if (!k.startsWith('sk-ant-')) return 'Khoá API của Anthropic bắt đầu bằng "sk-ant-".';
  if (k.length < 20) return 'Khoá API quá ngắn — có thể bạn chưa dán hết.';
  return null;
}

/** Hiện khoá dạng che: "sk-ant-…9f2a". */
export function cheKhoa(khoa: string): string {
  const k = khoa.trim();
  return k.length <= 11 ? 'sk-ant-…' : `${k.slice(0, 7)}…${k.slice(-4)}`;
}

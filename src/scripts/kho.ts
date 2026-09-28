// Đọc/ghi tiến độ trong localStorage. localStorage bị chặn thì web vẫn chạy,
// chỉ là không nhớ được tiến độ.
import { KHOA_TIEN_DO, docTienDo, ghiTienDo, type TienDo } from '../lib/tien-do';

function layKho(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function docKho(): TienDo {
  try {
    return docTienDo(layKho()?.getItem(KHOA_TIEN_DO));
  } catch {
    return docTienDo(null);
  }
}

export function ghiKho(td: TienDo): void {
  try {
    layKho()?.setItem(KHOA_TIEN_DO, ghiTienDo(td));
  } catch {
    // hết chỗ hoặc bị chặn: bỏ qua
  }
  document.dispatchEvent(new CustomEvent('hochanh:tien-do', { detail: td }));
}

/** Đọc — sửa — ghi trong một bước. */
export function capNhatKho(sua: (td: TienDo) => TienDo): TienDo {
  const moi = sua(docKho());
  ghiKho(moi);
  return moi;
}

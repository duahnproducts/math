// Chế độ màn hình sáng/tối — docs/tech_stack.md, mục 12.
// Mặc định là sáng; chỉ sang tối khi người học tự bấm chuyển.

export type GiaoDien = 'sang' | 'toi';

export const KHOA_GIAO_DIEN = 'hochanh:giao-dien';
export const GIAO_DIEN_MAC_DINH: GiaoDien = 'sang';

/** Màu thanh trình duyệt (meta theme-color) — trùng với --bg của từng giao diện. */
export const MAU_THANH_TRINH_DUYET: Record<GiaoDien, string> = {
  sang: '#F7F6F2',
  toi: '#0A0C10',
};

/** Giá trị đã lưu → giao diện. Thiếu hoặc lạ thì coi như sáng. */
export function docGiaoDien(giaTri: string | null | undefined): GiaoDien {
  return giaTri === 'toi' ? 'toi' : GIAO_DIEN_MAC_DINH;
}

export function doiGiaoDien(hienTai: GiaoDien): GiaoDien {
  return hienTai === 'sang' ? 'toi' : 'sang';
}

/** Giá trị đặt vào thuộc tính data-theme của <html> và CSS color-scheme. */
export function thuocTinhTheme(g: GiaoDien): 'light' | 'dark' {
  return g === 'toi' ? 'dark' : 'light';
}

/** Nhãn cho nút: nói điều sẽ xảy ra khi bấm. */
export function nhanNutGiaoDien(hienTai: GiaoDien): string {
  return hienTai === 'sang' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng';
}

/** Đọc lựa chọn đã lưu; localStorage bị chặn (ẩn danh…) thì trả về mặc định. */
export function docGiaoDienDaLuu(kho: Pick<Storage, 'getItem'> | undefined): GiaoDien {
  try {
    return docGiaoDien(kho?.getItem(KHOA_GIAO_DIEN));
  } catch {
    return GIAO_DIEN_MAC_DINH;
  }
}

/** Lưu lựa chọn; bỏ qua lỗi nếu không lưu được — trang vẫn đổi màu bình thường. */
export function luuGiaoDien(kho: Pick<Storage, 'setItem'> | undefined, g: GiaoDien): void {
  try {
    kho?.setItem(KHOA_GIAO_DIEN, g);
  } catch {
    // không lưu được thì thôi
  }
}

/**
 * Script nhúng thẳng vào <head> (is:inline), chạy trước khi vẽ trang để không bị
 * nháy trắng khi người học đang dùng giao diện tối. Viết bằng ES5, không import.
 */
export const SCRIPT_KHOI_TAO_GIAO_DIEN = `(function(){var g=null;try{g=localStorage.getItem(${JSON.stringify(
  KHOA_GIAO_DIEN,
)});}catch(e){}var t=g==='toi'?'dark':'light';var d=document.documentElement;d.setAttribute('data-theme',t);d.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute('content',t==='dark'?${JSON.stringify(
  MAU_THANH_TRINH_DUYET.toi,
)}:${JSON.stringify(MAU_THANH_TRINH_DUYET.sang)});}})();`;

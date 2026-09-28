// Nút chuyển sáng/tối (docs/tech_stack.md, mục 12). Script đầu trang đã đặt
// data-theme trước khi vẽ; ở đây chỉ gắn sự kiện cho nút và đồng bộ nhãn.
import {
  KHOA_GIAO_DIEN,
  MAU_THANH_TRINH_DUYET,
  docGiaoDienDaLuu,
  doiGiaoDien,
  luuGiaoDien,
  nhanNutGiaoDien,
  thuocTinhTheme,
  type GiaoDien,
} from '../lib/giao-dien';

function kho(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function hienTai(): GiaoDien {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'toi' : 'sang';
}

function apDung(g: GiaoDien): void {
  const t = thuocTinhTheme(g);
  const html = document.documentElement;
  html.setAttribute('data-theme', t);
  html.style.colorScheme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', MAU_THANH_TRINH_DUYET[g]);
  for (const nut of document.querySelectorAll<HTMLButtonElement>('[data-nut-giao-dien]')) {
    nut.setAttribute('aria-pressed', String(g === 'toi'));
    nut.setAttribute('aria-label', nhanNutGiaoDien(g));
    nut.title = nhanNutGiaoDien(g);
  }
}

export function khoiTaoGiaoDien(): void {
  // Đồng bộ phòng khi script đầu trang không chạy được
  apDung(docGiaoDienDaLuu(kho()));
  for (const nut of document.querySelectorAll<HTMLButtonElement>('[data-nut-giao-dien]')) {
    nut.addEventListener('click', () => {
      const moi = doiGiaoDien(hienTai());
      luuGiaoDien(kho(), moi);
      apDung(moi);
    });
  }
  // Đổi ở tab khác thì tab này đổi theo
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === KHOA_GIAO_DIEN) apDung(docGiaoDienDaLuu(kho()));
  });
}

// Biểu tượng cài lên màn hình chính (ảnh đại diện của app) — docs/tech_stack.md, mục 13.
// Điện thoại lưu biểu tượng theo đường dẫn: đổi ảnh mà giữ nguyên tên file thì cài
// lại vẫn ra ảnh cũ. Vì vậy mỗi đường dẫn kèm `?v=` tính từ nội dung file: ảnh đổi
// thì đường dẫn đổi, máy buộc phải tải ảnh mới.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MAU_THANH_TRINH_DUYET } from './giao-dien';

/** Biểu tượng khai báo trong manifest (file nằm trong public/). */
export const BIEU_TUONG_MANIFEST = [
  { ten: 'icon-192.png', sizes: '192x192', purpose: 'any' },
  { ten: 'icon-512.png', sizes: '512x512', purpose: 'any' },
  { ten: 'icon-maskable-512.png', sizes: '512x512', purpose: 'maskable' },
] as const;
export const APPLE_TOUCH_ICON = 'apple-touch-icon.png';
export const FAVICON = 'favicon.png';

/** Đọc nội dung một file biểu tượng theo tên. */
export type DocFile = (ten: string) => Uint8Array;

/** Mã phiên bản 10 ký tự hex lấy từ nội dung: cùng ảnh thì cùng mã, khác ảnh thì khác mã. */
export function maPhienBan(noiDung: Uint8Array): string {
  return createHash('sha256').update(noiDung).digest('hex').slice(0, 10);
}

/** `icon-192.png` → `icon-192.png?v=3f2a…` */
export function kemPhienBan(ten: string, doc: DocFile): string {
  return `${ten}?v=${maPhienBan(doc(ten))}`;
}

/**
 * Nội dung manifest.webmanifest. Mọi đường dẫn tương đối (`./`) nên đúng với base
 * `/math/`. `id` giữ nguyên để Android coi là cùng một app khi biểu tượng đổi.
 */
export function taoManifest(doc: DocFile) {
  return {
    name: 'Hochanh — Học theo giáo trình',
    short_name: 'Hochanh',
    description: 'Web học theo giáo trình: Giảng dạy, Dịch nguyên văn / Theo sách, Bài tập kèm gợi ý theo tầng.',
    lang: 'vi',
    dir: 'ltr',
    id: './',
    start_url: './',
    scope: './',
    display: 'standalone',
    orientation: 'any',
    background_color: MAU_THANH_TRINH_DUYET.sang,
    theme_color: MAU_THANH_TRINH_DUYET.sang,
    icons: BIEU_TUONG_MANIFEST.map((b) => ({
      src: kemPhienBan(b.ten, doc),
      sizes: b.sizes,
      type: 'image/png',
      purpose: b.purpose,
    })),
  };
}

/** Đọc file trong public/ lúc build (lệnh build chạy ở gốc repo). Mỗi file đọc một lần. */
const daDoc = new Map<string, Uint8Array>();
export const docFilePublic: DocFile = (ten) => {
  if (!daDoc.has(ten)) daDoc.set(ten, readFileSync(join(process.cwd(), 'public', ten)));
  return daDoc.get(ten)!;
};

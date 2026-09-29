// Cài lên màn hình chính (docs/tech_stack.md, mục 13): mở từ biểu tượng thì web
// chạy toàn màn hình, không còn thanh địa chỉ và thanh công cụ của trình duyệt.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APPLE_TOUCH_ICON, FAVICON, docFilePublic, maPhienBan, taoManifest } from '../src/lib/bieu-tuong';

const goc = new URL('..', import.meta.url);
const doc = (duong: string) => readFileSync(new URL(duong, goc), 'utf8');

// Manifest dựng lúc build (src/pages/manifest.webmanifest.ts) từ đúng các file trong public/
const manifest = taoManifest(docFilePublic);
/** `icon-192.png?v=…` → `icon-192.png` */
const tenFile = (src: string) => src.split('?')[0];

/** Rộng × cao đọc thẳng từ khối IHDR của file PNG. */
function kichThuocPng(duong: string): string {
  const b = readFileSync(new URL(duong, goc));
  expect(b.subarray(1, 4).toString('latin1'), `${duong} không phải PNG`).toBe('PNG');
  return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
}

describe('manifest', () => {
  it('không còn manifest tĩnh trong public/ đè lên bản dựng lúc build', () => {
    expect(existsSync(new URL('public/manifest.webmanifest', goc))).toBe(false);
    expect(existsSync(new URL('src/pages/manifest.webmanifest.ts', goc))).toBe(true);
  });

  it('đường dẫn tương đối, nên chạy đúng dưới base /math/ của GitHub Pages', () => {
    for (const duong of [manifest.start_url, manifest.scope, manifest.id, ...manifest.icons.map((i) => i.src)]) {
      expect(duong, duong).not.toMatch(/^\/|^https?:/);
    }
  });

  it('biểu tượng có thật, đúng kích thước khai báo', () => {
    for (const bt of manifest.icons) {
      expect(kichThuocPng(`public/${tenFile(bt.src)}`), bt.src).toBe(bt.sizes);
    }
  });

  it('đường dẫn biểu tượng mang mã phiên bản đúng với ảnh đang có', () => {
    for (const bt of manifest.icons) {
      const noiDung = readFileSync(new URL(`public/${tenFile(bt.src)}`, goc));
      expect(bt.src, bt.src).toBe(`${tenFile(bt.src)}?v=${maPhienBan(noiDung)}`);
    }
  });

  it('có biểu tượng 192, 512 và một bản maskable cho Android', () => {
    const cacCo = manifest.icons.map((i) => i.sizes);
    expect(cacCo).toContain('192x192');
    expect(cacCo).toContain('512x512');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  it('iOS: apple-touch-icon 180×180', () => {
    expect(kichThuocPng(`public/${APPLE_TOUCH_ICON}`)).toBe('180x180');
  });

  it('favicon 64×64 cho tab trình duyệt', () => {
    expect(kichThuocPng(`public/${FAVICON}`)).toBe('64x64');
  });

  it('script và ảnh nguồn còn đó để tạo lại biểu tượng khi đổi ảnh', () => {
    expect(existsSync(new URL('scripts/tao-bieu-tuong.py', goc))).toBe(true);
    expect(existsSync(new URL('scripts/anh-bieu-tuong.jpg', goc))).toBe(true);
  });
});

describe('khung trang khai báo đủ để cài', () => {
  const khung = doc('src/layouts/Khung.astro');

  it('trỏ tới manifest, apple-touch-icon và favicon qua base', () => {
    expect(khung).toContain('rel="manifest" href={`${base}manifest.webmanifest`}');
    expect(khung).toContain('rel="apple-touch-icon" sizes="180x180" href={`${base}${kemPhienBan(APPLE_TOUCH_ICON, docFilePublic)}`}');
    expect(khung).toContain('rel="icon" type="image/png" href={`${base}${kemPhienBan(FAVICON, docFilePublic)}`}');
  });

  it('iOS mở toàn màn hình khi cài từ Safari', () => {
    expect(khung).toMatch(/name="apple-mobile-web-app-capable" content="yes"/);
    expect(khung).toMatch(/name="mobile-web-app-capable" content="yes"/);
    // "default": thanh trạng thái lấy theme-color, chữ không bị trắng trên nền sáng
    expect(khung).toMatch(/name="apple-mobile-web-app-status-bar-style" content="default"/);
  });

  it('viewport-fit=cover để thanh dưới né được vạch Home của iPhone', () => {
    expect(khung).toContain('viewport-fit=cover');
    expect(doc('src/styles/global.css')).toContain('env(safe-area-inset-bottom)');
  });
});

describe('token bong bóng có ở cả hai giao diện', () => {
  const css = doc('src/styles/tokens.css');
  const khoi = (boChon: string) => {
    const batDau = css.indexOf(`${boChon} {`);
    return css.slice(batDau, css.indexOf('}', batDau));
  };
  for (const ten of ['--glass', '--glass-line', '--glass-shadow', '--bubble', '--track', '--bubble-raised', '--gloss']) {
    it(ten, () => {
      expect(khoi(':root')).toContain(`${ten}:`);
      expect(khoi(':root[data-theme="dark"]')).toContain(`${ten}:`);
    });
  }
});

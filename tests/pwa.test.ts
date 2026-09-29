// Cài lên màn hình chính (docs/tech_stack.md, mục 13): mở từ biểu tượng thì web
// chạy toàn màn hình, không còn thanh địa chỉ và thanh công cụ của trình duyệt.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MAU_THANH_TRINH_DUYET } from '../src/lib/giao-dien';

const goc = new URL('..', import.meta.url);
const doc = (duong: string) => readFileSync(new URL(duong, goc), 'utf8');

interface BieuTuong {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}
const manifest = JSON.parse(doc('public/manifest.webmanifest')) as {
  name: string;
  short_name: string;
  lang: string;
  start_url: string;
  scope: string;
  id: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: BieuTuong[];
};

/** Rộng × cao đọc thẳng từ khối IHDR của file PNG. */
function kichThuocPng(duong: string): string {
  const b = readFileSync(new URL(duong, goc));
  expect(b.subarray(1, 4).toString('latin1'), `${duong} không phải PNG`).toBe('PNG');
  return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
}

describe('manifest', () => {
  it('mở toàn màn hình, không có thanh của trình duyệt', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('tên và ngôn ngữ', () => {
    expect(manifest.short_name).toBe('Hochanh');
    expect(manifest.name).toContain('Hochanh');
    expect(manifest.lang).toBe('vi');
  });

  it('đường dẫn tương đối, nên chạy đúng dưới base /math/ của GitHub Pages', () => {
    for (const duong of [manifest.start_url, manifest.scope, manifest.id, ...manifest.icons.map((i) => i.src)]) {
      expect(duong, duong).not.toMatch(/^\/|^https?:/);
    }
  });

  it('màu nền và màu thanh trạng thái trùng giao diện sáng mặc định', () => {
    expect(manifest.background_color).toBe(MAU_THANH_TRINH_DUYET.sang);
    expect(manifest.theme_color).toBe(MAU_THANH_TRINH_DUYET.sang);
  });

  it('biểu tượng có thật, đúng kích thước khai báo', () => {
    for (const bt of manifest.icons) {
      expect(bt.type).toBe('image/png');
      expect(kichThuocPng(`public/${bt.src}`), bt.src).toBe(bt.sizes);
    }
  });

  it('có biểu tượng 192, 512 và một bản maskable cho Android', () => {
    const cacCo = manifest.icons.map((i) => i.sizes);
    expect(cacCo).toContain('192x192');
    expect(cacCo).toContain('512x512');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  it('iOS: apple-touch-icon 180×180', () => {
    expect(kichThuocPng('public/apple-touch-icon.png')).toBe('180x180');
  });

  it('favicon 64×64 cho tab trình duyệt', () => {
    expect(kichThuocPng('public/favicon.png')).toBe('64x64');
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
    expect(khung).toContain('rel="apple-touch-icon" href={`${base}apple-touch-icon.png`}');
    expect(khung).toContain('rel="icon" type="image/png" href={`${base}favicon.png`}');
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

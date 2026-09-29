import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  APPLE_TOUCH_ICON,
  BIEU_TUONG_MANIFEST,
  FAVICON,
  docFilePublic,
  kemPhienBan,
  maPhienBan,
  taoManifest,
  type DocFile,
} from './bieu-tuong';
import { MAU_THANH_TRINH_DUYET } from './giao-dien';

const byte = (s: string) => new TextEncoder().encode(s);
/** Mỗi file có nội dung riêng, đổi được từng file. */
const khoGia = (noiDung: Record<string, string>): DocFile => (ten) => byte(noiDung[ten] ?? `ảnh ${ten}`);

describe('maPhienBan', () => {
  it('10 ký tự hex, là đầu của sha256 nội dung', () => {
    const ma = maPhienBan(byte('ảnh chữ H'));
    expect(ma).toMatch(/^[0-9a-f]{10}$/);
    expect(ma).toBe(createHash('sha256').update(byte('ảnh chữ H')).digest('hex').slice(0, 10));
  });

  it('cùng ảnh thì cùng mã', () => {
    expect(maPhienBan(byte('ảnh chụp'))).toBe(maPhienBan(byte('ảnh chụp')));
  });

  it('đổi ảnh thì đổi mã, dù chỉ khác một byte', () => {
    expect(maPhienBan(byte('ảnh chụp 1'))).not.toBe(maPhienBan(byte('ảnh chụp 2')));
  });
});

describe('kemPhienBan', () => {
  it('giữ tên file, thêm ?v= theo nội dung', () => {
    const doc = khoGia({});
    expect(kemPhienBan(APPLE_TOUCH_ICON, doc)).toBe(`apple-touch-icon.png?v=${maPhienBan(doc(APPLE_TOUCH_ICON))}`);
  });

  it('đổi ảnh → đổi đường dẫn, nên máy không dùng lại ảnh cũ đã lưu', () => {
    const cu = kemPhienBan(FAVICON, khoGia({ [FAVICON]: 'chữ H' }));
    const moi = kemPhienBan(FAVICON, khoGia({ [FAVICON]: 'ảnh chụp' }));
    expect(moi).not.toBe(cu);
    expect(moi.split('?')[0]).toBe(cu.split('?')[0]);
  });
});

describe('taoManifest', () => {
  const manifest = taoManifest(khoGia({}));

  it('mở toàn màn hình, tên và ngôn ngữ', () => {
    expect(manifest.display).toBe('standalone');
    expect(manifest.short_name).toBe('Hochanh');
    expect(manifest.lang).toBe('vi');
  });

  it('màu trùng giao diện sáng mặc định', () => {
    expect(manifest.background_color).toBe(MAU_THANH_TRINH_DUYET.sang);
    expect(manifest.theme_color).toBe(MAU_THANH_TRINH_DUYET.sang);
  });

  it('mỗi biểu tượng kèm mã phiên bản của chính file đó', () => {
    const doc = khoGia({});
    expect(manifest.icons).toHaveLength(BIEU_TUONG_MANIFEST.length);
    manifest.icons.forEach((bt, i) => {
      const ten = BIEU_TUONG_MANIFEST[i].ten;
      expect(bt.src).toBe(`${ten}?v=${maPhienBan(doc(ten))}`);
      expect(bt.type).toBe('image/png');
    });
  });

  it('chỉ đổi ảnh maskable thì chỉ đường dẫn maskable đổi', () => {
    const sau = taoManifest(khoGia({ 'icon-maskable-512.png': 'ảnh mới' }));
    const doi = sau.icons.filter((bt, i) => bt.src !== manifest.icons[i].src).map((bt) => bt.src.split('?')[0]);
    expect(doi).toEqual(['icon-maskable-512.png']);
  });

  it('id không đổi theo ảnh, để Android coi là cùng một app', () => {
    expect(taoManifest(khoGia({ 'icon-192.png': 'ảnh mới' })).id).toBe(manifest.id);
  });
});

describe('docFilePublic', () => {
  it('đọc đúng file thật trong public/', () => {
    const b = docFilePublic(APPLE_TOUCH_ICON);
    expect(Buffer.from(b.subarray(1, 4)).toString('latin1')).toBe('PNG');
  });
});

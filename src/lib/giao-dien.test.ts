import { describe, expect, it } from 'vitest';
import {
  GIAO_DIEN_MAC_DINH,
  KHOA_GIAO_DIEN,
  MAU_THANH_TRINH_DUYET,
  SCRIPT_KHOI_TAO_GIAO_DIEN,
  docGiaoDien,
  docGiaoDienDaLuu,
  doiGiaoDien,
  luuGiaoDien,
  nhanNutGiaoDien,
  thuocTinhTheme,
} from './giao-dien';

describe('docGiaoDien', () => {
  it('mặc định là sáng', () => {
    expect(GIAO_DIEN_MAC_DINH).toBe('sang');
    expect(docGiaoDien(null)).toBe('sang');
    expect(docGiaoDien(undefined)).toBe('sang');
  });
  it('giá trị lạ coi như sáng', () => {
    expect(docGiaoDien('dark')).toBe('sang');
    expect(docGiaoDien('')).toBe('sang');
    expect(docGiaoDien('TOI')).toBe('sang');
  });
  it('đọc đúng giá trị đã lưu', () => {
    expect(docGiaoDien('toi')).toBe('toi');
    expect(docGiaoDien('sang')).toBe('sang');
  });
});

describe('đổi giao diện', () => {
  it('đổi qua lại sáng ↔ tối', () => {
    expect(doiGiaoDien('sang')).toBe('toi');
    expect(doiGiaoDien('toi')).toBe('sang');
    expect(doiGiaoDien(doiGiaoDien('sang'))).toBe('sang');
  });
  it('thuộc tính data-theme', () => {
    expect(thuocTinhTheme('sang')).toBe('light');
    expect(thuocTinhTheme('toi')).toBe('dark');
  });
  it('nhãn nút nói điều sẽ xảy ra khi bấm', () => {
    expect(nhanNutGiaoDien('sang')).toContain('tối');
    expect(nhanNutGiaoDien('toi')).toContain('sáng');
  });
});

describe('lưu và đọc trong localStorage', () => {
  function khoGia() {
    const du = new Map<string, string>();
    return {
      getItem: (k: string) => du.get(k) ?? null,
      setItem: (k: string, v: string) => void du.set(k, v),
      du,
    };
  }

  it('lưu rồi đọc lại', () => {
    const kho = khoGia();
    luuGiaoDien(kho, 'toi');
    expect(kho.du.get(KHOA_GIAO_DIEN)).toBe('toi');
    expect(docGiaoDienDaLuu(kho)).toBe('toi');
  });

  it('localStorage bị chặn thì không lỗi và dùng sáng', () => {
    const khoLoi = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(docGiaoDienDaLuu(khoLoi)).toBe('sang');
    expect(() => luuGiaoDien(khoLoi, 'toi')).not.toThrow();
    expect(docGiaoDienDaLuu(undefined)).toBe('sang');
  });
});

describe('script đầu trang', () => {
  function chay(giaTriDaLuu: string | null, chan = false) {
    const thuocTinh = new Map<string, string>();
    const meta = { content: '', setAttribute: (_: string, v: string) => (meta.content = v) };
    const html = {
      style: { colorScheme: '' },
      setAttribute: (k: string, v: string) => void thuocTinh.set(k, v),
    };
    const document = {
      documentElement: html,
      querySelector: (s: string) => (s.includes('theme-color') ? meta : null),
    };
    const localStorage = {
      getItem: (k: string) => {
        if (chan) throw new Error('SecurityError');
        return k === KHOA_GIAO_DIEN ? giaTriDaLuu : null;
      },
    };
    new Function('localStorage', 'document', SCRIPT_KHOI_TAO_GIAO_DIEN)(localStorage, document);
    return { theme: thuocTinh.get('data-theme'), colorScheme: html.style.colorScheme, meta: meta.content };
  }

  it('chưa lưu gì → sáng', () => {
    expect(chay(null)).toEqual({ theme: 'light', colorScheme: 'light', meta: MAU_THANH_TRINH_DUYET.sang });
  });
  it('đã chọn tối → tối ngay từ đầu', () => {
    expect(chay('toi')).toEqual({ theme: 'dark', colorScheme: 'dark', meta: MAU_THANH_TRINH_DUYET.toi });
  });
  it('localStorage bị chặn → vẫn chạy, dùng sáng', () => {
    expect(chay('toi', true).theme).toBe('light');
  });
  it('không dùng cú pháp mới (chạy được trên trình duyệt cũ)', () => {
    expect(SCRIPT_KHOI_TAO_GIAO_DIEN).not.toMatch(/=>|\blet\b|\bconst\b|\?\./);
  });
});

import { describe, expect, it } from 'vitest';
import { KHOA_LUU, cheKhoa, docKhoa, loiKhoa, luuKhoa, xoaKhoa } from './khoa-api';

function khoGia(): Storage & { du: Map<string, string> } {
  const du = new Map<string, string>();
  return {
    du,
    getItem: (k) => du.get(k) ?? null,
    setItem: (k, v) => void du.set(k, v),
    removeItem: (k) => void du.delete(k),
    clear: () => du.clear(),
    key: () => null,
    length: 0,
  } as Storage & { du: Map<string, string> };
}

const khoBiChan = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('SecurityError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

const KHOA = 'sk-ant-api03-thu-nghiem-1234567890';

describe('lưu khoá API', () => {
  it('mặc định chỉ nhớ trong phiên', () => {
    const phien = khoGia();
    const lau = khoGia();
    luuKhoa(`  ${KHOA} `, false, phien, lau);
    expect(phien.du.get(KHOA_LUU)).toBe(KHOA);
    expect(lau.du.has(KHOA_LUU)).toBe(false);
    expect(docKhoa(phien, lau)).toEqual({ khoa: KHOA, nho: false });
  });

  it('chọn "Nhớ trên máy này" thì chuyển sang localStorage, bỏ bản trong phiên', () => {
    const phien = khoGia();
    const lau = khoGia();
    luuKhoa(KHOA, false, phien, lau);
    luuKhoa(KHOA, true, phien, lau);
    expect(phien.du.has(KHOA_LUU)).toBe(false);
    expect(docKhoa(phien, lau)).toEqual({ khoa: KHOA, nho: true });
  });

  it('xoá khoá ở cả hai nơi', () => {
    const phien = khoGia();
    const lau = khoGia();
    luuKhoa(KHOA, true, phien, lau);
    xoaKhoa(phien, lau);
    expect(docKhoa(phien, lau)).toBeNull();
  });

  it('kho bị chặn (ẩn danh) thì không lỗi, coi như chưa có khoá', () => {
    expect(() => luuKhoa(KHOA, true, khoBiChan, khoBiChan)).not.toThrow();
    expect(docKhoa(khoBiChan, khoBiChan)).toBeNull();
    expect(docKhoa(undefined, undefined)).toBeNull();
  });
});

describe('kiểm tra và che khoá', () => {
  it('báo lỗi khoá nhìn đã biết là sai', () => {
    expect(loiKhoa('')).toMatch(/Chưa nhập/);
    expect(loiKhoa('sk-ant- abc')).toMatch(/dấu cách/);
    expect(loiKhoa('sk-proj-1234567890abcdefgh')).toMatch(/bắt đầu bằng "sk-ant-"/);
    expect(loiKhoa('sk-ant-123')).toMatch(/quá ngắn/);
    expect(loiKhoa(KHOA)).toBeNull();
  });

  it('chỉ hiện đầu và bốn ký tự cuối', () => {
    expect(cheKhoa(KHOA)).toBe('sk-ant-…7890');
    expect(cheKhoa(KHOA)).not.toContain('thu-nghiem');
  });
});

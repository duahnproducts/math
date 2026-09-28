import { describe, expect, it } from 'vitest';
import { noi, noiFile, slugSangSo, soChuongTuSlug, soSangSlug, taoDuongDan, viTriTuUrl } from './duong-dan';

describe('số hiệu ↔ slug', () => {
  it('đổi qua lại', () => {
    expect(soSangSlug('1.2.5')).toBe('1-2-5');
    expect(slugSangSo('1-2-5')).toBe('1.2.5');
    expect(slugSangSo(soSangSlug('1.3'))).toBe('1.3');
  });
  it('đọc số chương', () => {
    expect(soChuongTuSlug('chuong-12')).toBe(12);
    expect(soChuongTuSlug('bai-1')).toBeNaN();
  });
});

describe('noi', () => {
  it('ghép base có hoặc không có dấu /', () => {
    expect(noi('/math/', 'giai-tich')).toBe('/math/giai-tich/');
    expect(noi('/math', 'giai-tich', 'chuong-1')).toBe('/math/giai-tich/chuong-1/');
    expect(noi('/', 'thuat-ngu')).toBe('/thuat-ngu/');
  });
  it('trang chủ', () => {
    expect(noi('/math/')).toBe('/math/');
    expect(noi('/')).toBe('/');
  });
  it('không sinh dấu // thừa', () => {
    expect(noi('/math/', '/giai-tich/', '/chuong-1')).toBe('/math/giai-tich/chuong-1/');
  });
  it('file không có dấu / cuối', () => {
    expect(noiFile('/math/', 'tai-ve', 'a.pdf')).toBe('/math/tai-ve/a.pdf');
  });
});

describe('viTriTuUrl', () => {
  it('đọc môn và chương từ đường dẫn', () => {
    expect(viTriTuUrl('/math/giai-tich/chuong-1/giang-day/bai-2/', '/math/')).toEqual({ mon: 'giai-tich', chuong: 1 });
    expect(viTriTuUrl('/math/dai-so/chuong-3', '/math')).toEqual({ mon: 'dai-so', chuong: 3 });
  });
  it('trang không thuộc chương nào → null', () => {
    expect(viTriTuUrl('/math/', '/math/')).toBeNull();
    expect(viTriTuUrl('/math/thuat-ngu/', '/math/')).toBeNull();
    expect(viTriTuUrl('/khac/giai-tich/chuong-1/', '/math/')).toBeNull();
  });
});

describe('taoDuongDan', () => {
  const d = taoDuongDan('/math/');
  it('đủ các màn hình', () => {
    expect(d.trangChu()).toBe('/math/');
    expect(d.mon('giai-tich')).toBe('/math/giai-tich/');
    expect(d.chuong('giai-tich', 1)).toBe('/math/giai-tich/chuong-1/');
    expect(d.baiGiang('giai-tich', 1, 2)).toBe('/math/giai-tich/chuong-1/giang-day/bai-2/');
    expect(d.sach('giai-tich', 1, '1.3')).toBe('/math/giai-tich/chuong-1/sach/1-3/');
    expect(d.dsBaiTap('giai-tich', 1)).toBe('/math/giai-tich/chuong-1/bai-tap/');
    expect(d.baiTap('giai-tich', 1, '1.2.5')).toBe('/math/giai-tich/chuong-1/bai-tap/1-2-5/');
    expect(d.thuatNgu()).toBe('/math/thuat-ngu/');
    expect(d.taiVe('x.pdf')).toBe('/math/tai-ve/x.pdf');
  });
});

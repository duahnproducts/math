import { describe, expect, it } from 'vitest';
import { BO_LOC_TRONG, docBoLoc, ghiBoLoc, khopBoLoc, type TheDeLoc } from './loc-bai-tap';

const the = (muc: string, doKho: string, nenLam = false, ketQua = ''): TheDeLoc => ({ muc, doKho, nenLam, ketQua });

describe('khopBoLoc', () => {
  it('bộ lọc trống cho qua mọi bài', () => {
    expect(khopBoLoc(the('1.2', 'de'), BO_LOC_TRONG)).toBe(true);
  });
  it('lọc theo mục và độ khó', () => {
    const bl = { ...BO_LOC_TRONG, muc: '1.3', doKho: 'vua' as const };
    expect(khopBoLoc(the('1.3', 'vua'), bl)).toBe(true);
    expect(khopBoLoc(the('1.3', 'kho'), bl)).toBe(false);
    expect(khopBoLoc(the('1.2', 'vua'), bl)).toBe(false);
  });
  it('chỉ bài nên làm', () => {
    const bl = { ...BO_LOC_TRONG, nenLam: true };
    expect(khopBoLoc(the('1.2', 'de', true), bl)).toBe(true);
    expect(khopBoLoc(the('1.2', 'de', false), bl)).toBe(false);
  });
  it('chỉ bài cần làm lại', () => {
    const bl = { ...BO_LOC_TRONG, lamLai: true };
    expect(khopBoLoc(the('1.2', 'de', false, 'chua-lam-duoc'), bl)).toBe(true);
    expect(khopBoLoc(the('1.2', 'de', false, 'can-goi-y'), bl)).toBe(true);
    expect(khopBoLoc(the('1.2', 'de', false, 'lam-duoc'), bl)).toBe(false);
    expect(khopBoLoc(the('1.2', 'de', false, ''), bl)).toBe(false);
  });
});

describe('bộ lọc trên URL', () => {
  it('đọc và ghi qua lại', () => {
    const bl = { muc: '1.3', doKho: 'kho' as const, nenLam: true, lamLai: false };
    expect(docBoLoc(ghiBoLoc(bl))).toEqual(bl);
    expect(ghiBoLoc(BO_LOC_TRONG)).toBe('');
  });
  it('bỏ qua giá trị lạ', () => {
    expect(docBoLoc('?muc=abc&do-kho=sieu-kho&nen-lam=yes')).toEqual(BO_LOC_TRONG);
  });
});

import { describe, expect, it } from 'vitest';
import { GIA, chiPhiTheoToken, dinhDangKhoang, dinhDangUSD, uocTinhChuong, uocTinhMucLuc } from './chi-phi';

describe('chiPhiTheoToken', () => {
  it('tính theo bảng giá Claude Opus 5.5', () => {
    expect(chiPhiTheoToken({ input_tokens: 1_000_000, output_tokens: 0 })).toBeCloseTo(GIA.vao);
    expect(chiPhiTheoToken({ input_tokens: 0, output_tokens: 1_000_000 })).toBeCloseTo(GIA.ra);
    expect(
      chiPhiTheoToken({ input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 1_000_000, cache_read_input_tokens: 1_000_000 }),
    ).toBeCloseTo(GIA.ghi_cache + GIA.doc_cache);
  });

  it('chịu được trường bộ nhớ đệm là null', () => {
    expect(chiPhiTheoToken({ input_tokens: 100, output_tokens: 0, cache_creation_input_tokens: null, cache_read_input_tokens: null })).toBeCloseTo(0.0004);
  });

  it('đọc lại từ bộ nhớ đệm rẻ hơn gửi mới', () => {
    expect(GIA.doc_cache).toBeLessThan(GIA.vao / 10);
  });
});

describe('ước tính trước khi tạo', () => {
  it('khoảng thấp luôn nhỏ hơn khoảng cao', () => {
    const k = uocTinhChuong(30, 5);
    expect(k.thap).toBeGreaterThan(0);
    expect(k.thap).toBeLessThan(k.cao);
  });

  it('chương dài hơn, nhiều bài hơn thì tốn hơn', () => {
    expect(uocTinhChuong(60, 5).cao).toBeGreaterThan(uocTinhChuong(30, 5).cao);
    expect(uocTinhChuong(30, 7).cao).toBeGreaterThan(uocTinhChuong(30, 3).cao);
  });

  it('một chương 30 trang, 5 bài tốn cỡ vài chục xu tới vài đô', () => {
    const k = uocTinhChuong(30, 5);
    expect(k.thap).toBeGreaterThan(0.3);
    expect(k.cao).toBeLessThan(5);
  });

  it('đọc mục lục rẻ hơn tạo một chương', () => {
    expect(uocTinhMucLuc(40).cao).toBeLessThan(uocTinhChuong(40, 5).thap);
  });
});

describe('định dạng tiền', () => {
  it('dùng dấu phẩy thập phân kiểu Việt Nam', () => {
    expect(dinhDangUSD(0.456)).toBe('0,46 USD');
    expect(dinhDangUSD(0.004)).toBe('dưới 0,01 USD');
    expect(dinhDangUSD(0)).toBe('0,00 USD');
    expect(dinhDangKhoang({ thap: 0.5, cao: 1.25 })).toBe('khoảng 0,50–1,25 USD');
  });
});

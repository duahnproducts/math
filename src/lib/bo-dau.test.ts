import { describe, expect, it } from 'vitest';
import { boDau, chuanHoa, khop } from './bo-dau';

describe('boDau', () => {
  it('bỏ dấu thanh và dấu mũ', () => {
    expect(boDau('Tập số thực')).toBe('Tap so thuc');
    expect(boDau('Tiên đề Đầy đủ')).toBe('Tien de Day du');
    expect(boDau('ươ ỹ ặ')).toBe('uo y a');
  });
  it('đổi đ/Đ', () => {
    expect(boDau('đường chéo Đ')).toBe('duong cheo D');
  });
  it('dạng tổ hợp sẵn (NFC) và tách rời (NFD) cho cùng kết quả', () => {
    expect(boDau('Tập'.normalize('NFD'))).toBe(boDau('Tập'.normalize('NFC')));
  });
});

describe('tìm kiếm', () => {
  it('gõ không dấu vẫn ra "Tập số thực" (điều kiện nghiệm thu mục 6)', () => {
    expect(khop('Tập số thực', 'tap so thuc')).toBe(true);
  });
  it('không phân biệt hoa thường, thứ tự từ', () => {
    expect(khop('Cận trên nhỏ nhất (supremum)', 'SUPREMUM can tren')).toBe(true);
  });
  it('thiếu một từ thì không khớp', () => {
    expect(khop('Tập số thực', 'tap so huu ti')).toBe(false);
  });
  it('từ khoá rỗng khớp mọi thứ', () => {
    expect(khop('bất kỳ', '   ')).toBe(true);
  });
  it('chuẩn hoá khoảng trắng', () => {
    expect(chuanHoa('  Số   Hữu  tỉ ')).toBe('so huu ti');
  });
});

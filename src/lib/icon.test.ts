import { Download } from 'lucide-static';
import { describe, expect, it } from 'vitest';
import { svgIcon } from './icon';

describe('svgIcon', () => {
  it('đổi cỡ, nét, lớp và ẩn với trình đọc màn hình', () => {
    const s = svgIcon(Download, 16, 'xoay');
    expect(s).toMatch(/^<svg aria-hidden="true" focusable="false"/);
    expect(s).toContain('class="icon xoay"');
    expect(s).toContain('width="16"');
    expect(s).toContain('height="16"');
    expect(s).toContain('stroke-width="1.75"');
    expect(s).not.toContain('<!--');
  });
  it('không có lớp thêm thì chỉ là "icon"', () => {
    expect(svgIcon(Download)).toContain('class="icon"');
  });
});

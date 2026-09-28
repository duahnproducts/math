// Hình lấy từ sách gốc (src/figures/sach): có ghi nguồn, đổi được sáng/tối,
// và mọi <HinhSach ten="…"> trong nội dung đều trỏ tới hình có thật.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const GOC = fileURLToPath(new URL('..', import.meta.url));
const THU_MUC = join(GOC, 'src', 'figures', 'sach');
const nguon = JSON.parse(readFileSync(join(THU_MUC, 'nguon.json'), 'utf8')) as {
  hinh: Record<string, { sach: string; trang: number; hop: number[] }>;
  sach: Record<string, string>;
};
const cacSvg = readdirSync(THU_MUC)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => f.slice(0, -4));

function tatCaMdx(thuMuc: string): string[] {
  return readdirSync(thuMuc).flatMap((f) => {
    const p = join(thuMuc, f);
    return statSync(p).isDirectory() ? tatCaMdx(p) : f.endsWith('.mdx') ? [p] : [];
  });
}

describe('hình lấy từ sách gốc', () => {
  it('có ít nhất một hình', () => {
    expect(cacSvg.length).toBeGreaterThan(0);
  });

  it('hình nào cũng ghi nguồn (sách, trang, vùng cắt) và ngược lại', () => {
    expect(Object.keys(nguon.hinh).sort()).toEqual([...cacSvg].sort());
    for (const [ten, h] of Object.entries(nguon.hinh)) {
      expect(nguon.sach[h.sach], ten).toBeTruthy();
      expect(h.hop, ten).toHaveLength(4);
    }
  });

  it.each(cacSvg)('%s: không có màu cứng, chỉ dùng lớp CSS (đổi được sáng/tối)', (ten) => {
    const svg = readFileSync(join(THU_MUC, `${ten}.svg`), 'utf8');
    expect(svg).toMatch(/^<svg /);
    expect(svg).not.toMatch(/#[0-9a-f]{3,6}\b|rgb\(/i);
    expect(svg).not.toMatch(/<(script|image|foreignObject)\b/);
    expect(svg).toMatch(/class="/);
  });

  it('mọi <HinhSach ten> trong nội dung đều có file hình', () => {
    const dung = new Set<string>();
    for (const tep of tatCaMdx(join(GOC, 'content'))) {
      for (const m of readFileSync(tep, 'utf8').matchAll(/<HinhSach\b[^>]*\bten="([^"]+)"/g)) {
        expect(cacSvg, `${tep}: ${m[1]}`).toContain(m[1]);
        dung.add(m[1]);
      }
    }
    // Không để hình mồ côi
    for (const ten of cacSvg) expect(dung, ten).toContain(ten);
  });
});

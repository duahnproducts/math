// Tương phản chữ ≥ 4.5:1 (WCAG AA) ở CẢ HAI giao diện sáng và tối
// (DESIGN_SPEC mục 10, docs/tech_stack.md mục 12).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

function khoiBien(boChon: string): Record<string, string> {
  const batDau = css.indexOf(`${boChon} {`);
  if (batDau === -1) throw new Error(`Không thấy khối ${boChon}`);
  const ketThuc = css.indexOf('}', batDau);
  const bien: Record<string, string> = {};
  for (const m of css.slice(batDau, ketThuc).matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    bien[m[1]] = m[2].trim();
  }
  return bien;
}

function doSang(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Không phải mã màu hex 6 chữ số: ${hex}`);
  const kenh = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const [r, g, b] = kenh.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function tuongPhan(a: string, b: string): number {
  const [l1, l2] = [doSang(a), doSang(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const giaoDien = {
  sáng: khoiBien(':root'),
  tối: khoiBien(':root[data-theme="dark"]'),
};

const BE_MAT = ['--bg', '--surface-1', '--surface-2', '--paper'];
const CHU = ['--text', '--text-2', '--text-3', '--accent', '--ok', '--warn', '--err', '--info'];

describe.each(Object.entries(giaoDien))('giao diện %s', (_ten, bien) => {
  it('có đủ biến ở cả hai giao diện', () => {
    for (const ten of [...BE_MAT, ...CHU, '--accent-ink', '--surface-3']) {
      expect(bien[ten], ten).toBeDefined();
    }
  });

  for (const chu of CHU) {
    for (const nen of BE_MAT) {
      it(`${chu} trên ${nen} ≥ 4.5:1`, () => {
        expect(tuongPhan(bien[chu], bien[nen])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('chữ trên nút chính ≥ 4.5:1', () => {
    expect(tuongPhan(bien['--accent-ink'], bien['--accent'])).toBeGreaterThanOrEqual(4.5);
  });

  it('chữ phụ trên --surface-3 (nav đang chọn) ≥ 4.5:1', () => {
    expect(tuongPhan(bien['--text-2'], bien['--surface-3'])).toBeGreaterThanOrEqual(4.5);
  });
});

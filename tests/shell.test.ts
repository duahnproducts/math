// Chạy mọi tests/*.test.sh bên trong `npm test` (docs/tech_stack.md, mục 8).
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const thuMucTest = dirname(fileURLToPath(import.meta.url));

/** Tìm `sh`: có sẵn trên Linux/macOS; trên Windows thường nằm trong Git for Windows. */
function timSh(): string {
  const ungVien = [
    'sh',
    'C:/Program Files/Git/bin/sh.exe',
    'C:/Program Files/Git/usr/bin/sh.exe',
  ];
  for (const sh of ungVien) {
    try {
      execFileSync(sh, ['-c', 'exit 0'], { stdio: 'ignore' });
      return sh;
    } catch {
      // thử ứng viên tiếp theo
    }
  }
  throw new Error('Không tìm thấy sh để chạy test shell');
}

const cacTest = readdirSync(thuMucTest).filter((f) => f.endsWith('.test.sh'));

describe('test shell', () => {
  it('có ít nhất một test shell', () => {
    expect(cacTest.length).toBeGreaterThan(0);
  });

  const sh = timSh();
  for (const ten of cacTest) {
    it(ten, () => {
      const duongDan = join(thuMucTest, ten);
      expect(existsSync(duongDan)).toBe(true);
      // execFileSync ném lỗi (kèm output) nếu script thoát với mã khác 0
      const ketQua = execFileSync(sh, [duongDan], { encoding: 'utf8' });
      expect(ketQua).toContain('ĐẠT');
    });
  }
});

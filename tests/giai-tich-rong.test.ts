import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('Giải tích không còn chương, bài học, thuật ngữ hay tài liệu tải về', () => {
  const mon = JSON.parse(readFileSync('content/giai-tich/mon.json', 'utf8'));
  expect(mon.chuong).toEqual([]);
  expect(readdirSync('content/giai-tich').sort()).toEqual(['mon.json', 'thuat-ngu.json']);
  expect(JSON.parse(readFileSync('content/giai-tich/thuat-ngu.json', 'utf8')).thuat_ngu).toEqual([]);
  expect(readdirSync('public/tai-ve').filter((f) => f.startsWith('giai-tich-'))).toEqual([]);
});

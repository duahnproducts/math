import { expect, test } from '@playwright/test';

test('mục Giải tích trống, không còn trang bài học hay PDF trong bản xuất bản', async ({ page, request }) => {
  await page.goto('giai-tich/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Giải tích');
  await expect(page.getByRole('status')).toHaveText('Chưa có nội dung.');
  await expect(page.locator('[aria-label="Các chương"] li')).toHaveCount(0);
  await page.goto('thuat-ngu/');
  await expect(page.locator('[data-dong-thuat-ngu]').filter({ hasText: 'supremum' })).toHaveCount(0);
  for (const duong of [
    'giai-tich/chuong-1/',
    'giai-tich/chuong-2/giang-day/bai-1/',
    'tai-ve/giai-tich-chuong-1-bai-giang.pdf',
  ]) expect((await request.get(duong)).status()).toBe(404);
});

test('tiến độ Giải tích cũ được xóa khi mở web', async ({ page }) => {
  await page.addInitScript(() => {
    const viTri = { href: '/math/giai-tich/chuong-1/', tieuDe: 'Tập số thực', duongDan: 'Giải tích', chuong: 'giai-tich/1', luc: 1 };
    localStorage.setItem('hochanh:tien-do', JSON.stringify({
      phienBan: 1, daHoc: { 'giai-tich/1/giang-day/1': 1, 'dai-so/1/giang-day/1': 1 },
      tuDanhGia: { 'giai-tich/1/bai-tap/1.2.1': { ketQua: 'can-goi-y', luc: 1 } },
      lanCuoi: viTri, lanCuoiTheoChuong: { 'giai-tich/1': viTri },
    }));
  });
  await page.goto('./');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hochanh:tien-do')!).lanCuoi)).toBeNull();
  const du = await page.evaluate(() => JSON.parse(localStorage.getItem('hochanh:tien-do')!));
  expect(du.daHoc).toEqual({ 'dai-so/1/giang-day/1': 1 });
  expect(du.tuDanhGia).toEqual({});
  expect(du.lanCuoiTheoChuong).toEqual({});
  await expect(page.locator('[data-hoc-tiep-link]')).not.toHaveAttribute('href', /giai-tich/);
});

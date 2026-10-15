import { expect, test } from '@playwright/test';

test('Bài 8 Chương 2: nút cuối bài dẫn tới bài luyện ngay trong bài giảng', async ({ page }) => {
  await page.goto('dai-so/chuong-2/giang-day/bai-8/');
  const nut = page.locator('nav[aria-label="Bước tiếp theo"] [data-bai-tap-bai-nay]');
  await expect(nut).toHaveText('Làm bài tập bài này →');
  const muc = page.locator('.bai-giang h2').filter({ hasText: /^Bài tập$/ });
  const id = await muc.getAttribute('id');
  expect(id).toBeTruthy();
  await expect(nut).toHaveAttribute('href', `#${id}`);
  await nut.click();
  await expect(muc).toBeInViewport();
  expect(decodeURIComponent(new URL(page.url()).hash)).toBe(`#${id}`);
});

test('bài có kho bài tập: nút cuối bài lọc đúng mục của bài giảng', async ({ page }) => {
  await page.goto('dai-so/chuong-1/giang-day/bai-1/');
  await page.locator('[data-bai-tap-bai-nay]').click();
  await expect(page).toHaveURL(/\/dai-so\/chuong-1\/bai-tap\/\?muc=1\.1$/);
  await expect(page.locator('[data-loc-muc="1.1"]')).toHaveAttribute('aria-pressed', 'true');
  const baiTap = page.locator('[data-the-bai-tap]:visible');
  expect(await baiTap.count()).toBeGreaterThan(0);
  for (const bai of await baiTap.all()) await expect(bai).toHaveAttribute('data-muc', '1.1');
});

test('bài phủ nhiều mục: có đường dẫn riêng cho từng mục bài tập', async ({ page }) => {
  await page.goto('dai-so/chuong-1/giang-day/bai-5/');
  const cacNut = page.locator('[data-bai-tap-bai-nay]');
  await expect(cacNut).toHaveCount(2);
  await expect(cacNut.nth(0)).toHaveAttribute('href', '/math/dai-so/chuong-1/bai-tap/?muc=1.5');
  await expect(cacNut.nth(1)).toHaveAttribute('href', '/math/dai-so/chuong-1/bai-tap/?muc=1.6');
});

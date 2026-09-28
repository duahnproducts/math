// Điện thoại: thanh dưới 4 mục, thanh bên ẩn, mục lục chương gọn, không tràn ngang.
import { expect, test } from '@playwright/test';

test('thanh dưới và mục lục gọn trên điện thoại', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/giang-day/bai-3/');
  const thanhDuoi = page.getByRole('navigation', { name: 'Điều hướng chính' });
  await expect(thanhDuoi).toBeVisible();
  for (const ten of ['Trang chủ', 'Môn học', 'Bài tập', 'Thuật ngữ']) {
    await expect(thanhDuoi.getByRole('link', { name: ten })).toBeVisible();
  }
  await expect(page.locator('.thanh-ben')).toBeHidden();

  const mucLuc = page.locator('details.muc-luc-gon');
  await expect(mucLuc).toBeVisible();
  await mucLuc.locator('summary').click();
  await expect(mucLuc.getByRole('link', { name: /Bốn hệ quả lớn/ })).toBeVisible();

  // Nút Bài tập ở thanh dưới đưa tới bài tập của chương đang học
  await thanhDuoi.getByRole('link', { name: 'Bài tập' }).click();
  await expect(page).toHaveURL(/giai-tich\/chuong-1\/bai-tap\/$/);
});

test('không tràn ngang trên điện thoại', async ({ page }) => {
  for (const duong of [
    './',
    'giai-tich/chuong-1/',
    'giai-tich/chuong-1/giang-day/bai-5/',
    'giai-tich/chuong-1/bai-tap/1-5-4/',
    'giai-tich/chuong-2/giang-day/bai-1/',
    'giai-tich/chuong-2/giang-day/bai-5/',
    'giai-tich/chuong-2/sach/2-1/',
    'giai-tich/chuong-2/bai-tap/2-7-2/',
    'dai-so/chuong-1/sach/1-3/',
    'dai-so/chuong-1/bai-tap/1-5-3/',
    'dai-so/chuong-2/sach/2-2/',
    'dai-so/chuong-2/sach/2-5/',
    'dai-so/chuong-2/sach/2-6/',
    'dai-so/chuong-2/sach/2-7/',
    'vi-mo/chuong-2/sach/2-2/',
    'thuat-ngu/',
  ]) {
    await page.goto(duong);
    const tran = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(tran, duong).toBeLessThanOrEqual(0);
  }
});

test('nút sáng/tối có trên điện thoại', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-nut-giao-dien]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

// Chế độ màn hình sáng/tối (docs/tech_stack.md, mục 12).
import { expect, test } from '@playwright/test';

const nenTrang = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('mặc định sáng — kể cả khi hệ điều hành đang để tối', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await nenTrang(page)).toBe('rgb(247, 246, 242)');
});

test('bấm nút thì chuyển tối, tải lại và sang trang khác vẫn giữ', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/');
  const nut = page.locator('[data-nut-giao-dien]');
  await expect(nut).toHaveAttribute('aria-label', 'Chuyển sang giao diện tối');
  await expect(nut).toHaveAttribute('aria-pressed', 'false');

  await nut.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(nut).toHaveAttribute('aria-pressed', 'true');
  await expect(nut).toHaveAttribute('aria-label', 'Chuyển sang giao diện sáng');
  expect(await nenTrang(page)).toBe('rgb(10, 12, 16)');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0A0C10');

  // Tải lại: vẫn tối ngay từ đầu (script đầu trang), không nháy sáng
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Sang trang khác: vẫn tối
  await page.goto('giai-tich/chuong-1/giang-day/bai-1/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => document.documentElement.style.colorScheme)).toBe('dark');

  // Bấm lần nữa: về sáng
  await page.locator('[data-nut-giao-dien]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('hochanh:giao-dien'))).toBe('sang');
});

test('giao diện đã lưu được áp dụng ngay bằng script đầu trang', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('hochanh:giao-dien', 'toi'));
  // Chặn toàn bộ JS đóng gói của trang: chỉ còn script nhỏ nhúng trong <head>
  await page.route('**/_astro/*.js', (r) => r.abort());
  await page.goto('thuat-ngu/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await nenTrang(page)).toBe('rgb(10, 12, 16)');
});

test('localStorage bị chặn thì web vẫn chạy, dùng giao diện sáng', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('SecurityError');
      },
    });
  });
  const loi: string[] = [];
  page.on('pageerror', (e) => loi.push(e.message));
  await page.goto('giai-tich/chuong-1/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('[data-nut-giao-dien]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(loi).toEqual([]);
});

test('nút sáng/tối dùng được bằng bàn phím', async ({ page }) => {
  await page.goto('./');
  await page.locator('[data-nut-giao-dien]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

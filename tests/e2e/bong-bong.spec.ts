// Hiệu ứng bong bóng trên laptop: tab "Giảng dạy | Theo sách" là công tắc có bong
// bóng trượt; thanh dưới và việc ẩn thanh khi cuộn chỉ dành cho điện thoại.
import { expect, test, type Locator } from '@playwright/test';

const tamNgang = (loc: Locator) =>
  loc.evaluate((e) => {
    const b = e.getBoundingClientRect();
    return b.left + b.width / 2;
  });
const lech = async (a: Locator, b: Locator) => Math.abs((await tamNgang(a)) - (await tamNgang(b)));

test('tab hai lối vào là công tắc bong bóng: bấm hay dùng phím mũi tên thì bong bóng trượt theo', async ({
  page,
}) => {
  await page.goto('giai-tich/chuong-1/');
  const ray = page.getByRole('tablist', { name: 'Chọn phần' });
  const bong = ray.locator('.bong-truot');
  const giangDay = ray.getByRole('tab', { name: 'Giảng dạy' });
  const theoSach = ray.getByRole('tab', { name: 'Theo sách' });

  // Hai ô rộng bằng nhau thì bong bóng mới vừa khít từng ô
  const [r1, r2] = await Promise.all([giangDay, theoSach].map((t) => t.evaluate((e) => e.getBoundingClientRect().width)));
  expect(Math.abs(r1 - r2)).toBeLessThan(1);
  expect(await ray.evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe('999px');

  await expect.poll(() => lech(bong, giangDay)).toBeLessThan(1);

  await theoSach.click();
  await expect(theoSach).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-sach')).toBeVisible();
  await expect.poll(() => lech(bong, theoSach)).toBeLessThan(1);

  await theoSach.press('ArrowLeft');
  await expect(giangDay).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => lech(bong, giangDay)).toBeLessThan(1);
});

test('laptop: không có thanh dưới, thanh trên đứng yên khi cuộn', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/giang-day/bai-3/');
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(400);
  const tren = await page.locator('.topbar').evaluate((e) => e.getBoundingClientRect().top);
  expect(tren).toBe(0);
});

test('nút bấm là bong bóng trên laptop', async ({ page }) => {
  await page.goto('./');
  const nut = page.locator('main .nut.chinh').first();
  const { r, h } = await nut.evaluate((e) => ({
    r: parseFloat(getComputedStyle(e).borderTopLeftRadius),
    h: e.getBoundingClientRect().height,
  }));
  expect(r).toBeGreaterThanOrEqual(h / 2);
  // Nảy về bằng đường cong vượt đích (--ease-bubble)
  expect(await nut.evaluate((e) => getComputedStyle(e).transitionTimingFunction)).toContain('cubic-bezier(0.34, 1.4');
});

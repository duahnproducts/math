// Điện thoại: thanh dưới 4 mục, thanh bên ẩn, mục lục chương gọn, không tràn ngang.
// Thanh dưới bong bóng, hai thanh lùi đi khi cuộn xuống đọc, web cài được lên màn
// hình chính (docs/tech_stack.md, mục 13).
import { expect, test, type Locator } from '@playwright/test';

/** Tâm ngang của phần tử, tính cả transform (bong bóng trượt bằng translateX). */
const tamNgang = (loc: Locator) =>
  loc.evaluate((e) => {
    const b = e.getBoundingClientRect();
    return b.left + b.width / 2;
  });
const khung = (loc: Locator) => loc.evaluate((e) => e.getBoundingClientRect().toJSON() as DOMRect);

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
    'dai-so/chuong-2/sach/2-9/',
    'dai-so/chuong-2/bai-tap/2-1-15/',
    'dai-so/chuong-3/sach/3-1/',
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

test('thanh dưới là viên thuốc bong bóng, chỉ có icon', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/giang-day/bai-3/');
  const thanh = page.getByRole('navigation', { name: 'Điều hướng chính' });
  const man = page.viewportSize()!;

  // Nổi tách khỏi mép màn hình, bo tròn hẳn
  const k = await khung(thanh);
  expect(k.left).toBeGreaterThanOrEqual(12);
  expect(man.width - k.right).toBeGreaterThanOrEqual(12);
  expect(man.height - k.bottom).toBeGreaterThanOrEqual(8);
  const bo = await thanh.evaluate((e) => parseFloat(getComputedStyle(e).borderTopLeftRadius));
  expect(bo).toBeGreaterThanOrEqual(k.height / 2);

  // Chỉ có icon: không chữ nào hiện ra, tên nằm ở aria-label
  await expect(thanh).toHaveText('');

  // Bong bóng nằm đúng dưới ô đang chọn
  const bong = thanh.locator('.bong-truot');
  const monHoc = thanh.getByRole('link', { name: 'Môn học' });
  await expect(monHoc).toHaveAttribute('aria-current', 'page');
  await expect.poll(async () => Math.abs((await tamNgang(bong)) - (await tamNgang(monHoc)))).toBeLessThan(1);
});

test('bấm ô khác: trang mới cho bong bóng trượt từ ô cũ sang', async ({ page }) => {
  // Ghi lại mọi lần --index của thanh dưới đổi, từ trước khi trang kịp vẽ
  await page.addInitScript(() => {
    const w = window as unknown as { cacIndex: string[] };
    w.cacIndex = [];
    new MutationObserver((cac) => {
      for (const c of cac) {
        const el = c.target as HTMLElement;
        if (el.matches('[data-thanh-duoi]')) w.cacIndex.push(el.style.getPropertyValue('--index'));
      }
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['style'] });
  });
  await page.goto('giai-tich/chuong-1/giang-day/bai-3/');
  await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: 'Thuật ngữ' }).click();
  await expect(page).toHaveURL(/thuat-ngu\/$/);

  // Môn học là ô 1, Thuật ngữ là ô 3: đặt về ô cũ trước, rồi mới trượt sang
  await expect.poll(() => page.evaluate(() => (window as unknown as { cacIndex: string[] }).cacIndex)).toEqual(['1', '3']);
  const thanh = page.getByRole('navigation', { name: 'Điều hướng chính' });
  const thuatNgu = thanh.getByRole('link', { name: 'Thuật ngữ' });
  await expect(thuatNgu).toHaveAttribute('aria-current', 'page');
  await expect
    .poll(async () => Math.abs((await tamNgang(thanh.locator('.bong-truot'))) - (await tamNgang(thuatNgu))))
    .toBeLessThan(1);

  // Tải lại thì bong bóng đứng yên ở ô đang chọn, không trượt nữa
  await page.evaluate(() => ((window as unknown as { cacIndex: string[] }).cacIndex = []));
  await page.reload();
  await expect(thuatNgu).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { cacIndex: string[] }).cacIndex)).toEqual([]);
});

test('cuộn xuống đọc thì hai thanh lùi đi, cuộn lên hoặc chạm đáy thì hiện lại', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/giang-day/bai-3/');
  const html = page.locator('html');
  const thanhDuoi = page.getByRole('navigation', { name: 'Điều hướng chính' });
  const thanhTren = page.locator('.topbar');
  const man = page.viewportSize()!;
  await expect(html).not.toHaveAttribute('data-an-thanh');

  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect(html).toHaveAttribute('data-an-thanh', '');
  await expect.poll(async () => (await khung(thanhDuoi)).top).toBeGreaterThanOrEqual(man.height);
  await expect.poll(async () => (await khung(thanhTren)).bottom).toBeLessThanOrEqual(0);

  await page.evaluate(() => window.scrollTo(0, 1300));
  await expect(html).not.toHaveAttribute('data-an-thanh');
  await expect.poll(async () => (await khung(thanhDuoi)).bottom).toBeLessThan(man.height);
  await expect.poll(async () => (await khung(thanhTren)).top).toBeGreaterThanOrEqual(0);

  await page.evaluate(() => window.scrollTo(0, 1500));
  await expect(html).toHaveAttribute('data-an-thanh', '');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(html).not.toHaveAttribute('data-an-thanh');
});

test('nút bấm là bong bóng: viên thuốc bo tròn, nút icon hình tròn', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/giang-day/bai-3/');
  for (const nut of await page.locator('main .nut:visible').all()) {
    const { r, h } = await nut.evaluate((e) => ({
      r: parseFloat(getComputedStyle(e).borderTopLeftRadius),
      h: e.getBoundingClientRect().height,
    }));
    expect(r).toBeGreaterThanOrEqual(h / 2);
  }
  const nutGiaoDien = page.locator('[data-nut-giao-dien]');
  expect(await nutGiaoDien.evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe('50%');
});

test('web cài được lên màn hình chính', async ({ page, request }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('/math/manifest.webmanifest');
  const tra = await request.get(href!);
  expect(tra.ok()).toBe(true);
  const manifest = await tra.json();
  expect(manifest.display).toBe('standalone');
  // Đường dẫn trong manifest tương đối → tính từ /math/
  for (const bt of manifest.icons as { src: string }[]) {
    expect((await request.get(new URL(bt.src, `http://localhost${href}`).pathname)).ok(), bt.src).toBe(true);
  }
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect((await request.get(apple!)).ok()).toBe(true);
  const favicon = await page.locator('link[rel="icon"]').getAttribute('href');
  expect(favicon).toBe('/math/favicon.png');
  const traFavicon = await request.get(favicon!);
  expect(traFavicon.ok()).toBe(true);
  expect(traFavicon.headers()['content-type']).toContain('image/png');
});

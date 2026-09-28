// Giải tích Chương 2 (Phase 2 — đổ nội dung có sẵn): bài giảng có hình, trò chơi ε–N
// tương tác, liên kết chéo sang Chương 1, bài tập ★ có hướng dẫn.
import { expect, test } from '@playwright/test';

test('trang chương 2: 6 bài giảng, 9 mục theo sách, 20 bài tập', async ({ page }) => {
  await page.goto('giai-tich/');
  await page.getByRole('link', { name: /Dãy số và chuỗi số/ }).first().click();
  await expect(page).toHaveURL(/giai-tich\/chuong-2\/$/);
  await expect(page.locator('.lo-trinh a[href*="/giang-day/"]')).toHaveCount(6);
  await expect(page.getByRole('heading', { name: 'Bảng đối chiếu Bài ↔ § ↔ Bài tập' })).toBeVisible();

  // Mỗi mục § có trang riêng, ghi công sách Abbott, công thức dựng không lỗi
  for (let muc = 1; muc <= 9; muc++) {
    await page.goto(`giai-tich/chuong-2/sach/2-${muc}/`);
    await expect(page.locator('[data-ghi-cong]')).toContainText('Abbott');
    await expect(page.locator('.katex-error')).toHaveCount(0);
  }

  await page.goto('giai-tich/chuong-2/bai-tap/');
  await expect(page.locator('[data-the-bai-tap]')).toHaveCount(20);
  // 13 bài "nên làm bằng mọi giá" theo hướng dẫn học tập
  await page.goto('giai-tich/chuong-2/bai-tap/?nen-lam=1');
  await expect(page.locator('[data-the-bai-tap]:visible')).toHaveCount(13);
});

test('trò chơi ε–N: kéo ε, mốc N nhảy theo', async ({ page }) => {
  await page.goto('giai-tich/chuong-2/giang-day/bai-1/');
  const hinh = page.locator('[data-tro-choi-epsilon-n]');
  await hinh.scrollIntoViewIfNeeded();
  // Chờ React gắn vào hình (client:visible): Astro gỡ thuộc tính ssr khi xong
  await expect(page.locator('astro-island', { has: hinh })).not.toHaveAttribute('ssr', /.*/);
  const moc = hinh.locator('[data-moc-n]');
  // Mặc định ε = 0,25 → N = 17 (khớp nháp N > 1/ε² của Ví dụ A)
  await expect(moc).toHaveText('N = 17');
  const thanhTruot = hinh.getByRole('slider');
  await thanhTruot.fill('0.1');
  await expect(moc).toHaveText('N = 101');
  await thanhTruot.fill('0.5');
  await expect(moc).toHaveText('N = 5');
});

test('bài giảng Chương 2 đủ 8 mục, có hình, trỏ ngược về Chương 1', async ({ page }) => {
  for (let bai = 1; bai <= 6; bai++) {
    await page.goto(`giai-tich/chuong-2/giang-day/bai-${bai}/`);
    await expect(page.locator('.bai-giang h2').first()).toBeVisible();
    await expect(page.locator('figure.hinh svg').first()).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);
  }

  await page.goto('giai-tich/chuong-2/giang-day/bai-1/');
  await page.getByRole('link', { name: 'Đọc theo sách §1.4' }).first().click();
  await expect(page).toHaveURL(/giai-tich\/chuong-1\/sach\/1-4\/$/);
  await expect(page.locator('#dinh-ly-1\\.4\\.2')).toBeVisible();

  await page.goto('giai-tich/chuong-2/giang-day/bai-1/');
  await page.getByRole('link', { name: 'Học dễ hiểu ở Bài 4, Chương 1' }).click();
  await expect(page).toHaveURL(/giai-tich\/chuong-1\/giang-day\/bai-4\/$/);
});

test('bài tập Chương 2: "Cần dùng" trỏ được sang khối của Chương 1', async ({ page }) => {
  await page.goto('giai-tich/chuong-2/bai-tap/2-2-2/');
  const canDung = page.locator('.can-dung');
  // Khối có số hiệu của chương khác
  await expect(canDung.getByRole('link', { name: /Định lý 1\.4\.2/ })).toHaveAttribute(
    'href',
    /giai-tich\/chuong-1\/sach\/1-4\/#dinh-ly-1\.4\.2$/,
  );
  // Khối cùng chương, kèm bài giảng phủ nó
  await expect(canDung.getByRole('link', { name: /Định nghĩa 2\.2\.3/ })).toHaveAttribute(
    'href',
    /giai-tich\/chuong-2\/sach\/2-2\/#dinh-nghia-2\.2\.3$/,
  );
  await expect(canDung.getByRole('link', { name: 'Bài 1' }).first()).toHaveAttribute('href', /chuong-2\/giang-day\/bai-1\/$/);

  // Khối không số hiệu (Nguyên lý quy nạp) được tìm ở Chương 1
  await page.goto('giai-tich/chuong-2/bai-tap/2-4-1/');
  const quyNap = page.locator('.can-dung').getByRole('link', { name: /quy nạp/i });
  await expect(quyNap).toHaveAttribute('href', /giai-tich\/chuong-1\/sach\/1-2\/#dinh-ly-quy-nap$/);
  await quyNap.click();
  await expect(page.locator('#dinh-ly-quy-nap')).toBeVisible();
});

test('bài tập Chương 2 có gợi ý theo tầng và lời giải', async ({ page }) => {
  await page.goto('giai-tich/chuong-2/bai-tap/2-7-9/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Chứng minh tiêu chuẩn tỉ số');
  await expect(page.locator('.pill', { hasText: '★ Nên làm' })).toBeVisible();
  await expect(page.locator('.pill', { hasText: 'Chưa có hướng dẫn' })).toHaveCount(0);
  await expect(page.locator('details[data-tang="goi-y-1"]')).toBeVisible();
  await expect(page.locator('details[data-tang="goi-y-2"]')).toBeVisible();
  await expect(page.locator('details[data-tang="loi-giai"]')).toBeVisible();
});

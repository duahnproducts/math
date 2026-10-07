// Đại số tuyến tính (Phase 2 — đổ bản dịch có sẵn): trang dịch nguyên văn có hình
// vẽ lại/lấy từ bản gốc; bài tập có đề, gợi ý theo tầng, lời giải và lỗi hay mắc.
import { expect, test } from '@playwright/test';

test('Chương 1 đủ §1.1–§1.6, mục ứng dụng có sơ đồ', async ({ page }) => {
  test.slow(); // đi qua nhiều trang KaTeX nặng
  for (let muc = 1; muc <= 6; muc++) {
    await page.goto(`dai-so/chuong-1/sach/1-${muc}/`);
    await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA');
    await expect(page.locator('.katex-error')).toHaveCount(0);
  }

  // §1.4: sơ đồ mạng vẽ lại từ phương trình của Ví dụ 1.4.1
  await page.goto('dai-so/chuong-1/sach/1-4/');
  await expect(page.locator('[data-hinh-mang] svg')).toBeVisible();
  // §1.5: sơ đồ mạch lấy từ bản gốc, dùng lớp màu của web
  await page.goto('dai-so/chuong-1/sach/1-5/');
  const mach = page.locator('[data-hinh-sach="ds-vd-1-5-1"] svg');
  await expect(mach).toBeVisible();
  await expect(mach).toHaveAttribute('aria-label', /Mạch điện/);
});

test('bài tập Chương 1: đủ 66 bài, bài nào cũng có gợi ý và lời giải, bài mạng điện có hình', async ({ page }) => {
  await page.goto('dai-so/chuong-1/bai-tap/');
  await expect(page.locator('[data-the-bai-tap]')).toHaveCount(66);
  await expect(page.locator('.pill', { hasText: 'Chưa có hướng dẫn' })).toHaveCount(0);

  await page.goto('dai-so/chuong-1/bai-tap/1-5-3/');
  await expect(page.locator('[data-hinh-sach="ds-bt-1-5-3"] svg')).toBeVisible();
  await expect(page.locator('details[data-tang="loi-giai"]')).toHaveCount(1);
  // "Cần dùng" trỏ về ví dụ mạch điện ở §1.5
  await expect(page.locator('.can-dung a').first()).toHaveAttribute('href', /sach\/1-5\/#vi-du-1\.5\.1$/);
});

test('sơ đồ đổi màu theo giao diện tối', async ({ page }) => {
  await page.goto('dai-so/chuong-1/sach/1-5/');
  const net = page.locator('[data-hinh-sach="ds-vd-1-5-1"] .nhan-manh').first();
  const mauSang = await net.evaluate((el) => getComputedStyle(el).stroke);
  await page.locator('[data-nut-giao-dien]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const mauToi = await net.evaluate((el) => getComputedStyle(el).stroke);
  expect(mauToi).not.toBe(mauSang);
});

test('Chương 2: đủ §2.1–§2.9 có trang dịch, mục lục đủ 9 mục, có PDF tải về', async ({ page }) => {
  test.slow(); // đi qua nhiều trang KaTeX nặng
  for (let so = 1; so <= 9; so++) {
    const muc = `2-${so}`;
    await page.goto(`dai-so/chuong-2/sach/${muc}/`);
    await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA');
    await expect(page.locator('.katex-error')).toHaveCount(0);
  }
  // §2.9: sơ đồ chuyển và đồ thị hội tụ của Ví dụ 2.9.1
  await expect(page.locator('[data-hinh-xich-markov] svg')).toBeVisible();
  await expect(page.locator('[data-hinh-hoi-tu-markov] svg')).toBeVisible();
  // §2.3 → §2.9 (PageRank) nối liên kết
  await page.goto('dai-so/chuong-2/sach/2-3/');
  await page.getByRole('link', { name: 'Mục 2.9' }).click();
  await expect(page).toHaveURL(/dai-so\/chuong-2\/sach\/2-9\/$/);
  // §2.6: ba hình vẽ lại (sách dịch viết "từ hình vẽ ta thấy" nhưng không in hình)
  await page.goto('dai-so/chuong-2/sach/2-6/');
  for (const hinh of ['binh-hanh', 'phep-quay', 'he-so-goc']) {
    await expect(page.locator(`[data-hinh-${hinh}] svg`)).toBeVisible();
  }
  // §2.4: Định lý về nghịch đảo có neo để liên kết tới
  await page.goto('dai-so/chuong-2/sach/2-4/');
  await expect(page.locator('#dinh-ly-2\\.4\\.5')).toContainText('Inverse Theorem');
  await page.goto('dai-so/chuong-2/sach/2-3/');
  // §2.3: đồ thị có hướng vẽ lại từ ma trận kề
  await expect(page.locator('[data-hinh-do-thi] svg')).toBeVisible();
  await page.goto('dai-so/chuong-2/sach/2-2/');
  await expect(page.locator('#dinh-ly-2\\.2\\.1')).toBeVisible();

  await page.goto('dai-so/chuong-2/');
  await expect(page.getByText('Phép biến đổi tuyến tính').first()).toBeVisible();
  await expect(page.locator('a[href$="tai-ve/dai-so-chuong-2-ban-dich.pdf"]')).toBeVisible();
});

test('bài tập Chương 2: 47 bài của §2.1–§2.2 đều có lời giải, "Cần dùng" trỏ về §2.1, thuật ngữ mới có trong bảng', async ({ page }) => {
  await page.goto('dai-so/chuong-2/bai-tap/');
  await expect(page.locator('[data-the-bai-tap]')).toHaveCount(47);
  await expect(page.locator('.pill', { hasText: 'Chưa có hướng dẫn' })).toHaveCount(0);

  await page.goto('dai-so/chuong-2/bai-tap/2-1-18/');
  await expect(page.locator('details[data-tang="loi-giai"]')).toHaveCount(1);
  await expect(page.locator('.can-dung a').first()).toHaveAttribute('href', /sach\/2-1\/#vi-du-2\.1\.12$/);
  await expect(page.locator('.katex-error')).toHaveCount(0);

  // §2.2: đề viết lại ngắn gọn, ghi công nói rõ điều đó và vẫn giữ giấy phép
  await page.goto('dai-so/chuong-2/bai-tap/2-2-4/');
  await expect(page.locator('.ghi-cong')).toContainText('viết lại ngắn gọn');
  await expect(page.locator('.ghi-cong')).toContainText('CC BY-NC-SA');
  await expect(page.locator('details[data-tang="loi-giai"]')).toHaveCount(1);
  await expect(page.locator('.katex-error')).toHaveCount(0);

  await page.goto('thuat-ngu/');
  await expect(page.getByText('vector trạng thái dừng')).toBeVisible();
});

// Các mục Chương 3 đã có trang trên web (thêm dần theo tiến độ chuyển bản dịch)
const MUC_CHUONG_3 = ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8'];

test('Chương 3: các mục đã chuyển có trang dịch, công thức dựng không lỗi, có PDF tải về', async ({ page }) => {
  test.slow(); // đi qua nhiều trang KaTeX nặng
  for (const muc of MUC_CHUONG_3) {
    await page.goto(`dai-so/chuong-3/sach/${muc}/`);
    await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA');
    await expect(page.locator('.katex-error')).toHaveCount(0);
  }
  await page.goto('dai-so/chuong-3/sach/3-1/');
  await expect(page.locator('#dinh-ly-3\\.1\\.1')).toContainText('khai triển');
  await page.goto('dai-so/chuong-3/sach/3-2/');
  await expect(page.locator('[data-hinh-noi-suy-cay] svg')).toBeVisible();
  await page.goto('dai-so/chuong-3/sach/3-3/');
  await expect(page.locator('[data-hinh-vector-rieng] svg')).toBeVisible();
  await page.goto('dai-so/chuong-3/sach/3-5/');
  await expect(page.locator('[data-hinh-quy-dao] svg')).toHaveCount(4);
  await page.goto('dai-so/chuong-3/');
  await expect(page.getByText('Giá trị riêng và vector riêng').first()).toBeVisible();
  await expect(page.locator('a[href$="tai-ve/dai-so-chuong-3-ban-dich.pdf"]')).toBeVisible();
});

test('bài giảng Chương 1: 5 bài đủ 8 mục, công thức không lỗi, sơ đồ mạng của bài 4, nối về §', async ({ page }) => {
  test.slow(); // đi qua nhiều trang KaTeX nặng
  await page.goto('dai-so/chuong-1/');
  await expect(page.getByText('Chưa có bài giảng')).toHaveCount(0);
  for (let bai = 1; bai <= 5; bai++) {
    await page.goto(`dai-so/chuong-1/giang-day/bai-${bai}/`);
    await expect(page.locator('h2', { hasText: 'Ý tưởng trong 1 câu' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Bài tập' })).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);
  }
  // Bài 4 dùng lại hình mạng với dữ liệu riêng
  await page.goto('dai-so/chuong-1/giang-day/bai-4/');
  await expect(page.locator('[data-hinh-mang] svg')).toHaveAttribute('aria-label', /Mạng ba nút/);
  // Bài 5 phủ hai mục §1.5, §1.6; §1.6 nối ngược về Bài 5
  await page.goto('dai-so/chuong-1/sach/1-6/');
  await page.getByRole('link', { name: 'Học dễ hiểu ở Bài 5' }).click();
  await expect(page).toHaveURL(/dai-so\/chuong-1\/giang-day\/bai-5\/$/);
});

test('bài giảng Chương 2: 9 bài đủ 8 mục, công thức không lỗi, nối hai chiều với §', async ({ page }) => {
  test.slow(); // đi qua nhiều trang KaTeX nặng
  await page.goto('dai-so/chuong-2/');
  await expect(page.getByText('Chưa có bài giảng')).toHaveCount(0);
  for (let bai = 1; bai <= 9; bai++) {
    await page.goto(`dai-so/chuong-2/giang-day/bai-${bai}/`);
    await expect(page.locator('h2', { hasText: 'Ý tưởng trong 1 câu' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Bài tập' })).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);
  }
  // Bài 6 dùng lại hình phép quay của §2.6
  await page.goto('dai-so/chuong-2/giang-day/bai-6/');
  await expect(page.locator('[data-hinh-phep-quay] svg')).toBeVisible();
  // Bài 2 trỏ về bài giảng Chương 1; §2.4 nối về Bài 4
  await page.goto('dai-so/chuong-2/giang-day/bai-2/');
  // (liên kết nằm trong gợi ý đang thu gọn nên tìm theo href)
  await expect(page.locator('a[href$="dai-so/chuong-1/giang-day/bai-2/"]')).toHaveText('Học dễ hiểu ở Bài 2, Chương 1');
  await page.goto('dai-so/chuong-2/sach/2-4/');
  await page.getByRole('link', { name: 'Học dễ hiểu ở Bài 4' }).click();
  await expect(page).toHaveURL(/dai-so\/chuong-2\/giang-day\/bai-4\/$/);
});

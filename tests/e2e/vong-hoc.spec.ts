import { expect, test } from '@playwright/test';

test('vòng học Đại số và Học tiếp lưu qua tải lại', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: /Đại số tuyến tính/ }).first().click();
  await page.getByRole('link', { name: /Hệ phương trình tuyến tính/ }).first().click();
  await page.locator('.lo-trinh a[href*="/giang-day/"]').first().click();
  await expect(page.locator('.bai-giang h2')).toHaveCount(8);
  await expect(page.locator('.katex-error')).toHaveCount(0);
  const danhDau = page.locator('[data-danh-dau]');
  await danhDau.click();
  await expect(danhDau).toHaveAttribute('aria-pressed', 'true');
  await page.goto('dai-so/chuong-1/bai-tap/1-1-1/');
  await page.locator('details[data-tang="goi-y-1"] > summary').click();
  await page.locator('details[data-tang="goi-y-2"] > summary').click();
  await expect(page.locator('details[data-tang="goi-y-2"]')).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Cần gợi ý' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Cần gợi ý' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('./');
  await page.locator('[data-hop-hoc-tiep]').getByRole('link', { name: /Học tiếp/ }).click();
  await expect(page).toHaveURL(/dai-so\/chuong-1\/bai-tap\/1-1-1\/$/);
  await page.goto('dai-so/chuong-1/');
  await expect(page.locator('[data-can-lam-lai] ul')).toContainText('Bài 1.1.1');
  await expect(page.locator('.lo-trinh [data-khoa-da-hoc="dai-so/1/giang-day/1"]')).toHaveAttribute('data-da-hoc', 'true');
});

test('lời giải vẫn hỏi xác nhận 20 phút', async ({ page }) => {
  await page.goto('dai-so/chuong-1/bai-tap/1-1-1/');
  const loiGiai = page.locator('details[data-tang="loi-giai"]');
  await loiGiai.locator(':scope > summary').click();
  const hoi = page.getByRole('dialog', { name: /20 phút/ });
  await expect(hoi).toBeVisible();
  await hoi.getByRole('button', { name: /Chưa/ }).click();
  await expect(loiGiai).not.toHaveAttribute('open', '');
  await loiGiai.locator(':scope > summary').click();
  await page.getByRole('dialog', { name: /20 phút/ }).getByRole('button', { name: /xem lời giải/ }).click();
  await expect(loiGiai).toHaveAttribute('open', '');
});

test('Đại số: trang dịch nguyên văn có ghi công, nối sang bài giảng, bài tập có gợi ý và lời giải', async ({ page }) => {
  await page.goto('dai-so/chuong-1/');
  await page.getByRole('tab', { name: 'Dịch nguyên văn' }).click();
  await page.locator('#panel-sach').getByRole('link', { name: /Phép khử Gauss/ }).first().click();
  await expect(page).toHaveURL(/dai-so\/chuong-1\/sach\/1-2\/$/);
  await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA 4.0');
  await page.getByRole('link', { name: 'Học dễ hiểu ở Bài 2' }).click();
  await expect(page).toHaveURL(/dai-so\/chuong-1\/giang-day\/bai-2\/$/);

  // Bài tập có gợi ý theo tầng, lời giải và lỗi hay mắc; không còn nhãn "Chưa có hướng dẫn"
  await page.goto('dai-so/chuong-1/bai-tap/1-1-1/');
  await expect(page.locator('.nhan-tren').getByText('Chưa có hướng dẫn')).toHaveCount(0);
  for (const tang of ['goi-y-1', 'goi-y-2', 'loi-giai', 'loi-hay-mac']) {
    await expect(page.locator(`details[data-tang="${tang}"]`)).toHaveCount(1);
  }
});

test('thuật ngữ: gõ không dấu vẫn tìm được', async ({ page }) => {
  await page.goto('thuat-ngu/');
  await page.getByPlaceholder(/Ví dụ/).fill('he phuong trinh tuyen tinh');
  const dong = page.locator('[data-dong-thuat-ngu]:visible');
  await expect(dong).toHaveCount(1);
  await expect(dong).toContainText('system of linear equations');
});

test('chạm vào thuật ngữ trong bài thì hiện nghĩa', async ({ page }) => {
  await page.goto('dai-so/chuong-1/giang-day/bai-2/');
  const tn = page.locator('[data-thuat-ngu]').first();
  await tn.locator('button').click();
  await expect(tn).toHaveClass(/\bmo\b/);
  await expect(tn.locator('.bong')).toHaveCSS('opacity', '1');
  await expect(tn.locator('.bong')).toContainText('—');
  // Bấm ra ngoài thì đóng
  await page.locator('h1').click();
  await expect(tn).not.toHaveClass(/\bmo\b/);
});

test('không tải gì từ bên ngoài (chạy được khi không có mạng)', async ({ page }) => {
  const ngoai: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.hostname !== 'localhost' && u.protocol !== 'data:') ngoai.push(r.url());
  });
  for (const duong of ['./', 'dai-so/chuong-1/giang-day/bai-4/', 'dai-so/chuong-1/sach/1-1/', 'thuat-ngu/']) {
    await page.goto(duong);
    await page.waitForLoadState('networkidle');
  }
  expect(ngoai).toEqual([]);
});

// Vòng học cốt lõi của Version 1 (product_design.md, "Mục tiêu Version 1";
// docs/tech_stack.md, mục 8): mở web → Giải tích → Chương 1 → Bài 1 → sang mục §
// → bài tập → mở gợi ý → tự đánh giá → tải lại trang, Học tiếp đưa về đúng chỗ.
import { expect, test } from '@playwright/test';

test('vòng học cốt lõi và nút Học tiếp', async ({ page }) => {
  // Mở web
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Học chậm mà chắc');

  // Chọn Giải tích
  await page.getByRole('link', { name: /Giải tích/ }).first().click();
  await expect(page).toHaveURL(/\/math\/giai-tich\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Giải tích');

  // Vào Chương 1
  await page.getByRole('link', { name: /Tập số thực/ }).first().click();
  await expect(page).toHaveURL(/\/giai-tich\/chuong-1\/$/);
  await expect(page.getByRole('heading', { name: 'Bảng đối chiếu Bài ↔ § ↔ Bài tập' })).toBeVisible();

  // Học Bài 1 và xem hình minh hoạ
  await page.locator('.lo-trinh').getByRole('link', { name: /Vì sao phân số không đủ/ }).click();
  await expect(page).toHaveURL(/giang-day\/bai-1\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Vì sao phân số không đủ?');
  await expect(page.locator('figure.hinh svg').first()).toBeVisible();
  // Đủ 8 mục, đánh số 1–8
  await expect(page.locator('.bai-giang h2')).toHaveCount(8);
  // Công thức được dựng sẵn lúc build (KaTeX), không có lỗi
  expect(await page.locator('.katex').count()).toBeGreaterThan(10);
  await expect(page.locator('.katex-error')).toHaveCount(0);

  // Đánh dấu đã học
  const nutDanhDau = page.locator('[data-danh-dau]');
  await nutDanhDau.click();
  await expect(nutDanhDau).toHaveAttribute('aria-pressed', 'true');

  // Bấm sang đọc mục § tương ứng theo sách
  await page.getByRole('link', { name: 'Đọc theo sách §1.1' }).first().click();
  await expect(page).toHaveURL(/sach\/1-1\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tính vô tỉ của √2');
  await expect(page.locator('#dinh-ly-1\\.1\\.1')).toBeVisible();
  await expect(page.locator('[data-ghi-cong]')).toContainText('Abbott');
  // Mục § nối ngược về bài giảng
  await expect(page.getByRole('link', { name: 'Học dễ hiểu ở Bài 1' })).toBeVisible();

  // Làm bài tập, mở gợi ý từng tầng
  await page.goto('giai-tich/chuong-1/bai-tap/1-2-1/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('√3 vô tỉ');
  // "Cần dùng" trỏ tới Định lý 1.1.1 ở phần theo sách
  const canDung = page.locator('.can-dung a').first();
  await expect(canDung).toHaveAttribute('href', /sach\/1-1\/#dinh-ly-1\.1\.1$/);

  const goiY1 = page.locator('details[data-tang="goi-y-1"]');
  const goiY2 = page.locator('details[data-tang="goi-y-2"]');
  await goiY1.locator('summary').click();
  await expect(goiY1).toHaveAttribute('open', '');
  await goiY2.locator('summary').click();
  await expect(goiY2).toHaveAttribute('open', '');

  // Tự đánh giá
  await page.getByRole('button', { name: 'Cần gợi ý' }).click();
  await expect(page.getByRole('button', { name: 'Cần gợi ý' })).toHaveAttribute('aria-pressed', 'true');

  // Tải lại trang: kết quả tự đánh giá vẫn còn
  await page.reload();
  await expect(page.getByRole('button', { name: 'Cần gợi ý' })).toHaveAttribute('aria-pressed', 'true');

  // Lần sau quay lại: Học tiếp đưa về đúng chỗ đang học
  await page.goto('./');
  const hocTiep = page.locator('[data-hop-hoc-tiep]');
  await expect(hocTiep.locator('[data-hoc-tiep-tieu-de]')).toContainText('Bài 1.2.1');
  await hocTiep.getByRole('link', { name: /Học tiếp/ }).click();
  await expect(page).toHaveURL(/bai-tap\/1-2-1\/$/);

  // Trang chương: tiến độ và "Bài nên làm lại"
  await page.goto('giai-tich/chuong-1/');
  await expect(page.locator('[data-thanh-tien-do="doc"] [data-so-lieu]').first()).toHaveText('1/12');
  await expect(page.locator('[data-can-lam-lai] ul')).toContainText('Bài 1.2.1');
  // Dấu ✓ đã học trên lộ trình
  await expect(page.locator('.lo-trinh [data-khoa-da-hoc="giai-tich/1/giang-day/1"]')).toHaveAttribute(
    'data-da-hoc',
    'true',
  );
});

test('chỉ nhắc, không khoá lời giải: hỏi 20 phút rồi mới mở', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/bai-tap/1-3-6/');
  const loiGiai = page.locator('details[data-tang="loi-giai"]');

  // Gợi ý 2 chỉ mở sau gợi ý 1
  await page.locator('details[data-tang="goi-y-2"] summary').click();
  await expect(page.locator('details[data-tang="goi-y-1"]')).toHaveAttribute('open', '');
  await expect(page.locator('details[data-tang="goi-y-2"]')).not.toHaveAttribute('open', '');
  await expect(page.locator('[data-nhac-tang]')).toBeVisible();

  // Chưa làm đủ lâu → không mở
  await loiGiai.locator('summary').click();
  const hoi = page.getByRole('dialog', { name: /20 phút/ });
  await expect(hoi).toBeVisible();
  await hoi.getByRole('button', { name: /Chưa/ }).click();
  await expect(loiGiai).not.toHaveAttribute('open', '');

  // Đã làm → mở được
  await loiGiai.locator('summary').click();
  await page.getByRole('dialog', { name: /20 phút/ }).getByRole('button', { name: /xem lời giải/ }).click();
  await expect(loiGiai).toHaveAttribute('open', '');
  await expect(loiGiai).toContainText('Dùng Bổ đề 1.3.8');
});

test('bảng đối chiếu trỏ tới danh sách bài tập đã lọc theo §', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/');
  // Dòng §1.3 (11 bài, 3 bài ★)
  await page.locator('table.bang tr', { hasText: '§1.3' }).getByRole('link', { name: /11 bài/ }).click();
  await expect(page).toHaveURL(/bai-tap\/\?muc=1\.3$/);
  const hien = page.locator('[data-the-bai-tap]:visible');
  await expect(hien).toHaveCount(11);
  for (const muc of await hien.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.muc))) {
    expect(muc).toBe('1.3');
  }
  // Lọc thêm "nên làm"
  await page.locator('[data-loc-nen-lam]').click();
  await expect(page.locator('[data-the-bai-tap]:visible')).toHaveCount(3);
});

test('Đại số: trang dịch nguyên văn có ghi công, bài chưa có hướng dẫn có nhãn', async ({ page }) => {
  await page.goto('dai-so/chuong-1/');
  await page.getByRole('tab', { name: 'Dịch nguyên văn' }).click();
  await page.getByRole('link', { name: /Phép khử Gauss/ }).first().click();
  await expect(page).toHaveURL(/dai-so\/chuong-1\/sach\/1-2\/$/);
  await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA 4.0');
  await expect(page.getByText('Mục này chưa có bài giảng dễ hiểu')).toBeVisible();

  await page.goto('dai-so/chuong-1/bai-tap/1-1-1/');
  await expect(page.locator('.nhan-tren').getByText('Chưa có hướng dẫn')).toBeVisible();
  await expect(page.locator('details[data-tang]')).toHaveCount(0);
});

test('thuật ngữ: gõ không dấu vẫn tìm được', async ({ page }) => {
  await page.goto('thuat-ngu/');
  await page.getByPlaceholder(/Ví dụ/).fill('can tren nho nhat');
  const dong = page.locator('[data-dong-thuat-ngu]:visible');
  await expect(dong).toHaveCount(1);
  await expect(dong).toContainText('supremum');
});

test('chạm vào thuật ngữ trong bài thì hiện nghĩa', async ({ page }) => {
  await page.goto('giai-tich/chuong-1/giang-day/bai-2/');
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
  for (const duong of ['./', 'giai-tich/chuong-1/giang-day/bai-4/', 'dai-so/chuong-1/sach/1-1/', 'thuat-ngu/']) {
    await page.goto(duong);
    await page.waitForLoadState('networkidle');
  }
  expect(ngoai).toEqual([]);
});

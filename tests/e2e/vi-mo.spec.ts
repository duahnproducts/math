// Kinh tế vi mô (Phase 2 — slide dịch): mỗi slide là một khối, đủ 100% số slide,
// đúng thứ tự (micro/README.md), biểu đồ nhãn tiếng Việt, ảnh giữ nguồn.
import { expect, test } from '@playwright/test';

test('Chương 2: đủ 25/25 slide, đúng thứ tự qua ba mục §', async ({ page }) => {
  const cacSo: number[] = [];
  for (const muc of ['2-1', '2-2', '2-3']) {
    await page.goto(`vi-mo/chuong-2/sach/${muc}/`);
    await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA');
    const so = await page.locator('[data-slide]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-slide'))));
    cacSo.push(...so);
  }
  expect(cacSo).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
});

test('biểu đồ và ảnh trong slide hiển thị', async ({ page }) => {
  await page.goto('vi-mo/chuong-2/sach/2-1/');
  await expect(page.locator('#slide-5 [data-hinh-sach="vm-2-ngan-sach"] svg')).toBeVisible();
  const anh = page.locator('#slide-3 img');
  await anh.scrollIntoViewIfNeeded();
  await expect(anh).toHaveJSProperty('complete', true);
  expect(await anh.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('#slide-3 figcaption')).toContainText('CC BY 2.0');

  await page.goto('vi-mo/chuong-2/sach/2-2/');
  for (const ten of ['vm-2-ppf', 'vm-2-hai-rang-buoc', 'vm-2-ppf-hieu-qua', 'vm-2-loi-the-so-sanh']) {
    await expect(page.locator(`[data-hinh-sach="${ten}"] svg`).first()).toBeVisible();
  }
});

test('trang môn Vi mô dẫn tới Chương 2', async ({ page }) => {
  await page.goto('vi-mo/');
  await page.getByRole('link', { name: /Lựa chọn trong thế giới khan hiếm/ }).first().click();
  await expect(page).toHaveURL(/vi-mo\/chuong-2\/$/);
  await expect(page.getByRole('link', { name: /Slide dịch Chương 2/ })).toHaveAttribute('href', /tai-ve\/vi-mo-chuong-2-slide\.pdf$/);
});

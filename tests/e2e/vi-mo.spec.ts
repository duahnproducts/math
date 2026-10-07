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

test('Chương 1: đủ 23/23 slide, đúng thứ tự qua bốn mục §', async ({ page }) => {
  const cacSo: number[] = [];
  for (const muc of ['1-1', '1-2', '1-3', '1-4']) {
    await page.goto(`vi-mo/chuong-1/sach/${muc}/`);
    await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA');
    const so = await page.locator('[data-slide]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-slide'))));
    cacSo.push(...so);
  }
  expect(cacSo).toEqual(Array.from({ length: 23 }, (_, i) => i + 1));
  await expect(page.locator('#slide-23')).toContainText('CC BY-NC-SA 4.0 International');
  // Lỗi đánh máy của bản gốc được ghi chú lại (micro/README.md)
  await expect(page.locator('#slide-23')).toContainText('lỗi đánh máy');
});

test('Chương 1: ảnh chụp giữ nguồn, sơ đồ dòng luân chuyển vẽ lại với nhãn tiếng Việt', async ({ page }) => {
  const anhTheoMuc: Record<string, number[]> = { '1-1': [4, 5, 6, 7, 9], '1-3': [12], '1-4': [17, 18, 22] };
  for (const [muc, cacSlide] of Object.entries(anhTheoMuc)) {
    await page.goto(`vi-mo/chuong-1/sach/${muc}/`);
    for (const so of cacSlide) {
      const anh = page.locator(`#slide-${so} img`);
      await anh.scrollIntoViewIfNeeded();
      await expect(anh).toHaveJSProperty('complete', true);
      expect(await anh.evaluate((img: HTMLImageElement) => img.naturalWidth), `slide ${so}`).toBeGreaterThan(0);
      await expect(page.locator(`#slide-${so} figcaption`)).toContainText(/CC BY 2\.0|phạm vi công cộng/);
    }
  }

  await page.goto('vi-mo/chuong-1/sach/1-3/');
  const hinh = page.locator('#slide-14 [data-hinh-dong-luan-chuyen] svg');
  await expect(hinh).toBeVisible();
  for (const nhan of ['Hộ gia đình', 'Doanh nghiệp', 'A: Hàng hóa và dịch vụ', 'B: Thanh toán cho hàng hóa và dịch vụ', 'C: Dịch vụ lao động', 'D: Tiền công, tiền lương và phúc lợi']) {
    await expect(hinh.getByText(nhan, { exact: true })).toBeVisible();
  }
  // Mũi tên đúng chiều hình gốc: A, D chảy về hộ gia đình (bên trái), B, C chảy về doanh nghiệp (bên phải)
  const hopHo = await hinh.getByText('Hộ gia đình', { exact: true }).boundingBox();
  const hopDn = await hinh.getByText('Doanh nghiệp', { exact: true }).boundingBox();
  for (const [ma, ve] of [['a', hopHo], ['d', hopHo], ['b', hopDn], ['c', hopDn]] as const) {
    const dau = await hinh.locator(`[data-dong="${ma}"] path.to-nhan`).boundingBox();
    const giuaDau = dau!.x + dau!.width / 2;
    expect(Math.abs(giuaDau - (ve!.x + ve!.width / 2)), `dòng ${ma}`).toBeLessThan(90);
  }
});

test('trang môn Vi mô dẫn tới Chương 1', async ({ page }) => {
  await page.goto('vi-mo/');
  await page.getByRole('link', { name: /Chào mừng đến với kinh tế học/ }).first().click();
  await expect(page).toHaveURL(/vi-mo\/chuong-1\/$/);
  await page.getByRole('link', { name: /Kinh tế học vi mô và kinh tế học vĩ mô/ }).first().click();
  await expect(page).toHaveURL(/vi-mo\/chuong-1\/sach\/1-2\/$/);
});

test('Chương 3: đủ 38/38 slide, đúng thứ tự qua năm mục §', async ({ page }) => {
  const cacSo: number[] = [];
  for (const muc of ['3-1', '3-2', '3-3', '3-4', '3-5']) {
    await page.goto(`vi-mo/chuong-3/sach/${muc}/`);
    await expect(page.locator('[data-ghi-cong]')).toContainText('CC BY-NC-SA');
    const so = await page.locator('[data-slide]').evaluateAll((els) => els.map((e) => Number(e.getAttribute('data-slide'))));
    cacSo.push(...so);
  }
  expect(cacSo).toEqual(Array.from({ length: 38 }, (_, i) => i + 1));
  // Slide cuối giữ trang giấy phép và ghi chú bản dịch
  await expect(page.locator('#slide-38')).toContainText('CC BY-NC-SA 4.0 International');
  await expect(page.locator('#slide-38')).toContainText('Ghi chú về bản dịch');
});

test('Chương 3: biểu đồ đổi được sáng/tối, ảnh giữ nguồn, hình (a)/(b) có chú thích', async ({ page }) => {
  await page.goto('vi-mo/chuong-3/sach/3-1/');
  const anh = page.locator('#slide-3 img');
  await anh.scrollIntoViewIfNeeded();
  await expect(anh).toHaveJSProperty('complete', true);
  expect(await anh.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('#slide-3 figcaption')).toContainText('NatalieMaynor/Flickr, CC BY 2.0');

  // Nhãn biểu đồ giữ cỡ chữ gốc (không bị CSS phóng to rồi chồng lên nhau), điểm E tô màu nhấn
  const canBang = page.locator('#slide-11 [data-hinh-sach="vm-3-can-bang"] svg');
  await expect(canBang).toBeVisible();
  await expect(canBang.getByText('Giá cân bằng', { exact: true })).toHaveCSS('font-size', '9.38px');
  const mauE = await canBang.getByText('E', { exact: true }).evaluate((el) => getComputedStyle(el).fill);
  const mauNhan = await page.evaluate(() => {
    const t = document.createElement('span');
    t.style.color = 'var(--accent)';
    document.body.append(t);
    return getComputedStyle(t).color;
  });
  expect(mauE).toBe(mauNhan);

  // Hình (a), (b) đặt cạnh nhau trên laptop, chú thích có chữ đậm
  await page.goto('vi-mo/chuong-3/sach/3-2/');
  const a = page.locator('#slide-17 [data-hinh-sach="vm-3-yeu-to-cau-a"]');
  const b = page.locator('#slide-17 [data-hinh-sach="vm-3-yeu-to-cau-b"]');
  await expect(a.locator('figcaption strong').first()).toHaveText('(a)');
  await expect(b.locator('figcaption')).toContainText('làm giảm cầu');
  const [hopA, hopB] = [await a.boundingBox(), await b.boundingBox()];
  expect(hopB!.x).toBeGreaterThan(hopA!.x + hopA!.width - 1);
  expect(Math.abs(hopB!.y - hopA!.y)).toBeLessThan(2);

  // Mọi biểu đồ của chương đều hiện
  const hinhTheoMuc: Record<string, string[]> = {
    '3-1': ['vm-3-duong-cau', 'vm-3-duong-cung', 'vm-3-can-bang'],
    '3-2': ['vm-3-cau-p0', 'vm-3-dich-cau-a', 'vm-3-dich-cau-b', 'vm-3-cau-o-to', 'vm-3-yeu-to-cau-a', 'vm-3-yeu-to-cau-b',
      'vm-3-cung-p0', 'vm-3-gia-cung', 'vm-3-thay-doi-gia', 'vm-3-dich-cung', 'vm-3-cung-o-to', 'vm-3-yeu-to-cung-a', 'vm-3-yeu-to-cung-b'],
    '3-3': ['vm-3-ca-hoi', 'vm-3-tin-tuc', 'vm-3-buu-chinh-a', 'vm-3-buu-chinh-b', 'vm-3-buu-chinh-chong', 'vm-3-di-chuyen'],
    '3-4': ['vm-3-gia-tran', 'vm-3-gia-san'],
    '3-5': ['vm-3-thang-du', 'vm-3-hieu-qua-tran', 'vm-3-hieu-qua-san'],
  };
  for (const [muc, cacHinh] of Object.entries(hinhTheoMuc)) {
    await page.goto(`vi-mo/chuong-3/sach/${muc}/`);
    for (const ten of cacHinh) await expect(page.locator(`[data-hinh-sach="${ten}"] svg`)).toBeVisible();
  }
});

test('trang môn Vi mô dẫn tới Chương 3, có slide dịch để tải', async ({ page }) => {
  await page.goto('vi-mo/');
  await page.getByRole('link', { name: /Cung và cầu/ }).first().click();
  await expect(page).toHaveURL(/vi-mo\/chuong-3\/$/);
  await expect(page.getByRole('link', { name: /Slide dịch Chương 3/ })).toHaveAttribute('href', /tai-ve\/vi-mo-chuong-3-slide\.pdf$/);
  await page.getByRole('link', { name: /Giá trần và giá sàn/ }).first().click();
  await expect(page).toHaveURL(/vi-mo\/chuong-3\/sach\/3-4\/$/);
  await expect(page.locator('#slide-33 [data-hinh-sach="vm-3-gia-tran"] svg')).toBeVisible();
});

test('trang môn Vi mô dẫn tới Chương 2', async ({ page }) => {
  await page.goto('vi-mo/');
  await page.getByRole('link', { name: /Lựa chọn trong thế giới khan hiếm/ }).first().click();
  await expect(page).toHaveURL(/vi-mo\/chuong-2\/$/);
  await expect(page.getByRole('link', { name: /Slide dịch Chương 2/ })).toHaveAttribute('href', /tai-ve\/vi-mo-chuong-2-slide\.pdf$/);
});

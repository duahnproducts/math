import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

for (const [chapter,first,last] of [[2,11,16],[3,17,22],[4,23,27]]) {
  test(`Ross chương ${chapter}: đọc đủ các bài mới §${first}–§${last}`, async ({ page }) => {
    test.slow();
    for (let section=first;section<=last;section++) {
      const lesson=chapter===2?section-6:chapter===3?section-16:section-22;
      const response=await page.goto(`giai-tich/chuong-${chapter}/giang-day/bai-${lesson}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toContainText(`§${section}.`);
      await expect(page.locator('.bai-giang h2')).toHaveCount(8);
      await expect(page.locator('.katex')).not.toHaveCount(0);
      await expect(page.locator('.katex-error')).toHaveCount(0);
      await expect(page.locator('[data-hinh-ross] svg').first()).toBeVisible();
      await expect(page.locator('.bai-giang')).not.toContainText('@figure');
      const pdfLink=page.getByRole('link',{name:'PDF bài giảng',exact:true});
      if (section<=20) await expect(pdfLink).toHaveAttribute('href','/math/tai-ve/giai-tich-ross-bai-giang-11-20.pdf');
      else await expect(pdfLink).toHaveCount(0);
      const solutions=page.locator('details[data-tang="loi-giai"]');
      await expect(solutions).toHaveCount(3);
      await solutions.first().locator('summary').click();
      const dialog=page.getByRole('dialog', { name:/20 phút/ });
      if (await dialog.isVisible()) await dialog.getByRole('button',{name:/xem lời giải/}).click();
      await expect(solutions.first()).toHaveAttribute('open','');
      await expect(solutions.first()).toContainText('Bước 6.');
    }
  });
}

test('lộ trình đủ bốn chương, đến được §27 và lưu tiến độ', async ({page,request})=>{
  await page.goto('giai-tich/');
  await expect(page.locator('[aria-label="Các chương"] li')).toHaveCount(4);
  await page.locator('a[href="/math/giai-tich/chuong-4/"]').click();
  await expect(page.locator('.lo-trinh a[href*="giang-day"]')).toHaveCount(5);
  await page.locator('.lo-trinh a[href$="/bai-5/"]').click();
  await expect(page.locator('h1')).toContainText('§27.');
  await page.locator('[data-danh-dau]').click();
  await page.reload();
  await expect(page.locator('[data-danh-dau]')).toHaveAttribute('aria-pressed','true');
  await page.goto('./');
  await expect(page.locator('[data-hoc-tiep-link]')).toHaveAttribute('href','/math/giai-tich/chuong-4/giang-day/bai-5/');
  const pdf=await request.get('tai-ve/giai-tich-ross-bai-giang-11-20.pdf');
  expect(pdf.ok()).toBe(true);
  expect(await pdf.body()).toEqual(readFileSync('public/tai-ve/giai-tich-ross-bai-giang-11-20.pdf'));
});

test('bài cuối chương 4 đọc trên điện thoại và hình hỗ trợ sáng tối',async({page},testInfo)=>{
  await page.setViewportSize({width:393,height:851});
  await page.goto('giai-tich/chuong-4/giang-day/bai-5/');
  const image=page.locator('[data-hinh-ross="bernstein"] svg');
  const light=await image.evaluate(e=>getComputedStyle(e).color);
  await page.screenshot({path:testInfo.outputPath('ross-four-light.png'),fullPage:true});
  await page.getByRole('button',{name:/Chuyển sang giao diện tối/}).click();
  await expect.poll(()=>image.evaluate(e=>getComputedStyle(e).color)).not.toBe(light);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('ross-four-dark.png'),fullPage:true});
});

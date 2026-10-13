import { expect, test } from '@playwright/test';

test('10 bài Ross đọc trực tiếp, đủ 8 mục, công thức và hình; tải PDF được', async ({page,request}) => {
  test.slow();
  await page.goto('giai-tich/');
  await expect(page.locator('.ghi-cong')).toContainText('Kenneth A. Ross');
  await expect(page.locator('[aria-label="Các chương"] li')).toHaveCount(2);
  for(let section=1;section<=10;section++) {
    const chapter=section<=6?1:2, lesson=section<=6?section:section-6;
    await page.goto(`giai-tich/chuong-${chapter}/giang-day/bai-${lesson}/`);
    await expect(page.locator('h1')).toContainText(`§${section}.`);
    await expect(page.locator('.bai-giang h2')).toHaveCount(8);
    await expect(page.locator('.katex')).not.toHaveCount(0);
    await expect(page.locator('.katex-error')).toHaveCount(0);
    await expect(page.locator('.bai-giang')).not.toContainText('@figure');
    if([4,6,7,10].includes(section)) await expect(page.locator('[data-hinh-ross]').first()).toBeVisible();
  }
  const pdf=await request.get('tai-ve/giai-tich-ross-bai-giang-1-10.pdf');
  expect(pdf.ok()).toBe(true);
  expect((await pdf.body()).subarray(0,5).toString()).toBe('%PDF-');
  expect((await request.get('tai-ve/giai-tich-chuong-1-bai-giang.pdf')).status()).toBe(404);
  expect((await request.get('giai-tich/chuong-1/sach/1-2/')).status()).toBe(404);
});

test('xóa tiến độ Abbott một lần, tiến độ Ross và Học tiếp tồn tại sau tải lại', async ({page})=>{
  await page.addInitScript(()=>{
    if(localStorage.getItem('hochanh:tien-do')) return;
    localStorage.setItem('hochanh:tien-do',JSON.stringify({phienBan:1,daHoc:{'giai-tich/1/giang-day/1':1,'dai-so/1/giang-day/1':1},tuDanhGia:{},lanCuoi:null,lanCuoiTheoChuong:{}}));
  });
  await page.goto('giai-tich/chuong-1/giang-day/bai-1/');
  const button=page.locator('[data-danh-dau]');
  await expect(button).toHaveAttribute('aria-pressed','false');
  await button.click();
  await page.reload();
  await expect(button).toHaveAttribute('aria-pressed','true');
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('hochanh:tien-do')!));
  expect(progress.daHoc['dai-so/1/giang-day/1']).toBe(1);
  await page.goto('./');
  await expect(page.locator('[data-hoc-tiep-link]')).toHaveAttribute('href','/math/giai-tich/chuong-1/giang-day/bai-1/');
});

test('chương chỉ có bản dịch PDF vẫn vào được, tải đủ 8 file và không dẫn đến bài tập 404', async ({page,request})=>{
  test.slow();
  for(const [subject,chapters] of [['dai-so',[4,5,6,7,8]],['vi-mo',[5,7,8]]] as const) {
    await page.goto(`${subject}/`);
    for(const n of chapters) await expect(page.locator(`a[href="/math/${subject}/chuong-${n}/"]`)).toBeVisible();
    for(const n of chapters) {
      await page.goto(`${subject}/chuong-${n}/`);
      await expect(page.locator('.ghi-cong')).toContainText('CC BY-NC-SA');
      await expect(page.locator('[data-hoc-tiep-link]')).toHaveCount(0);
      const link=page.locator('#tai-ve + ul a');
      const response=await request.get((await link.getAttribute('href'))!);
      expect(response.ok()).toBe(true);
      expect((await response.body()).subarray(0,5).toString()).toBe('%PDF-');
    }
  }
});

test('bài Ross đọc được trên điện thoại và hình đổi màu ở giao diện tối', async ({page},testInfo)=>{
  await page.goto('giai-tich/chuong-1/giang-day/bai-4/');
  const image=page.locator('[data-hinh-ross="sup"] svg');
  const light=await image.evaluate(e=>getComputedStyle(e).color);
  await page.screenshot({path:testInfo.outputPath('ross-light.png'),fullPage:true});
  await page.getByRole('button',{name:/Chuyển sang giao diện tối/}).click();
  await expect.poll(()=>image.evaluate(e=>getComputedStyle(e).color)).not.toBe(light);
  await page.screenshot({path:testInfo.outputPath('ross-dark.png'),fullPage:true});
  await page.setViewportSize({width:393,height:851});
  await expect(image).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('ross-mobile.png'),fullPage:true});
});

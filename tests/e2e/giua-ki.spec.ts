import { test, expect } from '@playwright/test';

test('đi từ môn học, làm bài, khôi phục, kết thúc và xem lời giải', async ({page}) => {
  await page.goto('dai-so/');
  await page.getByRole('link',{name:'Làm bài kiểm tra giữa kì'}).click();
  await expect(page.locator('.cau-thi')).toHaveCount(6);
  await expect(page.locator('#noi-dung-dap-an')).toBeHidden();
  await expect(page.locator('[data-bai-lam="0"]')).toBeDisabled();
  await page.getByRole('button',{name:'Bắt đầu 60 phút'}).click();
  await page.locator('[data-bai-lam="0"]').fill('a) Đúng vì có biến tự do.');
  await page.reload();
  await expect(page.locator('[data-bai-lam="0"]')).toHaveValue('a) Đúng vì có biến tự do.');
  await expect(page.locator('[data-bai-lam="0"]')).toBeEnabled();
  await page.getByRole('button',{name:'Kết thúc bài làm'}).click();
  await page.getByRole('button',{name:'Quay lại',exact:true}).click();
  await expect(page.locator('[data-bai-lam="0"]')).toBeEnabled();
  await page.getByRole('button',{name:'Kết thúc bài làm'}).click();
  await page.getByRole('button',{name:'Đồng ý',exact:true}).click();
  await expect(page.locator('[data-bai-lam="0"]')).toBeDisabled();
  await page.getByRole('button',{name:'Xem đáp án và tự chấm'}).click();
  await expect(page.locator('#noi-dung-dap-an')).toBeVisible();
  for (const answer of await page.locator('.loi-giai-thi').all()) {
    await answer.locator(':scope > summary').click();
    await expect(answer.getByRole('heading',{name:/Thang điểm câu/})).toBeVisible();
    const canCu=answer.locator('[data-can-cu]').first();
    await canCu.locator(':scope > summary').click();
    await expect(canCu).toContainText('Điều kiện:');
  }
  await expect(page.locator('.katex-error')).toHaveCount(0);
  await page.getByRole('button',{name:'Làm lại đề',exact:true}).click();
  await page.getByRole('button',{name:'Đồng ý',exact:true}).click();
  await expect(page.locator('[data-bai-lam="0"]')).toHaveValue('');
  await expect(page.locator('#noi-dung-dap-an')).toBeHidden();
  await expect(page.locator('#dong-ho')).toHaveText('60:00');
});

test('hết giờ sau khi tải lại vẫn khóa bài; điện thoại không tràn ngang',async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('dai-so/giua-ki/');
  await page.evaluate(() => localStorage.setItem('hochanh:dai-so:giua-ki-1-3:v1',JSON.stringify({batDau:Date.now()-3600001,ketThuc:false,baiLam:Array(6).fill('Bài đã lưu')})));
  await page.reload();
  await expect(page.locator('#dong-ho')).toHaveText('00:00');
  await expect(page.locator('[data-bai-lam="0"]')).toBeDisabled();
  await expect(page.locator('[data-bai-lam="0"]')).toHaveValue('Bài đã lưu');
  await page.getByRole('button',{name:'Xem đáp án và tự chấm'}).click();
  await page.locator('.loi-giai-thi').nth(4).locator(':scope > summary').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('xem sớm cần xác nhận, bộ nhớ bị chặn vẫn làm được',async ({page}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {throw new Error('blocked');};
    Storage.prototype.setItem = () => {throw new Error('blocked');};
  });
  await page.goto('dai-so/giua-ki/');
  await page.getByRole('button',{name:'Bắt đầu 60 phút'}).click();
  await page.locator('[data-bai-lam="1"]').fill('z = t');
  await expect(page.locator('#luu-bai')).toContainText('Không lưu được');
  await page.getByRole('button',{name:'Xem đáp án và tự chấm'}).click();
  await page.getByRole('button',{name:'Quay lại',exact:true}).click();
  await expect(page.locator('#noi-dung-dap-an')).toBeHidden();
  await page.getByRole('button',{name:'Xem đáp án và tự chấm'}).click();
  await page.getByRole('button',{name:'Đồng ý',exact:true}).click();
  await expect(page.locator('#noi-dung-dap-an')).toBeVisible();
  await expect(page.locator('[data-bai-lam="1"]')).toBeDisabled();
});

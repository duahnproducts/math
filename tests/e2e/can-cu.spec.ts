import {expect,test} from '@playwright/test';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';

test('toàn bộ trang xuất bản có công thức hợp lệ, mọi trang bài tập có căn cứ',()=>{
  const files=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(join(dir,d.name)):d.name.endsWith('.html')?[join(dir,d.name)]:[]);
  let exerciseCount=0;
  for(const file of files('dist')){
    const html=readFileSync(file,'utf8');
    expect(html,file).not.toContain('katex-error');
    if(html.includes('data-the-bai-tap-chi-tiet')){
      expect(html,file).toContain('data-can-cu');
      exerciseCount++;
    }
  }
  expect(exerciseCount).toBe(597);
});

test('căn cứ nằm trong hướng dẫn của sách, bài luyện và thảo luận; mở được trên điện thoại sáng/tối',async({page},info)=>{
  await page.setViewportSize({width:393,height:851});
  for(const [url,rule] of [
    ['giai-tich/chuong-2/bai-tap/10-1/','dinh-nghia-don-dieu'],
    ['dai-so/chuong-3/bai-tap/3-1-7/','phep-hang'],
    ['giai-tich/chuong-2/giang-day/bai-4/','tam-giac'],
    ['dai-so/chuong-2/giang-day/bai-7/','lu'],
    ['vi-mo/chuong-3/sach/3-3/','cung'],
  ]){
    await page.goto(url);
    await expect(page.locator('.de [data-can-cu], .slide [data-can-cu]')).toHaveCount(0);
    const answer=page.locator('[data-tang="loi-giai"]').filter({has:page.locator(`[data-can-cu-ma="${rule}"]`)}).first();
    await answer.locator(':scope > summary').click();
    const dialog=page.getByRole('dialog',{name:/20 phút/});
    if(await dialog.isVisible())await dialog.getByRole('button',{name:/xem lời giải/}).click();
    const note=answer.locator('[data-can-cu]').filter({has:page.locator(`[data-can-cu-ma="${rule}"]`)}).first();
    await note.locator(':scope > summary').click();
    await expect(note).toContainText('Phát biểu / công thức:');
    await expect(note).toContainText('Điều kiện:');
    await expect(note).toContainText('Vì sao dùng:');
    await expect(note).toHaveAttribute('open','');
    await expect(answer).toHaveAttribute('open','');
    await expect(page.locator('.katex-error')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await note.screenshot({path:info.outputPath(url.split('/')[0]+'-'+url.split('/')[2]+'-can-cu.png')});
  }
  await page.getByRole('button',{name:/Chuyển sang giao diện tối/}).click();
  await page.locator('[data-can-cu][open]').first().screenshot({path:info.outputPath('can-cu-dark.png')});
});

test('gợi ý lặp lại căn cứ khi áp dụng nhiều lần; không lộ lời giải khi mở căn cứ',async({page})=>{
  await page.goto('giai-tich/chuong-2/giang-day/bai-4/');
  const answer=page.locator('[data-tang="loi-giai"]').last();
  expect(await answer.locator('[data-can-cu-ma="tam-giac"]').count()).toBeGreaterThan(1);
  await page.goto('vi-mo/chuong-3/sach/3-3/');
  await expect(page.locator('[data-tang="goi-y-1"]')).toHaveCount(3);
  await expect(page.locator('[data-tang="goi-y-2"]')).toHaveCount(3);
  const hint=page.locator('[data-tang="goi-y-1"]').first();
  await hint.locator(':scope > summary').click();
  const note=hint.locator('[data-can-cu]').first();
  await note.locator(':scope > summary').click();
  await expect(note).toContainText('Điều kiện:');
  await expect(page.locator('[data-tang="loi-giai"][open]')).toHaveCount(0);
});

import { expect,test } from '@playwright/test';

test('mở lời giải chi tiết trong bài giảng của cả ba môn, đọc được ở màn hình nhỏ',async({page},info)=>{
  await page.setViewportSize({width:393,height:851});
  for(const [url,total,expected] of [
    ['giai-tich/chuong-2/giang-day/bai-4/',3,'Chứng minh bị chặn và đơn điệu trước'],
    ['dai-so/chuong-2/giang-day/bai-7/',3,'Không cần'],
    ['vi-mo/chuong-3/sach/3-3/',3,'giá có thể tăng, giảm hoặc giữ nguyên'],
  ] as const){
    await page.goto(url);
    const answers=page.locator('[data-tang="loi-giai"]');
    await expect(answers).toHaveCount(total);
    for(const answer of await answers.all()){
      await expect(answer).not.toHaveAttribute('open','');
      await answer.locator(':scope > summary').click();
      const dialog=page.getByRole('dialog',{name:/20 phút/});
      if(await dialog.isVisible())await dialog.getByRole('button',{name:/xem lời giải/}).click();
      await expect(answer).toHaveAttribute('open','');
      await expect(answer).toContainText('Bước 1.');
    }
    if(url.startsWith('giai-tich')||url.startsWith('vi-mo'))await expect(answers.filter({hasText:expected})).toHaveCount(1);
    await expect(page.locator('.katex-error')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:info.outputPath(url.split('/')[0]+'-chi-tiet-mobile.png'),fullPage:true});
    await answers.nth(1).screenshot({path:info.outputPath(url.split('/')[0]+'-loi-giai-mobile.png')});
  }
});

test('bài 3.1.7 trình bày từng hệ số khử và giữ chức năng tự đánh giá',async({page})=>{
  await page.goto('dai-so/chuong-3/bai-tap/3-1-7/');
  const solution=page.locator('[data-tang="loi-giai"]');
  await solution.locator(':scope > summary').click();
  await page.getByRole('dialog',{name:/20 phút/}).getByRole('button',{name:/xem lời giải/}).click();
  await expect(solution).toContainText('Đổi hàng 1 và 2');
  await expect(solution).toContainText('Đổi hàng 2 và 3');
  await expect(solution).toContainText('Muốn trừ');
  await expect(page.locator('.katex-error')).toHaveCount(0);
  await page.getByRole('button',{name:'Làm được',exact:true}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Làm được',exact:true})).toHaveAttribute('aria-pressed','true');
});

import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const inventory=JSON.parse(readFileSync('content/giai-tich/bai-tap-goc.json','utf8')) as {so:string;chuong:number}[];
const counts=[12,8,8,16,7,5,5,10,18,12,11,14,15,14,8];

test('163 bài Ross đều có trang, công thức và đủ tầng hướng dẫn',async({request})=>{
  test.slow();
  for(const {so,chuong} of inventory){
    const response=await request.get(`giai-tich/chuong-${chuong}/bai-tap/${so.replaceAll('.','-')}/`);
    expect(response.ok(),so).toBe(true);
    const html=await response.text();
    for(const marker of ['data-the-bai-tap-chi-tiet','data-tang="goi-y-1"','data-tang="goi-y-2"','data-tang="loi-giai"','Bước 6.','data-can-cu'])expect(html,so).toContain(marker);
    expect(html,so).not.toContain('katex-error');
    expect(html,so).not.toContain('Chưa có hướng dẫn');
    expect(html,so).toContain(`Bài ${so}`);
  }
});

test('hai kho đúng số bài và bộ lọc URL theo đủ 15 mục Ross',async({page})=>{
  for(const chapter of [1,2]){
    await page.goto(`giai-tich/chuong-${chapter}/bai-tap/`);
    await expect(page.locator('[data-the-bai-tap]')).toHaveCount(chapter===1?56:107);
    const sections=chapter===1?[1,2,3,4,5,6]:[7,8,9,10,11,12,13,14,15];
    for(const section of sections){
      await page.locator(`[data-loc-muc="${section}"]`).click();
      await expect(page.locator('[data-the-bai-tap]:visible')).toHaveCount(counts[section-1]);
      await expect(page).toHaveURL(new RegExp(`muc=${section}$`));
    }
    await page.reload();
    const last=sections.at(-1)!;
    await expect(page.locator('[data-the-bai-tap]:visible')).toHaveCount(counts[last-1]);
  }
});

test('10 bài giảng và bảng đối chiếu nối tới bài Ross đúng mục, không dẫn trang sách chưa có',async({page})=>{
  for(let section=1;section<=10;section++){
    const chapter=section<=6?1:2,lesson=section<=6?section:section-6;
    await page.goto(`giai-tich/chuong-${chapter}/giang-day/bai-${lesson}/`);
    const link=page.locator('[data-bai-tap-bai-nay]');
    await expect(link).toHaveAttribute('href',`/math/giai-tich/chuong-${chapter}/bai-tap/?muc=${section}`);
    await link.click();
    await expect(page.locator('[data-the-bai-tap]:visible')).toHaveCount(counts[section-1]);
  }
  await page.goto('giai-tich/chuong-2/');
  await expect(page.locator('#doi-chieu + p + div tbody tr')).toHaveCount(9);
  await expect(page.locator('a[href*="/sach/"]')).toHaveCount(0);
});

test('gợi ý mở theo tầng, lời giải và tự đánh giá giữ sau tải lại, lọc bài cần làm lại',async({page})=>{
  await page.goto('giai-tich/chuong-2/bai-tap/15-8/');
  const first=page.locator('[data-tang="goi-y-1"]'),second=page.locator('[data-tang="goi-y-2"]'),answer=page.locator('[data-tang="loi-giai"]');
  await second.locator(':scope > summary').click();
  await expect(first).toHaveAttribute('open','');
  await expect(second).not.toHaveAttribute('open','');
  await second.locator(':scope > summary').click();
  await expect(second).toHaveAttribute('open','');
  await answer.locator(':scope > summary').click();
  await page.getByRole('dialog',{name:/20 phút/}).getByRole('button',{name:/xem lời giải/}).click();
  await expect(answer).toHaveAttribute('open','');
  for(let step=1;step<=6;step++)await expect(answer).toContainText(`Bước ${step}.`);
  await page.getByRole('button',{name:'Cần gợi ý',exact:true}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Cần gợi ý',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.goto('giai-tich/chuong-2/bai-tap/?lam-lai=1');
  await expect(page.locator('[data-the-bai-tap]:visible')).toHaveCount(1);
  await expect(page.locator('[data-the-bai-tap]:visible')).toContainText('Bài 15.8');
});

test('bài có bảng, chứng minh dài và công thức đọc được trên điện thoại sáng/tối',async({page},info)=>{
  await page.setViewportSize({width:393,height:851});
  for(const [chapter,slug] of [[1,'4-1'],[1,'6-3'],[2,'7-3'],[2,'12-12'],[2,'13-15'],[2,'15-8']] as const){
    await page.goto(`giai-tich/chuong-${chapter}/bai-tap/${slug}/`);
    const positions=await page.evaluate(()=>['.de','[data-kien-thuc-ross]','[data-tang="goi-y-1"]'].map(s=>document.querySelector(s)!.getBoundingClientRect().top));
    expect(positions[0]).toBeLessThan(positions[1]);
    expect(positions[1]).toBeLessThan(positions[2]);
    await page.locator('[data-tang="loi-giai"] > summary').click();
    await page.getByRole('dialog',{name:/20 phút/}).getByRole('button',{name:/xem lời giải/}).click();
    await expect(page.locator('.katex-error')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.screenshot({path:info.outputPath('ross-exercise-mobile-light.png'),fullPage:true});
  await page.getByRole('button',{name:/Chuyển sang giao diện tối/}).click();
  await page.screenshot({path:info.outputPath('ross-exercise-mobile-dark.png'),fullPage:true});
});

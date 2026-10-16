import { expect,test } from '@playwright/test';

test('đủ đề ở từng mục, lọc được phần bổ sung, nhãn đề gốc và hướng dẫn đúng',async({page})=>{
  for(const [chapter,total,supp]of [[2,220,13],[3,148,6]]){
    await page.goto(`dai-so/chuong-${chapter}/bai-tap/`);
    await expect(page.locator('[data-the-bai-tap]')).toHaveCount(total);
    await page.getByRole('button',{name:'Bổ sung',exact:true}).click();
    await expect(page.locator('[data-the-bai-tap]:visible')).toHaveCount(supp);
    await expect(page.locator('[data-the-bai-tap]:visible').first()).toContainText(`Bài bổ sung ${chapter}.1`);
    await page.locator('[data-the-bai-tap]:visible a').first().click();
    await expect(page.locator('[data-de-goc-tieng-anh]')).toBeVisible();
    await expect(page.locator('[data-tang="loi-giai"]')).toHaveCount(1);
    await expect(page.locator('.ghi-cong')).toContainText('Đề gốc tiếng Anh');
    await expect(page.locator('[data-hinh-sach]').first()).toBeVisible();
  }
});

test('đề nhiều phần qua cột / trang đủ hình, rõ trên điện thoại và đổi màu sáng tối',async({page},testInfo)=>{
  await page.goto('dai-so/chuong-2/bai-tap/2-3-2/');
  await expect(page.locator('[data-hinh-sach]')).toHaveCount(2);
  const svg=page.locator('[data-hinh-sach] svg').first();
  const color=await svg.evaluate(e=>getComputedStyle(e).fill);
  await page.screenshot({path:testInfo.outputPath('de-goc-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Chuyển sang giao diện tối'}).click();
  await expect.poll(()=>svg.evaluate(e=>getComputedStyle(e).fill)).not.toBe(color);
  await page.setViewportSize({width:393,height:851});
  await expect(svg).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('de-goc-mobile.png'),fullPage:true});
});

test('số bài gốc và bài tự soạn độc lập; tiến độ được chuyển một lần',async({page})=>{
  await page.addInitScript(()=>{
    if(localStorage.getItem('hochanh:tien-do'))return;
    const pos={href:'/math/dai-so/chuong-3/bai-tap/3-1-1/',tieuDe:'Bài luyện',duongDan:'Đại số',chuong:'dai-so/3',luc:1};
    localStorage.setItem('hochanh:tien-do',JSON.stringify({phienBan:1,tuDanhGia:{'dai-so/3/bai-tap/3.1.1':{ketQua:'lam-duoc',luc:1}},daHoc:{},lanCuoi:pos,lanCuoiTheoChuong:{'dai-so/3':pos}}));
  });
  await page.goto('./');
  await expect(page.locator('[data-hoc-tiep-link]')).toHaveAttribute('href','/math/dai-so/chuong-3/bai-tap/3-1-1001/');
  await page.goto('dai-so/chuong-3/bai-tap/3-1-1/');
  await expect(page.locator('[data-de-goc-tieng-anh]')).toBeVisible();
  await expect(page.getByRole('button',{name:'Làm được',exact:true})).not.toHaveAttribute('aria-pressed','true');
  await page.goto('dai-so/chuong-3/bai-tap/3-1-1001/');
  await expect(page.locator('[data-bai-tu-soan]')).toBeVisible();
  await expect(page.getByRole('button',{name:'Làm được',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.reload();
  await expect(page.getByRole('button',{name:'Làm được',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('lời giải mới mở được, công thức rõ, dữ kiện sai được chú thích',async({page},testInfo)=>{
  for(const [chapter,slug]of [[2,'2-7-3'],[2,'2-8-3'],[3,'3-4-2'],[3,'3-0-5']] as const){
    await page.goto(`dai-so/chuong-${chapter}/bai-tap/${slug}/`);
    const solution=page.locator('[data-tang="loi-giai"]');
    await solution.locator('summary').click();
    await page.getByRole('dialog',{name:/20 phút/}).getByRole('button',{name:/xem lời giải/}).click();
    await expect(solution).toHaveAttribute('open','');
    await expect(solution.locator('.ruot')).not.toBeEmpty();
    await expect(page.locator('.katex-error')).toHaveCount(0);
    if(slug==='3-4-2'){
      await expect(solution).toContainText('Lỗi dữ kiện bản in');
      await page.setViewportSize({width:393,height:851});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.screenshot({path:testInfo.outputPath('loi-giai-mobile.png'),fullPage:true});
      await page.setViewportSize({width:1366,height:860});
    }
  }
});

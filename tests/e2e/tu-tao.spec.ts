// Tự tạo bài giảng từ PDF (product_design.md, mục 15): nhập khoá API → chọn PDF →
// Claude đọc mục lục → lưu môn → tạo bài giảng một chương → đọc bài 8 mục → tải lại
// vẫn còn → sao lưu .json → xoá → nhập lại. Máy chủ Claude được giả lập bằng
// page.route (trả luồng SSE như API thật), nên test không gọi mạng, không tốn tiền.
import { readFile } from 'node:fs/promises';
import { expect, test, type Page, type Request } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { DAN_Y_MAU, MUC_LUC_MAU, baiDocHai, baiMau, luongSse } from '../fixtures/tu-tao';

// Khoá giả chỉ dùng trong test — mọi yêu cầu tới api.anthropic.com đều bị chặn lại ở dưới
const KHOA_THU = 'sk-ant-api03-khoa-gia-cho-e2e-000000000000';
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
};

async function taoPdf(soTrang: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < soTrang; i++) doc.addPage([300, 400]).drawText(`Trang ${i + 1}`, { x: 40, y: 340, size: 18 });
  return Buffer.from(await doc.save());
}

interface YeuCauClaude {
  nhiemVu: string;
  headers: Record<string, string>;
  pdf: string;
}

/** Giả lập Messages API: đọc nhiệm vụ trong lời nhắc rồi trả câu trả lời mẫu. */
async function giaLapClaude(page: Page, traLoi?: (nhiemVu: string) => { status: number; body: string } | null) {
  const daNhan: YeuCauClaude[] = [];
  await page.route('https://api.anthropic.com/**', async (route, req: Request) => {
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const body = req.postDataJSON();
    const [taiLieu, nhiemVu] = body.messages[0].content;
    daNhan.push({ nhiemVu: nhiemVu.text, headers: await req.allHeaders(), pdf: taiLieu.source.data });
    const rieng = traLoi?.(nhiemVu.text);
    if (rieng) {
      return route.fulfill({ status: rieng.status, headers: { ...CORS, 'content-type': 'application/json' }, body: rieng.body });
    }
    let duLieu: unknown;
    if (nhiemVu.text.startsWith('NHIỆM VỤ: ĐỌC MỤC LỤC')) duLieu = MUC_LUC_MAU;
    else if (nhiemVu.text.startsWith('NHIỆM VỤ: LẬP DÀN Ý')) duLieu = DAN_Y_MAU;
    else {
      const so = Number(/VIẾT BÀI (\d+)/.exec(nhiemVu.text)?.[1]);
      duLieu = so === 2 ? baiDocHai(2) : baiMau(so, DAN_Y_MAU.bai[so - 1].tieu_de);
    }
    return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'text/event-stream' }, body: luongSse(duLieu) });
  });
  return daNhan;
}

async function nhapKhoa(page: Page) {
  await page.getByLabel('Khoá API', { exact: true }).fill(KHOA_THU);
  await page.getByRole('button', { name: 'Lưu khoá' }).click();
  await expect(page.locator('[data-khoa-che]')).toHaveText('sk-ant-…0000');
}

test('tạo môn từ PDF, tạo bài giảng một chương, đọc bài, sao lưu và xoá', async ({ page }) => {
  const daNhan = await giaLapClaude(page);

  // Trang chủ có lối vào
  await page.goto('./');
  await page.locator('[data-the-tu-tao]').click();
  await expect(page).toHaveURL(/\/math\/tu-tao\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tự tạo bài giảng từ PDF');
  await expect(page.getByText('Chưa có môn nào')).toBeVisible();

  // Khoá API
  await nhapKhoa(page);

  // Chọn PDF 10 trang → đọc mục lục tự động
  await page.locator('[data-chon-pdf]').setInputFiles({ name: 'vi-mo.pdf', mimeType: 'application/pdf', buffer: await taoPdf(10) });
  await expect(page.locator('[data-thong-tin-file]')).toHaveText('vi-mo.pdf · 10 trang');
  await page.getByRole('button', { name: /Đọc mục lục tự động/ }).click();
  await expect(page.locator('[data-o-ten-mon]')).toHaveValue('Kinh tế vĩ mô');
  const bang = page.locator('[data-bang-chuong] tbody tr');
  await expect(bang).toHaveCount(2);
  // Trang in 1 và 3, lệch 2 → trang PDF 3–4 và 5–10
  await expect(page.getByLabel('Từ trang, dòng 1')).toHaveValue('3');
  await expect(page.getByLabel('Đến trang, dòng 1')).toHaveValue('4');
  await expect(page.getByLabel('Đến trang, dòng 2')).toHaveValue('10');
  expect(daNhan[0].nhiemVu).toContain('10 trang đầu');

  // Lưu môn → sang trang môn
  await page.locator('[data-luu-mon]').click();
  await expect(page).toHaveURL(/\/tu-tao\/mon\/\?id=kinh-te-vi-mo-[a-z0-9]{5}$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kinh tế vĩ mô');
  const chuong1 = page.locator('[data-chuong-tu-tao="1"]');
  await expect(chuong1.getByText('Chưa tạo')).toBeVisible();

  // Tạo bài giảng Chương 1: lập dàn ý rồi viết 2 bài
  await page.locator('[data-tao-chuong="1"]').click();
  await expect(page.getByText('Xong Chương 1: 2 bài giảng.')).toBeVisible();
  await expect(chuong1.getByText('2 bài giảng')).toBeVisible();
  await expect(page.locator('[data-chuong-tu-tao="2"]').getByText('Chưa tạo')).toBeVisible();

  // Mọi yêu cầu đi thẳng từ trình duyệt tới Anthropic bằng khoá của người học
  expect(daNhan.map((y) => y.nhiemVu.split('\n')[0])).toEqual([
    'NHIỆM VỤ: ĐỌC MỤC LỤC.',
    'NHIỆM VỤ: LẬP DÀN Ý CHƯƠNG.',
    'NHIỆM VỤ: VIẾT BÀI 1.',
    'NHIỆM VỤ: VIẾT BÀI 2.',
  ]);
  for (const y of daNhan) {
    expect(y.headers['x-api-key']).toBe(KHOA_THU);
    expect(y.headers['anthropic-dangerous-direct-browser-access']).toBe('true');
  }
  // Chỉ gửi đúng 2 trang của Chương 1, và cả ba lần gọi của chương dùng chung một PDF (bộ nhớ đệm)
  const pdfChuong = await PDFDocument.load(Buffer.from(daNhan[1].pdf, 'base64'));
  expect(pdfChuong.getPageCount()).toBe(2);
  expect(new Set(daNhan.slice(1).map((y) => y.pdf)).size).toBe(1);

  // Đọc Bài 1: đủ 8 mục, công thức dựng bằng KaTeX
  await chuong1.getByRole('link', { name: 'Bài 1: Cả nước làm ra bao nhiêu?' }).click();
  await expect(page).toHaveURL(/\/tu-tao\/bai\/\?mon=kinh-te-vi-mo-[a-z0-9]{5}&chuong=1&bai=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cả nước làm ra bao nhiêu?');
  await expect(page.locator('.bai-giang h2')).toHaveCount(8);
  await expect(page.locator('.bai-giang h2').first()).toHaveText('Ý tưởng trong 1 câu');
  expect(await page.locator('.bai-giang .katex').count()).toBeGreaterThan(5);
  await expect(page.locator('.katex-error')).toHaveCount(0);
  await expect(page.locator('.bai-giang .hop.loi')).toHaveCount(2);
  await expect(page.locator('.bai-giang .bai-luyen')).toHaveCount(3);
  await expect(page.locator('[data-ghi-cong]')).toContainText('Claude Opus 5.5');
  await expect(page.locator('.muc-luc-trang a')).toHaveCount(8);

  // Bài 2 có nội dung cố chèn mã độc: bị lọc sạch
  await page.getByRole('link', { name: /Bài tiếp theo/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bài có mã độc');
  await expect(page.locator('.bai-giang')).toContainText('Chữ thường');
  await expect(page.locator('.bai-giang script, .bai-giang img, .bai-giang iframe')).toHaveCount(0);
  await expect(page.locator('.bai-giang a[href^="javascript"]')).toHaveCount(0);
  expect(await page.evaluate(() => (window as { __bi_tan_cong?: boolean }).__bi_tan_cong)).toBeUndefined();

  // Tải lại trang: bài vẫn còn (IndexedDB)
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bài có mã độc');

  // Sao lưu .json
  await page.getByRole('link', { name: /Về môn Kinh tế vĩ mô/ }).click();
  const [taiVe] = await Promise.all([page.waitForEvent('download'), page.locator('[data-tai-json]').click()]);
  expect(taiVe.suggestedFilename()).toMatch(/^kinh-te-vi-mo-[a-z0-9]{5}\.hochanh\.json$/);
  const banSaoLuu = await readFile((await taiVe.path())!, 'utf8');
  expect(JSON.parse(banSaoLuu).mon.chuong[0].bai).toHaveLength(2);

  // Xoá môn → về trang tạo, không còn môn nào
  page.once('dialog', (hop) => hop.accept());
  await page.locator('[data-xoa-mon]').click();
  await expect(page).toHaveURL(/\/tu-tao\/$/);
  await expect(page.getByText('Chưa có môn nào')).toBeVisible();

  // Nhập lại từ file sao lưu
  await page.locator('[data-nhap-json]').setInputFiles({
    name: 'sao-luu.json',
    mimeType: 'application/json',
    buffer: Buffer.from(banSaoLuu),
  });
  await expect(page.getByText('Đã nhập môn "Kinh tế vĩ mô".')).toBeVisible();
  await expect(page.locator('[data-mon-tu-tao]')).toHaveCount(1);
  await expect(page.locator('[data-mon-tu-tao]')).toContainText('2 bài giảng');
});

test('khoá sai: báo lỗi dễ hiểu, không lưu gì', async ({ page }) => {
  await giaLapClaude(page, () => ({
    status: 401,
    body: JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }),
  }));
  await page.goto('tu-tao/');
  await nhapKhoa(page);
  await page.locator('[data-chon-pdf]').setInputFiles({ name: 'sach.pdf', mimeType: 'application/pdf', buffer: await taoPdf(3) });
  await page.getByRole('button', { name: /Đọc mục lục tự động/ }).click();
  await expect(page.getByRole('alert')).toContainText('Khoá API không đúng hoặc đã bị thu hồi');
  await expect(page.locator('[data-bang-chuong]')).toHaveCount(0);
});

test('tự nhập chương, không cần gọi Claude; file không phải PDF thì báo lỗi', async ({ page }) => {
  const daNhan = await giaLapClaude(page);
  await page.goto('tu-tao/');

  await page.locator('[data-chon-pdf]').setInputFiles({ name: 'hong.pdf', mimeType: 'application/pdf', buffer: Buffer.from('không phải pdf') });
  await expect(page.getByRole('alert')).toContainText('Không đọc được file này');

  await page.locator('[data-chon-pdf]').setInputFiles({ name: 'toan-roi-rac.pdf', mimeType: 'application/pdf', buffer: await taoPdf(6) });
  // Chưa có khoá thì không đọc mục lục tự động được
  await expect(page.getByRole('button', { name: /Đọc mục lục tự động/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Tự nhập' }).click();
  await expect(page.locator('[data-o-ten-mon]')).toHaveValue('toan roi rac');
  await expect(page.getByLabel('Đến trang, dòng 1')).toHaveValue('6');

  // Thiếu tên chương, trang vượt file → báo lỗi từng dòng
  await page.getByLabel('Đến trang, dòng 1').fill('9');
  await page.locator('[data-luu-mon]').click();
  await expect(page.getByText('Chưa có tên chương.')).toBeVisible();
  await page.getByLabel('Tên chương, dòng 1').fill('Logic mệnh đề');
  await page.locator('[data-luu-mon]').click();
  await expect(page.getByText('File chỉ có 6 trang.')).toBeVisible();
  await page.getByLabel('Đến trang, dòng 1').fill('6');
  await page.locator('[data-luu-mon]').click();

  await expect(page).toHaveURL(/\/tu-tao\/mon\/\?id=toan-roi-rac-/);
  await expect(page.locator('[data-chuong-tu-tao="1"]')).toContainText('Chương 1: Logic mệnh đề');
  // Chưa có khoá: nút tạo bị khoá, thẻ nhập khoá hiện ngay trên trang môn
  await expect(page.locator('[data-tao-chuong="1"]')).toBeDisabled();
  await expect(page.getByLabel('Khoá API', { exact: true })).toBeVisible();
  expect(daNhan).toHaveLength(0);
});

test('trang môn và trang bài không có trên máy thì nói rõ', async ({ page }) => {
  await page.goto('tu-tao/mon/?id=khong-co-00000');
  await expect(page.locator('[data-khong-thay]')).toContainText('Không tìm thấy môn này trên máy');
  await page.goto('tu-tao/bai/?mon=khong-co-00000&chuong=1&bai=1');
  await expect(page.locator('[data-khong-thay]')).toContainText('Không tìm thấy bài giảng này trên máy');
});

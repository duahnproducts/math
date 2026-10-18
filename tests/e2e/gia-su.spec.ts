import { expect, test } from '@playwright/test';

test('hỏi theo đoạn trích, hiển thị công thức và giữ câu hỏi khi API lỗi', async ({ page }) => {
  let fail = true;
  await page.route('**/api/gia-su/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/status')) return route.fulfill({ json: { available: true, connected: true, email: 'learner@example.com' } });
    if (path.endsWith('/models')) return route.fulfill({ json: { models: [{ id: 'test-model', name: 'Mô hình thử' }] } });
    if (path.endsWith('/chat')) {
      const body = route.request().postDataJSON(); expect(body.context.tieuDe).toBeTruthy(); expect(body.messages.at(-1).role).toBe('user'); expect(body.context.noiDung).not.toContain('LOI_GIAI_CHUA_MO');
      if (fail) { fail = false; return route.fulfill({ status: 429, json: { error: 'Đã chạm hạn mức ChatGPT.' } }); }
      return route.fulfill({ contentType: 'text/event-stream', body: 'data: {"type":"response.output_text.delta","delta":"Ta có $x^2$. <script>alert(1)</script>"}\n\ndata: {"type":"response.completed"}\n\n' });
    }
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto('./giai-tich/chuong-1/giang-day/bai-1/');
  await page.locator('#noi-dung').evaluate(node => { const hidden = document.createElement('details'); hidden.textContent = 'LOI_GIAI_CHUA_MO'; node.append(hidden); });
  await page.locator('#noi-dung h1').evaluate(node => { const selection = window.getSelection()!; const range = document.createRange(); range.selectNodeContents(node); selection.removeAllRanges(); selection.addRange(range); });
  await page.getByRole('button', { name: 'Hỏi gia sư', exact: true }).click();
  const dialog = page.getByRole('dialog'); await expect(dialog).toBeVisible();
  await expect(dialog.locator('blockquote')).toBeVisible();
  await dialog.getByLabel('Bạn chưa hiểu chỗ nào?').fill('Giải thích giúp mình?');
  await dialog.getByRole('button', { name: 'Gửi câu hỏi' }).click();
  await expect(dialog.getByRole('alert')).toContainText('hạn mức');
  await expect(dialog.getByLabel('Bạn chưa hiểu chỗ nào?')).toHaveValue('Giải thích giúp mình?');
  await dialog.getByRole('button', { name: 'Gửi câu hỏi' }).click();
  await expect(dialog.locator('.katex')).toHaveCount(1);
  await expect(dialog.locator('.gia-su-message script')).toHaveCount(0);
  await expect(dialog.getByLabel('Bạn chưa hiểu chỗ nào?')).toHaveValue('');
  await dialog.getByRole('button', { name: 'Cuộc trò chuyện mới' }).click();
  await expect(dialog.locator('.gia-su-message')).toHaveCount(0);
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Hỏi gia sư', exact: true })).toBeFocused();
});

test('web tĩnh hướng dẫn kết nối thay vì giả trả lời', async ({ page }) => {
  await page.route('**/api/gia-su/**', route => route.fulfill({ status: 404, body: 'Not found' }));
  await page.goto('./'); await page.getByRole('button', { name: 'Hỏi gia sư', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('kết nối cần bản Hochanh chạy trên máy');
  await expect(page.getByRole('link', { name: 'Mở bản trên máy để đăng nhập ChatGPT' })).toHaveAttribute('href', 'http://127.0.0.1:4325/math/?gia-su=open');
  await expect(page.getByRole('button', { name: 'Continue with ChatGPT' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Gửi câu hỏi' })).toBeDisabled();
  await page.setViewportSize({ width: 390, height: 844 });
  const size = await page.getByRole('dialog').boundingBox(); expect(size!.width).toBeLessThanOrEqual(390);
});

test('nút đăng nhập đi đến OpenAI, quay về khôi phục câu hỏi và đổi trạng thái tài khoản', async ({ page }) => {
  let connected = false, returnTo = '';
  await page.route('**/api/gia-su/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/status')) return route.fulfill({ json: { available: true, connected, mode: 'chatgpt', email: connected ? 'student@example.com' : undefined } });
    if (path.endsWith('/models')) return route.fulfill({ json: { models: [{ id: 'account-model', name: 'Mô hình tài khoản' }] } });
    if (path.endsWith('/login')) { returnTo = route.request().postDataJSON().returnTo; return route.fulfill({ json: { url: 'https://auth.openai.com/api/accounts/authorize?state=test' } }); }
    if (path.endsWith('/logout')) { connected = false; return route.fulfill({ json: { ok: true } }); }
    return route.abort();
  });
  await page.route('https://auth.openai.com/api/accounts/authorize**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Đăng nhập OpenAI</h1>' }));
  await page.goto('./giai-tich/chuong-1/giang-day/bai-1/');
  await page.getByRole('button', { name: 'Hỏi gia sư', exact: true }).click();
  await page.getByLabel('Bạn chưa hiểu chỗ nào?').fill('Giải thích quy nạp?');
  await page.getByRole('button', { name: 'Continue with ChatGPT' }).click();
  await expect(page).toHaveURL(/^https:\/\/auth\.openai\.com\/api\/accounts\/authorize/);
  expect(returnTo).toBe('/math/giai-tich/chuong-1/giang-day/bai-1/'); connected = true;
  await page.goto(`http://localhost:${new URL(test.info().project.use.baseURL!).port}${returnTo}?gia-su=connected`);
  await expect(page.getByRole('dialog')).toContainText('student@example.com');
  await expect(page.getByLabel('Bạn chưa hiểu chỗ nào?')).toHaveValue('Giải thích quy nạp?');
  await expect(page.getByRole('button', { name: 'Gửi câu hỏi' })).toBeEnabled();
  await page.getByRole('button', { name: 'Ngắt kết nối trên máy' }).click();
  await expect(page.getByRole('button', { name: 'Continue with ChatGPT' })).toBeVisible();
});

test('chưa cấu hình AI thì báo rõ và không yêu cầu đăng nhập', async ({ page }) => {
  await page.route('**/api/gia-su/status', route => route.fulfill({ json: { available: true, connected: false, mode: 'api' } }));
  await page.goto('./'); await page.getByRole('button', { name: 'Hỏi gia sư', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Chủ ứng dụng cần bật kết nối AI');
  await expect(page.getByRole('button', { name: 'Continue with ChatGPT' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Gửi câu hỏi' })).toBeDisabled();
});

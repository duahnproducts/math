import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { taoMayChu } from '../scripts/gia-su.ts';

const cleanup: (() => Promise<unknown>)[] = [];
afterEach(async () => { for (const fn of cleanup.splice(0).reverse()) await fn(); });
async function setup(apiKey = 'server-secret-key', upstreamStatus = 200, authMode: 'api' | 'chatgpt' = 'api') {
  const testRoot = join(process.cwd(), '.hochanh-local'); await mkdir(testRoot, { recursive: true });
  const dir = await mkdtemp(join(testRoot, 'test-')); cleanup.push(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'dist')); await writeFile(join(dir, 'dist', 'index.html'), '<h1>Hochanh</h1>');
  const request = vi.fn(async (_url: unknown, _init?: RequestInit) => String(_url).endsWith('/token') ? Response.json({ access_token: 'account-access', id_token: 'signed-id', refresh_token: 'account-refresh', scope: 'resource.invoke chatgpt.tokens.use.direct', expires_in: 3600 }) : String(_url).endsWith('/models') ? Response.json({ models: [{ slug: 'configured-model', display_name: 'Model', visibility: 'list' }] }) : upstreamStatus === 200
    ? new Response('data: {"type":"response.output_text.delta","delta":"Giải thích"}\n\ndata: {"type":"response.completed"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } })
    : Response.json({ error: { message: 'private upstream details' } }, { status: upstreamStatus }));
  const { createServer } = await import('node:net'); const probe = createServer();
  await new Promise<void>(done => probe.listen(0, '127.0.0.1', done)); const port = (probe.address() as { port: number }).port;
  await new Promise<void>(done => probe.close(() => done()));
  const server = await taoMayChu({ port, root: join(dir, 'dist'), request: request as typeof fetch, apiKey, model: 'configured-model', authMode, stateDir: join(dir, 'state'), verifyIdentity: async () => ({ sub: 'account', email: 'student@example.com' }) });
  await new Promise<void>(done => server.listen(port, '127.0.0.1', done));
  cleanup.push(() => new Promise<void>(done => { server.closeAllConnections(); server.close(() => done()); }));
  const base = `http://127.0.0.1:${port}`, page = await fetch(`${base}/math/`), cookie = page.headers.get('set-cookie')!.split(';')[0];
  const get = (path: string) => fetch(base + path, { headers: { Cookie: cookie }, redirect: 'manual' });
  const post = (path: string, body: unknown = {}) => fetch(base + path, { method: 'POST', headers: { Cookie: cookie, Origin: base, 'X-Hochanh': '1', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { base, cookie, get, post, request };
}
const question = { model: 'configured-model', messages: [{ role: 'user', content: 'Vì sao?' }], context: { tieuDe: 'Bài', duongDan: '/math/', noiDung: 'Dữ liệu', trichDan: '' } };
describe('gia sư dùng khóa API máy chủ, không đăng nhập', () => {
  it('đăng nhập ChatGPT, gọi đúng OAuth token và ngắt kết nối qua HTTP', async () => {
    const app = await setup('unused-key', 200, 'chatgpt');
    expect((await app.post('/api/gia-su/chat', question)).status).toBe(401);
    const login = await app.post('/api/gia-su/login', { returnTo: '/math/dai-so/' }), url = new URL((await login.json()).url);
    const callback = await app.get(`/auth/callback?state=${url.searchParams.get('state')}&code=valid&client_id=oaiapp_issued`);
    expect(callback.status).toBe(303); expect(callback.headers.get('location')).toBe('/math/dai-so/?gia-su=connected');
    expect((await (await app.get('/api/gia-su/status')).json()).email).toBe('student@example.com');
    const result = await app.post('/api/gia-su/chat', question); expect(result.status).toBe(200); await result.text();
    const call = app.request.mock.calls.find(call => String(call[0]).endsWith('/responses'))!;
    expect(call[1]?.headers).toMatchObject({ Authorization: 'Bearer account-access' });
    expect(JSON.parse(String(call[1]?.body))).not.toHaveProperty('max_output_tokens');
    await app.post('/api/gia-su/logout'); expect((await (await app.get('/api/gia-su/status')).json()).connected).toBe(false);
  });
  it('hỏi ngay sau khi mở trang, chỉ gửi khóa đến OpenAI', async () => {
    const app = await setup();
    expect((await (await app.get('/api/gia-su/status')).json()).connected).toBe(true);
    expect((await (await app.get('/api/gia-su/models')).json()).models).toEqual([{ id: 'configured-model', name: 'configured-model' }]);
    const result = await app.post('/api/gia-su/chat', question);
    expect(result.status).toBe(200); expect(await result.text()).toContain('response.completed');
    const [url, init] = app.request.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/responses');
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer server-secret-key' });
    expect(JSON.parse(String(init?.body))).toMatchObject({ model: 'configured-model', store: false, stream: true, max_output_tokens: 4096 });
    expect(await (await app.get('/api/gia-su/status')).text()).not.toContain('server-secret-key');
    expect((await app.post('/api/gia-su/login')).status).toBe(404);
    expect((await app.get('/auth/callback')).status).toBe(404);
  });
  it('thiếu khóa thì không gọi mạng và không giả trạng thái sẵn sàng', async () => {
    const app = await setup('');
    expect((await (await app.get('/api/gia-su/status')).json()).connected).toBe(false);
    expect((await app.post('/api/gia-su/chat', question)).status).toBe(503);
    expect(app.request).not.toHaveBeenCalled();
  });
  it('chặn CSRF, sai model, sai dữ liệu và truy cập file riêng', async () => {
    const app = await setup();
    expect((await fetch(`${app.base}/api/gia-su/chat`, { method: 'POST', headers: { Cookie: app.cookie, Origin: 'https://evil.example' } })).status).toBe(403);
    expect((await fetch(`${app.base}/api/gia-su/chat`, { method: 'POST', headers: { Origin: app.base, 'X-Hochanh': '1' } })).status).toBe(403);
    expect((await app.post('/api/gia-su/chat', { ...question, model: 'expensive-other-model' })).status).toBe(400);
    expect((await app.post('/api/gia-su/chat', { messages: [] })).status).toBe(400);
    expect((await app.get('/math/%2e%2e%5c.hochanh-local%5c.env')).status).toBe(403);
    expect(app.request).not.toHaveBeenCalled();
  });
  it('hết hạn mức báo lỗi thân thiện, không lộ chi tiết dịch vụ', async () => {
    const app = await setup('secret', 429), response = await app.post('/api/gia-su/chat', question);
    expect(response.status).toBe(429); expect(await response.text()).not.toContain('private upstream details');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { taoMayChu } from '../scripts/gia-su.ts';

const cleanup: (() => Promise<unknown>)[] = [];
afterEach(async () => { for (const fn of cleanup.splice(0).reverse()) await fn(); });
async function setup() {
  const testRoot = join(process.cwd(), '.hochanh-local');
  await mkdir(testRoot, { recursive: true });
  const dir = await mkdtemp(join(testRoot, 'test-')); cleanup.push(() => rm(dir, { recursive: true, force: true }));
  await mkdir(join(dir, 'dist')); await writeFile(join(dir, 'dist', 'index.html'), '<h1>Hochanh</h1>');
  let authParams: URLSearchParams | undefined, responseBody: Record<string, unknown> | undefined;
  const request = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const path = String(url);
    if (path.endsWith('/token')) { authParams = init?.body as URLSearchParams; return Response.json({ access_token: 'secret-access', refresh_token: 'secret-refresh', id_token: 'signed-id', scope: 'resource.invoke chatgpt.tokens.use.direct', expires_in: 3600 }); }
    if (path.endsWith('/models')) return Response.json({ models: [{ slug: 'permitted', display_name: 'Mô hình được cấp', visibility: 'list' }, { slug: 'hidden', visibility: 'hide' }] });
    responseBody = JSON.parse(String(init?.body));
    return new Response('data: {"type":"response.output_text.delta","delta":"Giải thích"}\n\ndata: {"type":"response.completed"}\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
  }) as unknown as typeof fetch;
  const verifyIdentity = vi.fn(async () => ({ sub: 'account-1', email: 'learner@example.com' }));
  // Chọn cổng trống bằng listener tạm; máy chủ production kiểm Host theo đúng cổng cấu hình.
  const { createServer } = await import('node:net'); const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve)); const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  const server: Server = await taoMayChu({ port, root: join(dir, 'dist'), stateDir: join(dir, 'state'), request, verifyIdentity });
  await new Promise<void>(resolve => server.listen(port, '127.0.0.1', resolve));
  cleanup.push(() => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }));
  const base = `http://127.0.0.1:${port}`;
  const page = await fetch(`${base}/math/`), cookie = page.headers.get('set-cookie')!.split(';')[0];
  const get = (path: string) => fetch(base + path, { headers: { Cookie: cookie }, redirect: 'manual' });
  const post = (path: string, body: unknown = {}) => fetch(base + path, { method: 'POST', headers: { Cookie: cookie, Origin: base, 'X-Hochanh': '1', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  async function login() {
    const res = await post('/api/gia-su/login', { returnTo: '/math/dai-so/' }); const auth = new URL((await res.json()).url);
    return { auth, callback: `/auth/callback?state=${auth.searchParams.get('state')}&code=one-time-code&client_id=oaiapp_issued` };
  }
  return { dir, base, cookie, get, post, login, request, verifyIdentity, payload: () => responseBody, grant: () => authParams };
}
describe('máy chủ gia sư cá nhân', () => {
  it('OAuth PKCE, xác minh danh tính, catalog và Responses API không lộ token', async () => {
    const app = await setup(), { auth, callback } = await app.login();
    expect(auth.origin).toBe('https://auth.openai.com');
    expect(auth.searchParams.get('client_id')).toBe('dynamic_agent_client');
    expect(auth.searchParams.get('code_challenge_method')).toBe('S256');
    const redirect = await app.get(callback);
    expect(redirect.status).toBe(303);
    expect(redirect.headers.get('location')).toBe('/math/dai-so/?gia-su=connected');
    expect(app.verifyIdentity).toHaveBeenCalledWith('signed-id', 'oaiapp_issued', auth.searchParams.get('nonce'));
    expect(app.grant()?.get('redirect_uri')).toBe(`${app.base}/auth/callback`);
    const status = await (await app.get('/api/gia-su/status')).json(); expect(status.connected).toBe(true); expect(JSON.stringify(status)).not.toContain('secret');
    expect((await (await app.get('/api/gia-su/models')).json()).models).toEqual([{ id: 'permitted', name: 'Mô hình được cấp' }]);
    const answer = await app.post('/api/gia-su/chat', { model: 'permitted', messages: [{ role: 'user', content: 'Vì sao?' }], context: { tieuDe: 'Bài', duongDan: '/math/', noiDung: 'Dữ liệu', trichDan: '' } });
    expect(answer.status).toBe(200); expect(await answer.text()).toContain('response.completed');
    expect(app.payload()).toMatchObject({ model: 'permitted', store: false, stream: true });
    expect(app.payload()).not.toHaveProperty('previous_response_id');
    expect(await readFile(join(app.dir, 'state', 'registration.json'), 'utf8')).not.toContain('secret-');
    const again = await app.login(); expect(again.auth.searchParams.get('client_id')).toBe('oaiapp_issued');
    expect((await app.post('/api/gia-su/logout')).status).toBe(200);
    expect((await (await app.get('/api/gia-su/status')).json()).connected).toBe(false);
  });
  it('chặn sai state, replay, CSRF, origin lạ và truy cập chưa đăng nhập', async () => {
    const app = await setup(), { callback } = await app.login();
    expect((await app.get('/auth/callback?state=wrong&code=x&client_id=oaiapp_bad')).status).toBe(400);
    expect((await app.get(callback)).status).toBe(303);
    expect((await app.get(callback)).status).toBe(400);
    expect((await fetch(`${app.base}/api/gia-su/logout`, { method: 'POST', headers: { Cookie: app.cookie, Origin: 'https://evil.example' } })).status).toBe(403);
    expect((await fetch(`${app.base}/api/gia-su/models`)).status).toBe(401);
    expect((await fetch(`${app.base}/api/gia-su/status`, { headers: { Origin: 'https://evil.example' } })).status).toBe(403);
    expect((await app.get('/math/%2e%2e%5cstate%5cregistration.json')).status).toBe(403);
    expect((await app.post('/api/gia-su/chat', { messages: [] })).status).toBe(400);
  });
  it('không thay tài khoản khi xác minh JWT thất bại', async () => {
    const app = await setup(), { callback } = await app.login();
    app.verifyIdentity.mockRejectedValueOnce(new Error('invalid signature'));
    expect((await app.get(callback)).status).toBe(400);
    expect((await (await app.get('/api/gia-su/status')).json()).connected).toBe(false);
  });
});

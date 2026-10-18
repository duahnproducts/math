import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { taoKetNoiChatGPT } from '../scripts/chatgpt-auth.ts';

const cleanup: (() => Promise<unknown>)[] = [];
afterEach(async () => { vi.restoreAllMocks(); for (const fn of cleanup.splice(0).reverse()) await fn(); });
async function setup(expires = 3600, scope = 'resource.invoke chatgpt.tokens.use.direct') {
  const root = join(process.cwd(), '.hochanh-local'); await mkdir(root, { recursive: true });
  const dir = await mkdtemp(join(root, 'auth-test-')); cleanup.push(() => rm(dir, { force: true, recursive: true }));
  const request = vi.fn(async (url: unknown, _init?: RequestInit) => String(url).endsWith('/models')
    ? Response.json({ models: [{ slug: 'allowed', display_name: 'Mô hình được cấp', visibility: 'list' }, { slug: 'hidden', visibility: 'hide' }] })
    : Response.json({ access_token: 'private-access', refresh_token: 'private-refresh', id_token: 'private-id', expires_in: expires, scope }));
  const verifyIdentity = vi.fn(async () => ({ sub: 'account-one', email: 'learner@example.com' }));
  const opts = { origin: 'http://127.0.0.1:4325', stateDir: dir, request: request as typeof fetch, verifyIdentity };
  const auth = await taoKetNoiChatGPT(opts);
  const start = (browser = 'browser-one', returnTo: unknown = '/math/dai-so/') => {
    const url = new URL(auth.login(browser, returnTo));
    const callback = new URL(`${opts.origin}/auth/callback`); callback.search = new URLSearchParams({ code: 'one-time-code', client_id: 'oaiapp_issued', state: url.searchParams.get('state')! }).toString();
    return { url, callback };
  };
  return { auth, start, opts, dir, request, verifyIdentity };
}
describe('kết nối ChatGPT', () => {
  it('logout trong lúc callback đang xác minh không khôi phục lại token', async () => {
    const app = await setup();
    let arrived!: () => void, release!: () => void;
    const verifying = new Promise<void>(resolve => { arrived = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    app.verifyIdentity.mockImplementationOnce(async () => { arrived(); await gate; return { sub: 'account-one', email: 'learner@example.com' }; });
    const result = app.auth.callback(app.start().callback, 'browser-one');
    const rejected = expect(result).rejects.toThrow('Kết nối đã ngắt');
    await verifying; await app.auth.logout('browser-one'); release(); await rejected;
    expect(app.auth.status('browser-one').connected).toBe(false);
  });
  it('PKCE, callback, mô hình và đăng ký dùng lại; không ghi token xuống đĩa', async () => {
    const app = await setup(), { url, callback } = app.start();
    expect(url.origin).toBe('https://auth.openai.com'); expect(url.searchParams.get('client_id')).toBe('dynamic_agent_client');
    expect(url.searchParams.get('scope')).toContain('chatgpt.tokens.use.direct');
    expect(await app.auth.callback(callback, 'browser-one')).toBe('/math/dai-so/?gia-su=connected');
    const params = app.request.mock.calls[0][1]?.body as URLSearchParams;
    expect(params.get('client_id')).toBe('oaiapp_issued'); expect(params.get('resource')).toBe('https://api.openai.com/v1');
    expect(params.get('redirect_uri')).toBe('http://127.0.0.1:4325/auth/callback');
    expect(createHash('sha256').update(params.get('code_verifier')!).digest('base64url')).toBe(url.searchParams.get('code_challenge'));
    expect(app.verifyIdentity).toHaveBeenCalledWith('private-id', 'oaiapp_issued', url.searchParams.get('nonce'));
    expect(app.auth.status('browser-one')).toMatchObject({ connected: true, email: 'learner@example.com', mode: 'chatgpt' });
    expect(app.auth.status('browser-two').connected).toBe(false);
    expect(await app.auth.models('browser-one')).toEqual([{ id: 'allowed', name: 'Mô hình được cấp' }]);
    const saved = await readFile(join(app.dir, 'chatgpt-registration.json'), 'utf8'); expect(saved).not.toContain('private-'); expect(saved).not.toContain('learner@');
    const restarted = await taoKetNoiChatGPT(app.opts), reauth = new URL(restarted.login('new-browser', '/math/'));
    expect(reauth.searchParams.get('client_id')).toBe('oaiapp_issued');
    expect(reauth.searchParams.get('ext_agent_host_id')).toBe(url.searchParams.get('ext_agent_host_id'));
    expect(restarted.status('new-browser').connected).toBe(false);
  });
  it('chặn sai state, sai cookie, replay và đường dẫn quay về ngoài web', async () => {
    const app = await setup(), { callback } = app.start('browser-one', 'https://evil.example');
    const invalid = new URL(callback); invalid.searchParams.set('state', 'wrong');
    await expect(app.auth.callback(invalid, 'browser-one')).rejects.toThrow();
    await expect(app.auth.callback(callback, 'browser-two')).rejects.toThrow();
    expect(await app.auth.callback(callback, 'browser-one')).toBe('/math/?gia-su=connected');
    await expect(app.auth.callback(callback, 'browser-one')).rejects.toThrow();
  });
  it('từ chối cấp quyền không gọi token endpoint; state hết hạn bị loại', async () => {
    const app = await setup(), denied = app.start(); denied.callback.searchParams.set('error', 'access_denied');
    expect(await app.auth.callback(denied.callback, 'browser-one')).toContain('gia-su=denied'); expect(app.request).not.toHaveBeenCalled();
    const expired = app.start(); const now = Date.now(); vi.spyOn(Date, 'now').mockReturnValue(now + 600001);
    await expect(app.auth.callback(expired.callback, 'browser-one')).rejects.toThrow();
  });
  it('thiếu scope hoặc danh tính không hợp lệ không bật quyền AI', async () => {
    const app = await setup(3600, 'openid email'); const { callback } = app.start();
    await expect(app.auth.callback(callback, 'browser-one')).rejects.toThrow('chưa cấp quyền'); expect(app.auth.status('browser-one').connected).toBe(false);
    const other = await setup(); other.verifyIdentity.mockRejectedValueOnce(new Error('invalid signature'));
    await expect(other.auth.callback(other.start().callback, 'browser-one')).rejects.toThrow(); expect(other.auth.status('browser-one').connected).toBe(false);
  });
  it('refresh chỉ một lần khi hai yêu cầu đồng thời và logout xóa quyền cục bộ', async () => {
    const app = await setup(1); await app.auth.callback(app.start().callback, 'browser-one');
    await Promise.all([app.auth.bearer('browser-one'), app.auth.bearer('browser-one')]);
    const grants = app.request.mock.calls.map(call => (call[1]?.body as URLSearchParams)?.get('grant_type'));
    expect(grants).toEqual(['authorization_code', 'refresh_token']);
    await app.auth.logout('browser-one'); expect(app.auth.status('browser-one').connected).toBe(false);
    await expect(app.auth.bearer('browser-one')).rejects.toThrow();
    expect(new URL(app.auth.login('browser-one', '/math/')).searchParams.get('client_id')).toBe('dynamic_agent_client');
  });
  it('refresh không trả scope thì giữ quyền đã xác minh của grant hiện tại', async () => {
    const app = await setup(1); await app.auth.callback(app.start().callback, 'browser-one');
    app.request.mockImplementationOnce(async () => Response.json({ access_token: 'renewed-token', expires_in: 3600 }));
    expect(await app.auth.bearer('browser-one')).toBe('renewed-token');
  });
});

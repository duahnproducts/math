import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ISSUER = 'https://auth.openai.com', RESOURCE = 'https://api.openai.com/v1';
const SCOPES = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const random = () => randomBytes(32).toString('base64url');
const jwks = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));
interface Registration { host: string; clientId?: string; subject?: string }
interface Credentials { access_token: string; refresh_token?: string; scope: string; expires_in: number; email: string; expiresAt: number; clientId: string }
interface Pending { browser: string; nonce: string; verifier: string; expires: number; returnTo: string; generation: number; clientId?: string; subject?: string }
export interface AuthOptions {
  origin: string; stateDir: string; request?: typeof fetch;
  verifyIdentity?: (token: string, clientId: string, nonce: string) => Promise<{ sub: string; email?: string }>;
}

/** Đăng ký không chứa token; access/refresh/ID token chỉ tồn tại trong RAM. */
export async function taoKetNoiChatGPT(options: AuthOptions) {
  const request = options.request ?? fetch;
  await mkdir(options.stateDir, { recursive: true, mode: 0o700 });
  const file = join(options.stateDir, 'chatgpt-registration.json');
  let registration: Registration;
  try { registration = JSON.parse(await readFile(file, 'utf8')); }
  catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; registration = { host: `urn:uuid:${randomUUID()}` }; }
  let saveQueue = Promise.resolve();
  function save() {
    const snapshot = JSON.stringify(registration);
    const next = saveQueue.then(async () => { await writeFile(`${file}.tmp`, snapshot, { mode: 0o600 }); await rename(`${file}.tmp`, file); });
    saveQueue = next.catch(() => {}); return next;
  }
  await save();
  const pending = new Map<string, Pending>(), sessions = new Map<string, Credentials>();
  const generations = new Map<string, number>();
  const refreshing = new Map<string, Promise<string>>();
  const verifyIdentity = options.verifyIdentity ?? (async (token, clientId, nonce) => {
    const { payload } = await jwtVerify(token, jwks, { issuer: ISSUER, audience: clientId, requiredClaims: ['sub', 'exp', 'iat'], algorithms: ['RS256'], clockTolerance: 5 });
    if (!payload.sub || payload.nonce !== nonce) throw new Error('Không xác minh được tài khoản ChatGPT.');
    return { sub: payload.sub, email: typeof payload.email === 'string' ? payload.email : undefined };
  });
  async function tokenRequest(params: Record<string, string>, retainedScope?: string) {
    const res = await request(`${ISSUER}/api/accounts/oauth/token`, { method: 'POST', body: new URLSearchParams(params), signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error('Kết nối ChatGPT hết hạn. Hãy đăng nhập lại.');
    const value = await res.json();
    if (value.scope === undefined && retainedScope) value.scope = retainedScope;
    if (typeof value.access_token !== 'string' || !value.access_token || !Number.isFinite(value.expires_in) || value.expires_in <= 0 || typeof value.scope !== 'string' || !['resource.invoke', 'chatgpt.tokens.use.direct'].every(scope => value.scope.split(' ').includes(scope))) throw new Error('Tài khoản chưa cấp quyền dùng gói ChatGPT cho gia sư.');
    return value;
  }
  async function bearer(browser: string): Promise<string> {
    const current = sessions.get(browser);
    if (!current) throw new Error('Hãy đăng nhập ChatGPT để hỏi gia sư.');
    if (current.expiresAt > Date.now() + 60000) return current.access_token;
    const active = refreshing.get(browser); if (active) return active;
    const refresh = (async () => {
      try {
        if (!current.refresh_token) throw new Error('Hãy đăng nhập lại ChatGPT.');
        const next = await tokenRequest({ grant_type: 'refresh_token', client_id: current.clientId, refresh_token: current.refresh_token, resource: RESOURCE }, current.scope);
        if (sessions.get(browser) !== current) throw new Error('Kết nối đã ngắt.');
        sessions.set(browser, { ...next, clientId: current.clientId, email: current.email, refresh_token: next.refresh_token ?? current.refresh_token, expiresAt: Date.now() + next.expires_in * 1000 });
        return next.access_token as string;
      } catch (e) { sessions.delete(browser); throw e; }
      finally { refreshing.delete(browser); }
    })();
    refreshing.set(browser, refresh); return refresh;
  }
  return {
    status(browser: string) { const s = sessions.get(browser); return { available: true, connected: !!s, mode: 'chatgpt', email: s?.email }; },
    login(browser: string, returnTo: unknown) {
      for (const [state, attempt] of pending) if (attempt.expires < Date.now() || attempt.browser === browser) pending.delete(state);
      if (pending.size >= 20) throw new Error('Có quá nhiều lần đăng nhập đang chờ. Hãy thử lại sau.');
      const generation = (generations.get(browser) ?? 0) + 1; generations.set(browser, generation);
      const state = random(), attempt: Pending = { browser, generation, nonce: random(), verifier: random(), expires: Date.now() + 600000,
        returnTo: typeof returnTo === 'string' && /^\/math\/[a-zA-Z0-9/_-]*$/.test(returnTo) ? returnTo : '/math/', clientId: registration.clientId, subject: registration.subject };
      pending.set(state, attempt);
      const url = new URL(`${ISSUER}/api/accounts/authorize`);
      url.search = new URLSearchParams({ client_id: attempt.clientId ?? 'dynamic_agent_client', ...(attempt.clientId ? {} : { agent_name_hint: 'Hochanh' }),
        ext_agent_host_id: registration.host, response_type: 'code', redirect_uri: `${options.origin}/auth/callback`, scope: SCOPES, resource: RESOURCE,
        state, nonce: attempt.nonce, code_challenge_method: 'S256', code_challenge: createHash('sha256').update(attempt.verifier).digest('base64url') }).toString();
      return url.href;
    },
    async callback(url: URL, browser: string) {
      const state = url.searchParams.get('state') ?? '', p = pending.get(state);
      if (!p || p.browser !== browser || p.expires < Date.now() || generations.get(browser) !== p.generation) throw new Error('Lần đăng nhập không hợp lệ hoặc hết hạn.');
      pending.delete(state);
      if (url.searchParams.has('error')) return `${p.returnTo}?gia-su=denied`;
      const clientId = url.searchParams.get('client_id') ?? p.clientId, code = url.searchParams.get('code');
      if (!clientId || clientId === 'dynamic_agent_client' || (p.clientId && p.clientId !== clientId) || !code) throw new Error('Đăng ký ChatGPT chưa hoàn tất.');
      // Giữ issued client ID ngay cả khi code hết hạn; danh tính chỉ tin sau khi xác minh JWT.
      if (!p.clientId) { registration = { host: registration.host, clientId }; await save(); }
      const next = await tokenRequest({ grant_type: 'authorization_code', client_id: clientId, code, code_verifier: p.verifier, redirect_uri: `${options.origin}/auth/callback`, resource: RESOURCE });
      if (typeof next.id_token !== 'string') throw new Error('Thiếu xác minh danh tính.');
      const identity = await verifyIdentity(next.id_token, clientId, p.nonce);
      if (p.subject && p.subject !== identity.sub) throw new Error('Tài khoản khác đăng ký trước. Ngắt kết nối để đổi tài khoản.');
      registration = { host: registration.host, clientId, subject: identity.sub }; await save();
      if (generations.get(browser) !== p.generation) throw new Error('Kết nối đã ngắt. Hãy đăng nhập lại.');
      sessions.set(browser, { clientId, access_token: next.access_token, refresh_token: next.refresh_token, scope: next.scope, expires_in: next.expires_in, email: identity.email ?? '', expiresAt: Date.now() + next.expires_in * 1000 });
      return `${p.returnTo}?gia-su=connected`;
    },
    async logout(browser: string) {
      generations.set(browser, (generations.get(browser) ?? 0) + 1);
      sessions.delete(browser);
      for (const [state, attempt] of pending) if (attempt.browser === browser) pending.delete(state);
      // Các phiên trình duyệt khác vẫn dùng đăng ký hiện tại; không đổi tài khoản giữa phiên.
      if (!sessions.size) { registration = { host: registration.host }; await save(); }
    },
    bearer,
    async models(browser: string) {
      const res = await request(`${RESOURCE}/models`, { headers: { Authorization: `Bearer ${await bearer(browser)}` }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) { if (res.status === 401) sessions.delete(browser); throw new Error('Chưa tải được mô hình. Hãy kiểm tra kết nối ChatGPT.'); }
      const data = await res.json();
      return (data.models ?? []).filter((m: { visibility: string; slug: unknown; display_name: unknown }) => m.visibility === 'list' && typeof m.slug === 'string' && typeof m.display_name === 'string').map((m: { slug: string; display_name: string }) => ({ id: m.slug, name: m.display_name }));
    },
  };
}

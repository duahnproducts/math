// Máy chủ cá nhân, chỉ lắng nghe loopback. Không dùng phiên đăng nhập của Codex.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { kiemTraCauHoi, LOI_NHAC_GIA_SU } from '../src/lib/gia-su.ts';

const ISSUER = 'https://auth.openai.com';
const RESOURCE = 'https://api.openai.com/v1';
const SCOPES = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const random = () => randomBytes(32).toString('base64url');
const jwks = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));
interface Account { clientId: string; subject: string; email: string; idToken: string }
interface Tokens { access_token: string; refresh_token?: string; expires_in: number; scope: string }
interface Options {
  port?: number; root?: string; stateDir?: string; request?: typeof fetch;
  verifyIdentity?: (token: string, clientId: string, nonce: string) => Promise<{ sub: string; email?: string }>;
}

export async function taoMayChu(options: Options = {}) {
  const port = options.port ?? 4325;
  const origin = `http://127.0.0.1:${port}`;
  const root = resolve(options.root ?? fileURLToPath(new URL('../dist', import.meta.url)));
  const stateDir = options.stateDir ?? fileURLToPath(new URL('../.hochanh-local', import.meta.url));
  const request = options.request ?? fetch;
  // Chỉ lưu host ID và đăng ký (không lưu access/refresh token xuống đĩa).
  await mkdir(stateDir, { recursive: true, mode: 0o700 });
  const registration = resolve(stateDir, 'registration.json');
  let saved: { host: string; account?: Account };
  try { saved = JSON.parse(await readFile(registration, 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; saved = { host: `urn:uuid:${randomUUID()}` }; }
  const persist = async () => {
    await writeFile(`${registration}.tmp`, JSON.stringify(saved), { mode: 0o600 });
    await rename(`${registration}.tmp`, registration);
  };
  await persist();
  let tokens: Tokens | undefined, expiresAt = 0, browserSession = '', busy = false;
  let pending: { state: string; nonce: string; verifier: string; browser: string; expires: number; clientId?: string; subject?: string; returnTo: string } | undefined;
  async function readBody(req: IncomingMessage, limit: number) {
    const chunks: Buffer[] = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > limit) throw new Error('Câu hỏi quá dài.'); chunks.push(Buffer.from(chunk)); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  const cookie = (req: IncomingMessage) => /(?:^|;\s*)hochanh-session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1];
  const verifyIdentity = options.verifyIdentity ?? (async (token, clientId, nonce) => {
    const { payload } = await jwtVerify(token, jwks, { issuer: ISSUER, audience: clientId, requiredClaims: ['sub', 'exp', 'iat'], algorithms: ['RS256'], clockTolerance: 5 });
    if (!payload.sub || payload.nonce !== nonce) throw new Error('Không xác minh được đăng nhập.');
    return { sub: payload.sub, email: typeof payload.email === 'string' ? payload.email : undefined };
  });
  async function tokenRequest(params: Record<string, string>): Promise<Tokens & { id_token?: string }> {
    const res = await request(`${ISSUER}/api/accounts/oauth/token`, { method: 'POST', body: new URLSearchParams(params), signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error('Đăng nhập hết hạn hoặc không được cấp quyền. Hãy kết nối lại ChatGPT.');
    const value = await res.json();
    if (typeof value.access_token !== 'string' || !Number.isFinite(value.expires_in) || value.expires_in <= 0 || typeof value.scope !== 'string' || !value.scope.split(' ').includes('chatgpt.tokens.use.direct') || !value.scope.split(' ').includes('resource.invoke')) throw new Error('Tài khoản chưa cấp quyền dùng gói ChatGPT cho ứng dụng.');
    return value;
  }
  async function bearer() {
    if (!tokens) throw new Error('Hãy đăng nhập ChatGPT trước.');
    if (Date.now() >= expiresAt - 60000) {
      if (!tokens.refresh_token || !saved.account) { tokens = undefined; throw new Error('Hãy kết nối lại ChatGPT.'); }
      try {
        const next = await tokenRequest({ grant_type: 'refresh_token', client_id: saved.account.clientId, refresh_token: tokens.refresh_token, resource: RESOURCE });
        tokens = { ...next, refresh_token: next.refresh_token ?? tokens.refresh_token }; expiresAt = Date.now() + next.expires_in * 1000;
      } catch (error) { tokens = undefined; throw error; }
    }
    return tokens.access_token;
  }
  const headers = (res: ServerResponse) => { res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer'); };
  const json = (res: ServerResponse, status: number, value: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };
  const redirect = (res: ServerResponse, path: string) => { res.writeHead(303, { Location: path }); res.end(); };
  const server = createServer(async (req, res) => {
    headers(res);
    try {
      // Host check chống DNS rebinding; POST cùng origin + custom header chống CSRF.
      if (req.headers.host !== `127.0.0.1:${port}`) return json(res, 403, { error: 'Chỉ dùng địa chỉ 127.0.0.1 của máy này.' });
      const url = new URL(req.url ?? '/', origin), path = url.pathname;
      if (path.startsWith('/api/gia-su/') && (req.headers.origin && req.headers.origin !== origin)) return json(res, 403, { error: 'Nguồn yêu cầu không hợp lệ.' });
      if (req.method === 'POST' && (req.headers.origin !== origin || req.headers['x-hochanh'] !== '1' || !browserSession || cookie(req) !== browserSession)) return json(res, 403, { error: 'Phiên không hợp lệ. Hãy tải lại trang.' });
      if (path === '/api/gia-su/status' && req.method === 'GET') {
        if (!browserSession || cookie(req) !== browserSession) {
          // Không cho một trình duyệt mới kế thừa quyền đang hoạt động.
          return json(res, 200, { available: true, connected: false });
        }
        return json(res, 200, { available: true, connected: !!tokens, email: tokens ? saved.account?.email : undefined });
      }
      if (path === '/api/gia-su/login' && req.method === 'POST') {
        const body = await readBody(req, 2000);
        const returnTo = typeof body.returnTo === 'string' && /^\/math\/[a-zA-Z0-9/_-]*$/.test(body.returnTo) ? body.returnTo : '/math/';
        pending = { state: random(), nonce: random(), verifier: random(), browser: browserSession, expires: Date.now() + 600000, clientId: saved.account?.clientId, subject: saved.account?.subject, returnTo };
        const auth = new URL(`${ISSUER}/api/accounts/authorize`);
        auth.search = new URLSearchParams({ client_id: pending.clientId ?? 'dynamic_agent_client', ext_agent_host_id: saved.host,
          ...(pending.clientId ? { id_token_hint: saved.account!.idToken } : { agent_name_hint: 'Hochanh' }),
          response_type: 'code', redirect_uri: `${origin}/auth/callback`, scope: SCOPES, resource: RESOURCE,
          state: pending.state, nonce: pending.nonce, code_challenge_method: 'S256', code_challenge: createHash('sha256').update(pending.verifier).digest('base64url') }).toString();
        return json(res, 200, { url: auth.href });
      }
      if (path === '/auth/callback' && req.method === 'GET') {
        const p = pending;
        if (!p || p.state !== url.searchParams.get('state') || p.browser !== cookie(req) || Date.now() > p.expires) return json(res, 400, { error: 'Lần đăng nhập không hợp lệ hoặc hết hạn. Hãy bắt đầu lại.' });
        pending = undefined;
        if (url.searchParams.has('error')) return redirect(res, `${p.returnTo}?gia-su=denied`);
        const clientId = url.searchParams.get('client_id') ?? p.clientId;
        if (!clientId || clientId === 'dynamic_agent_client' || (p.clientId && clientId !== p.clientId) || !url.searchParams.get('code')) throw new Error('Đăng ký ChatGPT chưa hoàn tất.');
        const next = await tokenRequest({ grant_type: 'authorization_code', client_id: clientId, code: url.searchParams.get('code')!, code_verifier: p.verifier, redirect_uri: `${origin}/auth/callback`, resource: RESOURCE });
        if (!next.id_token) throw new Error('Thiếu xác minh tài khoản.');
        const identity = await verifyIdentity(next.id_token, clientId, p.nonce);
        if (p.subject && identity.sub !== p.subject) throw new Error('Tài khoản không khớp đăng ký trước. Ngắt kết nối rồi đăng ký lại để đổi tài khoản.');
        saved.account = { clientId, subject: identity.sub, email: identity.email ?? '', idToken: next.id_token };
        await persist(); tokens = next; expiresAt = Date.now() + next.expires_in * 1000;
        return redirect(res, `${p.returnTo}?gia-su=connected`);
      }
      if (path === '/api/gia-su/logout' && req.method === 'POST') {
        if (busy) return json(res, 409, { error: 'Hãy dừng câu trả lời trước khi ngắt kết nối.' });
        tokens = undefined; pending = undefined; delete saved.account; await persist();
        return json(res, 200, { ok: true });
      }
      if (path === '/api/gia-su/models' && req.method === 'GET') {
        if (!browserSession || cookie(req) !== browserSession) return json(res, 401, { error: 'Hãy đăng nhập trước.' });
        const response = await request(`${RESOURCE}/models`, { headers: { Authorization: `Bearer ${await bearer()}` }, signal: AbortSignal.timeout(30000) });
        if (!response.ok) return json(res, response.status === 401 ? 401 : 502, { error: 'Không tải được mô hình. Hãy thử kết nối lại ChatGPT.' });
        const data = await response.json();
        const models = (data.models ?? []).filter((m: { visibility: string }) => m.visibility === 'list').map((m: { slug: string; display_name: string }) => ({ id: m.slug, name: m.display_name }));
        return json(res, 200, { models });
      }
      if (path === '/api/gia-su/chat' && req.method === 'POST') {
        if (busy) return json(res, 429, { error: 'Gia sư đang trả lời một câu hỏi. Hãy đợi hoặc dừng trước.' });
        let input; try { input = kiemTraCauHoi(await readBody(req, 160000)); } catch (e) { return json(res, 400, { error: (e as Error).message }); }
        busy = true;
        const abort = new AbortController(); const timer = setTimeout(() => abort.abort(), 120000);
        res.on('close', () => abort.abort());
        try {
          const upstream = await request(`${RESOURCE}/responses`, { method: 'POST', signal: abort.signal,
            headers: { Authorization: `Bearer ${await bearer()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: input.model, instructions: LOI_NHAC_GIA_SU, store: false, stream: true,
              input: [{ role: 'user', content: `Ngữ cảnh trang học (JSON):\n${JSON.stringify(input.context)}` }, ...input.messages] }) });
          if (!upstream.ok || !upstream.body) return json(res, upstream.status === 429 ? 429 : upstream.status === 401 ? 401 : 502, { error: upstream.status === 429 ? 'Đã chạm hạn mức ChatGPT. Hãy thử lại sau.' : 'ChatGPT chưa trả lời được. Kiểm tra quyền tài khoản và mô hình rồi thử lại.' });
          res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8' });
          for await (const chunk of upstream.body) { if (res.destroyed) break; if (!res.write(chunk)) await new Promise<void>(resolve => { res.once('drain', resolve); res.once('close', resolve); }); }
          res.end();
        } finally { busy = false; clearTimeout(timer); }
        return;
      }
      if (path.startsWith('/api/') || req.method !== 'GET') return json(res, 404, { error: 'Không có dịch vụ này.' });
      if (path === '/') return redirect(res, '/math/');
      if (!path.startsWith('/math/')) return json(res, 404, { error: 'Không tìm thấy trang.' });
      const relative = decodeURIComponent(path.slice('/math/'.length));
      const file = resolve(root, !relative || relative.endsWith('/') ? `${relative}index.html` : relative);
      if (!file.startsWith(`${root}${sep}`) || relative.split(/[\\/]/).some(p => p.startsWith('.'))) return json(res, 403, { error: 'Đường dẫn không hợp lệ.' });
      let data; try { data = await readFile(file); } catch { return json(res, 404, { error: 'Chưa có bản build. Chạy npm run build trước.' }); }
      if (!browserSession || cookie(req) !== browserSession) {
        // Một phiên trình duyệt duy nhất cho máy chủ cá nhân.
        browserSession = random(); tokens = undefined; pending = undefined;
        res.setHeader('Set-Cookie', `hochanh-session=${browserSession}; HttpOnly; SameSite=Lax; Path=/`);
      }
      const mime: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
      res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }); res.end(data);
    } catch (error) {
      if (res.headersSent) res.destroy();
      else json(res, 400, { error: error instanceof Error && !/fetch|JSON|token|jwt|signature|claim/i.test(error.message) ? error.message : 'Không kết nối hoặc xác minh được ChatGPT. Hãy đăng nhập lại.' });
    }
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.HOCHANH_CHAT_PORT ?? 4325);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Cổng không hợp lệ.');
  const server = await taoMayChu({ port });
  server.listen(port, '127.0.0.1', () => console.log(`Hochanh + Gia sư: http://127.0.0.1:${port}/math/`));
}

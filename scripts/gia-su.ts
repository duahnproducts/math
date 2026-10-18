// Máy chủ gia sư riêng: khóa API chỉ nằm ở máy chủ, người học không đăng nhập.
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kiemTraCauHoi, LOI_NHAC_GIA_SU } from '../src/lib/gia-su.ts';

interface Options { port?: number; root?: string; request?: typeof fetch; apiKey?: string; model?: string }
export async function taoMayChu(options: Options = {}) {
  const port = options.port ?? 4325, origin = `http://127.0.0.1:${port}`;
  const root = resolve(options.root ?? fileURLToPath(new URL('../dist', import.meta.url)));
  const request = options.request ?? fetch;
  const apiKey = (options.apiKey ?? process.env.OPENAI_API_KEY ?? '').trim();
  const model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-6.1-sol';
  const sessions = new Map<string, number>();
  let busy = false;
  const recent: number[] = [];
  const cookie = (req: IncomingMessage) => /(?:^|;\s*)hochanh-session=([^;]+)/.exec(req.headers.cookie ?? '')?.[1] ?? '';
  const validSession = (req: IncomingMessage) => (sessions.get(cookie(req)) ?? 0) > Date.now();
  const json = (res: ServerResponse, status: number, value: unknown) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };
  const redirect = (res: ServerResponse, path: string) => { res.writeHead(303, { Location: path }); res.end(); };
  async function readBody(req: IncomingMessage) {
    const chunks: Buffer[] = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 160000) throw new Error('Câu hỏi quá dài.'); chunks.push(Buffer.from(chunk)); }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  return createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer');
    try {
      if (req.headers.host !== `127.0.0.1:${port}`) return json(res, 403, { error: 'Chỉ dùng địa chỉ 127.0.0.1 của máy này.' });
      const path = new URL(req.url ?? '/', origin).pathname;
      if (path.startsWith('/api/') && req.headers.origin && req.headers.origin !== origin) return json(res, 403, { error: 'Nguồn yêu cầu không hợp lệ.' });
      if (req.method === 'POST' && (req.headers.origin !== origin || req.headers['x-hochanh'] !== '1' || !validSession(req))) return json(res, 403, { error: 'Phiên đã hết hạn. Hãy tải lại trang.' });
      if (path === '/api/gia-su/status' && req.method === 'GET') return json(res, 200, { available: true, connected: !!apiKey, mode: 'api' });
      if (path === '/api/gia-su/models' && req.method === 'GET') return json(res, 200, { models: apiKey ? [{ id: model, name: model }] : [] });
      if (path === '/api/gia-su/chat' && req.method === 'POST') {
        if (!apiKey) return json(res, 503, { error: 'Gia sư chưa được cấu hình. Chủ ứng dụng cần bật kết nối AI.' });
        if (busy) return json(res, 429, { error: 'Gia sư đang trả lời một câu hỏi. Hãy đợi hoặc dừng trước.' });
        while (recent.length && recent[0] < Date.now() - 60000) recent.shift();
        if (recent.length >= 10) return json(res, 429, { error: 'Bạn đã hỏi nhiều câu liên tiếp. Hãy đợi một phút rồi thử lại.' });
        let input; try { input = kiemTraCauHoi(await readBody(req)); } catch (e) { return json(res, 400, { error: (e as Error).message }); }
        if (input.model !== model) return json(res, 400, { error: 'Mô hình không được cấu hình cho gia sư.' });
        busy = true; recent.push(Date.now());
        const abort = new AbortController(), timer = setTimeout(() => abort.abort(), 120000);
        res.on('close', () => abort.abort());
        try {
          const upstream = await request('https://api.openai.com/v1/responses', { method: 'POST', signal: abort.signal,
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, instructions: LOI_NHAC_GIA_SU, store: false, stream: true, max_output_tokens: 4096,
              input: [{ role: 'user', content: `Ngữ cảnh trang học (JSON):\n${JSON.stringify(input.context)}` }, ...input.messages] }) });
          if (!upstream.ok || !upstream.body) return json(res, upstream.status === 429 ? 429 : 502, { error: upstream.status === 429 ? 'AI đã chạm hạn mức sử dụng. Hãy thử lại sau.' : 'Chưa kết nối được AI. Chủ ứng dụng cần kiểm tra cấu hình dịch vụ.' });
          res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8' });
          for await (const chunk of upstream.body) { if (res.destroyed) break; if (!res.write(chunk)) await new Promise<void>(done => { res.once('drain', done); res.once('close', done); }); }
          res.end();
        } finally { busy = false; clearTimeout(timer); }
        return;
      }
      if (path.startsWith('/api/') || path.startsWith('/auth/') || req.method !== 'GET') return json(res, 404, { error: 'Không có dịch vụ này.' });
      if (path === '/') return redirect(res, '/math/');
      if (!path.startsWith('/math/')) return json(res, 404, { error: 'Không tìm thấy trang.' });
      const relative = decodeURIComponent(path.slice('/math/'.length));
      const file = resolve(root, !relative || relative.endsWith('/') ? `${relative}index.html` : relative);
      if (!file.startsWith(`${root}${sep}`) || relative.split(/[\\/]/).some(p => p.startsWith('.'))) return json(res, 403, { error: 'Đường dẫn không hợp lệ.' });
      let data; try { data = await readFile(file); } catch { return json(res, 404, { error: 'Chưa có bản build hoặc không tìm thấy trang.' }); }
      if (!validSession(req)) {
        for (const [id, expiry] of sessions) if (expiry <= Date.now()) sessions.delete(id);
        if (sessions.size >= 1000) sessions.delete(sessions.keys().next().value!);
        const id = randomBytes(32).toString('base64url'); sessions.set(id, Date.now() + 86400000);
        res.setHeader('Set-Cookie', `hochanh-session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);
      }
      const mime: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
      res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }); res.end(data);
    } catch { if (res.headersSent) res.destroy(); else json(res, 502, { error: 'Không kết nối được AI. Hãy thử lại sau.' }); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.HOCHANH_CHAT_PORT ?? 4325);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Cổng không hợp lệ.');
  const server = await taoMayChu({ port });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Hochanh + Gia sư: http://127.0.0.1:${port}/math/`);
    if (!process.env.OPENAI_API_KEY) console.log('Chưa cấu hình OPENAI_API_KEY trong .hochanh-local/.env.');
  });
}

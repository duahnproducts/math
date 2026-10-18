import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { docTraLoi, type NguCanh, type TinNhan } from '../lib/gia-su';
import '../styles/gia-su.css';

const Markdown = lazy(() => import('./GiaSuMarkdown'));

export default function GiaSu({ tieuDe }: { tieuDe: string }) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false), [available, setAvailable] = useState(false), [connected, setConnected] = useState(false);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]), [model, setModel] = useState('');
  const [messages, setMessages] = useState<TinNhan[]>([]), [draft, setDraft] = useState(''), [quote, setQuote] = useState('');
  const [busy, setBusy] = useState(false), [partial, setPartial] = useState(''), [error, setError] = useState('');
  const [includePage, setIncludePage] = useState(true), [email, setEmail] = useState('');
  const dialog = useRef<HTMLDialogElement>(null), launch = useRef<HTMLButtonElement>(null), input = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null), bottom = useRef<HTMLDivElement>(null);
  const api = async (path: string, body?: unknown) => {
    const response = await fetch(`/api/gia-su/${path}`, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Hochanh': '1' }, body: JSON.stringify(body) });
    if (!(response.headers.get('content-type') ?? '').includes('application/json')) throw new Error('Gia sư cần bản chạy trên máy.');
    const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Chưa kết nối được gia sư.'); return data;
  };
  async function status() {
    try {
      const data = await api('status'); setAvailable(data.available === true); setConnected(data.connected === true); setEmail(data.email ?? '');
      if (data.connected) {
        try {
          const list = await api('models'); setModels(list.models); setModel(current => list.models.some((m: { id: string }) => m.id === current) ? current : list.models[0]?.id ?? '');
          if (!list.models.length) setError('Tài khoản chưa có mô hình khả dụng. Kiểm tra quyền dùng gói ChatGPT.');
        } catch (e) { setError((e as Error).message); }
      }
    } catch (e) { setAvailable(false); setConnected(false); setError((e as Error).message); }
  }
  useEffect(() => {
    setReady(true);
    const result = new URLSearchParams(location.search).get('gia-su');
    if (result) {
      setOpen(true);
      if (result === 'denied') setError('Bạn chưa cấp quyền ChatGPT. Có thể kết nối lại khi sẵn sàng.');
      try { const saved = JSON.parse(sessionStorage.getItem('hochanh-chat-draft') ?? 'null'); if (saved?.path === location.pathname) { setDraft(saved.draft); setQuote(saved.quote); } sessionStorage.removeItem('hochanh-chat-draft'); } catch { /* Trình duyệt có thể chặn lưu trữ. */ }
      const url = new URL(location.href); url.searchParams.delete('gia-su'); history.replaceState(null, '', url);
    }
    return () => abort.current?.abort();
  }, []);
  useEffect(() => {
    if (open) { dialog.current?.showModal(); void status(); input.current?.focus(); }
    else dialog.current?.close();
  }, [open]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages, partial, error]);
  function close() { abort.current?.abort(); dialog.current?.close(); setOpen(false); launch.current?.focus(); }
  function capture() {
    const selection = window.getSelection();
    const main = document.getElementById('noi-dung');
    if (selection?.anchorNode && main?.contains(selection.anchorNode) && selection.focusNode && main.contains(selection.focusNode)) setQuote(selection.toString().trim().slice(0, 3000));
    setOpen(true);
  }
  function context(): NguCanh {
    const main = document.getElementById('noi-dung')?.cloneNode(true) as HTMLElement | undefined;
    // Không tự gửi lời giải/gợi ý chưa mở hoặc nội dung điều hướng.
    main?.querySelectorAll('details:not([open]), footer, nav, script, style, .muc-luc-gon').forEach(node => node.remove());
    main?.querySelectorAll('.katex').forEach(node => node.replaceWith(document.createTextNode(` $${node.querySelector('annotation')?.textContent ?? node.textContent}$ `)));
    return { tieuDe, duongDan: location.pathname, noiDung: includePage ? (main?.textContent ?? '').trim().slice(0, 18000) : '', trichDan: quote };
  }
  async function send() {
    if (!draft.trim() || busy || !connected || !model) return;
    const question = draft.trim(); setBusy(true); setError(''); setPartial('');
    const controller = new AbortController(); abort.current = controller;
    try {
      const next: TinNhan[] = [...messages, { role: 'user', content: question }];
      const response = await fetch('/api/gia-su/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Hochanh': '1' }, signal: controller.signal, body: JSON.stringify({ model, context: context(), messages: next }) });
      const answer = await docTraLoi(response, setPartial);
      setMessages([...next, { role: 'assistant', content: answer }]); setDraft('');
    } catch (e) { setError(controller.signal.aborted ? 'Đã dừng. Câu hỏi vẫn còn để bạn gửi lại.' : (e as Error).message); }
    finally { setPartial(''); setBusy(false); abort.current = null; }
  }
  return <>
    <button ref={launch} className="gia-su-launch nut" disabled={!ready} onClick={capture} aria-haspopup="dialog">Hỏi gia sư</button>
    {open && <dialog ref={dialog} className="gia-su-dialog" aria-labelledby="gia-su-title" onCancel={e => { e.preventDefault(); close(); }} onClose={() => setOpen(false)}>
      <header className="gia-su-header"><div><h2 id="gia-su-title">Gia sư Hochanh</h2><p>Gỡ từng chỗ khó, hiểu từng bước.</p></div><button className="nut nhe nho" onClick={close} aria-label="Đóng gia sư">Đóng</button></header>
      <div className="gia-su-body">
        <p className="gia-su-topic">Đang học: <strong>{tieuDe}</strong></p>
        {!available ? <div className="gia-su-notice"><p>Để dùng gói ChatGPT của bạn, mở bản Hochanh chạy trên máy:</p><code>npm run chat</code><p>Sau đó mở <strong>http://127.0.0.1:4325/math/</strong> và bấm Continue with ChatGPT. GitHub Pages chưa có máy chủ gia sư.</p><button className="nut nhe nho" onClick={() => void status()}>Kiểm tra kết nối</button></div>
          : !connected ? <div className="gia-su-notice"><p>Đăng nhập tài khoản ChatGPT và cấp quyền dùng gói của bạn cho Hochanh. Khả dụng tùy gói và quyền của tài khoản.</p><button className="nut" onClick={async () => { try { setError(''); try { sessionStorage.setItem('hochanh-chat-draft', JSON.stringify({ path: location.pathname, draft, quote })); } catch { /* Đăng nhập vẫn hoạt động khi không lưu được bản nháp. */ } const data = await api('login', { returnTo: location.pathname }); location.assign(data.url); } catch (e) { setError((e as Error).message); } }}>Continue with ChatGPT</button></div>
          : <div className="gia-su-account"><span>ChatGPT · {email || 'Đã kết nối'}</span><button className="nut nhe nho" disabled={busy} onClick={async () => { try { await api('logout', {}); setMessages([]); setConnected(false); setModels([]); setError(''); } catch (e) { setError((e as Error).message); } }}>Ngắt kết nối</button></div>}
        {connected && <label className="gia-su-model">Mô hình <select value={model} disabled={busy} onChange={e => setModel(e.target.value)}>{models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>}
        <div className="gia-su-messages" role="log" aria-label="Cuộc trò chuyện với gia sư" aria-live="polite" aria-busy={busy}>
          {!messages.length && !busy && <p className="gia-su-empty">Bạn vướng ở ý nào? Hãy hỏi bằng lời của mình, hoặc chọn một đoạn trong bài rồi bấm “Hỏi gia sư”.</p>}
          {messages.map((m, i) => <article key={i} className={`gia-su-message ${m.role}`}><strong>{m.role === 'user' ? 'Bạn' : 'Gia sư'}</strong>{m.role === 'user' ? <p>{m.content}</p> : <Suspense fallback={<p>{m.content}</p>}><Markdown text={m.content} /></Suspense>}</article>)}
          {busy && <article className="gia-su-message assistant"><strong>Gia sư</strong><Suspense fallback={<p>{partial || 'Đang suy nghĩ…'}</p>}><Markdown text={partial || 'Đang suy nghĩ…'} /></Suspense></article>}
        </div>
        {error && <p className="gia-su-error" role="alert">{error}</p>}<div ref={bottom} />
      </div>
      <form className="gia-su-compose" onSubmit={e => { e.preventDefault(); void send(); }}>
        {quote && <blockquote>{quote}<button type="button" className="nut nhe nho" disabled={busy} onClick={() => setQuote('')}>Bỏ đoạn trích</button></blockquote>}
        <label className="gia-su-share"><input type="checkbox" checked={includePage} disabled={busy} onChange={e => setIncludePage(e.target.checked)} /> Gửi nội dung bài đang đọc kèm câu hỏi</label>
        <label htmlFor="gia-su-question">Bạn chưa hiểu chỗ nào?</label>
        <textarea ref={input} id="gia-su-question" rows={3} maxLength={6000} value={draft} disabled={busy} onChange={e => setDraft(e.target.value)} placeholder="Ví dụ: Vì sao bước này được phép chia cho x?" />
        <div className="gia-su-actions"><button type="button" className="nut nhe nho" disabled={busy || !messages.length} onClick={() => { setMessages([]); setError(''); }}>Cuộc trò chuyện mới</button>{busy ? <button type="button" className="nut" onClick={() => abort.current?.abort()}>Dừng trả lời</button> : <button type="submit" className="nut" disabled={!connected || !model || !draft.trim() || messages.length >= 20}>Gửi câu hỏi</button>}</div>
        {messages.length >= 20 && <p>Đã đủ 10 lượt. Mở cuộc trò chuyện mới để hỏi tiếp.</p>}
        <small>Nội dung bạn gửi được chuyển đến OpenAI. Chat chỉ giữ trong lần mở trang này. Hãy đối chiếu lời giải với giáo trình.</small>
      </form>
    </dialog>}
  </>;
}

// Phần dùng chung của các trang "Tự tạo bài giảng": thẻ khoá API, hộp thông báo, tải file.
// Lô-gic nằm trong src/lib/tu-tao/ (có test); ở đây chỉ lo hiển thị.
import { useState, type ReactNode } from 'react';
import { cheKhoa, docKhoa, loiKhoa, luuKhoa, xoaKhoa } from '../../lib/tu-tao/khoa-api';
import { Icon } from './Icon';

export { Icon };

export function ThongBao({ loai, children }: { loai: 'loi' | 'ok' | 'ghi-chu'; children: ReactNode }) {
  return (
    <div className={`hop ${loai} thong-bao`} role={loai === 'loi' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

function khoTrinhDuyet(ten: 'sessionStorage' | 'localStorage'): Storage | undefined {
  try {
    return window[ten];
  } catch {
    return undefined;
  }
}

export interface KhoaApi {
  khoa: string | null;
  nho: boolean;
  luu(khoa: string, nho: boolean): void;
  xoa(): void;
}

export function useKhoaApi(): KhoaApi {
  const phien = khoTrinhDuyet('sessionStorage');
  const lau = khoTrinhDuyet('localStorage');
  const [daLuu, datDaLuu] = useState(() => docKhoa(phien, lau));
  return {
    khoa: daLuu?.khoa ?? null,
    nho: daLuu?.nho ?? false,
    luu(khoa, nho) {
      luuKhoa(khoa, nho, phien, lau);
      datDaLuu(docKhoa(phien, lau) ?? { khoa: khoa.trim(), nho });
    },
    xoa() {
      xoaKhoa(phien, lau);
      datDaLuu(null);
    },
  };
}

/** Thẻ nhập khoá API Claude — người học dùng khoá của chính mình. */
export function TheKhoaApi({ khoaApi }: { khoaApi: KhoaApi }) {
  const [nhap, datNhap] = useState('');
  const [nho, datNho] = useState(false);
  const [loi, datLoi] = useState<string | null>(null);
  const [sua, datSua] = useState(false);

  if (khoaApi.khoa && !sua) {
    return (
      <section className="card the-khoa" aria-labelledby="tieu-de-khoa">
        <h2 id="tieu-de-khoa">
          <Icon ten="key" /> Khoá API Claude
        </h2>
        <p>
          Đang dùng khoá <code data-khoa-che>{cheKhoa(khoaApi.khoa)}</code>
          {khoaApi.nho ? ', nhớ trên máy này.' : ', chỉ nhớ đến khi đóng thẻ.'}
        </p>
        <div className="hang-nut">
          <button type="button" className="nut nho" onClick={() => datSua(true)}>
            Đổi khoá
          </button>
          <button type="button" className="nut nhe nho" onClick={() => khoaApi.xoa()}>
            <Icon ten="trash" co={14} /> Xoá khoá khỏi máy
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card the-khoa" aria-labelledby="tieu-de-khoa">
      <h2 id="tieu-de-khoa">
        <Icon ten="key" /> Khoá API Claude
      </h2>
      <p>
        Bài giảng được viết bởi Claude qua khoá API <b>của bạn</b>: bạn trả phí theo lượt dùng cho Anthropic, web không
        thu gì. Tạo khoá ở <b>console.anthropic.com</b> → <i>API Keys</i>.
      </p>
      <form
        className="bieu-mau"
        onSubmit={(e) => {
          e.preventDefault();
          const l = loiKhoa(nhap);
          datLoi(l);
          if (l) return;
          khoaApi.luu(nhap, nho);
          datNhap('');
          datSua(false);
        }}
      >
        <label className="o">
          <span>Khoá API</span>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-…"
            value={nhap}
            onChange={(e) => datNhap(e.target.value)}
            aria-invalid={loi ? true : undefined}
            aria-describedby={loi ? 'loi-khoa' : undefined}
          />
        </label>
        {loi && (
          <p className="loi-o" id="loi-khoa">
            {loi}
          </p>
        )}
        <label className="o-chon">
          <input type="checkbox" checked={nho} onChange={(e) => datNho(e.target.checked)} /> Nhớ trên máy này (đừng
          chọn nếu là máy dùng chung)
        </label>
        <div className="hang-nut">
          <button type="submit" className="nut chinh nho">
            Lưu khoá
          </button>
          {khoaApi.khoa && (
            <button type="button" className="nut nhe nho" onClick={() => datSua(false)}>
              Huỷ
            </button>
          )}
        </div>
      </form>
      <p className="ghi">
        Khoá chỉ nằm trong trình duyệt này và chỉ được gửi tới api.anthropic.com. File PDF cũng đi thẳng từ máy bạn tới
        Anthropic, không qua máy chủ nào khác.
      </p>
    </section>
  );
}

/** Cho trình duyệt tải về một file chữ. */
export function taiXuong(tenFile: string, noiDung: string, loai = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([noiDung], { type: loai }));
  const a = document.createElement('a');
  a.href = url;
  a.download = tenFile;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "2026-09-29T08:00:00.000Z" → "29/09/2026". */
export function ngayVN(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

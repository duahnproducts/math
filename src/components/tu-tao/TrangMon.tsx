// Trang một môn tự tạo: các chương, trạng thái, nút tạo bài giảng từng chương,
// tiến độ và chi phí khi đang tạo; tải về / xoá môn.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocument } from 'pdf-lib';
import { taoDuongDan } from '../../lib/duong-dan';
import { dinhDangKhoang, dinhDangUSD, uocTinhChuong } from '../../lib/tu-tao/chi-phi';
import { TEN_MO_HINH, lapDanY, taoKetNoi, thongBaoLoi, vietBai } from '../../lib/tu-tao/goi-claude';
import { taoKho, tenFileXuat, xuatMon } from '../../lib/tu-tao/kho';
import { trangThaiChuong, type ChuongTuTao, type MonTuTao } from '../../lib/tu-tao/khung';
import { datLaiChuong, taoBaiGiangChuong, thayChuong, type TienDoTao } from '../../lib/tu-tao/quy-trinh';
import { loiDungLuong, loiKhoangTrang } from '../../lib/tu-tao/trang';
import { Icon, TheKhoaApi, ThongBao, ngayVN, taiXuong, useKhoaApi } from './chung';

const d = taoDuongDan(import.meta.env.BASE_URL);

type TrangThaiTrang = { loai: 'dang-mo' } | { loai: 'khong-thay' } | { loai: 'co'; mon: MonTuTao };

export default function TrangMon() {
  const kho = useMemo(() => taoKho(), []);
  const khoaApi = useKhoaApi();
  const [tt, datTt] = useState<TrangThaiTrang>({ loai: 'dang-mo' });
  const [coPdf, datCoPdf] = useState(false);
  const pdfDaMo = useRef<PDFDocument | null>(null);
  const [dangTao, datDangTao] = useState<number | null>(null);
  const [tienDo, datTienDo] = useState<TienDoTao | null>(null);
  const [chiPhi, datChiPhi] = useState(0);
  const [loi, datLoi] = useState<string | null>(null);
  const [xong, datXong] = useState<string | null>(null);
  const dieuKhien = useRef<AbortController | null>(null);
  const id = useMemo(() => new URLSearchParams(location.search).get('id') ?? '', []);

  useEffect(() => {
    (async () => {
      try {
        const mon = id ? await kho.doc(id) : null;
        if (!mon) return datTt({ loai: 'khong-thay' });
        document.title = `${mon.ten} · Hochanh`;
        datTt({ loai: 'co', mon });
        datCoPdf((await kho.docPdf(id)) !== null);
      } catch {
        datTt({ loai: 'khong-thay' });
      }
    })();
  }, []);

  // Đang tạo mà đóng thẻ thì mất bài đang viết dở (các bài đã xong vẫn còn)
  useEffect(() => {
    if (dangTao === null) return;
    const chan = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener('beforeunload', chan);
    return () => removeEventListener('beforeunload', chan);
  }, [dangTao]);

  if (tt.loai === 'dang-mo') return <p className="rong">Đang mở môn học…</p>;
  if (tt.loai === 'khong-thay') {
    return (
      <div className="rong" data-khong-thay>
        <p>Không tìm thấy môn này trên máy. Môn tự tạo chỉ nằm trong trình duyệt đã tạo ra nó.</p>
        <a className="nut nho" href={d.tuTao()}>
          <Icon ten="arrow-left" co={14} /> Về trang Tự tạo bài giảng
        </a>
      </div>
    );
  }
  const mon = tt.mon;

  async function luu(m: MonTuTao): Promise<MonTuTao> {
    const moi = await kho.luu(m);
    datTt({ loai: 'co', mon: moi });
    return moi;
  }

  async function layPdf(): Promise<PDFDocument> {
    if (pdfDaMo.current) return pdfDaMo.current;
    const daLuu = await kho.docPdf(mon.id);
    if (!daLuu) throw new Error('Chưa có file PDF của môn này trên máy. Hãy chọn lại file ở trên.');
    const { moPdf } = await import('../../lib/tu-tao/pdf');
    pdfDaMo.current = await moPdf(daLuu.du_lieu);
    return pdfDaMo.current;
  }

  async function chonLaiPdf(f: File) {
    datLoi(null);
    try {
      const { moPdf } = await import('../../lib/tu-tao/pdf');
      const du_lieu = await f.arrayBuffer();
      const pdf = await moPdf(du_lieu.slice(0));
      if (pdf.getPageCount() !== mon.tong_so_trang) {
        throw new Error(`File này có ${pdf.getPageCount()} trang, khác file lúc tạo môn (${mon.tong_so_trang} trang).`);
      }
      pdfDaMo.current = pdf;
      datCoPdf(true);
      try {
        await kho.luuPdf(mon.id, { ten_file: f.name, du_lieu });
      } catch {
        // Hết chỗ: dùng được trong lần mở trang này
      }
    } catch (e) {
      datLoi(thongBaoLoi(e));
    }
  }

  async function tao(c: ChuongTuTao) {
    if (!khoaApi.khoa) return;
    const dk = new AbortController();
    dieuKhien.current = dk;
    const client = taoKetNoi(khoaApi.khoa);
    datLoi(null);
    datXong(null);
    datChiPhi(0);
    datDangTao(c.so);
    try {
      const pdf = await layPdf();
      const { catTrang, sangBase64 } = await import('../../lib/tu-tao/pdf');
      const kq = await taoBaiGiangChuong(mon, c.so, {
        async layPdf(dau, cuoi) {
          const byte = await catTrang(pdf, dau, cuoi);
          const loiNang = loiDungLuong(byte.length);
          if (loiNang) throw new Error(loiNang);
          return sangBase64(byte);
        },
        lapDanY: (p, m, ch, tc) => lapDanY(client, p, m, ch, tc),
        vietBai: (p, m, ch, danY, bai, tc) => vietBai(client, p, m, ch, danY, bai, tc),
        luu,
        baoTienDo: datTienDo,
        baoChiPhi: (x) => datChiPhi((t) => t + x),
        dung: dk.signal,
      });
      const cMoi = kq.chuong.find((x) => x.so === c.so);
      datXong(`Xong Chương ${c.so}: ${cMoi?.bai.length ?? 0} bài giảng.`);
    } catch (e) {
      datLoi(thongBaoLoi(e));
    } finally {
      datDangTao(null);
      datTienDo(null);
      dieuKhien.current = null;
    }
  }

  async function lamLai(c: ChuongTuTao) {
    if (!confirm(`Xoá dàn ý và ${c.bai.length} bài giảng của Chương ${c.so} để tạo lại?`)) return;
    await luu(thayChuong(mon, c.so, datLaiChuong));
  }

  async function suaTrang(c: ChuongTuTao, dau: number, cuoi: number): Promise<string | null> {
    const l = loiKhoangTrang(dau, cuoi, mon.tong_so_trang);
    if (l) return l;
    if (c.dan_y && !confirm(`Đổi khoảng trang sẽ xoá dàn ý và bài giảng đã tạo của Chương ${c.so}. Tiếp tục?`)) return null;
    await luu(thayChuong(mon, c.so, (x) => datLaiChuong({ ...x, trang_dau: dau, trang_cuoi: cuoi })));
    return null;
  }

  return (
    <div className="tu-tao" data-trang-mon={mon.id}>
      <header className="dau-trang">
        <p className="nhan-tren">
          <span className="pill info">Tự tạo</span> {mon.ten_file} · {mon.tong_so_trang} trang · tạo {ngayVN(mon.tao_luc)}
        </p>
        <h1>{mon.ten}</h1>
        {mon.ten_en && <p className="phu-de">{mon.ten_en}</p>}
        <p className="phu-de">
          <em>{mon.giao_trinh}</em>
        </p>
        <div className="hang-nut">
          <button type="button" className="nut nho" onClick={() => taiXuong(tenFileXuat(mon), xuatMon(mon))} data-tai-json>
            <Icon ten="download" co={14} /> Tải về (.json) để sao lưu
          </button>
          <button
            type="button"
            className="nut nhe nho"
            disabled={dangTao !== null}
            data-xoa-mon
            onClick={async () => {
              if (!confirm(`Xoá môn "${mon.ten}" cùng mọi bài giảng và file PDF đã giữ trên máy?`)) return;
              await kho.xoa(mon.id);
              location.href = d.tuTao();
            }}
          >
            <Icon ten="trash" co={14} /> Xoá môn
          </button>
        </div>
      </header>

      {!khoaApi.khoa && <TheKhoaApi khoaApi={khoaApi} />}

      {!coPdf && (
        <ThongBao loai="ghi-chu">
          <p>
            Máy này chưa giữ file <b>{mon.ten_file}</b>. Chọn lại file để tạo bài giảng cho các chương còn lại.
          </p>
          <label className="nut nho">
            <Icon ten="file-up" co={14} /> Chọn lại file PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="an-di"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void chonLaiPdf(f);
              }}
            />
          </label>
        </ThongBao>
      )}

      {dangTao !== null && (
        <div className="tien-trinh" role="status" data-tien-trinh>
          <Icon ten="loader" lop="xoay" />
          <span>{moTaTienDo(tienDo)}</span>
          <span className="trang-thai-nho">Đã tốn khoảng {dinhDangUSD(chiPhi)}</span>
          <button type="button" className="nut nhe nho" onClick={() => dieuKhien.current?.abort()} data-dung>
            <Icon ten="square" co={12} /> Dừng
          </button>
        </div>
      )}
      {xong && (
        <ThongBao loai="ok">
          {xong} Tốn khoảng {dinhDangUSD(chiPhi)}.
        </ThongBao>
      )}
      {loi && <ThongBao loai="loi">{loi}</ThongBao>}

      <section className="phan" aria-labelledby="tieu-de-chuong">
        <h2 id="tieu-de-chuong">Các chương</h2>
        <ul className="ds-chuong-tu-tao">
          {mon.chuong.map((c) => (
            <DongChuongTuTao
              key={c.so}
              mon={mon}
              c={c}
              dangTao={dangTao}
              coKhoa={!!khoaApi.khoa}
              coPdf={coPdf}
              tao={() => void tao(c)}
              lamLai={() => void lamLai(c)}
              suaTrang={(dau, cuoi) => suaTrang(c, dau, cuoi)}
            />
          ))}
        </ul>
      </section>

      <p className="ghi-cong">
        Bài giảng do {TEN_MO_HINH} viết tự động từ file PDF bạn nạp, theo cách soạn các bài giảng mẫu của Hochanh. Máy có
        thể sai — hãy đối chiếu với sách. Mọi thứ chỉ lưu trong trình duyệt này.
      </p>
    </div>
  );
}

function moTaTienDo(td: TienDoTao | null): string {
  if (!td || td.buoc === 'cat-pdf') return 'Đang cắt các trang của chương…';
  const chu = td.so_ky_tu > 0 ? ` (${td.so_ky_tu.toLocaleString('vi-VN')} ký tự)` : '';
  if (td.buoc === 'dan-y') return `Claude đang đọc chương và lập dàn ý…${chu}`;
  return `Đang viết Bài ${td.thu}/${td.tong}: ${td.bai.tieu_de}${chu}`;
}

function DongChuongTuTao(p: {
  mon: MonTuTao;
  c: ChuongTuTao;
  dangTao: number | null;
  coKhoa: boolean;
  coPdf: boolean;
  tao: () => void;
  lamLai: () => void;
  suaTrang: (dau: number, cuoi: number) => Promise<string | null>;
}) {
  const { mon, c } = p;
  const tt = trangThaiChuong(c);
  const [sua, datSua] = useState(false);
  const [dau, datDau] = useState(String(c.trang_dau));
  const [cuoi, datCuoi] = useState(String(c.trang_cuoi));
  const [loiSua, datLoiSua] = useState<string | null>(null);
  const soTrang = c.trang_cuoi - c.trang_dau + 1;
  const soBaiUoc = c.dan_y?.bai.length ?? 5;
  const conLai = tt.loai === 'dang-do' ? tt.tong - tt.xong : soBaiUoc;
  const coTheTao = p.dangTao === null && p.coKhoa && p.coPdf;

  return (
    <li className="card" data-chuong-tu-tao={c.so}>
      <div className="dong-dau">
        <h3>
          Chương {c.so}: {c.ten}
        </h3>
        {tt.loai === 'xong' ? (
          <span className="pill ok">{tt.tong} bài giảng</span>
        ) : tt.loai === 'dang-do' ? (
          <span className="pill warn">
            Tạo dở {tt.xong}/{tt.tong}
          </span>
        ) : (
          <span className="pill mo">Chưa tạo</span>
        )}
      </div>
      <p className="tom">
        {c.ten_en && <>{c.ten_en} · </>}trang {c.trang_dau}–{c.trang_cuoi} ({soTrang} trang)
        {!sua && p.dangTao === null && (
          <button type="button" className="nut nhe nho" onClick={() => datSua(true)}>
            Sửa trang
          </button>
        )}
      </p>
      {sua && (
        <form
          className="bieu-mau hang"
          onSubmit={async (e) => {
            e.preventDefault();
            const l = await p.suaTrang(Number(dau), Number(cuoi));
            datLoiSua(l);
            if (!l) datSua(false);
          }}
        >
          <label className="o">
            <span>Từ trang</span>
            <input className="o-so" inputMode="numeric" value={dau} onChange={(e) => datDau(e.target.value)} />
          </label>
          <label className="o">
            <span>Đến trang</span>
            <input className="o-so" inputMode="numeric" value={cuoi} onChange={(e) => datCuoi(e.target.value)} />
          </label>
          <button type="submit" className="nut nho">
            Lưu
          </button>
          <button type="button" className="nut nhe nho" onClick={() => datSua(false)}>
            Huỷ
          </button>
          {loiSua && <p className="loi-o">{loiSua}</p>}
        </form>
      )}

      {c.dan_y && (
        <ol className="ds-bai-tu-tao">
          {c.dan_y.bai.map((b) => {
            const daCo = c.bai.some((x) => x.so === b.so);
            return (
              <li key={b.so}>
                {daCo ? (
                  <a href={d.baiTuTao(mon.id, c.so, b.so)}>
                    Bài {b.so}: {b.tieu_de}
                  </a>
                ) : (
                  <span className="chua-co">
                    Bài {b.so}: {b.tieu_de} — chưa viết
                  </span>
                )}
                <span className="mo-ta">{b.y_tuong}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="hang-nut">
        {tt.loai !== 'xong' && (
          <button type="button" className="nut chinh nho" disabled={!coTheTao} onClick={p.tao} data-tao-chuong={c.so}>
            <Icon ten="sparkles" co={14} />
            {tt.loai === 'dang-do' ? `Tạo tiếp ${conLai} bài` : 'Tạo bài giảng'} (
            {dinhDangKhoang(uocTinhChuong(soTrang, conLai))})
          </button>
        )}
        {tt.loai !== 'chua-tao' && (
          <button type="button" className="nut nhe nho" disabled={p.dangTao !== null} onClick={p.lamLai}>
            <Icon ten="rotate-ccw" co={14} /> Làm lại chương
          </button>
        )}
        {p.dangTao === c.so && <span className="trang-thai-nho">Đang tạo…</span>}
      </div>
    </li>
  );
}

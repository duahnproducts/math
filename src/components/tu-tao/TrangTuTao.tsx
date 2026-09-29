// Trang "Tự tạo bài giảng": khoá API, danh sách môn đã tạo, và tạo môn mới từ PDF
// (chọn file → đọc mục lục hoặc tự nhập → sửa bảng chương → lưu).
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocument } from 'pdf-lib';
import { taoDuongDan } from '../../lib/duong-dan';
import {
  bieuMauTuMucLuc,
  bieuMauTuNhap,
  dongMoi,
  kiemTraBieuMau,
  type DongChuong,
  type ThongTinBieuMau,
} from '../../lib/tu-tao/bieu-mau';
import { dinhDangKhoang, dinhDangUSD, uocTinhMucLuc } from '../../lib/tu-tao/chi-phi';
import { docMucLuc, taoKetNoi, thongBaoLoi } from '../../lib/tu-tao/goi-claude';
import { docFileMon, taoKho, taoMonMoi } from '../../lib/tu-tao/kho';
import { trangThaiChuong, type MonTuTao } from '../../lib/tu-tao/khung';
import { khoangMucLuc, loiDungLuong } from '../../lib/tu-tao/trang';
import { Icon, TheKhoaApi, ThongBao, ngayVN, useKhoaApi } from './chung';

const d = taoDuongDan(import.meta.env.BASE_URL);

interface FileDaChon {
  ten: string;
  du_lieu: ArrayBuffer;
  pdf: PDFDocument;
  tong: number;
}

export default function TrangTuTao() {
  const kho = useMemo(() => taoKho(), []);
  const khoaApi = useKhoaApi();
  const [dsMon, datDsMon] = useState<MonTuTao[] | null>(null);
  const [loiKho, datLoiKho] = useState<string | null>(null);
  const [thongBaoNhap, datThongBaoNhap] = useState<{ loai: 'loi' | 'ok'; chu: string } | null>(null);

  const napLai = () =>
    kho
      .danhSach()
      .then(datDsMon)
      .catch(() => {
        datDsMon([]);
        datLoiKho('Trình duyệt đang chặn bộ nhớ của web (có thể do chế độ ẩn danh), nên không lưu được môn tự tạo.');
      });
  useEffect(() => {
    void napLai();
  }, []);

  async function nhapFile(f: File) {
    try {
      const mon = docFileMon(await f.text());
      if (dsMon?.some((m) => m.id === mon.id) && !confirm(`Đã có môn "${mon.ten}" trên máy. Ghi đè bằng bản trong file?`)) return;
      await kho.luu(mon, new Date(mon.cap_nhat_luc));
      await napLai();
      datThongBaoNhap({ loai: 'ok', chu: `Đã nhập môn "${mon.ten}".` });
    } catch (e) {
      datThongBaoNhap({ loai: 'loi', chu: thongBaoLoi(e) });
    }
  }

  return (
    <div className="tu-tao" data-tu-tao data-san-sang={dsMon ? '' : undefined}>
      <TheKhoaApi khoaApi={khoaApi} />

      <section className="phan" aria-labelledby="tieu-de-cua-toi">
        <h2 id="tieu-de-cua-toi">Môn của tôi</h2>
        {loiKho && <ThongBao loai="loi">{loiKho}</ThongBao>}
        {dsMon === null ? (
          <p className="rong">Đang mở kho trên máy…</p>
        ) : dsMon.length === 0 ? (
          <p className="rong">Chưa có môn nào. Tạo môn đầu tiên từ file PDF ở bên dưới.</p>
        ) : (
          <div className="luoi" data-ds-mon>
            {dsMon.map((m) => {
              const soBai = m.chuong.reduce((t, c) => t + c.bai.length, 0);
              const soXong = m.chuong.filter((c) => trangThaiChuong(c).loai === 'xong').length;
              return (
                <a key={m.id} className="card the-mon" href={d.monTuTao(m.id)} data-mon-tu-tao={m.id}>
                  <h3>{m.ten}</h3>
                  {m.ten_en && <p className="en">{m.ten_en}</p>}
                  <p className="mo-ta">{m.mo_ta || m.giao_trinh}</p>
                  <div className="cac-phan">
                    <span className="pill nhan">
                      {soXong}/{m.chuong.length} chương đã tạo
                    </span>
                    {soBai > 0 ? <span className="pill ok">{soBai} bài giảng</span> : <span className="pill mo">Chưa có bài giảng</span>}
                    <span className="pill mo">Sửa {ngayVN(m.cap_nhat_luc)}</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
        <div className="hang-nut">
          <label className="nut nho">
            <Icon ten="upload" co={14} /> Nhập môn từ file .json
            <input
              type="file"
              accept="application/json,.json"
              className="an-di"
              data-nhap-json
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void nhapFile(f);
              }}
            />
          </label>
        </div>
        {thongBaoNhap && <ThongBao loai={thongBaoNhap.loai}>{thongBaoNhap.chu}</ThongBao>}
      </section>

      <section className="phan" aria-labelledby="tieu-de-moi">
        <h2 id="tieu-de-moi">Tạo môn mới từ PDF</h2>
        <TaoMonMoi khoa={khoaApi.khoa} luu={async (mon, pdf) => {
          const daLuu = await kho.luu(mon);
          try {
            await kho.luuPdf(daLuu.id, { ten_file: pdf.ten, du_lieu: pdf.du_lieu });
          } catch {
            // Hết chỗ: vẫn có môn, lần sau chọn lại file PDF
          }
          location.href = d.monTuTao(daLuu.id);
        }} />
      </section>
    </div>
  );
}

function TaoMonMoi({ khoa, luu }: { khoa: string | null; luu: (m: MonTuTao, pdf: FileDaChon) => Promise<void> }) {
  const [file, datFile] = useState<FileDaChon | null>(null);
  const [dangMo, datDangMo] = useState(false);
  const [loi, datLoi] = useState<string | null>(null);
  const [thongTin, datThongTin] = useState<ThongTinBieuMau | null>(null);
  const [cacDong, datCacDong] = useState<DongChuong[]>([]);
  const [loiDong, datLoiDong] = useState<string[]>([]);
  const [dangDoc, datDangDoc] = useState(false);
  const [soChu, datSoChu] = useState(0);
  const [chiPhi, datChiPhi] = useState<number | null>(null);
  const [dangLuu, datDangLuu] = useState(false);
  const dieuKhien = useRef<AbortController | null>(null);

  async function chonFile(f: File) {
    datLoi(null);
    datThongTin(null);
    datChiPhi(null);
    datDangMo(true);
    try {
      const { moPdf } = await import('../../lib/tu-tao/pdf');
      const du_lieu = await f.arrayBuffer();
      const pdf = await moPdf(du_lieu.slice(0));
      datFile({ ten: f.name, du_lieu, pdf, tong: pdf.getPageCount() });
    } catch (e) {
      datFile(null);
      datLoi(thongBaoLoi(e));
    } finally {
      datDangMo(false);
    }
  }

  async function docTuDong() {
    if (!file || !khoa) return;
    const dk = new AbortController();
    dieuKhien.current = dk;
    datLoi(null);
    datDangDoc(true);
    datSoChu(0);
    try {
      const { catTrang, sangBase64 } = await import('../../lib/tu-tao/pdf');
      const k = khoangMucLuc(file.tong);
      const byte = await catTrang(file.pdf, k.trang_dau, k.trang_cuoi);
      const loiNang = loiDungLuong(byte.length);
      if (loiNang) throw new Error(loiNang);
      const kq = await docMucLuc(taoKetNoi(khoa), sangBase64(byte), k.trang_cuoi, file.tong, {
        dung: dk.signal,
        khiViet: datSoChu,
      });
      const bm = bieuMauTuMucLuc(kq.du_lieu, file.tong);
      datThongTin(bm.thong_tin);
      datCacDong(bm.chuong);
      datLoiDong([]);
      datChiPhi(kq.chi_phi);
    } catch (e) {
      datLoi(thongBaoLoi(e));
    } finally {
      datDangDoc(false);
      dieuKhien.current = null;
    }
  }

  function tuNhap() {
    if (!file) return;
    const bm = bieuMauTuNhap(file.ten, file.tong);
    datThongTin(bm.thong_tin);
    datCacDong(bm.chuong);
    datLoiDong([]);
  }

  async function luuMon() {
    if (!file || !thongTin) return;
    const kq = kiemTraBieuMau(thongTin, cacDong, file.tong);
    if (!kq.hop_le) {
      datLoiDong(kq.loi_dong);
      datLoi(kq.loi_chung ?? 'Bảng chương còn chỗ chưa đúng — xem dòng báo đỏ.');
      return;
    }
    datLoi(null);
    datDangLuu(true);
    try {
      const mon = taoMonMoi({ ...thongTin, ten_file: file.ten, tong_so_trang: file.tong, chuong: kq.chuong });
      await luu(mon, file);
    } catch (e) {
      datLoi(thongBaoLoi(e));
      datDangLuu(false);
    }
  }

  const suaDong = (i: number, sua: Partial<DongChuong>) =>
    datCacDong((ds) => ds.map((x, j) => (j === i ? { ...x, ...sua, can_kiem_tra: false } : x)));

  return (
    <div className="card tao-moi" data-tao-mon-moi>
      <ol className="cac-buoc">
        <li>
          <b>Chọn file PDF</b> của giáo trình (cả cuốn hay một chương đều được).
          <div className="hang-nut">
            <label className="nut nho">
              <Icon ten="file-up" co={14} /> {file ? 'Chọn file khác' : 'Chọn file PDF'}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="an-di"
                data-chon-pdf
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (f) void chonFile(f);
                }}
              />
            </label>
            {dangMo && <span className="trang-thai-nho">Đang đọc file…</span>}
            {file && (
              <span className="trang-thai-nho" data-thong-tin-file>
                {file.ten} · {file.tong} trang
              </span>
            )}
          </div>
        </li>

        {file && (
          <li>
            <b>Chia chương.</b> Để Claude đọc mục lục ở {khoangMucLuc(file.tong).trang_cuoi} trang đầu, hoặc tự nhập.
            <div className="hang-nut">
              <button type="button" className="nut chinh nho" disabled={!khoa || dangDoc} onClick={() => void docTuDong()}>
                <Icon ten="sparkles" co={14} /> Đọc mục lục tự động ({dinhDangKhoang(uocTinhMucLuc(khoangMucLuc(file.tong).trang_cuoi))})
              </button>
              <button type="button" className="nut nho" disabled={dangDoc} onClick={tuNhap}>
                <Icon ten="pencil-line" co={14} /> Tự nhập
              </button>
            </div>
            {!khoa && <p className="ghi">Cần nhập khoá API ở trên để đọc mục lục tự động.</p>}
            {dangDoc && (
              <div className="tien-trinh" role="status" data-tien-trinh>
                <Icon ten="loader" lop="xoay" /> Claude đang đọc mục lục… {soChu > 0 && `(${soChu.toLocaleString('vi-VN')} ký tự)`}
                <button type="button" className="nut nhe nho" onClick={() => dieuKhien.current?.abort()}>
                  <Icon ten="square" co={12} /> Dừng
                </button>
              </div>
            )}
            {chiPhi !== null && <p className="ghi">Đã đọc mục lục, tốn khoảng {dinhDangUSD(chiPhi)}.</p>}
          </li>
        )}

        {file && thongTin && (
          <li>
            <b>Kiểm tra lại</b> tên môn và khoảng trang của từng chương (trang tính theo file PDF, trang đầu file là 1).
            <div className="bieu-mau luoi-2">
              <label className="o">
                <span>Tên môn</span>
                <input value={thongTin.ten} onChange={(e) => datThongTin({ ...thongTin, ten: e.target.value })} data-o-ten-mon />
              </label>
              <label className="o">
                <span>Tên tiếng Anh</span>
                <input value={thongTin.ten_en} onChange={(e) => datThongTin({ ...thongTin, ten_en: e.target.value })} />
              </label>
              <label className="o">
                <span>Giáo trình</span>
                <input value={thongTin.giao_trinh} onChange={(e) => datThongTin({ ...thongTin, giao_trinh: e.target.value })} />
              </label>
              <label className="o">
                <span>Mô tả ngắn</span>
                <input value={thongTin.mo_ta} onChange={(e) => datThongTin({ ...thongTin, mo_ta: e.target.value })} />
              </label>
            </div>

            <div className="cuon-ngang">
              <table className="bang bang-chuong" data-bang-chuong>
                <thead>
                  <tr>
                    <th>Số</th>
                    <th>Tên chương</th>
                    <th>Tên tiếng Anh</th>
                    <th>Từ trang</th>
                    <th>Đến trang</th>
                    <th>
                      <span className="an-di">Xoá</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cacDong.map((dg, i) => (
                    <tr key={i} data-can-kiem-tra={dg.can_kiem_tra ? '' : undefined}>
                      <td>
                        <input className="o-so" inputMode="numeric" aria-label={`Số chương, dòng ${i + 1}`} value={dg.so} onChange={(e) => suaDong(i, { so: e.target.value })} />
                      </td>
                      <td>
                        <input aria-label={`Tên chương, dòng ${i + 1}`} value={dg.ten} onChange={(e) => suaDong(i, { ten: e.target.value })} />
                        {loiDong[i] && <p className="loi-o">{loiDong[i]}</p>}
                        {dg.can_kiem_tra && <p className="ghi">Số trang do máy đoán — hãy mở PDF kiểm tra.</p>}
                      </td>
                      <td>
                        <input aria-label={`Tên tiếng Anh, dòng ${i + 1}`} value={dg.ten_en} onChange={(e) => suaDong(i, { ten_en: e.target.value })} />
                      </td>
                      <td>
                        <input className="o-so" inputMode="numeric" aria-label={`Từ trang, dòng ${i + 1}`} value={dg.trang_dau} onChange={(e) => suaDong(i, { trang_dau: e.target.value })} />
                      </td>
                      <td>
                        <input className="o-so" inputMode="numeric" aria-label={`Đến trang, dòng ${i + 1}`} value={dg.trang_cuoi} onChange={(e) => suaDong(i, { trang_cuoi: e.target.value })} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="nut-icon"
                          aria-label={`Xoá dòng ${i + 1}`}
                          title="Xoá dòng"
                          onClick={() => {
                            datCacDong((ds) => ds.filter((_, j) => j !== i));
                            datLoiDong([]);
                          }}
                        >
                          <Icon ten="x" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="hang-nut">
              <button type="button" className="nut nho" onClick={() => datCacDong((ds) => [...ds, dongMoi(ds, file.tong)])}>
                <Icon ten="plus" co={14} /> Thêm chương
              </button>
              <button type="button" className="nut chinh" disabled={dangLuu} onClick={() => void luuMon()} data-luu-mon>
                Lưu môn và bắt đầu <Icon ten="arrow-right" co={16} />
              </button>
            </div>
          </li>
        )}
      </ol>
      {loi && <ThongBao loai="loi">{loi}</ThongBao>}
    </div>
  );
}

// Trang đọc một bài giảng tự tạo: cùng bố cục, cùng khung 8 mục và hộp màu với
// bài giảng soạn tay. HTML dựng bởi baiGiangSangHtml (đã lọc sạch nội dung máy sinh).
import { useEffect, useMemo, useState } from 'react';
import { taoDuongDan, thamSoBaiTuTao } from '../../lib/duong-dan';
import { TEN_MO_HINH } from '../../lib/tu-tao/mo-hinh';
import { MUC_LUC_BAI, baiGiangSangHtml } from '../../lib/tu-tao/hien-thi';
import { taoKho } from '../../lib/tu-tao/kho';
import type { MonTuTao } from '../../lib/tu-tao/khung';
import { Icon } from './Icon';

const d = taoDuongDan(import.meta.env.BASE_URL);

export default function TrangBai() {
  const thamSo = useMemo(() => thamSoBaiTuTao(location.search), []);
  const [mon, datMon] = useState<MonTuTao | null | undefined>(undefined);

  useEffect(() => {
    if (!thamSo) return datMon(null);
    taoKho()
      .doc(thamSo.mon)
      .then(datMon)
      .catch(() => datMon(null));
  }, []);

  const chuong = mon && thamSo ? mon.chuong.find((c) => c.so === thamSo.chuong) : undefined;
  const cacBai = chuong ? [...chuong.bai].sort((a, b) => a.so - b.so) : [];
  const viTri = cacBai.findIndex((b) => b.so === thamSo?.bai);
  const bai = viTri >= 0 ? cacBai[viTri] : undefined;
  const html = useMemo(() => (bai ? baiGiangSangHtml(bai) : ''), [bai]);

  useEffect(() => {
    if (bai && mon) document.title = `Bài ${bai.so}: ${bai.tieu_de} · ${mon.ten} · Hochanh`;
  }, [bai, mon]);

  if (mon === undefined) return <p className="rong">Đang mở bài giảng…</p>;
  if (!mon || !chuong || !bai) {
    return (
      <div className="rong" data-khong-thay>
        <p>Không tìm thấy bài giảng này trên máy. Bài tự tạo chỉ nằm trong trình duyệt đã tạo ra nó.</p>
        <a className="nut nho" href={mon ? d.monTuTao(mon.id) : d.tuTao()}>
          <Icon ten="arrow-left" co={14} /> {mon ? `Về môn ${mon.ten}` : 'Về trang Tự tạo bài giảng'}
        </a>
      </div>
    );
  }

  const truoc = cacBai[viTri - 1];
  const sau = cacBai[viTri + 1];
  const tong = chuong.dan_y?.bai.length ?? cacBai.length;

  return (
    <div className="trang-doc" data-bai-tu-tao>
      <article className="cot-doc">
        <header className="dau-trang">
          <p className="nhan-tren">
            <span className="pill ok">Giảng dạy</span> <span className="pill info">Tự tạo</span> Bài {bai.so}/{tong} ·
            Chương {chuong.so} · <a href={d.monTuTao(mon.id)}>{mon.ten}</a>
          </p>
          <h1>{bai.tieu_de}</h1>
          {bai.phu_muc.length > 0 && (
            <div className="lien-ket-cheo">
              <span>Bài này phủ:</span>
              {bai.phu_muc.map((m) => (
                <span key={m} className="pill mo">
                  §{m} trong sách
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="van-ban bai-giang" dangerouslySetInnerHTML={{ __html: html }} />

        <nav className="dieu-huong-cuoi" aria-label="Bài trước, bài sau">
          {truoc && (
            <a href={d.baiTuTao(mon.id, chuong.so, truoc.so)}>
              <small>← Bài trước</small>
              Bài {truoc.so}: {truoc.tieu_de}
            </a>
          )}
          {sau ? (
            <a className="sau" href={d.baiTuTao(mon.id, chuong.so, sau.so)}>
              <small>Bài tiếp theo →</small>
              Bài {sau.so}: {sau.tieu_de}
            </a>
          ) : (
            <a className="sau" href={d.monTuTao(mon.id)}>
              <small>Hết các bài đã tạo →</small>
              Về môn {mon.ten}
            </a>
          )}
        </nav>

        <p className="ghi-cong" data-ghi-cong>
          Bài giảng do {TEN_MO_HINH} viết tự động từ file PDF bạn nạp ({mon.giao_trinh}), theo cách soạn các bài giảng mẫu
          của Hochanh. Máy có thể sai — hãy đối chiếu với sách. Bài chỉ lưu trong trình duyệt này.
        </p>
      </article>
      <nav className="muc-luc-trang" aria-label="Trong trang này">
        <h2>Trong trang này</h2>
        <ol>
          {MUC_LUC_BAI.map((m) => (
            <li key={m.id}>
              <a href={`#${m.id}`}>{m.ten}</a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

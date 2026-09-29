// Quy trình tạo bài giảng cho một chương: cắt PDF → lập dàn ý → viết lần lượt từng bài.
// Xong bước nào lưu ngay bước đó, nên mất mạng hay bấm dừng giữa chừng thì lần sau
// bấm "Tạo tiếp" chỉ viết nốt các bài còn thiếu, không tốn tiền làm lại.
// Các việc thật (cắt PDF, gọi Claude, lưu IndexedDB) được truyền vào, để test được.
import type { KetQua, TuyChonGoi } from './goi-claude';
import { baiCanViet, type BaiGiangTuTao, type BaiTrongDanY, type ChuongTuTao, type DanYChuong, type MonTuTao } from './khung';
import type { ThongTinChuong, ThongTinMon } from './loi-nhac';

export type TienDoTao =
  | { buoc: 'cat-pdf' }
  | { buoc: 'dan-y'; so_ky_tu: number }
  | { buoc: 'viet'; bai: BaiTrongDanY; thu: number; tong: number; so_ky_tu: number };

export interface CongCuTao {
  /** Cắt trang [dau, cuoi] của file PDF gốc, trả về base64 */
  layPdf(dau: number, cuoi: number): Promise<string>;
  lapDanY(pdf: string, mon: ThongTinMon, chuong: ThongTinChuong, tc: TuyChonGoi): Promise<KetQua<DanYChuong>>;
  vietBai(
    pdf: string,
    mon: ThongTinMon,
    chuong: ThongTinChuong,
    danY: DanYChuong,
    bai: BaiTrongDanY,
    tc: TuyChonGoi,
  ): Promise<KetQua<BaiGiangTuTao>>;
  luu(mon: MonTuTao): Promise<MonTuTao>;
  baoTienDo?(td: TienDoTao): void;
  /** Chi phí (USD) của từng lần gọi vừa xong */
  baoChiPhi?(usd: number): void;
  dung?: AbortSignal;
}

export function thongTinMon(m: MonTuTao): ThongTinMon {
  return { ten: m.ten, giao_trinh: m.giao_trinh };
}

export function thongTinChuong(c: ChuongTuTao): ThongTinChuong {
  return { so: c.so, ten: c.ten, ten_en: c.ten_en, trang_dau: c.trang_dau, trang_cuoi: c.trang_cuoi };
}

/** Thay một chương của môn (không sửa đối tượng cũ). */
export function thayChuong(mon: MonTuTao, so: number, sua: (c: ChuongTuTao) => ChuongTuTao): MonTuTao {
  return { ...mon, chuong: mon.chuong.map((c) => (c.so === so ? sua(c) : c)) };
}

/** Sửa khoảng trang hay tên chương thì bài đã tạo không còn khớp: xoá dàn ý và bài. */
export function datLaiChuong(c: ChuongTuTao): ChuongTuTao {
  return { ...c, dan_y: null, bai: [] };
}

function timChuong(mon: MonTuTao, so: number): ChuongTuTao {
  const c = mon.chuong.find((x) => x.so === so);
  if (!c) throw new Error(`Môn này không có Chương ${so}.`);
  return c;
}

export async function taoBaiGiangChuong(monBanDau: MonTuTao, soChuong: number, cc: CongCuTao): Promise<MonTuTao> {
  let mon = monBanDau;
  const chuong = timChuong(mon, soChuong);
  const ttMon = thongTinMon(mon);
  const ttChuong = thongTinChuong(chuong);

  cc.baoTienDo?.({ buoc: 'cat-pdf' });
  const pdf = await cc.layPdf(chuong.trang_dau, chuong.trang_cuoi);

  if (!chuong.dan_y) {
    cc.baoTienDo?.({ buoc: 'dan-y', so_ky_tu: 0 });
    const kq = await cc.lapDanY(pdf, ttMon, ttChuong, {
      dung: cc.dung,
      khiViet: (n) => cc.baoTienDo?.({ buoc: 'dan-y', so_ky_tu: n }),
    });
    cc.baoChiPhi?.(kq.chi_phi);
    mon = await cc.luu(thayChuong(mon, soChuong, (c) => ({ ...c, dan_y: kq.du_lieu, bai: [] })));
  }

  for (;;) {
    const c = timChuong(mon, soChuong);
    const bai = baiCanViet(c);
    if (!bai || !c.dan_y) break;
    const danY = c.dan_y;
    const tong = danY.bai.length;
    const thu = danY.bai.indexOf(bai) + 1;
    cc.baoTienDo?.({ buoc: 'viet', bai, thu, tong, so_ky_tu: 0 });
    const kq = await cc.vietBai(pdf, ttMon, ttChuong, danY, bai, {
      dung: cc.dung,
      khiViet: (n) => cc.baoTienDo?.({ buoc: 'viet', bai, thu, tong, so_ky_tu: n }),
    });
    cc.baoChiPhi?.(kq.chi_phi);
    mon = await cc.luu(
      thayChuong(mon, soChuong, (x) => ({ ...x, bai: [...x.bai, kq.du_lieu].sort((p, q) => p.so - q.so) })),
    );
  }
  return mon;
}

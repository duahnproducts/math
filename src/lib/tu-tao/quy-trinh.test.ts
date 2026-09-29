import { describe, expect, it } from 'vitest';
import { DAN_Y_MAU, baiMau } from '../../../tests/fixtures/tu-tao';
import { kiemTraBaiGiang, trangThaiChuong, type MonTuTao } from './khung';
import { taoMonMoi } from './kho';
import { datLaiChuong, taoBaiGiangChuong, thayChuong, type CongCuTao, type TienDoTao } from './quy-trinh';

function monMoi(): MonTuTao {
  return taoMonMoi(
    {
      ten: 'Kinh tế vĩ mô',
      ten_en: 'Macroeconomics',
      giao_trinh: 'OpenStax',
      mo_ta: '',
      ten_file: 'macro.pdf',
      tong_so_trang: 100,
      chuong: [
        { so: 1, ten: 'Đo lường', ten_en: 'Measuring', trang_dau: 3, trang_cuoi: 30 },
        { so: 2, ten: 'Lạm phát', ten_en: 'Inflation', trang_dau: 31, trang_cuoi: 60 },
      ],
    },
    new Date('2026-09-29T08:00:00Z'),
    () => 0,
  );
}

function congCuGia(tuyChon: { hongOBai?: number } = {}) {
  const nhatKy: string[] = [];
  const daLuu: MonTuTao[] = [];
  const tienDo: TienDoTao[] = [];
  const chiPhi: number[] = [];
  const cc: CongCuTao = {
    async layPdf(dau, cuoi) {
      nhatKy.push(`cắt ${dau}-${cuoi}`);
      return `pdf-${dau}-${cuoi}`;
    },
    async lapDanY(pdf, _mon, chuong, tc) {
      nhatKy.push(`dàn ý ${pdf} chương ${chuong.so}`);
      tc.khiViet?.(10);
      return { du_lieu: DAN_Y_MAU, usage: { input_tokens: 1, output_tokens: 1 }, chi_phi: 0.1 };
    },
    async vietBai(pdf, _mon, _chuong, _danY, bai, tc) {
      if (bai.so === tuyChon.hongOBai) throw new Error('mất mạng');
      nhatKy.push(`viết bài ${bai.so} từ ${pdf}`);
      tc.khiViet?.(100);
      return { du_lieu: kiemTraBaiGiang(baiMau(bai.so), bai.so), usage: { input_tokens: 1, output_tokens: 1 }, chi_phi: 0.2 };
    },
    async luu(mon) {
      daLuu.push(structuredClone(mon));
      return mon;
    },
    baoTienDo: (td) => tienDo.push(td),
    baoChiPhi: (x) => chiPhi.push(x),
  };
  return { cc, nhatKy, daLuu, tienDo, chiPhi };
}

describe('taoBaiGiangChuong', () => {
  it('cắt đúng trang, lập dàn ý, rồi viết từng bài; lưu sau mỗi bước', async () => {
    const { cc, nhatKy, daLuu, chiPhi } = congCuGia();
    const kq = await taoBaiGiangChuong(monMoi(), 2, cc);
    expect(nhatKy).toEqual(['cắt 31-60', 'dàn ý pdf-31-60 chương 2', 'viết bài 1 từ pdf-31-60', 'viết bài 2 từ pdf-31-60']);
    expect(daLuu).toHaveLength(3);
    expect(trangThaiChuong(kq.chuong[1])).toEqual({ loai: 'xong', tong: 2 });
    expect(trangThaiChuong(kq.chuong[0])).toEqual({ loai: 'chua-tao' });
    expect(chiPhi).toEqual([0.1, 0.2, 0.2]);
  });

  it('báo tiến độ: bài thứ mấy trên tổng số, bao nhiêu chữ', async () => {
    const { cc, tienDo } = congCuGia();
    await taoBaiGiangChuong(monMoi(), 1, cc);
    expect(tienDo[0]).toEqual({ buoc: 'cat-pdf' });
    expect(tienDo).toContainEqual({ buoc: 'dan-y', so_ky_tu: 10 });
    expect(tienDo).toContainEqual(expect.objectContaining({ buoc: 'viet', thu: 2, tong: 2, so_ky_tu: 100 }));
  });

  it('hỏng giữa chừng thì giữ phần đã xong; lần sau chỉ viết nốt, không lập lại dàn ý', async () => {
    const lan1 = congCuGia({ hongOBai: 2 });
    await expect(taoBaiGiangChuong(monMoi(), 1, lan1.cc)).rejects.toThrow('mất mạng');
    const daCo = lan1.daLuu.at(-1)!;
    expect(trangThaiChuong(daCo.chuong[0])).toEqual({ loai: 'dang-do', xong: 1, tong: 2 });

    const lan2 = congCuGia();
    const kq = await taoBaiGiangChuong(daCo, 1, lan2.cc);
    expect(lan2.nhatKy).toEqual(['cắt 3-30', 'viết bài 2 từ pdf-3-30']);
    expect(kq.chuong[0].bai.map((b) => b.so)).toEqual([1, 2]);
  });

  it('chương không tồn tại thì báo lỗi', async () => {
    await expect(taoBaiGiangChuong(monMoi(), 9, congCuGia().cc)).rejects.toThrow(/không có Chương 9/);
  });
});

describe('sửa chương', () => {
  it('thayChuong không sửa môn cũ; datLaiChuong xoá dàn ý và bài', () => {
    const m = monMoi();
    const moi = thayChuong(m, 1, (c) => ({ ...c, dan_y: DAN_Y_MAU, bai: [baiMau(1)] }));
    expect(m.chuong[0].dan_y).toBeNull();
    expect(moi.chuong[0].bai).toHaveLength(1);
    expect(datLaiChuong(moi.chuong[0])).toMatchObject({ dan_y: null, bai: [] });
  });
});

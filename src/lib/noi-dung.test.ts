import { describe, expect, it } from 'vitest';
import {
  TAM_MUC,
  bangDoiChieu,
  baiGiangPhuMuc,
  chuongCuaMuc,
  coHuongDan,
  kiemTraChuong,
  kiemTraTamMuc,
  mucCuaSo,
  phanTichCanDung,
  soSanhSo,
  tenKhoi,
  timMucCuaKhoi,
  trichKhoiSo,
  trichThuatNgu,
  trichTieuDeCap2,
  trichXemMuc,
  type DuLieuChuong,
} from './noi-dung';

const baiGiangDu = TAM_MUC.map((m) => `## ${m}\n\nnội dung`).join('\n\n');

describe('khung 8 mục', () => {
  it('đọc tiêu đề cấp 2, bỏ qua khối code', () => {
    const vb = '# Bài 1\n## Một\n```\n## Không tính\n```\n### Cấp 3\n## Hai ##';
    expect(trichTieuDeCap2(vb)).toEqual(['Một', 'Hai']);
  });
  it('đủ 8 mục thì đạt, cho phép đuôi tiêu đề', () => {
    const tieuDe: string[] = [...TAM_MUC];
    tieuDe[3] = 'Công thức — định nghĩa sup';
    expect(kiemTraTamMuc(tieuDe)).toEqual([]);
    expect(kiemTraTamMuc(trichTieuDeCap2(baiGiangDu))).toEqual([]);
  });
  it('báo thiếu mục', () => {
    const tieuDe = TAM_MUC.filter((m) => m !== 'Lỗi dễ mắc');
    expect(kiemTraTamMuc(tieuDe)).toEqual(['thiếu mục "Lỗi dễ mắc"']);
  });
  it('báo sai thứ tự', () => {
    const tieuDe: string[] = [...TAM_MUC];
    [tieuDe[0], tieuDe[1]] = [tieuDe[1], tieuDe[0]];
    expect(kiemTraTamMuc(tieuDe)).toContain('mục "Hình dung trực quan" sai thứ tự');
  });
});

describe('số hiệu', () => {
  it('sắp xếp theo số, không theo chữ', () => {
    expect(['1.2.10', '1.2.9', '1.3.1', '1.2.1'].sort(soSanhSo)).toEqual(['1.2.1', '1.2.9', '1.2.10', '1.3.1']);
    expect(soSanhSo('1.2', '1.2.1')).toBeLessThan(0);
  });
  it('mục và chương của một số hiệu', () => {
    expect(mucCuaSo('1.2.5')).toBe('1.2');
    expect(chuongCuaMuc('1.2')).toBe(1);
  });
});

describe('khối có số hiệu', () => {
  const mdx = `
<DinhNghia so="1.3.2" ten="Supremum">…</DinhNghia>
<DinhLy so='1.4.3'>…</DinhLy>
<BoDe so="1.3.8">…</BoDe>
<TienDe id="tien-de-day-du" ten="Tiên đề Đầy đủ">…</TienDe>
<ViDu>ví dụ không số hiệu</ViDu>
<GhiChu>không phải khối</GhiChu>`;

  it('trích đúng loại, số và id', () => {
    expect(trichKhoiSo(mdx)).toEqual([
      { loai: 'dinh-nghia', so: '1.3.2', id: 'dinh-nghia-1.3.2', ten: 'Supremum' },
      { loai: 'dinh-ly', so: '1.4.3', id: 'dinh-ly-1.4.3' },
      { loai: 'bo-de', so: '1.3.8', id: 'bo-de-1.3.8' },
      { loai: 'tien-de', so: undefined, id: 'tien-de-day-du', ten: 'Tiên đề Đầy đủ' },
    ]);
  });

  it('phân tích mã can_dung', () => {
    expect(phanTichCanDung('dinh-ly-1.4.3')).toEqual({ loai: 'dinh-ly', so: '1.4.3' });
    expect(phanTichCanDung('dinh-nghia-1.3.2')).toEqual({ loai: 'dinh-nghia', so: '1.3.2' });
    expect(phanTichCanDung('tien-de-day-du')).toEqual({ loai: 'tien-de' });
    expect(phanTichCanDung('bua-1.2')).toBeNull();
  });

  it('tên đọc được', () => {
    expect(tenKhoi('dinh-ly-1.4.3')).toBe('Định lý 1.4.3');
    expect(tenKhoi('bo-de-1.3.8', 'Đặc trưng ε')).toBe('Bổ đề 1.3.8 (Đặc trưng ε)');
    expect(tenKhoi('tien-de-day-du', 'Tiên đề Đầy đủ')).toBe('Tiên đề Đầy đủ');
  });

  it('tìm mục chứa khối', () => {
    const theoMuc = { '1.3': trichKhoiSo('<BoDe so="1.3.8">'), '1.4': trichKhoiSo('<DinhLy so="1.4.3">') };
    expect(timMucCuaKhoi(theoMuc, 'dinh-ly-1.4.3')).toBe('1.4');
    expect(timMucCuaKhoi(theoMuc, 'dinh-ly-9.9.9')).toBeUndefined();
  });

  it('nhận biết bài đã có hướng dẫn', () => {
    expect(coHuongDan('<De>…</De><GoiY so={1}>…</GoiY>')).toBe(true);
    expect(coHuongDan('<De>…</De><LoiGiai>…</LoiGiai>')).toBe(true);
    expect(coHuongDan('<De>chỉ có đề</De>')).toBe(false);
  });
});

describe('liên kết và thuật ngữ trong bài', () => {
  it('trích XemMuc theo mục, bài giảng, bài tập', () => {
    const mdx = '<XemMuc muc="1.3" /> và <XemMuc bai={2} chu="x" /> rồi <XemMuc bai-tap="1.3.6" />';
    expect(trichXemMuc(mdx)).toEqual([{ muc: '1.3' }, { bai: 2 }, { baiTap: '1.3.6' }]);
  });
  it('trích mã thuật ngữ', () => {
    expect(trichThuatNgu('<ThuatNgu id="supremum">sup</ThuatNgu> <ThuatNgu en={false} id="field" />')).toEqual([
      'supremum',
      'field',
    ]);
  });
});

describe('liên kết chéo', () => {
  const baiGiang = [
    { bai: 2, phu_muc: ['1.3'] },
    { bai: 1, phu_muc: ['1.1'] },
    { bai: 3, phu_muc: ['1.3', '1.4'] },
  ];

  it('bài giảng phủ một mục, xếp theo số bài', () => {
    expect(baiGiangPhuMuc(baiGiang, '1.3').map((b) => b.bai)).toEqual([2, 3]);
    expect(baiGiangPhuMuc(baiGiang, '1.2')).toEqual([]);
  });

  it('bảng đối chiếu Bài ↔ § ↔ Bài tập', () => {
    const bang = bangDoiChieu(
      [
        { so: '1.1', ten: 'Một' },
        { so: '1.2', ten: 'Hai' },
        { so: '1.3', ten: 'Ba' },
      ],
      baiGiang,
      ['1.1', '1.3'],
      [
        { muc: '1.2', nen_lam: true },
        { muc: '1.2', nen_lam: false },
        { muc: '1.3', nen_lam: false },
      ],
    );
    expect(bang).toEqual([
      { muc: '1.1', tenMuc: 'Một', coSach: true, baiGiang: [1], soBaiTap: 0, soNenLam: 0 },
      { muc: '1.2', tenMuc: 'Hai', coSach: false, baiGiang: [], soBaiTap: 2, soNenLam: 1 },
      { muc: '1.3', tenMuc: 'Ba', coSach: true, baiGiang: [2, 3], soBaiTap: 1, soNenLam: 0 },
    ]);
  });
});

describe('kiemTraChuong', () => {
  function chuongMau(): DuLieuChuong {
    return {
      mon: 'giai-tich',
      chuong: 1,
      cacMuc: [
        { so: '1.1', ten: 'Một' },
        { so: '1.2', ten: 'Hai' },
      ],
      baiGiang: [
        { mon: 'giai-tich', chuong: 1, bai: 1, tieu_de: 'B1', phu_muc: ['1.1'], tep: 'bai-1.mdx', noiDung: baiGiangDu },
      ],
      sach: [
        {
          mon: 'giai-tich',
          chuong: 1,
          muc: '1.1',
          tieu_de: 'M',
          loai: 'theo-sach',
          nguon: 'Abbott, Understanding Analysis, 2015',
          tep: '1-1.mdx',
          noiDung: '<DinhLy so="1.1.1">x</DinhLy>',
        },
      ],
      baiTap: [
        {
          so: '1.2.1',
          muc: '1.2',
          do_kho: 'de',
          nen_lam: false,
          can_dung: ['dinh-ly-1.1.1'],
          tep: '1-2-1.mdx',
          noiDung: '<De>…</De>',
        },
      ],
    };
  }

  it('chương hợp lệ thì không có lỗi', () => {
    expect(kiemTraChuong(chuongMau())).toEqual([]);
  });

  it('bắt liên kết chéo hỏng', () => {
    const du = chuongMau();
    du.baiGiang[0].phu_muc = ['1.2'];
    du.baiTap[0].can_dung = ['dinh-ly-1.9.9'];
    const loi = kiemTraChuong(du);
    expect(loi.some((l) => l.includes('phu_muc "1.2"'))).toBe(true);
    expect(loi.some((l) => l.includes('dinh-ly-1.9.9'))).toBe(true);
  });

  it('bắt trùng số bài tập và số không khớp mục', () => {
    const du = chuongMau();
    du.baiTap.push({ ...du.baiTap[0], tep: 'trung.mdx' });
    du.baiTap.push({ ...du.baiTap[0], so: '1.1.3', tep: 'lech.mdx' });
    const loi = kiemTraChuong(du);
    expect(loi.some((l) => l.includes('trùng số bài tập 1.2.1'))).toBe(true);
    expect(loi.some((l) => l.includes('lech.mdx') && l.includes('không khớp muc'))).toBe(true);
  });

  it('bắt thiếu ghi công và thiếu mục bài giảng', () => {
    const du = chuongMau();
    du.sach[0].nguon = '';
    du.baiGiang[0].noiDung = '## Ý tưởng trong 1 câu';
    const loi = kiemTraChuong(du);
    expect(loi.some((l) => l.includes('thiếu ghi công'))).toBe(true);
    expect(loi.some((l) => l.includes('thiếu mục "Bài tập"'))).toBe(true);
  });
});

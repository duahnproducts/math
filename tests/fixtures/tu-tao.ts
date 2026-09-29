// Dữ liệu mẫu cho test tính năng "Tự tạo bài giảng từ PDF": câu trả lời giả của Claude
// (mục lục, dàn ý, bài giảng) và cách đóng gói thành luồng SSE như API thật.
import type { BaiGiangTuTao, DanYChuong, MucLucSach } from '../../src/lib/tu-tao/khung';

export const MUC_LUC_MAU: MucLucSach = {
  ten_mon: 'Kinh tế vĩ mô',
  ten_mon_en: 'Macroeconomics',
  giao_trinh: 'OpenStax, Principles of Macroeconomics 3e',
  mo_ta: 'Tổng sản phẩm quốc nội, lạm phát, thất nghiệp và chính sách tiền tệ.',
  do_lech_trang: 2,
  chuong: [
    { so: 1, ten: 'Đo lường nền kinh tế', ten_en: 'Measuring the Economy', trang_in: 1 },
    { so: 2, ten: 'Lạm phát', ten_en: 'Inflation', trang_in: 3 },
  ],
};

export const DAN_Y_MAU: DanYChuong = {
  muc: [
    { so: '1.1', ten: 'GDP là gì' },
    { so: '1.2', ten: 'GDP danh nghĩa và GDP thực' },
  ],
  bai: [
    {
      so: 1,
      tieu_de: 'Cả nước làm ra bao nhiêu?',
      y_tuong: 'GDP là tổng giá trị hàng hoá cuối cùng làm ra trong một năm.',
      phu_muc: ['1.1'],
      trong_tam: 'Định nghĩa GDP, hàng hoá cuối cùng.',
    },
    {
      so: 2,
      tieu_de: 'Giá tăng có làm GDP tăng?',
      y_tuong: 'GDP thực bỏ phần tăng giá, chỉ giữ phần làm ra nhiều hơn.',
      phu_muc: ['1.2'],
      trong_tam: 'GDP danh nghĩa, GDP thực, chỉ số giảm phát.',
    },
  ],
};

export function baiMau(so: number, tieuDe = `Bài mẫu số ${so}`): BaiGiangTuTao {
  return {
    so,
    tieu_de: tieuDe,
    phu_muc: [`1.${so}`],
    y_tuong: 'GDP là **tổng giá trị** hàng hoá cuối cùng làm ra trong một năm.',
    hinh_dung: 'Hãy tưởng tượng cả nước là **một tiệm bánh** khổng lồ.\n\n| Năm | Số bánh |\n| --- | --- |\n| 2024 | 1.000 |',
    kien_thuc: '## Hàng hoá cuối cùng\n\nLà hàng bán cho người dùng cuối, ví dụ $1$ ổ bánh mì.',
    cong_thuc: [
      {
        ten: 'Công thức GDP theo chi tiêu',
        dung_de: 'Dùng để cộng mọi khoản chi của cả nước.',
        bieu_thuc: 'GDP = C + I + G + (X - M)',
        ky_hieu: [
          { ky_hieu: 'C', nghia: 'tiêu dùng của hộ gia đình' },
          { ky_hieu: '|X - M|', nghia: 'độ lớn của **cán cân** thương mại' },
        ],
        khi_nao_dung: 'Khi đề cho các khoản chi.',
      },
    ],
    vi_du_mau: {
      de: 'Cho $C = 50$, $I = 20$, $G = 10$, $X = 5$, $M = 3$. Tính GDP.',
      cho_gi: 'Năm khoản chi.',
      hoi_gi: 'Tổng GDP.',
      chon_kien_thuc: 'Công thức theo chi tiêu, vì đề cho đúng các khoản chi.',
      giai: '$$GDP = 50 + 20 + 10 + (5 - 3) = 82$$',
      kiem_tra: 'Cộng lại lần nữa vẫn ra $82$.',
      tom_tat_cach_lam: 'Cộng bốn khoản, nhớ trừ nhập khẩu.',
    },
    loi_de_mac: [
      { tieu_de: 'Lỗi 1: Cộng cả hàng trung gian', noi_dung: 'Bột mì đã nằm trong giá bánh.' },
      { tieu_de: 'Lỗi 2: Quên trừ nhập khẩu $M$', noi_dung: 'Hàng nhập không do trong nước làm ra.' },
    ],
    tom_tat: ['GDP đo sản lượng cả nước.', 'Chỉ tính hàng **cuối cùng**.', 'Công thức $C + I + G + NX$.'],
    hieu: 'GDP là cái cân đo cả nền kinh tế.',
    nho: '$GDP = C + I + G + NX$',
    lam: 'Liệt kê từng khoản chi rồi cộng.',
    bai_tap: [
      { do_kho: 'kho', de: 'Bài khó: giải thích vì sao **không** tính hàng trung gian.', goi_y: 'Nghĩ tới việc đếm hai lần.' },
      { do_kho: 'de', de: 'Tính GDP khi $C = 10$, $I = 2$, $G = 3$, $NX = 0$.', goi_y: 'Cộng bốn số.' },
      { do_kho: 'vua', de: 'Nhập khẩu tăng thì GDP đổi thế nào?', goi_y: 'Nhìn dấu của $M$.' },
    ],
  };
}

/** Bài giảng mà nội dung cố chèn mã độc — trang phải lọc sạch. */
export function baiDocHai(so: number): BaiGiangTuTao {
  const b = baiMau(so, 'Bài có mã độc');
  return {
    ...b,
    hinh_dung:
      'Chữ thường <script>window.__bi_tan_cong = true</script> <img src="x" onerror="window.__bi_tan_cong = true"> [bấm vào](javascript:window.__bi_tan_cong=true) ![ảnh](https://example.com/theo-doi.png)',
    loi_de_mac: [{ tieu_de: '<b onmouseover="alert(1)">Lỗi</b>', noi_dung: '<iframe src="https://example.com"></iframe>Nội dung.' }],
  };
}

interface TuyChonSse {
  stop_reason?: string;
  so_manh?: number;
}

/** Đóng gói một đối tượng JSON thành luồng SSE của Messages API (câu trả lời có khuôn JSON). */
export function luongSse(duLieu: unknown, tuyChon: TuyChonSse = {}): string {
  return luongSseVan(JSON.stringify(duLieu), tuyChon);
}

/** Như luongSse, nhưng Claude "viết" đúng đoạn chữ cho trước. */
export function luongSseVan(van: string, tuyChon: TuyChonSse = {}): string {
  const soManh = tuyChon.so_manh ?? 4;
  const coManh = Math.ceil(van.length / soManh);
  const manh: string[] = [];
  for (let i = 0; i < van.length; i += coManh) manh.push(van.slice(i, i + coManh));
  const suKien = (ten: string, data: unknown) => `event: ${ten}\ndata: ${JSON.stringify(data)}\n\n`;
  return [
    suKien('message_start', {
      type: 'message_start',
      message: {
        id: 'msg_thu',
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-5-5',
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 1200, output_tokens: 1, cache_creation_input_tokens: 20000, cache_read_input_tokens: 0 },
      },
    }),
    suKien('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }),
    ...manh.map((m) =>
      suKien('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: m } }),
    ),
    suKien('content_block_stop', { type: 'content_block_stop', index: 0 }),
    suKien('message_delta', {
      type: 'message_delta',
      delta: { stop_reason: tuyChon.stop_reason ?? 'end_turn', stop_sequence: null },
      usage: { output_tokens: 5000 },
    }),
    suKien('message_stop', { type: 'message_stop' }),
  ].join('');
}

import { describe, expect, it } from 'vitest';
import { DAN_Y_MAU, MUC_LUC_MAU, baiMau, luongSse, luongSseVan } from '../../../tests/fixtures/tu-tao';
import { LOI_NHAC_HE_THONG } from './loi-nhac';
import {
  BETA_DU_PHONG,
  LoiTaoBai,
  MO_HINH,
  docMucLuc,
  lapDanY,
  taoKetNoi,
  thongBaoLoi,
  vietBai,
} from './goi-claude';

const KHOA = 'sk-ant-api03-thu-nghiem-1234567890';
const PDF = 'JVBERi0xLjcK'; // "%PDF-1.7" dạng base64
const MON = { ten: 'Kinh tế vĩ mô', giao_trinh: 'OpenStax' };
const CHUONG = { so: 1, ten: 'Đo lường', ten_en: 'Measuring', trang_dau: 15, trang_cuoi: 44 };

interface LanGui {
  url: string;
  headers: Headers;
  body: Record<string, any>;
}

/** fetch giả: ghi lại yêu cầu, trả lời bằng hàm cho trước. */
function ketNoiGia(traLoi: () => Response) {
  const daGui: LanGui[] = [];
  const fetchGia = async (url: string | URL | Request, init?: RequestInit) => {
    daGui.push({ url: String(url), headers: new Headers(init?.headers), body: JSON.parse(String(init?.body)) });
    return traLoi();
  };
  return { client: taoKetNoi(KHOA, { fetch: fetchGia as typeof fetch, maxRetries: 0 }), daGui };
}

const sse = (van: string) => () => new Response(van, { status: 200, headers: { 'content-type': 'text/event-stream' } });
const loiApi = (status: number, type: string, message: string) => () =>
  new Response(JSON.stringify({ type: 'error', error: { type, message } }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('yêu cầu gửi đi', () => {
  it('gửi thẳng từ trình duyệt tới Anthropic, đúng mô hình, có dự phòng khi bị từ chối', async () => {
    const { client, daGui } = ketNoiGia(sse(luongSse(MUC_LUC_MAU)));
    await docMucLuc(client, PDF, 40, 300);
    const [g] = daGui;
    expect(g.url).toBe('https://api.anthropic.com/v1/messages?beta=true');
    expect(g.headers.get('x-api-key')).toBe(KHOA);
    expect(g.headers.get('anthropic-dangerous-direct-browser-access')).toBe('true');
    expect(g.headers.get('anthropic-beta')).toContain(BETA_DU_PHONG);
    expect(g.body.model).toBe(MO_HINH);
    expect(g.body.fallbacks).toBe('default');
    expect(g.body.stream).toBe(true);
    expect(g.body.thinking).toEqual({ type: 'adaptive' });
  });

  it('lời nhắc hệ thống và PDF được đánh dấu bộ nhớ đệm, PDF đặt trước nhiệm vụ', async () => {
    const { client, daGui } = ketNoiGia(sse(luongSse(DAN_Y_MAU)));
    await lapDanY(client, PDF, MON, CHUONG);
    const { body } = daGui[0];
    expect(body.system).toEqual([{ type: 'text', text: LOI_NHAC_HE_THONG, cache_control: { type: 'ephemeral' } }]);
    const [taiLieu, nhiemVu] = body.messages[0].content;
    expect(taiLieu).toEqual({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: PDF },
      cache_control: { type: 'ephemeral' },
    });
    expect(nhiemVu.text).toContain('LẬP DÀN Ý');
  });

  it('câu trả lời bị buộc theo khuôn JSON của từng nhiệm vụ', async () => {
    const { client, daGui } = ketNoiGia(sse(luongSse(baiMau(2))));
    await vietBai(client, PDF, MON, CHUONG, DAN_Y_MAU, DAN_Y_MAU.bai[1]);
    const { output_config } = daGui[0].body;
    expect(output_config.format.type).toBe('json_schema');
    expect(Object.keys(output_config.format.schema.properties)).toContain('vi_du_mau');
    expect(output_config.effort).toBe('high');
  });
});

describe('đọc câu trả lời', () => {
  it('trả về dữ liệu đã kiểm tra, chi phí, và báo số chữ đã viết', async () => {
    const { client } = ketNoiGia(sse(luongSse(MUC_LUC_MAU, { so_manh: 5 })));
    const soChu: number[] = [];
    const kq = await docMucLuc(client, PDF, 40, 300, { khiViet: (n) => soChu.push(n) });
    expect(kq.du_lieu).toEqual(MUC_LUC_MAU);
    expect(kq.chi_phi).toBeGreaterThan(0);
    expect(soChu.length).toBeGreaterThan(1);
    expect(soChu).toEqual([...soChu].sort((a, b) => a - b));
    expect(soChu.at(-1)).toBe(JSON.stringify(MUC_LUC_MAU).length);
  });

  it('bài viết ra được chuẩn hoá theo dàn ý', async () => {
    const { client } = ketNoiGia(sse(luongSse(baiMau(9))));
    const kq = await vietBai(client, PDF, MON, CHUONG, DAN_Y_MAU, DAN_Y_MAU.bai[1]);
    expect(kq.du_lieu.so).toBe(2);
    expect(kq.du_lieu.bai_tap.map((b) => b.do_kho)).toEqual(['de', 'vua', 'kho']);
  });

  it('Claude từ chối, trả lời bị cắt, hay sai khuôn thì báo lỗi rõ ràng', async () => {
    await expect(docMucLuc(ketNoiGia(sse(luongSse({}, { stop_reason: 'refusal' }))).client, PDF, 40, 300)).rejects.toThrow(
      /từ chối/,
    );
    await expect(
      docMucLuc(ketNoiGia(sse(luongSse(MUC_LUC_MAU, { stop_reason: 'max_tokens' }))).client, PDF, 40, 300),
    ).rejects.toThrow(LoiTaoBai);
    await expect(docMucLuc(ketNoiGia(sse(luongSseVan('{"ten_mon": "cắt dở'))).client, PDF, 40, 300)).rejects.toThrow(
      /sai khuôn/,
    );
  });
});

describe('thongBaoLoi', () => {
  async function loiKhiGoi(traLoi: () => Response): Promise<unknown> {
    try {
      await docMucLuc(ketNoiGia(traLoi).client, PDF, 40, 300);
    } catch (e) {
      return e;
    }
    throw new Error('lẽ ra phải lỗi');
  }

  it('khoá sai', async () => {
    expect(thongBaoLoi(await loiKhiGoi(loiApi(401, 'authentication_error', 'invalid x-api-key')))).toMatch(
      /Khoá API không đúng/,
    );
  });

  it('yêu cầu bị từ chối: kèm lý do của Anthropic', async () => {
    const tb = thongBaoLoi(await loiKhiGoi(loiApi(400, 'invalid_request_error', 'Your credit balance is too low.')));
    expect(tb).toContain('Your credit balance is too low.');
    expect(tb).toContain('console.anthropic.com');
  });

  it('quá hạn mức và máy chủ quá tải', async () => {
    expect(thongBaoLoi(await loiKhiGoi(loiApi(429, 'rate_limit_error', 'slow down')))).toMatch(/hạn mức/);
    expect(thongBaoLoi(await loiKhiGoi(loiApi(529, 'overloaded_error', 'Overloaded')))).toMatch(/quá tải/);
  });

  it('bấm dừng', async () => {
    const dk = new AbortController();
    dk.abort();
    let loi: unknown;
    try {
      await docMucLuc(ketNoiGia(sse(luongSse(MUC_LUC_MAU))).client, PDF, 40, 300, { dung: dk.signal });
    } catch (e) {
      loi = e;
    }
    expect(thongBaoLoi(loi)).toBe('Đã dừng.');
  });

  it('nội dung chưa đủ khung', async () => {
    const e = await loiKhiGoi(sse(luongSse({ ...MUC_LUC_MAU, chuong: 'không phải mảng' })));
    expect(thongBaoLoi(e)).toMatch(/chưa đủ khung/);
  });

  it('lỗi thường và thứ không phải lỗi', () => {
    expect(thongBaoLoi(new Error('Hỏng rồi.'))).toBe('Hỏng rồi.');
    expect(thongBaoLoi('???')).toMatch(/không rõ/);
  });
});

// Gọi Claude thẳng từ trình duyệt bằng khoá API của người học (web tĩnh, không có
// máy chủ trung gian). Mỗi lần gọi gửi: lời nhắc hệ thống (phương pháp dạy + bài mẫu),
// phần PDF đã cắt, rồi một nhiệm vụ; câu trả lời bị buộc theo khuôn JSON ở khung.ts.
//
// Bộ nhớ đệm (prompt caching): lời nhắc hệ thống giống nhau ở mọi lần gọi; PDF của
// một chương giống nhau ở lần lập dàn ý và các lần viết bài. Đánh dấu cả hai, nên từ
// lần gọi thứ hai trở đi phần lớn đầu vào được đọc lại với giá rẻ hơn nhiều.
import Anthropic from '@anthropic-ai/sdk';
import { chiPhiTheoToken, type SoToken } from './chi-phi';
import {
  LoiDuLieu,
  SCHEMA_BAI_GIANG,
  SCHEMA_DAN_Y,
  SCHEMA_MUC_LUC,
  kiemTraBaiGiang,
  kiemTraDanY,
  kiemTraMucLuc,
  type BaiGiangTuTao,
  type BaiTrongDanY,
  type DanYChuong,
  type MucLucSach,
  type Schema,
} from './khung';
import {
  LOI_NHAC_HE_THONG,
  loiNhacBaiGiang,
  loiNhacDanY,
  loiNhacMucLuc,
  type ThongTinChuong,
  type ThongTinMon,
} from './loi-nhac';

import { MO_HINH, TEN_MO_HINH } from './mo-hinh';

export { MO_HINH, TEN_MO_HINH };
/** Claude từ chối một yêu cầu thì máy chủ tự chạy lại bằng mô hình dự phòng Anthropic khuyên dùng. */
export const BETA_DU_PHONG = 'server-side-fallback-2026-07-01';

export function taoKetNoi(khoa: string, them: Partial<ConstructorParameters<typeof Anthropic>[0]> = {}): Anthropic {
  return new Anthropic({
    apiKey: khoa.trim(),
    // Web tĩnh: khoá là của chính người đang dùng trình duyệt, không phải khoá của web
    dangerouslyAllowBrowser: true,
    maxRetries: 2,
    timeout: 20 * 60 * 1000,
    ...them,
  });
}

/** Lỗi của bước tạo bài (Claude từ chối, trả lời bị cắt, sai khuôn…), câu báo bằng tiếng Việt. */
export class LoiTaoBai extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoiTaoBai';
  }
}

export interface TuyChonGoi {
  /** Gọi mỗi khi Claude viết thêm chữ: tổng số ký tự đã viết */
  khiViet?: (soKyTu: number) => void;
  dung?: AbortSignal;
}

export interface KetQua<T> {
  du_lieu: T;
  usage: SoToken;
  /** Chi phí ước tính của lần gọi này (USD) */
  chi_phi: number;
}

interface LanGoi<T> extends TuyChonGoi {
  pdf: string;
  loiNhac: string;
  schema: Schema;
  effort: 'medium' | 'high';
  kiemTra: (x: unknown) => T;
}

async function goi<T>(client: Anthropic, lg: LanGoi<T>): Promise<KetQua<T>> {
  const luong = client.beta.messages.stream(
    {
      model: MO_HINH,
      max_tokens: 64000,
      betas: [BETA_DU_PHONG],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: {
        effort: lg.effort,
        format: { type: 'json_schema', schema: lg.schema as unknown as Record<string, unknown> },
      },
      system: [{ type: 'text', text: LOI_NHAC_HE_THONG, cache_control: { type: 'ephemeral' } }],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: lg.pdf },
              cache_control: { type: 'ephemeral' },
            },
            { type: 'text', text: lg.loiNhac },
          ],
        },
      ],
    },
    { signal: lg.dung },
  );
  if (lg.khiViet) {
    const khiViet = lg.khiViet;
    luong.on('text', (_them, toanBo) => khiViet(toanBo.length));
  }
  const tn = await luong.finalMessage();

  if (tn.stop_reason === 'refusal') {
    throw new LoiTaoBai('Claude từ chối xử lý phần tài liệu này. Hãy thử lại, hoặc chọn một khoảng trang khác.');
  }
  if (tn.stop_reason === 'max_tokens') {
    throw new LoiTaoBai('Câu trả lời quá dài nên bị cắt giữa chừng. Hãy chia chương thành khoảng trang ngắn hơn rồi thử lại.');
  }
  const van = tn.content.flatMap((k) => (k.type === 'text' ? [k.text] : [])).join('');
  let json: unknown;
  try {
    json = JSON.parse(van);
  } catch {
    throw new LoiTaoBai('Claude trả lời sai khuôn dữ liệu. Hãy thử lại.');
  }
  return { du_lieu: lg.kiemTra(json), usage: tn.usage, chi_phi: chiPhiTheoToken(tn.usage) };
}

/** Đọc bìa và mục lục ở mấy chục trang đầu file. */
export function docMucLuc(
  client: Anthropic,
  pdf: string,
  soTrangGui: number,
  tongSoTrang: number,
  tuyChon: TuyChonGoi = {},
): Promise<KetQua<MucLucSach>> {
  return goi(client, {
    ...tuyChon,
    pdf,
    loiNhac: loiNhacMucLuc(soTrangGui, tongSoTrang),
    schema: SCHEMA_MUC_LUC,
    effort: 'medium',
    kiemTra: kiemTraMucLuc,
  });
}

/** Đọc cả chương, liệt kê các mục § và chia chương thành các bài giảng. */
export function lapDanY(
  client: Anthropic,
  pdf: string,
  mon: ThongTinMon,
  chuong: ThongTinChuong,
  tuyChon: TuyChonGoi = {},
): Promise<KetQua<DanYChuong>> {
  return goi(client, {
    ...tuyChon,
    pdf,
    loiNhac: loiNhacDanY(mon, chuong),
    schema: SCHEMA_DAN_Y,
    effort: 'high',
    kiemTra: kiemTraDanY,
  });
}

/** Viết trọn một bài giảng 8 mục theo dàn ý. */
export function vietBai(
  client: Anthropic,
  pdf: string,
  mon: ThongTinMon,
  chuong: ThongTinChuong,
  danY: DanYChuong,
  bai: BaiTrongDanY,
  tuyChon: TuyChonGoi = {},
): Promise<KetQua<BaiGiangTuTao>> {
  return goi(client, {
    ...tuyChon,
    pdf,
    loiNhac: loiNhacBaiGiang(mon, chuong, danY, bai),
    schema: SCHEMA_BAI_GIANG,
    effort: 'high',
    kiemTra: (x) => kiemTraBaiGiang(x, bai.so),
  });
}

/** Lỗi bất kỳ → một câu tiếng Việt cho người học biết phải làm gì. */
export function thongBaoLoi(e: unknown): string {
  if (e instanceof Anthropic.APIUserAbortError) return 'Đã dừng.';
  if (e instanceof Anthropic.AuthenticationError) return 'Khoá API không đúng hoặc đã bị thu hồi. Hãy kiểm tra lại khoá.';
  if (e instanceof Anthropic.PermissionDeniedError) return `Khoá API này không có quyền dùng ${TEN_MO_HINH}.`;
  if (e instanceof Anthropic.RateLimitError) {
    return 'Tài khoản đang gửi quá nhiều yêu cầu hoặc đã chạm hạn mức. Chờ ít phút rồi bấm tạo tiếp.';
  }
  if (e instanceof Anthropic.BadRequestError) {
    const chiTiet = (e.error as { error?: { message?: string } } | undefined)?.error?.message ?? e.message;
    return `Anthropic từ chối yêu cầu: ${chiTiet} Nếu tài khoản hết tiền, hãy nạp thêm ở console.anthropic.com.`;
  }
  if (e instanceof Anthropic.APIConnectionTimeoutError) return 'Chờ quá lâu mà máy chủ Claude chưa trả lời. Hãy bấm tạo tiếp.';
  if (e instanceof Anthropic.APIConnectionError) return 'Không kết nối được tới máy chủ Claude. Kiểm tra mạng rồi thử lại.';
  if (e instanceof Anthropic.InternalServerError) return 'Máy chủ Claude đang quá tải hoặc gặp sự cố. Thử lại sau ít phút.';
  if (e instanceof Anthropic.APIError) return `Máy chủ Claude báo lỗi (mã ${e.status ?? '?'}). Thử lại sau ít phút.`;
  if (e instanceof LoiDuLieu) return `Claude trả về nội dung chưa đủ khung (${e.chiTiet.slice(0, 2).join('; ')}). Hãy bấm tạo tiếp để viết lại.`;
  if (e instanceof Error) return e.message;
  return 'Có lỗi không rõ. Hãy thử lại.';
}

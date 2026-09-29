import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DAN_Y_MAU } from '../../../tests/fixtures/tu-tao';
import { TAM_MUC } from '../noi-dung';
import { TOKEN_HE_THONG } from './chi-phi';
import { BAI_GIANG_MAU, LOI_NHAC_HE_THONG, loiNhacBaiGiang, loiNhacDanY, loiNhacMucLuc } from './loi-nhac';

const mon = { ten: 'Kinh tế vĩ mô', giao_trinh: 'OpenStax' };
const chuong = { so: 2, ten: 'Lạm phát', ten_en: 'Inflation', trang_dau: 41, trang_cuoi: 70 };

describe('lời nhắc hệ thống — "cách làm" của các môn soạn tay', () => {
  it('có đủ khung 8 mục, đúng thứ tự', () => {
    let viTri = 0;
    for (const muc of TAM_MUC) {
      const tim = LOI_NHAC_HE_THONG.indexOf(`**${muc}**`, viTri);
      expect(tim, muc).toBeGreaterThan(-1);
      viTri = tim;
    }
  });

  it('lấy nguyên văn hai bài giảng mẫu từ content/', () => {
    expect(BAI_GIANG_MAU).toHaveLength(2);
    const bai1 = readFileSync('content/giai-tich/chuong-1/giang-day/bai-1.mdx', 'utf8');
    expect(BAI_GIANG_MAU[0]).toBe(bai1);
    for (const b of BAI_GIANG_MAU) expect(LOI_NHAC_HE_THONG).toContain(b.trim());
  });

  it('giữ các nguyên tắc chính của GIA_SU.md', () => {
    for (const y of ['BẢN CHẤT trước CÔNG THỨC', 'Không nhảy kiến thức', 'HIỂU', 'NHỚ', 'LÀM', 'giải thích từng thành phần']) {
      expect(LOI_NHAC_HE_THONG).toContain(y);
    }
  });

  it('dặn tôn trọng bản quyền và chỉ dùng Markdown, không HTML', () => {
    expect(LOI_NHAC_HE_THONG).toMatch(/không chép hay dịch nguyên văn/);
    expect(LOI_NHAC_HE_THONG).toMatch(/Không dùng HTML/);
    expect(LOI_NHAC_HE_THONG).toContain('\\text{…}');
  });

  it('không đổi giữa các lần gọi (để dùng lại bộ nhớ đệm): không có ngày giờ', () => {
    expect(LOI_NHAC_HE_THONG).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  it('độ dài khớp con số dùng để ước tính chi phí', () => {
    // Tiếng Việt khoảng 2–3 ký tự một token
    const uoc = LOI_NHAC_HE_THONG.length / 2.5;
    expect(uoc).toBeGreaterThan(TOKEN_HE_THONG * 0.5);
    expect(uoc).toBeLessThan(TOKEN_HE_THONG * 1.5);
  });
});

describe('lời nhắc từng nhiệm vụ', () => {
  it('đọc mục lục: nói rõ gửi bao nhiêu trang, cách tính độ lệch', () => {
    const s = loiNhacMucLuc(40, 512);
    expect(s).toContain('40 trang đầu');
    expect(s).toContain('512 trang');
    expect(s).toMatch(/độ lệch trang/);
  });

  it('lập dàn ý: có môn, chương, khoảng trang, 3–7 bài', () => {
    const s = loiNhacDanY(mon, chuong);
    expect(s).toContain('Chương 2: Lạm phát (Inflation), trang 41–70');
    expect(s).toContain('3–7 bài giảng');
  });

  it('viết bài: kèm cả dàn ý để các bài không lặp nhau', () => {
    const s = loiNhacBaiGiang(mon, chuong, DAN_Y_MAU, DAN_Y_MAU.bai[1]);
    expect(s).toContain('NHIỆM VỤ: VIẾT BÀI 2');
    expect(s).toContain(JSON.stringify(DAN_Y_MAU, null, 2));
    expect(s).toContain(DAN_Y_MAU.bai[1].trong_tam);
  });
});

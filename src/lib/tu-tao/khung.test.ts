import { describe, expect, it } from 'vitest';
import { DAN_Y_MAU, MUC_LUC_MAU, baiMau } from '../../../tests/fixtures/tu-tao';
import {
  LoiDuLieu,
  SCHEMA_BAI_GIANG,
  SCHEMA_DAN_Y,
  SCHEMA_MUC_LUC,
  baiCanViet,
  kiemTraBaiGiang,
  kiemTraDanY,
  kiemTraMucLuc,
  kiemTraSchema,
  trangThaiChuong,
  type ChuongTuTao,
  type Schema,
} from './khung';

/** Duyệt mọi nút của schema. */
function moiNut(s: Schema, gap: (s: Schema) => void): void {
  gap(s);
  if ('anyOf' in s) s.anyOf.forEach((x) => moiNut(x, gap));
  else if (s.type === 'array') moiNut(s.items, gap);
  else if (s.type === 'object') Object.values(s.properties).forEach((x) => moiNut(x, gap));
}

describe('schema gửi cho structured outputs', () => {
  const cacSchema = { SCHEMA_MUC_LUC, SCHEMA_DAN_Y, SCHEMA_BAI_GIANG };

  it.each(Object.entries(cacSchema))('%s: mọi đối tượng bắt buộc đủ thuộc tính, không cho thuộc tính lạ', (_ten, schema) => {
    moiNut(schema, (s) => {
      if (!('anyOf' in s) && s.type === 'object') {
        expect(s.additionalProperties).toBe(false);
        expect([...s.required].sort()).toEqual(Object.keys(s.properties).sort());
      }
    });
  });

  it.each(Object.entries(cacSchema))('%s: không dùng ràng buộc mà API chưa hỗ trợ', (_ten, schema) => {
    const json = JSON.stringify(schema);
    for (const khoa of ['minLength', 'maxLength', 'minimum', 'maximum', 'multipleOf', 'minItems', 'maxItems', 'pattern']) {
      expect(json).not.toContain(`"${khoa}"`);
    }
  });

  it('bài giảng có đủ các trường cho 8 mục', () => {
    const s = SCHEMA_BAI_GIANG as Extract<Schema, { type: 'object' }>;
    expect(Object.keys(s.properties)).toEqual(
      expect.arrayContaining(['y_tuong', 'hinh_dung', 'kien_thuc', 'cong_thuc', 'vi_du_mau', 'loi_de_mac', 'tom_tat', 'bai_tap']),
    );
  });
});

describe('kiemTraSchema', () => {
  it('báo đúng chỗ sai kiểu và chỗ thiếu', () => {
    const loi = kiemTraSchema(SCHEMA_MUC_LUC, { ...MUC_LUC_MAU, do_lech_trang: '2', chuong: [{ so: 1 }] });
    expect(loi).toContain('$.do_lech_trang: phải là số nguyên, đang là string');
    expect(loi).toContain('$.chuong[0].ten: thiếu');
  });

  it('nhận null ở trường có thể rỗng', () => {
    expect(kiemTraSchema(SCHEMA_MUC_LUC, { ...MUC_LUC_MAU, do_lech_trang: null })).toEqual([]);
  });

  it('chặn giá trị ngoài enum', () => {
    const b = baiMau(1);
    const loi = kiemTraSchema(SCHEMA_BAI_GIANG, { ...b, bai_tap: [{ ...b.bai_tap[0], do_kho: 'rat-kho' }] });
    expect(loi[0]).toMatch(/do_kho: "rat-kho" không thuộc/);
  });
});

describe('kiểm tra câu trả lời của Claude', () => {
  it('mục lục hợp lệ thì trả lại nguyên vẹn', () => {
    expect(kiemTraMucLuc(structuredClone(MUC_LUC_MAU))).toEqual(MUC_LUC_MAU);
  });

  it('mục lục thiếu tên môn thì báo lỗi', () => {
    expect(() => kiemTraMucLuc({ ...MUC_LUC_MAU, ten_mon: '  ' })).toThrow(LoiDuLieu);
  });

  it('dàn ý được đánh số lại 1…n', () => {
    const d = kiemTraDanY({ ...DAN_Y_MAU, bai: DAN_Y_MAU.bai.map((b) => ({ ...b, so: b.so + 10 })) });
    expect(d.bai.map((b) => b.so)).toEqual([1, 2]);
  });

  it('dàn ý không có bài nào thì báo lỗi', () => {
    expect(() => kiemTraDanY({ muc: [], bai: [] })).toThrow(/chưa có bài nào/);
  });

  it('bài giảng: lấy số bài theo dàn ý, xếp bài tập dễ → vừa → khó', () => {
    const b = kiemTraBaiGiang(baiMau(7), 2);
    expect(b.so).toBe(2);
    expect(b.bai_tap.map((x) => x.do_kho)).toEqual(['de', 'vua', 'kho']);
  });

  it('bài giảng thiếu chữ ở một mục bắt buộc thì báo lỗi', () => {
    expect(() => kiemTraBaiGiang({ ...baiMau(1), hinh_dung: '' })).toThrow(/hinh_dung: rỗng/);
    expect(() => kiemTraBaiGiang({ ...baiMau(1), loi_de_mac: [] })).toThrow(/chưa có lỗi nào/);
  });
});

describe('trạng thái chương', () => {
  const chuong = (danY: boolean, soBai: number[]): ChuongTuTao => ({
    so: 1,
    ten: 'C',
    ten_en: 'C',
    trang_dau: 1,
    trang_cuoi: 5,
    dan_y: danY ? DAN_Y_MAU : null,
    bai: soBai.map((s) => baiMau(s)),
  });

  it('chưa tạo → dở dang → xong', () => {
    expect(trangThaiChuong(chuong(false, []))).toEqual({ loai: 'chua-tao' });
    expect(trangThaiChuong(chuong(true, [1]))).toEqual({ loai: 'dang-do', xong: 1, tong: 2 });
    expect(trangThaiChuong(chuong(true, [1, 2]))).toEqual({ loai: 'xong', tong: 2 });
  });

  it('bài cần viết tiếp là bài đầu tiên còn thiếu', () => {
    expect(baiCanViet(chuong(false, []))).toBeNull();
    expect(baiCanViet(chuong(true, [2]))?.so).toBe(1);
    expect(baiCanViet(chuong(true, [1]))?.so).toBe(2);
    expect(baiCanViet(chuong(true, [1, 2]))).toBeNull();
  });
});

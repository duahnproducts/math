import { describe, expect, it } from 'vitest';
import {
  CAC_TAB_DUOI,
  HAN_BONG_TRUOC_MS,
  KHOA_BONG_TRUOC,
  SCRIPT_BONG_THANH_DUOI,
  chiSoTabDuoi,
  docBongTruoc,
  ghiBongTruoc,
} from './thanh-duoi';

describe('các tab của thanh dưới', () => {
  it('đúng bốn mục của product_design.md, mục 9', () => {
    expect(CAC_TAB_DUOI.map((t) => t.nhan)).toEqual(['Trang chủ', 'Môn học', 'Bài tập', 'Thuật ngữ']);
  });

  it('vị trí của từng tab; trang không thuộc tab nào → -1', () => {
    expect(chiSoTabDuoi('trang-chu')).toBe(0);
    expect(chiSoTabDuoi('thuat-ngu')).toBe(3);
    expect(chiSoTabDuoi(undefined)).toBe(-1);
  });
});

describe('bong bóng trượt từ ô cũ', () => {
  const bayGio = 1_000_000;

  it('ghi rồi đọc lại được ô cũ', () => {
    expect(docBongTruoc(ghiBongTruoc(0, bayGio - 300), 2, bayGio)).toBe(0);
  });

  it('không cần trượt: chưa ghi, ghi hỏng, bấm lại đúng ô đang đứng', () => {
    expect(docBongTruoc(null, 2, bayGio)).toBeNull();
    expect(docBongTruoc('lung-tung', 2, bayGio)).toBeNull();
    expect(docBongTruoc(ghiBongTruoc(2, bayGio), 2, bayGio)).toBeNull();
  });

  it('trang mới không thuộc tab nào thì không trượt', () => {
    expect(docBongTruoc(ghiBongTruoc(1, bayGio), -1, bayGio)).toBeNull();
  });

  it('lần bấm quá cũ (đã bị huỷ) hoặc đồng hồ lùi thì bỏ qua', () => {
    expect(docBongTruoc(ghiBongTruoc(1, bayGio - HAN_BONG_TRUOC_MS - 1), 2, bayGio)).toBeNull();
    expect(docBongTruoc(ghiBongTruoc(1, bayGio + 50), 2, bayGio)).toBeNull();
  });

  it('ô không có thật thì bỏ qua', () => {
    expect(docBongTruoc(ghiBongTruoc(CAC_TAB_DUOI.length, bayGio), 1, bayGio)).toBeNull();
  });
});

describe('script ngay sau thanh dưới', () => {
  /** Chạy script với thanh giả, sessionStorage giả và requestAnimationFrame chạy ngay. */
  function chay(chiSoMoi: number, daLuu: string | null, bayGio: number, chanKho = false) {
    const thuocTinh = new Map<string, string>([['data-chi-so', String(chiSoMoi)]]);
    const cacLanDatIndex: string[] = [];
    const lucDungYen: boolean[] = [];
    const thanh = {
      getAttribute: (k: string) => thuocTinh.get(k) ?? null,
      setAttribute: (k: string, v: string) => thuocTinh.set(k, v),
      removeAttribute: (k: string) => thuocTinh.delete(k),
      style: {
        setProperty: (k: string, v: string) => {
          if (k === '--index') {
            cacLanDatIndex.push(v);
            lucDungYen.push(thuocTinh.has('data-dung-yen'));
          }
        },
      },
    };
    const document = { querySelector: (s: string) => (s === '[data-thanh-duoi]' ? thanh : null) };
    const kho = new Map<string, string>(daLuu === null ? [] : [[KHOA_BONG_TRUOC, daLuu]]);
    const sessionStorage = {
      getItem: (k: string) => {
        if (chanKho) throw new Error('bị chặn');
        return kho.get(k) ?? null;
      },
      removeItem: (k: string) => kho.delete(k),
    };
    const DateGia = { now: () => bayGio };
    const raf = (f: () => void) => f();
    new Function('document', 'sessionStorage', 'Date', 'requestAnimationFrame', SCRIPT_BONG_THANH_DUOI)(
      document,
      sessionStorage,
      DateGia,
      raf,
    );
    return { cacLanDatIndex, lucDungYen, conDungYen: thuocTinh.has('data-dung-yen'), conLuu: kho.has(KHOA_BONG_TRUOC) };
  }

  it('đặt bong bóng ở ô cũ (không hiệu ứng) rồi mới cho trượt sang ô mới', () => {
    const kq = chay(2, ghiBongTruoc(0, 900), 1000);
    expect(kq.cacLanDatIndex).toEqual(['0', '2']);
    expect(kq.lucDungYen).toEqual([true, false]);
    expect(kq.conDungYen).toBe(false);
  });

  it('dùng xong thì xoá, lần tải lại sau không trượt nữa', () => {
    expect(chay(2, ghiBongTruoc(0, 900), 1000).conLuu).toBe(false);
  });

  it('khớp với docBongTruoc ở mọi trường hợp không cần trượt', () => {
    const bayGio = 100_000;
    const cacCa: [number, string | null][] = [
      [2, null],
      [2, 'lung-tung'],
      [2, ghiBongTruoc(2, bayGio)],
      [-1, ghiBongTruoc(1, bayGio)],
      [2, ghiBongTruoc(1, bayGio - HAN_BONG_TRUOC_MS - 1)],
      [1, ghiBongTruoc(CAC_TAB_DUOI.length, bayGio)],
    ];
    for (const [moi, luu] of cacCa) {
      expect(docBongTruoc(luu, moi, bayGio)).toBeNull();
      expect(chay(moi, luu, bayGio).cacLanDatIndex, `${moi} ${luu}`).toEqual([]);
    }
  });

  it('sessionStorage bị chặn thì thôi, không lỗi', () => {
    expect(() => chay(2, ghiBongTruoc(0, 900), 1000, true)).not.toThrow();
    expect(chay(2, ghiBongTruoc(0, 900), 1000, true).cacLanDatIndex).toEqual([]);
  });

  it('không dùng cú pháp mới (chạy được trên trình duyệt cũ)', () => {
    expect(SCRIPT_BONG_THANH_DUOI).not.toMatch(/=>|\blet\b|\bconst\b|\?\.|`/);
  });
});

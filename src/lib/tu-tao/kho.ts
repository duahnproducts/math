// Kho các môn tự tạo: IndexedDB trong trình duyệt của người học (một bài giảng nặng
// cỡ 15–30 KB, cả cuốn sách dễ vượt 5 MB của localStorage). Không có máy chủ nào giữ
// bản sao, nên có thêm Tải về / Nhập file .json để người học tự sao lưu.
import { chuanHoa } from '../bo-dau';
import { PHIEN_BAN_MON, kiemTraMon, type ChuongTuTao, type MonTuTao } from './khung';

const TEN_CSDL = 'hochanh-tu-tao';
const BANG = 'mon';

function yeuCau<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((xong, loi) => {
    req.onsuccess = () => xong(req.result);
    req.onerror = () => loi(req.error);
  });
}

function moCsdl(idb: IDBFactory): Promise<IDBDatabase> {
  return new Promise((xong, loi) => {
    const req = idb.open(TEN_CSDL, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(BANG, { keyPath: 'id' });
    req.onsuccess = () => xong(req.result);
    req.onerror = () => loi(req.error ?? new Error('Không mở được kho lưu trên máy.'));
    req.onblocked = () => loi(new Error('Kho lưu đang bị một thẻ khác của web giữ. Hãy đóng thẻ đó rồi thử lại.'));
  });
}

async function voiBang<T>(idb: IDBFactory, cheDo: IDBTransactionMode, viec: (b: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const csdl = await moCsdl(idb);
  try {
    const gd = csdl.transaction(BANG, cheDo);
    const ketQua = await yeuCau(viec(gd.objectStore(BANG)));
    await new Promise<void>((xong, loi) => {
      gd.oncomplete = () => xong();
      gd.onerror = () => loi(gd.error);
      gd.onabort = () => loi(gd.error ?? new Error('Không lưu được: bộ nhớ trình duyệt có thể đã đầy.'));
    });
    return ketQua;
  } finally {
    csdl.close();
  }
}

export interface KhoMon {
  danhSach(): Promise<MonTuTao[]>;
  doc(id: string): Promise<MonTuTao | null>;
  luu(mon: MonTuTao, bayGio?: Date): Promise<MonTuTao>;
  xoa(id: string): Promise<void>;
}

/** Kho trên IndexedDB. Test truyền IDBFactory giả (fake-indexeddb). */
export function taoKho(idb: IDBFactory = globalThis.indexedDB): KhoMon {
  return {
    async danhSach() {
      const tatCa = await voiBang<unknown[]>(idb, 'readonly', (b) => b.getAll());
      const hopLe: MonTuTao[] = [];
      for (const x of tatCa) {
        try {
          hopLe.push(kiemTraMon(x));
        } catch {
          // bản ghi hỏng thì bỏ qua, không làm hỏng cả danh sách
        }
      }
      return hopLe.sort((a, b) => b.cap_nhat_luc.localeCompare(a.cap_nhat_luc));
    },
    async doc(id) {
      const x = await voiBang<unknown>(idb, 'readonly', (b) => b.get(id));
      if (x === undefined) return null;
      return kiemTraMon(x);
    },
    async luu(mon, bayGio = new Date()) {
      const moi = { ...mon, cap_nhat_luc: bayGio.toISOString() };
      await voiBang(idb, 'readwrite', (b) => b.put(moi));
      return moi;
    },
    async xoa(id) {
      await voiBang(idb, 'readwrite', (b) => b.delete(id));
    },
  };
}

/** Mã môn: tên không dấu + đuôi ngẫu nhiên, ví dụ "kinh-te-vi-mo-k3f9x". */
export function taoIdMon(ten: string, ngauNhien: () => number = Math.random): string {
  const goc = chuanHoa(ten).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'mon';
  const duoi = Math.floor(ngauNhien() * 36 ** 5)
    .toString(36)
    .padStart(5, '0');
  return `${goc}-${duoi}`;
}

export interface ThongTinMonMoi {
  ten: string;
  ten_en: string;
  giao_trinh: string;
  mo_ta: string;
  ten_file: string;
  tong_so_trang: number;
  chuong: Pick<ChuongTuTao, 'so' | 'ten' | 'ten_en' | 'trang_dau' | 'trang_cuoi'>[];
}

export function taoMonMoi(tt: ThongTinMonMoi, bayGio = new Date(), ngauNhien: () => number = Math.random): MonTuTao {
  const luc = bayGio.toISOString();
  return kiemTraMon({
    phien_ban: PHIEN_BAN_MON,
    id: taoIdMon(tt.ten, ngauNhien),
    ten: tt.ten.trim(),
    ten_en: tt.ten_en.trim(),
    giao_trinh: tt.giao_trinh.trim(),
    mo_ta: tt.mo_ta.trim(),
    ten_file: tt.ten_file,
    tong_so_trang: tt.tong_so_trang,
    tao_luc: luc,
    cap_nhat_luc: luc,
    chuong: tt.chuong.map((c) => ({ ...c, ten: c.ten.trim(), ten_en: c.ten_en.trim(), dan_y: null, bai: [] })),
  });
}

// ---- sao lưu ra file .json ----

const LOAI_FILE = 'hochanh-mon-tu-tao';

export function xuatMon(mon: MonTuTao): string {
  return JSON.stringify({ loai: LOAI_FILE, mon }, null, 2);
}

export function tenFileXuat(mon: MonTuTao): string {
  return `${mon.id}.hochanh.json`;
}

/** Đọc file .json người học nhập vào. Sai khuôn thì báo lỗi bằng tiếng Việt. */
export function docFileMon(noiDung: string): MonTuTao {
  let x: unknown;
  try {
    x = JSON.parse(noiDung);
  } catch {
    throw new Error('File không phải JSON.');
  }
  if (typeof x !== 'object' || x === null || (x as { loai?: unknown }).loai !== LOAI_FILE) {
    throw new Error('Đây không phải file môn học tải về từ Hochanh.');
  }
  return kiemTraMon((x as { mon: unknown }).mon);
}

// Lớp mỏng nối Astro Content Collections với các hàm thuần trong noi-dung.ts.
// Chỉ đọc dữ liệu và sắp xếp; mọi quy tắc nằm ở noi-dung.ts (có test).
import { getCollection, type CollectionEntry } from 'astro:content';
import { soChuongTuSlug } from './duong-dan';
import {
  baiGiangPhuMuc,
  coHuongDan,
  soSanhSo,
  tenKhoi,
  timMucCuaKhoi,
  trichKhoiSo,
  type KhoiSo,
  type LoaiSach,
} from './noi-dung';
import { khoaBaiGiang, khoaBaiTap, khoaSach } from './tien-do';

export type BaiGiangEntry = CollectionEntry<'giangDay'>;
export type SachEntry = CollectionEntry<'sach'>;
export type BaiTapEntry = CollectionEntry<'baiTap'>;
type MonData = CollectionEntry<'monHoc'>['data'];
export type ChuongInfo = MonData['chuong'][number];
export interface MonInfo extends MonData {
  id: string;
}

/** 'giai-tich/chuong-1/bai-tap/1-2-5' → { mon: 'giai-tich', chuong: 1 } */
export function viTriTuId(id: string): { mon: string; chuong: number } {
  const [mon, slugChuong] = id.split('/');
  return { mon, chuong: soChuongTuSlug(slugChuong ?? '') };
}

export async function layDanhSachMon(): Promise<MonInfo[]> {
  const ds = await getCollection('monHoc');
  return ds
    .map((e) => ({ ...e.data, id: e.id.split('/')[0] }))
    .sort((a, b) => a.thu_tu - b.thu_tu);
}

export async function layMon(mon: string): Promise<MonInfo> {
  const m = (await layDanhSachMon()).find((x) => x.id === mon);
  if (!m) throw new Error(`Không có môn ${mon}`);
  return m;
}

export interface DuLieuChuongWeb {
  mon: MonInfo;
  chuong: ChuongInfo;
  loaiSach: LoaiSach;
  baiGiang: BaiGiangEntry[];
  sach: SachEntry[];
  baiTap: BaiTapEntry[];
  khoiTheoMuc: Record<string, KhoiSo[]>;
}

export async function layChuong(mon: string, soChuong: number): Promise<DuLieuChuongWeb> {
  const monInfo = await layMon(mon);
  const chuong = monInfo.chuong.find((c) => c.so === soChuong);
  if (!chuong) throw new Error(`Môn ${mon} không có chương ${soChuong}`);
  const cungChuong = (id: string) => {
    const v = viTriTuId(id);
    return v.mon === mon && v.chuong === soChuong;
  };
  const baiGiang = (await getCollection('giangDay', (e) => cungChuong(e.id))).sort(
    (a, b) => a.data.bai - b.data.bai,
  );
  const sach = (await getCollection('sach', (e) => cungChuong(e.id))).sort((a, b) =>
    soSanhSo(a.data.muc, b.data.muc),
  );
  const baiTap = (await getCollection('baiTap', (e) => cungChuong(e.id))).sort((a, b) =>
    soSanhSo(a.data.so, b.data.so),
  );
  const khoiTheoMuc: Record<string, KhoiSo[]> = {};
  for (const s of sach) khoiTheoMuc[s.data.muc] = trichKhoiSo(s.body ?? '');
  return { mon: monInfo, chuong, loaiSach: monInfo.loai_sach, baiGiang, sach, baiTap, khoiTheoMuc };
}

/** Các chương của một môn, kèm dữ liệu — dùng cho trang môn và trang chủ. */
export async function layCacChuong(mon: string): Promise<DuLieuChuongWeb[]> {
  const m = await layMon(mon);
  return Promise.all(m.chuong.map((c) => layChuong(mon, c.so)));
}

export function baiTapCoHuongDan(bt: BaiTapEntry): boolean {
  return coHuongDan(bt.body ?? '');
}

// ---- khoá tiến độ của một chương ----

export function khoaDocCuaChuong(du: DuLieuChuongWeb): string[] {
  return [
    ...du.baiGiang.map((b) => khoaBaiGiang(du.mon.id, du.chuong.so, b.data.bai)),
    ...du.sach.map((s) => khoaSach(du.mon.id, du.chuong.so, s.data.muc)),
  ];
}

export function khoaBaiTapCuaChuong(du: DuLieuChuongWeb): string[] {
  return du.baiTap.map((b) => khoaBaiTap(du.mon.id, du.chuong.so, b.data.so));
}

export function coNoiDung(du: DuLieuChuongWeb): boolean {
  return du.baiGiang.length + du.sach.length + du.baiTap.length > 0;
}

// ---- liên kết chéo cho một mã khối (can_dung) ----

export interface LienKetKhoi {
  ma: string;
  ten: string;
  muc?: string;
  baiGiang: number[];
}

export function lienKetKhoi(du: DuLieuChuongWeb, ma: string): LienKetKhoi {
  const muc = timMucCuaKhoi(du.khoiTheoMuc, ma);
  const khoi = muc ? du.khoiTheoMuc[muc].find((k) => k.id === ma) : undefined;
  const baiGiang = muc ? baiGiangPhuMuc(du.baiGiang.map((b) => b.data), muc).map((b) => b.bai) : [];
  return { ma, ten: tenKhoi(ma, khoi?.ten), muc, baiGiang };
}

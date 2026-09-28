// Nối tiến độ (localStorage) với trang: ghi chỗ đang học, dấu ✓ đã học, thanh
// tiến độ, nút Học tiếp, bài cần làm lại. Hiển thị bằng textContent, không innerHTML.
import {
  NHAN_TU_DANH_GIA,
  baiCanLamLai,
  boDanhDauDaHoc,
  capNhatViTri,
  chuongGanDay,
  daHoc,
  danhDauDaHoc,
  ketQuaTuDanhGia,
  tienDoBaiTap,
  tienDoDoc,
  type TienDo,
  type ViTri,
} from '../lib/tien-do';
import { capNhatKho, docKho } from './kho';

function docJson<T>(chuoi: string | undefined | null, macDinh: T): T {
  if (!chuoi) return macDinh;
  try {
    return JSON.parse(chuoi) as T;
  } catch {
    return macDinh;
  }
}

/** Trang bài giảng / mục § / bài tập khai báo vị trí trong <body data-vi-tri="…">. */
function ghiViTri(): void {
  const vt = docJson<Omit<ViTri, 'luc'> | null>(document.body.dataset.viTri, null);
  if (!vt) return;
  capNhatKho((td) => capNhatViTri(td, { ...vt, luc: Date.now() }));
}

function veDauDaHoc(td: TienDo): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-khoa-da-hoc]')) {
    el.dataset.daHoc = String(daHoc(td, el.dataset.khoaDaHoc ?? ''));
  }
}

function veNutDanhDau(td: TienDo): void {
  for (const nut of document.querySelectorAll<HTMLButtonElement>('[data-danh-dau]')) {
    const xong = daHoc(td, nut.dataset.khoa ?? '');
    nut.setAttribute('aria-pressed', String(xong));
    const chu = nut.querySelector('[data-chu]');
    if (chu) chu.textContent = xong ? 'Đã học ✓' : 'Đánh dấu đã học';
    const phu = nut.parentElement?.querySelector('[data-goi-y-danh-dau]');
    if (phu) phu.textContent = xong ? 'Bấm lần nữa nếu muốn bỏ đánh dấu.' : 'Học xong thì đánh dấu để theo dõi tiến độ.';
  }
}

function veThanhTienDo(td: TienDo): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-thanh-tien-do]')) {
    const cacKhoa = docJson<string[]>(el.dataset.cacKhoa, []);
    const tt = el.dataset.thanhTienDo === 'bai-tap' ? tienDoBaiTap(td, cacKhoa) : tienDoDoc(td, cacKhoa);
    const ray = el.querySelector<HTMLElement>('.ray');
    ray?.setAttribute('aria-valuenow', String(tt.xong));
    ray?.querySelector<HTMLElement>('span')?.style.setProperty('--p', String(tt.phanTram));
    const soLieu = el.querySelector('[data-so-lieu]');
    if (soLieu) soLieu.textContent = `${tt.xong}/${tt.tong}`;
    el.classList.toggle('xong', tt.tong > 0 && tt.xong === tt.tong);
  }
}

/**
 * Hộp Học tiếp: <div data-hop-hoc-tiep data-chuong="giai-tich/1"> … <a data-hoc-tiep-link> …
 * Không có tiến độ thì giữ nguyên nội dung mặc định (bài đầu tiên).
 */
function veHocTiep(td: TienDo): void {
  for (const hop of document.querySelectorAll<HTMLElement>('[data-hop-hoc-tiep]')) {
    const chuong = hop.dataset.chuong;
    const vt = chuong ? td.lanCuoiTheoChuong[chuong] : td.lanCuoi;
    if (!vt) continue;
    const link = hop.querySelector<HTMLAnchorElement>('[data-hoc-tiep-link]');
    if (link) link.href = vt.href;
    const tieuDe = hop.querySelector('[data-hoc-tiep-tieu-de]');
    if (tieuDe) tieuDe.textContent = vt.tieuDe;
    const viTri = hop.querySelector('[data-hoc-tiep-vi-tri]');
    if (viTri) viTri.textContent = vt.duongDan;
    const nhan = hop.querySelector('[data-hoc-tiep-nhan]');
    if (nhan) nhan.textContent = 'Học tiếp — lần trước bạn dừng ở';
    hop.dataset.coTienDo = 'true';
  }
}

/** Nhãn tự đánh giá cạnh mỗi bài tập trong danh sách. */
function veTrangThaiBaiTap(td: TienDo): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-trang-thai-bai-tap]')) {
    const kq = ketQuaTuDanhGia(td, el.dataset.trangThaiBaiTap ?? '');
    el.textContent = kq ? NHAN_TU_DANH_GIA[kq] : '';
    el.className = `pill trang-thai-bt ${kq === 'lam-duoc' ? 'ok' : kq === 'can-goi-y' ? 'warn' : kq ? 'err' : ''}`;
    const the = el.closest<HTMLElement>('[data-the-bai-tap]');
    if (the) the.dataset.ketQua = kq ?? '';
  }
}

interface MucBaiTap {
  khoa: string;
  so: string;
  href: string;
  ten: string;
}

/** Danh sách "Bài nên làm lại" ở trang chương. */
function veCanLamLai(td: TienDo): void {
  for (const hop of document.querySelectorAll<HTMLElement>('[data-can-lam-lai]')) {
    const cac = docJson<MucBaiTap[]>(hop.dataset.canLamLai, []);
    const theoKhoa = new Map(cac.map((c) => [c.khoa, c]));
    const khoa = baiCanLamLai(td, cac.map((c) => c.khoa));
    const ds = hop.querySelector('ul');
    const rong = hop.querySelector<HTMLElement>('[data-rong]');
    if (!ds) continue;
    ds.replaceChildren(
      ...khoa.map((k) => {
        const c = theoKhoa.get(k)!;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = c.href;
        a.textContent = `Bài ${c.so}${c.ten ? ` — ${c.ten}` : ''}`;
        const kq = ketQuaTuDanhGia(td, k)!;
        const nhan = document.createElement('span');
        nhan.className = `pill ${kq === 'chua-lam-duoc' ? 'err' : 'warn'}`;
        nhan.textContent = NHAN_TU_DANH_GIA[kq];
        li.append(a, ' ', nhan);
        return li;
      }),
    );
    if (rong) rong.hidden = khoa.length > 0;
  }
}

interface ThongTinChuong {
  ten: string;
  href: string;
  khoaDoc: string[];
  khoaBaiTap: string[];
}

/** Trang chủ: tiến độ các chương học gần đây. */
function veChuongGanDay(td: TienDo): void {
  const hop = document.querySelector<HTMLElement>('[data-chuong-gan-day]');
  if (!hop) return;
  const banDo = docJson<Record<string, ThongTinChuong>>(hop.dataset.chuongGanDay, {});
  const ds = hop.querySelector('ul');
  const rong = hop.querySelector<HTMLElement>('[data-rong]');
  if (!ds) return;
  const gan = chuongGanDay(td, 3).filter((v) => banDo[v.chuong]);
  ds.replaceChildren(
    ...gan.map((v) => {
      const c = banDo[v.chuong];
      const doc = tienDoDoc(td, c.khoaDoc);
      const bt = tienDoBaiTap(td, c.khoaBaiTap);
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'card';
      a.href = c.href;
      const ten = document.createElement('strong');
      ten.textContent = c.ten;
      const dong = document.createElement('div');
      dong.className = 'tien-do' + (doc.tong > 0 && doc.xong === doc.tong ? ' xong' : '');
      const ray = document.createElement('span');
      ray.className = 'ray';
      const thanh = document.createElement('span');
      thanh.style.setProperty('--p', String(doc.phanTram));
      ray.append(thanh);
      const so = document.createElement('span');
      so.textContent = `Đã học ${doc.xong}/${doc.tong} · Bài tập làm được ${bt.xong}/${bt.tong}`;
      dong.append(ray, so);
      a.append(ten, dong);
      li.append(a);
      return li;
    }),
  );
  if (rong) rong.hidden = gan.length > 0;
}

function veTatCa(td: TienDo): void {
  veDauDaHoc(td);
  veNutDanhDau(td);
  veThanhTienDo(td);
  veHocTiep(td);
  veTrangThaiBaiTap(td);
  veCanLamLai(td);
  veChuongGanDay(td);
}

export function khoiTaoTienDo(): void {
  ghiViTri();
  for (const nut of document.querySelectorAll<HTMLButtonElement>('[data-danh-dau]')) {
    nut.addEventListener('click', () => {
      const khoa = nut.dataset.khoa ?? '';
      capNhatKho((td) => (daHoc(td, khoa) ? boDanhDauDaHoc(td, khoa) : danhDauDaHoc(td, khoa, Date.now())));
    });
  }
  document.addEventListener('hochanh:tien-do', (e) => veTatCa((e as CustomEvent<TienDo>).detail));
  window.addEventListener('storage', () => veTatCa(docKho()));
  veTatCa(docKho());
}

// Tương tác nhỏ trên trang: tab, bộ lọc bài tập, lọc thuật ngữ, bong bóng thuật ngữ,
// mục lục trang (tô mục đang đọc).
import { khop } from '../lib/bo-dau';
import { BO_LOC_TRONG, docBoLoc, ghiBoLoc, khopBoLoc, type BoLoc } from '../lib/loc-bai-tap';

function khoiTaoTab(): void {
  for (const khung of document.querySelectorAll<HTMLElement>('[data-tabs]')) {
    const tabs = [...khung.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const chon = (tab: HTMLButtonElement, dat = true) => {
      for (const t of tabs) {
        const dangChon = t === tab;
        t.setAttribute('aria-selected', String(dangChon));
        t.tabIndex = dangChon ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
        if (panel) panel.hidden = !dangChon;
      }
      if (dat) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => chon(tab, false));
      tab.addEventListener('keydown', (e) => {
        const buoc = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (buoc) chon(tabs[(i + buoc + tabs.length) % tabs.length]);
      });
    });
    const dauTien = tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0];
    if (dauTien) chon(dauTien, false);
  }
}

function khoiTaoLocBaiTap(): void {
  const khung = document.querySelector<HTMLElement>('[data-bo-loc-bai-tap]');
  if (!khung) return;
  let bl: BoLoc = docBoLoc(location.search);
  const cacThe = [...document.querySelectorAll<HTMLElement>('[data-the-bai-tap]')];
  const dem = document.querySelector('[data-dem-ket-qua]');
  const rong = document.querySelector<HTMLElement>('[data-rong-loc]');

  const ve = () => {
    let hien = 0;
    for (const the of cacThe) {
      const ok = khopBoLoc(
        {
          muc: the.dataset.muc ?? '',
          doKho: the.dataset.doKho ?? '',
          nenLam: the.dataset.nenLam === 'true',
          ketQua: the.dataset.ketQua ?? '',
        },
        bl,
      );
      the.hidden = !ok;
      if (ok) hien++;
    }
    if (dem) dem.textContent = `${hien}/${cacThe.length} bài`;
    if (rong) rong.hidden = hien > 0;
    for (const nut of khung.querySelectorAll<HTMLButtonElement>('[data-loc-muc]')) {
      nut.setAttribute('aria-pressed', String((nut.dataset.locMuc || null) === bl.muc));
    }
    for (const nut of khung.querySelectorAll<HTMLButtonElement>('[data-loc-do-kho]')) {
      nut.setAttribute('aria-pressed', String((nut.dataset.locDoKho || null) === bl.doKho));
    }
    khung.querySelector('[data-loc-nen-lam]')?.setAttribute('aria-pressed', String(bl.nenLam));
    khung.querySelector('[data-loc-lam-lai]')?.setAttribute('aria-pressed', String(bl.lamLai));
    history.replaceState(null, '', `${location.pathname}${ghiBoLoc(bl)}`);
  };

  khung.addEventListener('click', (e) => {
    const nut = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!nut) return;
    if ('locMuc' in nut.dataset) bl = { ...bl, muc: nut.dataset.locMuc || null };
    else if ('locDoKho' in nut.dataset) bl = { ...bl, doKho: (nut.dataset.locDoKho || null) as BoLoc['doKho'] };
    else if ('locNenLam' in nut.dataset) bl = { ...bl, nenLam: !bl.nenLam };
    else if ('locLamLai' in nut.dataset) bl = { ...bl, lamLai: !bl.lamLai };
    else if ('locXoa' in nut.dataset) bl = BO_LOC_TRONG;
    else return;
    ve();
  });
  // Kết quả tự đánh giá được điền sau (tien-do.ts) → vẽ lại khi có
  document.addEventListener('hochanh:tien-do', ve);
  requestAnimationFrame(ve);
}

function khoiTaoLocThuatNgu(): void {
  const o = document.querySelector<HTMLInputElement>('[data-tim-thuat-ngu]');
  if (!o) return;
  const dong = [...document.querySelectorAll<HTMLElement>('[data-dong-thuat-ngu]')];
  const dem = document.querySelector('[data-dem-thuat-ngu]');
  const rong = document.querySelector<HTMLElement>('[data-rong-thuat-ngu]');
  const ve = () => {
    let hien = 0;
    for (const d of dong) {
      const ok = khop(d.textContent ?? '', o.value);
      d.hidden = !ok;
      if (ok) hien++;
    }
    for (const nhom of document.querySelectorAll<HTMLElement>('[data-nhom-thuat-ngu]')) {
      nhom.hidden = !nhom.querySelector('[data-dong-thuat-ngu]:not([hidden])');
    }
    if (dem) dem.textContent = `${hien} thuật ngữ`;
    if (rong) rong.hidden = hien > 0;
  };
  o.addEventListener('input', ve);
  ve();
}

/** Trên màn hình cảm ứng: chạm thuật ngữ để mở/đóng bong bóng nghĩa. */
function khoiTaoBongThuatNgu(): void {
  document.addEventListener('click', (e) => {
    const nut = (e.target as HTMLElement).closest('[data-thuat-ngu] > button');
    for (const mo of document.querySelectorAll('[data-thuat-ngu].mo')) {
      if (!nut || mo !== nut.parentElement) mo.classList.remove('mo');
    }
    nut?.parentElement?.classList.toggle('mo');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') for (const mo of document.querySelectorAll('[data-thuat-ngu].mo')) mo.classList.remove('mo');
  });
}

/** Tô mục đang đọc trong mục lục bên cạnh. */
function khoiTaoMucLucTrang(): void {
  const mucLuc = document.querySelector<HTMLElement>('[data-muc-luc-trang]');
  if (!mucLuc || !('IntersectionObserver' in window)) return;
  const link = new Map<string, HTMLAnchorElement>();
  for (const a of mucLuc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
    link.set(decodeURIComponent(a.hash.slice(1)), a);
  }
  const quanSat = new IntersectionObserver(
    (cac) => {
      for (const c of cac) {
        if (!c.isIntersecting) continue;
        for (const a of link.values()) a.classList.remove('dang-doc');
        link.get(c.target.id)?.classList.add('dang-doc');
      }
    },
    { rootMargin: '-15% 0px -70% 0px' },
  );
  for (const id of link.keys()) {
    const el = document.getElementById(id);
    if (el) quanSat.observe(el);
  }
}

export function khoiTaoTrang(): void {
  khoiTaoTab();
  khoiTaoLocBaiTap();
  khoiTaoLocThuatNgu();
  khoiTaoBongThuatNgu();
  khoiTaoMucLucTrang();
}

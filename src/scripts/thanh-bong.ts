// Hai thanh của điện thoại: thanh dưới bong bóng và việc ẩn/hiện khi cuộn.
// Lô-gic nằm ở src/lib/thanh-duoi.ts và src/lib/cuon.ts; ở đây chỉ gắn sự kiện.
import { BAT_DAU_CUON, capNhatCuon } from '../lib/cuon';
import { KHOA_BONG_TRUOC, ghiBongTruoc } from '../lib/thanh-duoi';

/** Bấm một ô: ghi lại ô đang đứng để trang mới cho bong bóng trượt từ đó sang. */
function khoiTaoThanhDuoi(): void {
  const thanh = document.querySelector<HTMLElement>('[data-thanh-duoi]');
  if (!thanh) return;
  const chiSo = Number(thanh.dataset.chiSo);
  thanh.addEventListener('click', (e) => {
    const o = (e.target as HTMLElement).closest('a');
    if (!o || chiSo < 0 || o.getAttribute('aria-current') === 'page') return;
    try {
      sessionStorage.setItem(KHOA_BONG_TRUOC, ghiBongTruoc(chiSo, Date.now()));
    } catch {
      // không ghi được thì bong bóng hiện sẵn ở ô mới, không trượt
    }
  });
}

/** Cuộn xuống thì hai thanh lùi đi, cuộn lên thì hiện lại (CSS chỉ áp dụng trên điện thoại). */
function khoiTaoAnKhiCuon(): void {
  const goc = document.documentElement;
  let tt = { ...BAT_DAU_CUON, y: window.scrollY };
  let choVe = false;

  const datAn = (an: boolean) => {
    if (an) goc.setAttribute('data-an-thanh', '');
    else goc.removeAttribute('data-an-thanh');
  };

  const ve = () => {
    choVe = false;
    const y = window.scrollY;
    const cuoiTrang = window.innerHeight + y >= goc.scrollHeight - 4;
    const moi = capNhatCuon(tt, y, cuoiTrang);
    if (moi.an !== tt.an) datAn(moi.an);
    tt = moi;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (choVe) return;
      choVe = true;
      requestAnimationFrame(ve);
    },
    { passive: true },
  );

  // Dùng bàn phím đi vào thanh đang ẩn thì hiện nó ra
  document.addEventListener('focusin', (e) => {
    if (tt.an && (e.target as Element).closest('.topbar, .thanh-duoi')) {
      tt = { ...tt, an: false };
      datAn(false);
    }
  });
}

export function khoiTaoThanhBong(): void {
  khoiTaoThanhDuoi();
  khoiTaoAnKhiCuon();
}

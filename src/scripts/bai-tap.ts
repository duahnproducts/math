// Thẻ bài tập: gợi ý mở dần từng tầng, nhắc 20 phút trước khi xem lời giải
// (chỉ nhắc, không khoá), và tự đánh giá (product_design.md, mục 6).
import { luuTuDanhGia, ketQuaTuDanhGia, NHAN_TU_DANH_GIA, type TuDanhGia } from '../lib/tien-do';
import { capNhatKho, docKho } from './kho';

function nhac(the: HTMLElement, chu: string): void {
  const el = the.querySelector<HTMLElement>('[data-nhac-tang]');
  if (!el) return;
  el.textContent = chu;
  el.hidden = false;
}

function khoiTaoTang(the: HTMLElement): void {
  const tang = (ten: string) => the.querySelector<HTMLDetailsElement>(`details[data-tang="${ten}"]`);
  const goiY1 = tang('goi-y-1');
  const goiY2 = tang('goi-y-2');
  const loiGiai = tang('loi-giai');
  const hoi = the.querySelector<HTMLDialogElement>('dialog[data-hoi-20-phut]');
  let daXacNhan = false;

  // Gợi ý 2 chỉ mở sau gợi ý 1
  goiY2?.querySelector('summary')?.addEventListener('click', (e) => {
    if (goiY2.open || !goiY1 || goiY1.open) return;
    e.preventDefault();
    goiY1.open = true;
    goiY1.querySelector('summary')?.focus();
    nhac(the, 'Mở gợi ý 1 trước đã — thử làm tiếp với hướng đi đó rồi hãy xem bước then chốt.');
  });

  // Lời giải: hỏi "đã tự làm ít nhất 20 phút chưa?" — trả lời gì cũng không khoá
  loiGiai?.querySelector('summary')?.addEventListener('click', (e) => {
    if (loiGiai.open || daXacNhan || !hoi || typeof hoi.showModal !== 'function') return;
    e.preventDefault();
    hoi.showModal();
  });
  hoi?.addEventListener('close', () => {
    if (hoi.returnValue === 'xem' && loiGiai) {
      daXacNhan = true;
      loiGiai.open = true;
      loiGiai.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function khoiTaoTuDanhGia(the: HTMLElement): void {
  const khoa = the.dataset.khoa ?? '';
  const nutCac = [...the.querySelectorAll<HTMLButtonElement>('[data-ket-qua]')];
  const trangThai = the.querySelector('[data-trang-thai-tu-danh-gia]');

  const ve = () => {
    const kq = ketQuaTuDanhGia(docKho(), khoa);
    for (const nut of nutCac) nut.setAttribute('aria-pressed', String(nut.dataset.ketQua === kq));
    if (trangThai) {
      trangThai.textContent = kq
        ? `Đã lưu: ${NHAN_TU_DANH_GIA[kq]}. ${
            kq === 'lam-duoc' ? 'Tốt lắm!' : 'Bài này sẽ hiện trong mục "Bài nên làm lại" ở trang chương.'
          }`
        : 'Chưa tự đánh giá. Kết quả chỉ lưu trên máy này.';
    }
  };
  for (const nut of nutCac) {
    nut.addEventListener('click', () => {
      capNhatKho((td) => luuTuDanhGia(td, khoa, nut.dataset.ketQua as TuDanhGia, Date.now()));
      ve();
    });
  }
  ve();
}

export function khoiTaoBaiTap(): void {
  for (const the of document.querySelectorAll<HTMLElement>('[data-the-bai-tap-chi-tiet]')) {
    khoiTaoTang(the);
    khoiTaoTuDanhGia(the);
  }
}

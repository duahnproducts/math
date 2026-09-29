// Thanh dưới trên điện thoại: viên thuốc kính mờ nổi, mục đang chọn nằm trong
// một bong bóng trượt (học từ thanh điều hướng của `learner`). Chỉ có icon;
// tên mục vẫn còn cho trình đọc màn hình (aria-label) và cho con trỏ (title).

export const CAC_TAB_DUOI = [
  { id: 'trang-chu', nhan: 'Trang chủ', icon: 'house' },
  { id: 'mon', nhan: 'Môn học', icon: 'library' },
  { id: 'bai-tap', nhan: 'Bài tập', icon: 'pencil-line' },
  { id: 'thuat-ngu', nhan: 'Thuật ngữ', icon: 'languages' },
] as const;

export type TabDuoi = (typeof CAC_TAB_DUOI)[number]['id'];

/** Vị trí của tab trong thanh; -1 khi trang không thuộc tab nào (bong bóng ẩn đi). */
export function chiSoTabDuoi(tab: TabDuoi | undefined): number {
  return CAC_TAB_DUOI.findIndex((t) => t.id === tab);
}

/**
 * Khoá sessionStorage ghi "bong bóng vừa rời khỏi ô nào, lúc nào". Mỗi lần bấm
 * là tải cả trang mới, nên trang mới phải biết ô cũ để cho bong bóng trượt từ
 * đó sang — không thì nó chỉ hiện sẵn ở ô mới, mất cái cảm giác trượt.
 */
export const KHOA_BONG_TRUOC = 'hochanh:bong-truoc';

/** Quá thời gian này mà trang mới chưa mở thì coi như lần bấm đó đã bị huỷ. */
export const HAN_BONG_TRUOC_MS = 5000;

export function ghiBongTruoc(chiSo: number, luc: number): string {
  return `${chiSo}:${luc}`;
}

/**
 * Đọc giá trị đã ghi → ô bong bóng phải trượt từ đó, hoặc null khi không cần
 * trượt: chưa ghi gì, ghi hỏng, quá hạn, hay bấm lại đúng ô đang đứng.
 */
export function docBongTruoc(giaTri: string | null, chiSoMoi: number, bayGio: number): number | null {
  if (!giaTri || chiSoMoi < 0) return null;
  const m = /^(\d+):(\d+)$/.exec(giaTri);
  if (!m) return null;
  const cu = Number(m[1]);
  const tuoi = bayGio - Number(m[2]);
  if (cu === chiSoMoi || cu >= CAC_TAB_DUOI.length || tuoi < 0 || tuoi > HAN_BONG_TRUOC_MS) return null;
  return cu;
}

/**
 * Script nhúng ngay sau thanh dưới (is:inline). Nó chạy đồng bộ lúc trình duyệt
 * vừa dựng xong thanh, trước khi thanh kịp được vẽ: đặt bong bóng về ô cũ, rồi
 * hai khung hình sau mới cho trượt sang ô mới. Viết bằng ES5, không import; lô-gic
 * giống hệt `docBongTruoc` (test đối chiếu hai bên).
 */
export const SCRIPT_BONG_THANH_DUOI = `(function(){var n=document.querySelector('[data-thanh-duoi]');if(!n)return;var moi=Number(n.getAttribute('data-chi-so'));var g=null;try{g=sessionStorage.getItem(${JSON.stringify(
  KHOA_BONG_TRUOC,
)});sessionStorage.removeItem(${JSON.stringify(
  KHOA_BONG_TRUOC,
)});}catch(e){}if(!g||moi<0)return;var m=/^(\\d+):(\\d+)$/.exec(g);if(!m)return;var cu=Number(m[1]);var tuoi=Date.now()-Number(m[2]);if(cu===moi||cu>=${
  CAC_TAB_DUOI.length
}||tuoi<0||tuoi>${HAN_BONG_TRUOC_MS})return;n.setAttribute('data-dung-yen','');n.style.setProperty('--index',String(cu));requestAnimationFrame(function(){requestAnimationFrame(function(){n.removeAttribute('data-dung-yen');n.style.setProperty('--index',String(moi));});});})();`;

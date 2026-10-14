import { DE_GIUA_KI, KHOA_BAI_THI, dinhDangGio, docBaiThi, giayConLai } from '../lib/de-giua-ki';

const nutBatDau = document.querySelector<HTMLButtonElement>('#bat-dau')!;
const nutNop = document.querySelector<HTMLButtonElement>('#nop-bai')!;
const nutLai = document.querySelector<HTMLButtonElement>('#lam-lai')!;
const nutDapAn = document.querySelector<HTMLButtonElement>('#xem-dap-an')!;
const noiDungDapAn = document.querySelector<HTMLElement>('#noi-dung-dap-an')!;
const trangThai = document.querySelector<HTMLElement>('#trang-thai-thi')!;
const dongHo = document.querySelector<HTMLElement>('#dong-ho')!;
const luuBai = document.querySelector<HTMLElement>('#luu-bai')!;
const oNhap = [...document.querySelectorAll<HTMLTextAreaElement>('[data-bai-lam]')];
const hop = document.querySelector<HTMLDialogElement>('#xac-nhan-thi')!;
let bai = docBaiThi(null);
try { bai = docBaiThi(localStorage.getItem(KHOA_BAI_THI)); } catch { luuBai.textContent = 'Trình duyệt chặn bộ nhớ: bài làm chỉ giữ trong lần mở này. Hãy chép bài ra giấy trước khi rời trang.'; }
function luu() {
  try { localStorage.setItem(KHOA_BAI_THI, JSON.stringify(bai)); luuBai.textContent = 'Đã lưu bài làm trên trình duyệt này.'; }
  catch { luuBai.textContent = 'Không lưu được bài làm. Hãy chép bài ra giấy trước khi tải lại hoặc rời trang.'; }
}
function ve() {
  const dangThi = bai.batDau !== null && !bai.ketThuc;
  nutBatDau.hidden = bai.batDau !== null || bai.ketThuc;
  nutNop.hidden = !dangThi;
  nutLai.hidden = !bai.ketThuc;
  oNhap.forEach((o) => { o.disabled = !dangThi; });
  trangThai.textContent = bai.ketThuc ? 'Đã kết thúc. Bài làm đã khóa; mở đáp án bên dưới để tự chấm.' : dangThi ? 'Đang làm bài. Đồng hồ tiếp tục chạy khi bạn rời trang.' : 'Sẵn sàng. Bấm Bắt đầu khi bạn muốn tính giờ.';
}
function ketThuc() { bai.ketThuc = true; luu(); ve(); }
function capNhatGio() {
  if (bai.batDau === null) { dongHo.textContent = '60:00'; return; }
  const con = giayConLai(bai.batDau, Date.now());
  dongHo.textContent = dinhDangGio(con);
  if (con === 0 && !bai.ketThuc) { ketThuc(); trangThai.textContent = 'Hết 60 phút. Bài làm đã khóa; bạn có thể xem lời giải để tự chấm.'; }
}
function xacNhan(noiDung: string, tiep: () => void) {
  document.querySelector('#noi-dung-xac-nhan')!.textContent = noiDung;
  hop.returnValue = '';
  hop.addEventListener('close', () => { if (hop.returnValue === 'dong-y') tiep(); }, { once: true });
  hop.showModal();
}
document.querySelectorAll<HTMLElement>('.o-bai-lam').forEach((e) => { e.hidden = false; });
oNhap.forEach((o,i) => {
  o.value = bai.baiLam[i];
  o.addEventListener('input', () => {
    // Kiểm tra mốc kết thúc cả khi tab bị trình duyệt ngừng chạy bộ đếm.
    capNhatGio();
    if (bai.ketThuc) { o.value = bai.baiLam[i]; return; }
    bai.baiLam[i] = o.value; luu();
  });
});
noiDungDapAn.hidden = true;
nutDapAn.hidden = false;
const nutIn = document.querySelector<HTMLButtonElement>('#in-de')!;
nutIn.hidden = false;
nutIn.addEventListener('click', () => window.print());
nutBatDau.addEventListener('click', () => { bai.batDau = Date.now(); luu(); ve(); capNhatGio(); });
nutNop.addEventListener('click', () => xacNhan('Kết thúc bài làm và khóa các ô trả lời? Bạn có thể xem đáp án sau đó.', ketThuc));
nutDapAn.addEventListener('click', () => {
  const mo = () => { if (!bai.ketThuc) ketThuc(); noiDungDapAn.hidden = false; nutDapAn.hidden = true; };
  if (bai.ketThuc) mo();
  else xacNhan('Xem đáp án sẽ kết thúc lượt thi và khóa bài làm hiện tại. Bạn muốn tiếp tục?', mo);
});
nutLai.addEventListener('click', () => xacNhan('Xóa bài làm đã lưu và đặt lại 60 phút để làm lại cùng đề? Hãy chép lại kết quả nếu cần.', () => {
  bai = { batDau: null, ketThuc: false, baiLam: DE_GIUA_KI.map(() => '') };
  oNhap.forEach((o) => { o.value = ''; });
  noiDungDapAn.hidden = true; nutDapAn.hidden = false;
  document.querySelectorAll<HTMLDetailsElement>('.loi-giai-thi').forEach(e => { e.open = false; });
  luu(); ve(); capNhatGio();
}));
ve(); capNhatGio();
setInterval(capNhatGio, 1000);
document.addEventListener('visibilitychange', capNhatGio);
window.addEventListener('focus', capNhatGio);

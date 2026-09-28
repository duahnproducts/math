// Điểm vào duy nhất của JS trên mọi trang. Mỗi phần tự tìm phần tử của mình
// qua thuộc tính data-*, trang nào không có thì bỏ qua.
import { khoiTaoBaiTap } from './bai-tap';
import { khoiTaoGiaoDien } from './giao-dien';
import { khoiTaoTrang } from './giao-dien-trang';
import { khoiTaoTienDo } from './tien-do';

khoiTaoGiaoDien();
khoiTaoTienDo();
khoiTaoBaiTap();
khoiTaoTrang();

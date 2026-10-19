# Bài tập Ross §1–§15

Nguồn: bản PDF Ross ấn bản 2 (2013) và bản dịch §1–§15 do người dùng cung cấp.
Phạm vi 163 bài, theo từng mục: 12, 8, 8, 16, 7, 5, 5, 10, 18, 12, 11, 14,
15, 14, 8. Chương 1 chứa §1–§6; chương 2 chứa §7–§15 (gồm cả chuỗi).

Đề trên web được diễn đạt lại bằng tiếng Việt, giữ đủ ý và dữ kiện, ghi
`de_tom_tat: true`. Không sao chép PDF sách gốc hoặc ảnh trang sách lên web.
Gợi ý, lời giải sáu bước và lỗi hay mắc do người biên soạn viết.
Các bài dẫn chiếu tập hợp, dãy, định lý hoặc hình đều nhắc lại dữ kiện cần thiết
để đọc độc lập. Bài 11.10 mô tả bảng và thứ tự đường chéo bằng văn bản.

Ross đánh số mục bằng một số và bài tập bằng hai số (ví dụ §12, bài 12.14).
Schema chấp nhận dạng này bên cạnh dạng ba số của Nicholson. URL và khóa
tiến độ dùng chính số Ross; không gán số chương giả vào nhãn bài.
Mười bài giảng hiện có nối tới bộ lọc bài tập đúng § qua `phu_muc`.
Không tạo trang Theo sách giả cho các mục chỉ mới có bài tập.

Dữ liệu biên soạn lưu trong `scripts/data/bai-tap-ross.txt`. Tái tạo:

```powershell
python scripts/nhap-bai-tap-ross.py
npm run check
npm test
npm run test:e2e
```

Kiểm kê số bài, từng ý, công thức KaTeX, các chứng minh và phản ví dụ đặc biệt
bằng kiểm thử dữ liệu; nghiệm thu bộ lọc, liên kết, mở gợi ý/lời giải, tự đánh
giá và màn hình điện thoại bằng Playwright.

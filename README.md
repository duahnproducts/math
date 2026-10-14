# Hochanh — web học theo giáo trình

Web tĩnh giúp sinh viên tự học giáo trình đại học bằng tiếng Việt. Mỗi chương có hai
lối vào — **Giảng dạy** (dễ hiểu, có hình) và **bám theo sách** (Dịch nguyên văn /
Theo sách) — cùng bài tập có gợi ý theo tầng và tự đánh giá.

- Sản phẩm làm gì: [`product_design.md`](product_design.md)
- Làm bằng công nghệ gì: [`docs/tech_stack.md`](docs/tech_stack.md)
- Web: <https://duahnproducts.github.io/math/>

## Chạy trên máy

Cần Node ≥ 22.12 (đang dùng Node 24).

```bash
npm install
npm run dev        # http://localhost:4321/math/
```

| Lệnh | Việc |
| --- | --- |
| `npm run build` | Dựng web tĩnh vào `dist/` (khai báo đầu file sai thì báo lỗi) |
| `npm run check` | Kiểm tra kiểu TypeScript |
| `npm test` | Vitest: hàm trong `src/lib`, dữ liệu nội dung, tương phản màu, test shell |
| `npm run test:e2e` | Playwright: vòng học cốt lõi, sáng/tối, giao diện điện thoại, Chương 2 |

## Thêm nội dung

Nội dung là file MDX trong `content/<môn>/chuong-N/`:

- `giang-day/bai-K.mdx` — bài giảng khung 8 mục
- `sach/1-3.mdx` — mục § (có trường `nguon` ghi công, bắt buộc)
- `bai-tap/1-2-5.mdx` — bài tập: `<De>`, `<GoiY so={1}>`, `<GoiY so={2}>`, `<LoiGiai>`, `<LoiHayMac>`

Trỏ sang chương khác: `<XemMuc muc="1.4" />`, `<XemMuc chuong={1} bai={4} />`,
`can_dung: ["dinh-ly-1.4.2"]`.

Phần chưa có thì **không tạo file rỗng** — web tự hiện “Chưa có”. Chạy `npm test` để
kiểm tra liên kết chéo, số hiệu và ghi công trước khi commit.

Nội dung hiện có: Giải tích theo Kenneth Ross §1–§10 (6 bài ở Chương 1, 4 bài
ở Chương 2, PDF tổng hợp 37 trang; bài tập tự soạn nằm cuối mỗi bài). Bộ Abbott
đã gỡ; có bản dịch Ross §1–§15 (PDF, 63 trang) tải ở cả hai chương, chưa chuyển
thành các mục đọc trực tiếp. Đại số tuyến tính Chương 1–3 đọc trực
tiếp trên web, Chương 4–8 có bản dịch PDF tải về; bài giảng Chương 1–3.
Chương 3 có thêm 24 bài luyện tự soạn, mỗi mục ba mức, hai tầng gợi ý và lời giải;
nhãn tự soạn phân biệt với số bài trong sách. Bài tập sách Chương 1 và §2.1–§2.2
giữ nguyên; các mục §2.3–§2.9 và toàn bộ đề gốc Chương 3 chưa chuyển hết.
Kinh tế vi mô Chương 1–3 đọc trực tiếp; Chương 5, 7, 8 có slide dịch PDF.
Chương chỉ có PDF vẫn có trang để tải về, với nhãn rõ phần chưa chuyển lên web.

Đại số có đề giữa kì tự soạn tại `/dai-so/giua-ki/`: Chương 1–3, 60 phút,
6 câu tự luận, 10 điểm. Đồng hồ theo thời gian thật; bài làm lưu tại trình duyệt,
khóa khi hết giờ hoặc kết thúc. Đáp án mở riêng, có lời giải từng bước và thang
điểm từng ý để tự chấm. Nút In đề in phần câu hỏi; đáp án không nằm trong bản in.

## Tự tạo bài giảng từ PDF

Trang `/tu-tao/` cho người học nạp PDF giáo trình của một môn bất kỳ; Claude soạn bài
giảng 8 mục theo cách soạn các môn có sẵn. Chạy hoàn toàn trong trình duyệt bằng khoá
API Claude của người học, bài lưu trong IndexedDB. Chi tiết: `product_design.md` mục 15,
`docs/tech_stack.md` mục 14.

## Giấy phép nội dung

Bản dịch Nicholson và OpenStax theo CC BY-NC-SA 4.0 (không thu phí, không quảng cáo).
Sách Ross và Abbott có bản quyền. Bài giảng dùng lời riêng, ví dụ và bài tập tự
soạn. Bản dịch PDF Ross §1–§15 được đăng theo yêu cầu của chủ website, có ghi
nguồn và ghi rõ là bản dịch không chính thức; không gắn giấy phép CC của các
môn khác cho tài liệu này. Không đăng PDF sách gốc tiếng Anh.

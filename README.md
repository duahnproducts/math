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
đã gỡ; phần Theo sách của Ross chưa có. Đại số tuyến tính Chương 1–3 đọc trực
tiếp trên web, Chương 4–8 có bản dịch PDF tải về; bài giảng và bài tập Chương
1–2. Kinh tế vi mô Chương 1–3 đọc trực tiếp; Chương 5, 7, 8 có slide dịch PDF.
Chương chỉ có PDF vẫn có trang để tải về, với nhãn rõ phần chưa chuyển lên web.

## Tự tạo bài giảng từ PDF

Trang `/tu-tao/` cho người học nạp PDF giáo trình của một môn bất kỳ; Claude soạn bài
giảng 8 mục theo cách soạn các môn có sẵn. Chạy hoàn toàn trong trình duyệt bằng khoá
API Claude của người học, bài lưu trong IndexedDB. Chi tiết: `product_design.md` mục 15,
`docs/tech_stack.md` mục 14.

## Giấy phép nội dung

Bản dịch Nicholson và OpenStax theo CC BY-NC-SA 4.0 (không thu phí, không quảng cáo).
Sách Ross và Abbott có bản quyền: web chỉ diễn đạt lại và dùng ví dụ, bài tập tự
soạn; không đăng bản dịch nguyên văn hay PDF sách gốc.

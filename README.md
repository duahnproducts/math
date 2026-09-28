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
| `npm run test:e2e` | Playwright: vòng học cốt lõi, sáng/tối, giao diện điện thoại |

## Thêm nội dung

Nội dung là file MDX trong `content/<môn>/chuong-N/`:

- `giang-day/bai-K.mdx` — bài giảng khung 8 mục
- `sach/1-3.mdx` — mục § (có trường `nguon` ghi công, bắt buộc)
- `bai-tap/1-2-5.mdx` — bài tập: `<De>`, `<GoiY so={1}>`, `<GoiY so={2}>`, `<LoiGiai>`, `<LoiHayMac>`

Phần chưa có thì **không tạo file rỗng** — web tự hiện “Chưa có”. Chạy `npm test` để
kiểm tra liên kết chéo, số hiệu và ghi công trước khi commit.

## Giấy phép nội dung

Bản dịch Nicholson và OpenStax theo CC BY-NC-SA 4.0 (không thu phí, không quảng cáo).
Sách Abbott có bản quyền: web chỉ diễn đạt lại và dùng lời giải tự viết; không đăng
PDF sách gốc.

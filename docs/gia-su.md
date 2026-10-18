# Gia sư Hochanh — hỏi ngay, không đăng nhập

Cập nhật theo yêu cầu 18/10/2026: chỉ giữ thay đổi hỏi AI không cần đăng nhập.
Repo `duahnproducts/math` tiếp tục công khai, GitHub Pages phục vụ phần học
tĩnh. Máy chủ gia sư hiện tại chỉ nghe 127.0.0.1.

Người học bấm **Hỏi gia sư** và gửi câu hỏi trực tiếp. Đã bỏ OAuth, nút đăng nhập,
callback và token ChatGPT. Máy chủ dùng `OPENAI_API_KEY` cấu hình một lần bởi
chủ ứng dụng; không dùng gói/phiên ChatGPT của cuộc chat Codex. API có hạn mức và
chi phí riêng. Thiếu khóa thì báo chưa cấu hình và không gọi mạng.

## Cấu hình trên máy chủ

Chép `.env.chat.example` vào `.hochanh-local/.env` (thư mục đã bị gitignore):

```dotenv
OPENAI_API_KEY=khóa_API_của_bạn
OPENAI_MODEL=gpt-6.1-sol
```

Không gửi khóa qua chat hoặc đưa vào mã frontend, biến PUBLIC_/VITE_, Git,
workflow build hay bản dist. Có thể đặt biến môi trường thay file .env.
`npm run chat` dựng web và chạy máy chủ; `npm run chat:serve` chạy lại máy chủ
trên bản đã build, nạp `.hochanh-local/.env`. Mở `http://127.0.0.1:4325/math/`.
Đổi khóa/model cần khởi động lại máy chủ. Node >=22.12.

Máy chủ gọi `POST https://api.openai.com/v1/responses`, `store:false`,
`stream:true`. Model do chủ ứng dụng quyết định, frontend không được đổi sang
model khác. Một câu hỏi tại một thời điểm, tối đa 10 câu/phút cho máy chủ và
4.096 output token/câu, timeout 120 giây. Không lưu hội thoại vào đĩa.
Cookie phiên tự tạo, HttpOnly, SameSite=Strict; không yêu cầu người học đăng nhập.
Kiểm Host, Origin, custom header và cookie để chặn CSRF/DNS rebinding. Cookie
này không thay thế xác thực khi triển khai trên Internet.

Hỏi tiếp tối đa 10 lượt. Có gửi đoạn bôi chọn và tùy chọn gửi nội dung trang,
loại thẻ details chưa mở để không tự gửi lời giải ẩn. Không tự đọc PDF hoặc tìm
toàn giáo trình. Markdown được lọc an toàn, công thức qua KaTeX; lỗi/dừng giữ
câu hỏi để thử lại. Bộ dựng Markdown chỉ nạp khi có câu trả lời.

## Giới hạn triển khai

Khóa API hiện chưa được cấu hình nên chưa xác minh inference thật. GitHub Pages
chỉ host tĩnh, không giữ được secret và không chạy máy chủ Node. Muốn dùng qua
mạng cần chọn host backend riêng, cấu hình khóa và quyền truy cập website;
không mở máy chủ loopback này ra Internet. Repo private không tự làm website
private và không làm AI miễn phí.

Kiểm thử: Vitest kiểm request API, thiếu khóa, CSRF, path traversal, model allowlist,
lỗi hạn mức; Playwright kiểm hỏi trực tiếp, retry, công thức, thiếu cấu hình,
điện thoại và bàn phím. Dùng API giả lập, không gửi khóa thật hoặc tính phí.

Nguồn: https://developers.openai.com/api/docs/quickstart

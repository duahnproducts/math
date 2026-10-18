# Gia sư giải đáp trong Hochanh

Theo yêu cầu ngày 18/10/2026: chat bằng tài khoản ChatGPT, đọc ngữ cảnh bài học,
gợi ý từng bước, hỏi tiếp, Markdown và KaTeX. Hộp chat mở từ nút **Hỏi gia sư**;
bôi chọn trong bài trước khi mở để gửi đoạn trích. Có thể tắt gửi nội dung trang.
Chỉ gửi khi bấm Gửi; không gửi lời giải trong thẻ details chưa mở. Không đọc PDF
đính kèm hoặc tự tìm toàn bộ giáo trình. Hội thoại giữ trong bộ nhớ của trang,
tối đa 10 lượt. Dừng hoặc lỗi giữ câu hỏi để gửi lại, không đưa câu trả lời dở
dang vào lịch sử. Nội dung máy sinh được lọc qua bộ Markdown an toàn có sẵn.

## Chạy với gói ChatGPT cá nhân

```powershell
npm install
npm run chat
```

Mở `http://127.0.0.1:4325/math/`, chọn Hỏi gia sư → Continue with ChatGPT,
đăng nhập đúng tài khoản muốn dùng và chấp thuận quyền tại OpenAI. Sau khi quay
lại, chọn mô hình từ danh sách mà tài khoản được cấp. Nút Ngắt kết nối xoá
đăng ký trên máy; có thể đăng ký lại tài khoản khác. Khởi động lại máy chủ cần
đăng nhập lại (giữ client ID và host ID để dùng lại đăng ký cũ).
Đổi cổng: đặt `HOCHANH_CHAT_PORT` trước khi chạy. Cần Node >=22.12 như dự án;
lệnh chat bật sẵn chế độ chạy TypeScript của Node.

## Kết nối và phạm vi triển khai

Máy chủ Node chỉ nghe `127.0.0.1`, phục vụ bản `dist/` dưới `/math/` và API
cùng origin. OAuth authorization code + PKCE, state gắn cookie trình duyệt,
nonce, xác minh JWT bằng JWKS (jose), issuer/audience/expiry và subject khi
đăng nhập lại. Refresh token chỉ ở RAM; refresh đồng thời bị chặn trong lượt
chat. ID token, client ID, subject và email đăng ký nằm trong
`.hochanh-local/registration.json` bị gitignore; không phục vụ thư mục này.
Không sao chép file đăng nhập Codex, không đưa access/refresh token vào JS,
localStorage hoặc Git. POST kiểm Origin, cookie và custom header; kiểm Host
chống DNS rebinding. Máy chủ dành cho một người dùng/một trình duyệt, không
đưa ra mạng LAN hoặc Internet. Đây là ngoại lệ có chủ đích cho ràng buộc web
tĩnh tại `tech_stack.md`; website học gốc vẫn build tĩnh bình thường.

Gọi `https://api.openai.com/v1/models` lấy catalog tài khoản và
`https://api.openai.com/v1/responses` với OAuth token, `store:false`,
`stream:true`, truyền lại lịch sử mỗi lượt. Không dùng backend-api của ChatGPT.
Không tự chuyển sang API tính tiền nếu hết hạn mức gói.

Bản GitHub Pages có giao diện và hướng dẫn chạy cục bộ, chưa có inference
trên host công khai. Tài khoản đang dùng trong cuộc chat Codex không tự cấp
quyền cho Hochanh. Luồng OpenAI đang trong preview, quyền dùng gói phụ thuộc
tài khoản/workspace; chưa thể khẳng định hoạt động thật trước khi chủ tài khoản
hoàn tất đăng nhập và thử một câu hỏi. Muốn phục vụ mọi học viên trên web cần
backend triển khai riêng với xác thực/hạn mức và phương án tài khoản được OpenAI
hỗ trợ; không chia sẻ đăng nhập cá nhân cho khách truy cập.

Nguồn chính thức đã kiểm tra:
- https://developers.openai.com/siwc/token-sharing-open-source
- https://developers.openai.com/siwc/token-sharing-open-source/sign-in
- https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
- https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations

Kiểm thử: Vitest cho validation, SSE và máy chủ với OAuth/API giả lập; Playwright
cho hội thoại, đoạn trích, công thức, retry và màn hình điện thoại. Không dùng
token thật hoặc phát sinh lượt inference trả phí trong kiểm thử.

# Gia sư — đăng nhập bằng tài khoản ChatGPT

Người học mở **Hỏi gia sư** → **Continue with ChatGPT**, đăng nhập tại
`auth.openai.com` và cấp quyền dùng gói cho Hochanh. Sau khi quay lại đúng bài,
chọn mô hình từ danh sách tài khoản được cấp rồi hỏi tiếp. Bản nháp và đoạn
trích được khôi phục sau đăng nhập. Hủy cấp quyền có thông báo riêng.

## Chạy trên máy

```powershell
npm install
npm run chat
```

Mở `http://127.0.0.1:4325/math/` → Hỏi gia sư. Không cần API key cho chế độ
ChatGPT mặc định. Có thể dùng `npm run chat:serve` nếu đã build. Đổi cổng bằng
`HOCHANH_CHAT_PORT`. Khởi động lại máy chủ cần đăng nhập lại; đăng ký và host ID
được dùng lại. Không tự động lấy đăng nhập của Codex hoặc phiên chat đang mở.
Tài khoản cần được OpenAI cho phép dùng gói với ứng dụng; tính năng đang preview.

## Trên GitHub Pages

Repo tiếp tục công khai; Pages phục vụ phần học tĩnh. Nút **Mở bản trên máy để
đăng nhập ChatGPT** đưa sang cùng bài trên máy chủ 127.0.0.1 của người học.
Người học phải chạy `npm run chat` trên máy trước. Không dùng CORS để mở quyền
truy cập token cho trang công khai và không đưa token vào frontend.

Đây không phải đăng nhập OAuth trực tiếp trên GitHub Pages: Pages không chạy
backend/callback và flow OSS yêu cầu HTTP loopback. Muốn dùng gói ChatGPT ngay
trong một web app được host từ xa, phải có phương án được OpenAI cho phép và
backend phù hợp; hiện chưa có đăng ký đó cho Hochanh. Không hứa đăng nhập thật
hoạt động trước khi chủ tài khoản hoàn tất cấp quyền và thử câu hỏi đầu tiên.

## Kết nối và bảo vệ tài khoản

- OAuth authorization code + PKCE S256; state ngẫu nhiên, một lần, hạn 10 phút,
  gắn phiên trình duyệt; nonce và cùng redirect URI khi trao đổi code.
- Client ID mới do OpenAI cấp, dùng `dynamic_agent_client` chỉ cho đăng ký lần
  đầu. Kiểm issuer, audience, expiry, chữ ký JWKS và nonce bằng jose; xác nhận
  subject khi kết nối lại và scope `resource.invoke`, `chatgpt.tokens.use.direct`.
- `.hochanh-local/chatgpt-registration.json` chỉ lưu host ID, issued client ID
  và subject; không lưu email, ID/access/refresh token. Token chỉ ở RAM, tách
  theo phiên trình duyệt. Refresh được tuần tự hóa cho từng phiên.
- Cookie HttpOnly, SameSite=Lax để callback từ OpenAI gửi được cookie. POST
  kiểm Origin, custom header, phiên; kiểm Host chống DNS rebinding. Chỉ nghe
  loopback, không mở máy chủ này ra Internet/LAN.
- Ngắt kết nối trên máy xóa token cục bộ; quyền đã cấp tại OpenAI có thể thu hồi
  trong ChatGPT Settings → Usage. Nút ngắt cục bộ không hứa thu hồi quyền từ xa.
- Catalog qua `/v1/models`; inference `/v1/responses`, OAuth bearer token,
  `store:false`, `stream:true`, lịch sử trong input. Không gửi `max_output_tokens`
  hoặc các trường không được hỗ trợ với token ChatGPT; không dùng backend-api.
- Mô hình phải nằm trong catalog của tài khoản; không tự chuyển sang API trả
  tiền khi đăng nhập/hạn mức gói gặp lỗi. Một lượt đang chạy, timeout 120 giây.

## Chế độ API tùy chọn

Muốn giữ cách dùng khóa máy chủ, đặt trong `.hochanh-local/.env`:

```dotenv
HOCHANH_CHAT_AUTH=api
OPENAI_API_KEY=khóa_API_của_bạn
OPENAI_MODEL=gpt-6.1-sol
```

API là chế độ chọn rõ ràng, không phải fallback. Khóa không đưa vào chat, Git,
PUBLIC_/VITE_ hoặc dist. Đổi lại `HOCHANH_CHAT_AUTH=chatgpt` để đăng nhập gói.
File `.env` đã bị Git loại trừ. Hai chế độ giữ chung kiểm tra model, CSRF và
giới hạn câu hỏi; API thêm giới hạn 4.096 output token và 10 câu/phút.

## Trải nghiệm gia sư và kiểm thử

Hỏi theo ngữ cảnh trang và đoạn bôi chọn; có thể tắt gửi nội dung bài. Không tự
gửi details chưa mở, không tự đọc PDF hoặc tìm toàn giáo trình. Tối đa 10 lượt,
Markdown lọc an toàn, KaTeX tải khi cần. Dừng/lỗi giữ câu hỏi để thử lại.
Hội thoại ở bộ nhớ trang; chỉ bản nháp OAuth tạm nằm trong sessionStorage,
được xóa khi quay về. Không dùng localStorage để lưu token.

Vitest: PKCE, state/cookie/replay/expiry, từ chối cấp quyền, thiếu scope, JWT
không hợp lệ, refresh đồng thời, logout, tách trình duyệt, token không lưu đĩa,
request inference đúng hợp đồng. Playwright: mở đăng nhập, quay về bài, bản
nháp, model, ngắt kết nối, công thức, retry và hướng dẫn trên web tĩnh.
Các test dùng OpenAI giả lập, không lấy tài khoản hoặc phát sinh phí thật.

Nguồn chính thức:
- https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt
- https://developers.openai.com/siwc/token-sharing-open-source/sign-in
- https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference
- https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations

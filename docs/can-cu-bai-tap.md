# Ghi căn cứ tại từng lần áp dụng

Áp dụng cho gợi ý, lời giải, ví dụ mẫu, bài luyện cuối bài giảng, thảo luận và
đáp án giữa kỳ của cả ba môn. Không chỉ đưa một danh sách công thức ở đầu bài.
Ngay sau đoạn/bước sử dụng, hiển thị tên căn cứ; mở ra để đọc phát biểu/công
thức, điều kiện và mục đích áp dụng. Khi cùng căn cứ được dùng lại ở bước khác,
ghi lại tại bước đó. Gợi ý chỉ dẫn phương pháp, không tự chèn đáp số.

Danh mục căn cứ trong `src/lib/can-cu/` được biên soạn theo nội dung hiện có.
Mỗi mục có tên, phát biểu, điều kiện và quy tắc nhận diện cụ thể. Không tự sinh
số định lý. Câu chỉ nêu dữ kiện, biến đơn lẻ hoặc thảo luận không dùng công
thức/định lý không bị ép gắn một định lý giả.

Bộ xử lý cây HTML chạy trước KaTeX: nhận đúng vùng gợi ý/lời giải trong MDX,
giữ đề và bản dịch ngoài vùng này nguyên vẹn. Bài tạo từ JSON và đề giữa kỳ
dùng cùng bộ xử lý khi dựng Markdown; nội dung không tin cậy vẫn đi qua bộ
lọc HTML trước khi thêm các chú thích do hệ thống tạo. Không cần JavaScript
để đọc căn cứ trên các trang tĩnh. Các script sinh nội dung không thể làm mất
chú thích vì chúng được tạo từ nội dung lúc build.

MDX chỉ biên dịch mã căn cứ và câu áp dụng vào component Astro nhỏ; component
dùng danh mục chung để dựng HTML. Công thức lặp lại dùng bộ nhớ đệm KaTeX,
tránh biên dịch hàng nghìn bản sao MathML vào từng module MDX. Phần chú thích
vẫn là HTML tĩnh, mở được khi trình duyệt tắt JavaScript.

Lời nhắc gia sư và Tự tạo yêu cầu ghi tên, công thức/phát biểu và lý do ngay
mỗi lần dùng; chỉ ghi số hiệu khi có nguồn xác thực. Căn cứ của bài tự tạo có
thể lấy trực tiếp từ danh mục công thức người biên soạn đã khai báo trong JSON.

Nghiệm thu: quét toàn bộ các vùng có hướng dẫn, kiểm tra nhắc lại ở các bước
khác nhau, phạm vi gợi ý không lộ lời giải, loại trừ đề/bản dịch, công thức
không lỗi, không chèn HTML không an toàn, giữ điểm số/đáp án/tiến độ, kiểm tra
bài trong sách, bài luyện, Vi mô, giữa kỳ, Tự tạo trên điện thoại và sáng/tối.

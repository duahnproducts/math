# Bài tập Nicholson chương 2 và 3

Nguồn đối chiếu: W. Keith Nicholson, *Linear Algebra with Applications*, Version
2023 – Revision A, PDF người dùng cung cấp, CC BY-NC-SA 4.0.

Chương 2 có 220 bài gốc, chương 3 có 124 bài gốc, gồm cả bài bổ sung cuối chương.
47 bài §2.1–2.2 đã có bản dịch và lời giải; 297 bài mới giữ đề tiếng Anh dưới dạng
SVG cắt đúng vùng từ PDF, kèm hai tầng gợi ý, lời giải và lỗi hay mắc bằng tiếng
Việt. Không xuất cả sách lên web. Giữ riêng 24 bài luyện tự soạn của chương 3.

`content/dai-so/bai-tap-goc.json` là danh mục đầy đủ. Số bài bổ sung trong sách
2.1–2.13 và 3.1–3.6 dùng mã nội bộ 2.0.N / 3.0.N để không trùng các mục chính.
Bài tự soạn chương 3 dùng mã 1001–1003, nhãn hiển thị vẫn là Bài luyện 1–3 theo
mỗi mục. Tiến độ cũ được chuyển một lần sang mã mới trong `chuyenBaiLuyenChuong3`.

## Tái tạo

Cần Python với `sympy` và `pymupdf`. Từ gốc repo:

```powershell
python scripts/tao-loi-giai-nicholson.py
python scripts/nhap-bai-tap-nicholson.py --source "đường dẫn PDF Nicholson 2023" --inventory scripts/data/nicholson-2023-exercise-clips.json
npm run check
npm test
npm run test:e2e
```

Các script lời giải dùng số hữu tỷ và kiểm tra nhân nghịch đảo hai chiều, RREF,
LU, cơ sở vector riêng, truy hồi và đạo hàm khi có phép tính tương ứng. Lời giải
chứng minh được viết riêng theo từng bài. Một số đề có lỗi dữ kiện/thiếu giả thiết;
đề được giữ nguyên và lời giải chỉ rõ lỗi, điều kiện cần hoặc cách hiểu sau khi sửa.

Ảnh SVG loại nền trắng và dùng `currentColor` để đọc được ở cả sáng và tối.
Mỗi ảnh có ID riêng để tránh xung đột khi nhiều vùng trích dẫn nằm chung trang.
Nguồn từng vùng được ghi trong `src/figures/sach/nguon.json`.

Khi nghiệm thu, kiểm tra đủ số bài theo mục, mở lời giải qua lời nhắc tự làm,
công thức không có `.katex-error`, ảnh đề thực sự có chữ và đọc được trên điện
thoại. Có thể hoàn tác bản triển khai bằng cách revert commit chứa bộ bài tập;
tiến độ lưu ở máy người học không bị xóa.

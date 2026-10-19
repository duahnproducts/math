# Bài tập Nicholson chương 2 và 3

Nguồn đối chiếu: W. Keith Nicholson, *Linear Algebra with Applications*, Version
2023 – Revision A, PDF người dùng cung cấp, CC BY-NC-SA 4.0.

Chương 2 có 220 bài gốc, chương 3 có 124 bài gốc, gồm cả bài bổ sung cuối chương.
Tất cả 344 đề có văn bản tiếng Việt, kèm hai tầng gợi ý, lời giải và lỗi hay mắc.
47 đề bài §2.1–2.2 được giữ nguyên; 297 bản dịch mới lưu trong
`scripts/data/de-bai-nicholson-tieng-viet.json`. Bản dịch hiển thị trước; đề tiếng
Anh dưới dạng SVG cắt từ PDF nằm trong khối thu gọn để đối chiếu. Không xuất cả
sách lên web. Giữ riêng 24 bài luyện tự soạn của chương 3.

`content/dai-so/bai-tap-goc.json` là danh mục đầy đủ. Số bài bổ sung trong sách
2.1–2.13 và 3.1–3.6 dùng mã nội bộ 2.0.N / 3.0.N để không trùng các mục chính.
Bài tự soạn chương 3 dùng mã 1001–1003, nhãn hiển thị vẫn là Bài luyện 1–3 theo
mỗi mục. Tiến độ cũ được chuyển một lần sang mã mới trong `chuyenBaiLuyenChuong3`.

## Tái tạo

Cần Python với `sympy` và `pymupdf`. Từ gốc repo:

```powershell
python scripts/tao-loi-giai-nicholson.py
python scripts/nhap-bai-tap-nicholson.py --source "đường dẫn PDF Nicholson 2023" --inventory scripts/data/nicholson-2023-exercise-clips.json
python scripts/cap-nhat-loi-giai-chi-tiet.py
npm run check
npm test
npm run test:e2e
```

Các script lời giải dùng số hữu tỷ và kiểm tra nhân nghịch đảo hai chiều, RREF,
LU, cơ sở vector riêng, truy hồi và đạo hàm khi có phép tính tương ứng. Lời giải
chứng minh được viết riêng theo từng bài. Một số đề có lỗi dữ kiện/thiếu giả thiết;
đề được giữ nguyên và lời giải chỉ rõ lỗi, điều kiện cần hoặc cách hiểu sau khi sửa.
Khi chuyển đề sang văn bản, phải đối chiếu nhãn từng ý và vị trí các công thức
với PDF: bản HTML tham khảo có chỗ gộp hai ý, đổi nhãn hoặc thiếu một ý. Số hiệu
định lý, ví dụ và bài tập theo bản PDF 2023. Các lỗi đọc ma trận/đồ thị phát hiện
trong quá trình này được sửa cả ở lời giải và kiểm thử hồi quy.

Ảnh SVG loại nền trắng và dùng `currentColor` để đọc được ở cả sáng và tối.
Riêng chữ nằm trên nút tô kín của mê cung dùng `var(--paper)` để giữ tương phản.
Mỗi ảnh có ID riêng để tránh xung đột khi nhiều vùng trích dẫn nằm chung trang.
Nguồn từng vùng được ghi trong `src/figures/sach/nguon.json`.

Khi nghiệm thu, kiểm tra đủ số bài theo mục, mở lời giải qua lời nhắc tự làm,
công thức không có `.katex-error`, ảnh đề thực sự có chữ và đọc được trên điện
thoại. Có thể hoàn tác bản triển khai bằng cách revert commit chứa bộ bài tập;
tiến độ lưu ở máy người học không bị xóa.

## Cách trình bày lời giải chi tiết

Toàn bộ 434 trang bài tập Đại số (66 bài chương 1, 220 bài chương 2, 148 bài
chương 3 kể cả 24 bài tự soạn) có các bước giải đọc riêng được. Với bài tính,
`scripts/loi-giai-nicholson/chi_tiet.py` xuất ma trận sau từng phép khử, phép tính
từng ô của tích, từng minor/phần bù, hệ Cramer, hệ số truy hồi, thế tiến/ngược
và kiểm tra cuối. Không chỉ xuất kết quả do thư viện tính.

`trinh_bay.py` giữ nguyên công thức và nhãn từng ý khi tách các lập luận chứng
minh; các ghi chú theo số bài giải thích điều kiện chia/khử, chiều ngược và cách
dựng phản ví dụ. Bài 3.1.7 viết riêng, giải thích vì sao chọn 3/2 và 1/3, rút
hệ số từng hàng và hai lần đổi hàng. Phản ví dụ 2.3.27g phải tạo một tích **không
có bất kỳ hàng 0 nào**, thay vì chỉ làm đổi vị trí hàng 0.

`cap-nhat-loi-giai-chi-tiet.py` đọc bản gốc 137 lời giải trong
`scripts/data/loi-giai-dai-so-co-san.json`, bổ sung các phép khử và giải thích,
để chạy lại không nhân đôi phần bổ sung. Script còn cập nhật
42 bài luyện cuối bài giảng Đại số, 30 bài luyện Giải tích và 6 câu thảo luận Vi
mô hiện có. Nội dung tự soạn trong `scripts/loi_giai_bien_soan.py`; lời giải Giải
tích theo sáu bước dữ kiện → yêu cầu → kiến thức/lý do → giải → kiểm tra → cách
tự làm. Hướng dẫn Vi mô nằm ngoài `<Slide>` và ghi rõ do người biên soạn bổ
sung, giữ tách biệt với bản dịch OpenStax. Không tạo bài tập giả cho các chương
chưa có bài tập trên web. Đề, gợi ý, số hiệu, URL và khóa lưu tiến độ được giữ.

Kiểm thử: `tests/loi-giai-chi-tiet.test.ts` kiểm kê toàn bộ các lời giải, dựng
công thức, đối chiếu các ma trận trung gian của 3.1.5 và phản ví dụ 2.3.27g.
Playwright mở phần lời giải ở cả ba môn trên màn hình nhỏ, kiểm tra thu gọn,
công thức và tự đánh giá còn lưu sau khi tải lại.

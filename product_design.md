# Web học theo giáo trình — Product Design Overview

## 1. Product Overview

**Tên tạm:** Hochanh

### Mục tiêu
Biến bộ tài liệu tự học đang nằm rải rác thành PDF trong thư mục này thành một
trang web học có lộ trình. Mỗi chương của mỗi môn có hai phần:

- **Giảng dạy** — giải thích dễ hiểu, có hình minh hoạ trực quan, đi từ con số 0.
- **Dịch nguyên văn** — bám đúng câu chữ và số hiệu của sách, để đọc đối chiếu.

Kèm theo là **hướng dẫn làm bài tập trong sách**: gợi ý theo từng tầng, rồi mới
đến lời giải.

### Đối tượng
Sinh viên Việt Nam tự học giáo trình tiếng Anh ở bậc đại học, đọc tiếng Anh
chuyên ngành chưa vững.

### Nền tảng
- Web responsive: Chrome, Edge, Safari, Firefox.
- **Ưu tiên laptop và tablet.** Học toán cần giấy bút và cần mở hai thứ cạnh
  nhau (bài giảng ↔ bản dịch ↔ bài tập). Điện thoại vẫn phải đọc tốt, dùng để
  ôn lại. Đây là điểm khác với `learner`, vốn ưu tiên điện thoại trước.

---

## 2. Nguồn tài liệu hiện có

| Môn | Giáo trình | Giấy phép | Giảng dạy | Dịch / Theo sách | Bài tập |
| --- | --- | --- | --- | --- | --- |
| **Giải tích** (`gtich/`) | Abbott, *Understanding Analysis*, Springer 2015 | **Có bản quyền** | Bài giảng 8 mục: Ch 1, 2, 6, 7, 8. Hướng dẫn học tập theo mục: Ch 1–5 | "Trình bày theo sách": Ch 6 | Lời giải Ch 1 (§1.2–1.6). Bài tập dễ → khó cuối mỗi bài giảng |
| **Đại số tuyến tính** (`dai so/`) | Nicholson, *Linear Algebra with Applications*, 2023 | CC BY-NC-SA 4.0 | Bài giảng 8 mục: Ch 1–2 | Bản dịch đầy đủ Ch 1–8 | Đề bài nằm trong bản dịch, chưa có hướng dẫn giải |
| **Kinh tế vi mô** (`micro/`) | OpenStax, *Principles of Microeconomics 3e* (slide) | CC BY-NC-SA 4.0 | Chưa có | Slide dịch trên web: Ch 1–3 (Ch 1 dịch thẳng từ slide gốc). Mới có PDF: Ch 5, 7, 8 | Slide không có bài tập. Câu hỏi cuối chương nằm trong sách, chưa nạp vào |

**Nhận xét:** mỗi môn hiện chỉ mạnh ở một phía. Giải tích mạnh phần giảng dạy,
còn Đại số và Vi mô mạnh phần dịch. Web phải chạy được cả khi một chương mới có
một trong hai phần, và phải cho người học thấy rõ phần nào **chưa có**.

---

## 3. Ràng buộc bản quyền — quyết định cấu trúc sản phẩm

| Nguồn | Được làm | Không được làm |
| --- | --- | --- |
| Nicholson, OpenStax (CC BY-NC-SA 4.0) | Đăng bản dịch nguyên văn | Thu phí, gắn quảng cáo. Bỏ dòng ghi nguồn |
| Abbott (Springer) | Diễn đạt lại định nghĩa, định lý bằng tiếng Việt. Dàn ý chứng minh tự viết. Tóm tắt đề bài | Đăng bản dịch nguyên văn. Đăng PDF sách gốc |

Từ đó rút ra ba quy tắc:

1. Với Giải tích, phần thứ hai của chương mang tên **"Theo sách"** thay vì
   "Dịch nguyên văn". Phần này giữ đúng thứ tự và số hiệu của sách, nhưng chỉ
   gồm phát biểu và dàn ý, giống cách tài liệu Chương 6 đang làm.
2. Mỗi trang dịch có dòng ghi công và giấy phép. Web không thu phí.
3. Không đưa PDF sách gốc lên web hay lên repo công khai. Chúng chỉ nằm trên
   máy để người soạn đối chiếu.

---

## 4. Product Scope — Version 1

### Core — bắt buộc
- Thư viện môn học
- Trang chương: lộ trình và bảng đối chiếu hai phần
- Giảng dạy
- Dịch nguyên văn / Theo sách
- Bài tập kèm gợi ý theo tầng
- Thuật ngữ Anh – Việt

### Supporting
- Ví dụ trực quan: hình tĩnh trước, hình tương tác sau
- Tìm kiếm
- Đánh dấu đã học, tiến độ lưu ngay trên máy
- Chế độ sáng/tối
- Tải PDF bài giảng
- **Tự tạo bài giảng từ PDF** cho môn chưa có trên web — người học dùng khoá API
  Claude của chính mình (mục 15)

### Chưa làm
- Tài khoản, đăng nhập
- Nộp bài làm để được chữa
- AI gia sư trò chuyện, AI chấm bài
- XP, streak, thành tích
- App mobile

---

## 5. Cấu trúc nội dung

```text
Môn
└── Chương
    ├── Giảng dạy        Bài 1 … Bài n
    ├── Dịch nguyên văn  §x.1 … §x.m   (Giải tích: "Theo sách")
    └── Bài tập          x.y.z, đánh số theo sách
```

### 5.1 Phần Giảng dạy — khung 8 mục

Lấy nguyên khung của bộ bài giảng Giải tích (`gtich/tutorial/tutorial.pdf`) và
dùng chung cho cả ba môn:

| # | Mục | Việc của mục |
| --- | --- | --- |
| 1 | Ý tưởng trong 1 câu | Bản chất, nói thật ngắn |
| 2 | Hình dung trực quan | Ví dụ đời thường, hình minh hoạ — chỗ đặt ví dụ trực quan |
| 3 | Kiến thức cần biết | Chỉ những gì thực sự cần |
| 4 | Công thức | Giải thích từng ký hiệu |
| 5 | Ví dụ mẫu | Giải từng bước, không nhảy bước |
| 6 | Lỗi dễ mắc | 2–3 lỗi phổ biến nhất |
| 7 | Tóm tắt 30 giây | Vài dòng cực dễ nhớ |
| 8 | Bài tập | Dễ → vừa → khó |

Giải tích còn có "Hướng dẫn học tập" theo từng mục §, dày hơn bài giảng. Loại
này hiện thành lớp **Đọc sâu** ở trang chương, dành cho người đã quen.

### 5.2 Phần Dịch nguyên văn
- Giữ đúng thứ tự và số hiệu của mục, định nghĩa, định lý, ví dụ, bài tập, để
  tra qua lại với sách gốc.
- Hộp màu theo loại nội dung, lấy theo quy ước của bản dịch Nicholson:
  định nghĩa xanh dương, định lý xanh lá, ví dụ cam, ghi chú xám.
- Thuật ngữ in đậm ở lần đầu, kèm tiếng Anh trong ngoặc. Chạm vào thuật ngữ thì
  hiện nghĩa lấy từ bảng thuật ngữ.
- Vi mô: mỗi slide là một khối. Biểu đồ vẽ lại bằng SVG với nhãn tiếng Việt,
  số viết theo chuẩn Việt Nam (theo `micro/README.md`).

### 5.3 Nối hai phần — giá trị cốt lõi
Hai phần là hai lối vào cùng một nội dung, nên phải nối chéo được với nhau:

- Mỗi bài giảng ghi rõ nó phủ những mục § nào, kèm nút "Đọc nguyên văn §1.3".
- Mỗi mục § có nút "Học dễ hiểu ở Bài 2".
- Mỗi bài tập trỏ tới định nghĩa, định lý cần dùng ở cả hai phần.
- Trang chương có bảng đối chiếu Bài ↔ § ↔ Bài tập.

---

## 6. Hướng dẫn làm bài tập

Mỗi bài tập là một thẻ:

```text
Bài 1.2.5 · §1.2 · Vừa · ★ Nên làm
Đề          dịch nguyên văn (Đại số, Vi mô) / tóm tắt tiếng Việt (Giải tích)
Cần dùng    Định nghĩa 1.2.x, Định lý 1.2.y  → mở được ngay
[Gợi ý 1]   hướng đi
[Gợi ý 2]   bước then chốt
[Lời giải]  đầy đủ, từng bước
Lỗi hay mắc (hộp cam)
Tự đánh giá:  Làm được · Cần gợi ý · Chưa làm được
```

- **Tự làm trước.** Gợi ý mở dần từng tầng. Trước khi mở lời giải, web nhắc
  "Bạn đã tự làm ít nhất 20 phút chưa?". Web chỉ nhắc chứ không khoá, giống lời
  khuyên trong chính các tài liệu hiện có.
- Những bài mà tài liệu ghi "nên làm bằng mọi giá" được gắn dấu ★.
- Bài chưa có hướng dẫn vẫn hiện đề và các mục liên quan, kèm nhãn "Chưa có
  hướng dẫn".
- Kết quả tự đánh giá được lưu lại, để trang chương gợi ý những bài cần làm lại.

---

## 7. Ví dụ trực quan

Nguyên tắc:
- Mỗi khái niệm khó có ít nhất một hình minh hoạ, đặt ở mục 2 của bài giảng.
- Hình vẽ bằng SVG, không dùng ảnh chụp, để nét và đổi được sáng/tối.
- Chỉ làm tương tác khi việc kéo, bấm giúp hiểu hơn; không làm cho vui mắt.

Ví dụ định hướng:

| Môn | Hình |
| --- | --- |
| Giải tích | Đường chéo hình vuông cạnh 1 và √2. Trục số có sup/inf và khoảng ε. Trò chơi ε–N: kéo ε, xem N nhảy. Dải ε quanh f cho hội tụ đều. Tổng Riemann với số khoảng chia thay đổi được |
| Đại số tuyến tính | Khử Gauss: bấm để thực hiện từng phép biến đổi hàng. Phép biến đổi tuyến tính làm biến dạng lưới 2D. Phép chiếu trực giao |
| Kinh tế vi mô | Kéo dịch đường cung, cầu và xem điểm cân bằng di chuyển. Các đường chi phí MC, AC, AVC. Đường giới hạn khả năng sản xuất và chi phí cơ hội |

---

## 8. User Flow

```text
Home → chọn môn → trang chương
     → Giảng dạy (Bài n) ⇄ Dịch nguyên văn (§)
     → Bài tập → gợi ý → tự đánh giá
     → Bài tiếp theo
```

Nguyên tắc: người học luôn biết mình đang ở đâu (Môn › Chương › Bài) và bước
tiếp theo là gì (nút **Học tiếp**).

---

## 9. Screen Map

1. **Home** — Học tiếp, ba môn, tiến độ gần đây
2. **Môn học** — danh sách chương, mỗi chương hiện phần nào đã có, phần nào chưa
3. **Chương** — lộ trình, hai tab *Giảng dạy | Dịch nguyên văn*, bảng đối chiếu, danh sách bài tập
4. **Bài giảng** — 8 mục, mục lục bên cạnh
5. **Trang dịch** — theo mục §, mục lục bên cạnh
6. **Bài tập** — danh sách lọc theo § và độ khó, thẻ bài tập
7. **Thuật ngữ** — Anh – Việt theo môn, có tìm kiếm
8. **Tìm kiếm** — trong cả ba phần
9. **Tự tạo bài giảng** — khoá API, môn của tôi, tạo môn mới từ PDF; trang môn tự tạo
   (các chương, nút tạo bài giảng); trang đọc bài tự tạo (mục 15)

### Điều hướng
- Laptop: thanh bên trái là mục lục của chương đang học.
- Điện thoại: thanh dưới gồm Trang chủ · Môn học · Bài tập · Thuật ngữ, dạng viên
  thuốc bong bóng nổi, chỉ có icon. Cuộn xuống để đọc thì thanh trên và thanh dưới
  lùi đi, cuộn lên thì hiện lại. Web cài được lên màn hình chính để mở toàn màn
  hình, không còn thanh của trình duyệt (`docs/tech_stack.md`, mục 13).

---

## 10. Tiến độ

Người học cần thấy:
- Những bài giảng và mục § đã đọc
- Kết quả tự đánh giá bài tập
- Thanh tiến độ của từng chương
- Chỗ dừng lần trước, để bấm Học tiếp

Tiến độ lưu trong `localStorage`, chưa cần tài khoản.

Web **không** có XP hay streak như `learner`. Người học đọc giáo trình đại học
cần sự tập trung, và nhãn "Làm được / Chưa làm được" đo việc học sát hơn điểm
thưởng.

---

## 11. UI/UX Guidelines

- **Đọc là chính:** cột chữ khoảng 70 ký tự, font hiển thị tiếng Việt tốt, công
  thức hiển thị sắc nét.
- **Một màn hình, một mục tiêu.** Không nhồi bài giảng, bản dịch và bài tập vào
  cùng một chỗ. Người học chuyển giữa chúng bằng liên kết chéo.
- **Hộp màu nhất quán** giữa Giảng dạy, Dịch và Bài tập: màu nào mang nghĩa nào
  thì dùng đúng như vậy ở mọi nơi.
- **Dùng lại thiết kế đã có:** `gtich/translator-ui/DESIGN_SPEC.md` đã có design
  token theo phong cách học thuật, tối giản, một màu nhấn duy nhất, nền giấy kẻ
  ô. Web này lấy lại bộ token đó, và bổ sung giao diện sáng vì đọc lâu trên nền
  tối dễ mỏi mắt.
- Hạn chế thuật ngữ kỹ thuật trên giao diện. Thuật ngữ chuyên ngành luôn có
  tiếng Anh đi kèm.

---

## 12. Technical Architecture

> Phương án công nghệ đã chốt nằm ở `docs/tech_stack.md`. Chỗ nào khác với mục
> này thì theo file đó.

### Frontend
- Astro, TypeScript; React chỉ dùng cho hình tương tác. Bên dưới Astro vẫn là
  Vite, nên dùng lại được kinh nghiệm và cách tổ chức test của `learner`.
- KaTeX hiển thị công thức.

### Nội dung
- Mỗi bài giảng, mục §, bài tập là **một file Markdown** trong `content/`, có
  công thức và khai báo số hiệu ở đầu file.
- **Không nhúng PDF làm nội dung chính.** Nội dung dạng file văn bản thì tìm
  kiếm được, nối chéo được, đặt được hình tương tác, và đọc được trên điện
  thoại. PDF bài giảng vẫn cho tải về.
- Test kiểm tra dữ liệu, giống `hsk1.test.ts` của `learner`: mọi liên kết chéo
  trỏ tới mục có thật, không trùng số hiệu bài tập, chương nào cũng có ghi công.

### Chuyển PDF thành nội dung web
PDF hiện có là **bản xuất**, không phải bản nguồn. Khi trích thử chữ từ PDF,
nhiều file bị mất khoảng trắng ("Tậpsốthực") và công thức bị vỡ. Có hai hướng:

1. Nếu còn giữ file nguồn LaTeX của các tài liệu: chuyển thẳng từ nguồn. Đây là
   cách nhanh và sạch nhất.
2. Nếu không còn: trích chữ, rồi soát tay từng chương và gõ lại công thức.

### Backend
Version 1 không cần backend. Web là trang tĩnh.

Supabase chỉ thêm vào khi làm tài khoản và nộp bài, dùng cùng cách của `learner`.

### Deployment
GitHub Pages nếu repo công khai, Cloudflare gói miễn phí nếu repo riêng tư. Web
chạy 24/7, không phụ thuộc laptop bật hay tắt.

---

## 13. Project Structure — định hướng

```text
hochanh/
├── content/
│   ├── giai-tich/
│   │   ├── chuong-1/
│   │   │   ├── giang-day/bai-1.md …
│   │   │   ├── theo-sach/1-3.md …
│   │   │   └── bai-tap/1-2-5.md …
│   │   └── thuat-ngu.json
│   ├── dai-so/…
│   └── vi-mo/…
├── src/
│   ├── components/   Hộp định nghĩa/định lý, thẻ bài tập, gợi ý theo tầng
│   ├── figures/      Hình trực quan, mỗi hình một component
│   ├── pages/
│   ├── lib/          Nạp nội dung, liên kết chéo, tiến độ — hàm thuần, có test
│   └── types/
├── tai-lieu/         PDF hiện có, dùng để soạn — không deploy
└── product_design.md
```

Giống quy tắc của `learner`: mọi logic nằm trong `src/lib` dưới dạng hàm thuần
để test trực tiếp, còn React chỉ lo hiển thị.

---

## 14. Roadmap tổng thể

### Phase 1 — Khung web và hai chương mẫu
- Home, Môn học, Chương, Bài giảng, Trang dịch, Bài tập
- **Giải tích Chương 1**: kiểm chứng phần Giảng dạy và Bài tập, vì chương này đã
  có đủ bài giảng và lời giải
- **Đại số tuyến tính Chương 1**: kiểm chứng phần Dịch nguyên văn

### Phase 2 — Đổ nội dung có sẵn
- Giải tích: bài giảng Ch 1, 2, 6, 7, 8; hướng dẫn học tập Ch 1–5; Theo sách Ch 6
- Đại số tuyến tính: bản dịch Ch 1–8
- Vi mô: slide dịch Ch 2, 3, 5, 7, 8

### Phase 3 — Ví dụ trực quan
- Hình tĩnh cho mọi bài giảng
- Hình tương tác cho khoảng 10 khái niệm khó nhất

### Phase 4 — Bù chỗ trống nội dung
- Bài giảng 8 mục cho Đại số và Vi mô
- Hướng dẫn giải bài tập cho Đại số
- "Theo sách" cho Giải tích Ch 1–5, 7, 8
- Slide Vi mô còn lại; nạp câu hỏi cuối chương từ sách OpenStax

### Phase 5 — Tiện ích
- Tìm kiếm, bảng thuật ngữ
- Cài lên điện thoại và đọc được khi không có mạng (PWA, như `learner`)

### Phase 6 — Tương lai
- Tài khoản, đồng bộ tiến độ
- Nộp bài làm để được chữa
- AI gia sư

---

## Nguyên tắc quan trọng

1. Làm trọn một chương trước, rồi mới nhân ra nhiều chương.
2. Tôn trọng bản quyền: chỉ dịch nguyên văn những gì giấy phép cho phép.
3. Hai phần Giảng dạy và Dịch nguyên văn luôn nối chéo được với nhau.
4. Người học phải tự làm bài trước, rồi mới xem gợi ý và lời giải.
5. Nội dung là file văn bản có test, không phải PDF nhúng vào trang.
6. Chưa đưa AI và tài khoản vào khi vòng học cơ bản chưa ổn định. Ngoại lệ duy
   nhất là **Tự tạo bài giảng từ PDF** (mục 15): tuỳ chọn, tách riêng, dùng khoá API
   của người học, không đụng vào các môn soạn tay.

## Mục tiêu Version 1

Một người học có thể:

Mở web
→ chọn Giải tích
→ vào Chương 1
→ học Bài 1 và xem hình minh hoạ
→ bấm sang đọc mục § tương ứng theo sách
→ làm bài tập, mở gợi ý từng tầng
→ tự đánh giá
→ lần sau quay lại đúng chỗ đang học.

Đó là vòng học cốt lõi cần hoàn thành trước khi mở rộng.

---

## 15. Tự tạo bài giảng từ PDF

### Vì sao
Ba môn trên web do người soạn làm tay, mỗi chương mất nhiều giờ. Người học muốn học
môn khác thì chưa có gì. Tính năng này cho người học **nạp file PDF giáo trình của
một môn bất kỳ**, rồi hệ thống tự soạn bài giảng **theo đúng cách làm của các môn có
sẵn**.

"Cách làm" ở đây là ba thứ đã có trong repo, được đưa nguyên vào lời nhắc cho Claude:

- Phương pháp dạy của `gtich/GIA_SU.md`: bản chất trước công thức, ví dụ đời thường,
  giải thích từng ký hiệu, giải bài 6 bước, phân biệt Hiểu · Nhớ · Làm, không nhảy
  kiến thức.
- Khung 8 mục của mục 5.1.
- Hai bài giảng mẫu đọc thẳng từ `content/giai-tich/`. Sửa bài mẫu thì lời nhắc đổi theo.

### Luồng

```text
Tự tạo bài giảng → nhập khoá API Claude (một lần)
  → chọn file PDF
  → Claude đọc mục lục ở 40 trang đầu (hoặc tự nhập chương)
  → kiểm tra tên môn, khoảng trang từng chương → Lưu môn
Trang môn → Tạo bài giảng cho một chương (báo trước chi phí ước tính)
  → Claude lập dàn ý: các mục § và 3–7 bài
  → viết lần lượt từng bài 8 mục, xong bài nào lưu bài đó
  → đọc bài: cùng bố cục, hộp màu, mục lục 8 mục như bài soạn tay
```

Mất mạng hay bấm Dừng giữa chừng thì bài đã xong vẫn còn; bấm **Tạo tiếp** chỉ viết
nốt bài còn thiếu. Sai khoảng trang thì sửa rồi tạo lại chương đó.

### Ràng buộc

| Ràng buộc | Cách giữ |
| --- | --- |
| Web miễn phí, không backend | Trình duyệt gọi thẳng Claude bằng **khoá API của người học**. Người học trả phí theo lượt cho Anthropic; web không thu gì, không có máy chủ trung gian |
| Người học phải biết trước tốn bao nhiêu | Nút nào gọi Claude cũng ghi khoảng chi phí ước tính; khi tạo xong ghi chi phí thật |
| Khoá API là bí mật | Mặc định chỉ nhớ đến khi đóng thẻ; muốn nhớ lâu thì tự chọn. Khoá chỉ gửi tới `api.anthropic.com` |
| Bản quyền | PDF là của người học, chỉ gửi cho Claude để soạn bài. Bài giảng diễn đạt lại, không chép nguyên văn. Bài chỉ nằm trong trình duyệt của người học, **không đăng lên web**, không vào repo |
| Nội dung do máy viết có thể sai | Trang bài ghi rõ "do Claude viết tự động, hãy đối chiếu với sách"; nhãn **Tự tạo** phân biệt với bài soạn tay |
| Nội dung máy sinh có thể chứa mã độc (PDF "dặn" Claude) | Chỉ nhận Markdown, lọc sạch HTML trước khi hiện |
| Dữ liệu chỉ ở một máy | Tải về file `.json` để sao lưu, nhập lại ở máy khác |

### Chưa làm
- Bài tập trong sách kèm gợi ý theo tầng, phần Dịch nguyên văn / Theo sách cho môn tự tạo
- Hình minh hoạ SVG (Claude tả hình bằng lời hoặc bảng số)
- Đánh dấu đã học, Học tiếp cho bài tự tạo
- Đưa một môn tự tạo lên web cho mọi người: vẫn phải qua người soạn, soát tay, thành MDX có test

Cách làm kỹ thuật: `docs/tech_stack.md`, mục 14.

# Phương án công nghệ — Hochanh

> **Trạng thái:** đã chốt ngày 28/09/2026.
> **Đọc cùng:** `product_design.md` nói web **làm gì**; file này nói web **làm bằng gì**.
> Chỗ nào khác với mục 12 của `product_design.md` thì theo file này.

## 0. Tóm tắt

**Astro** dựng web tĩnh. Nội dung là file **MDX** được kiểm tra bằng schema. Công
thức dùng **KaTeX**, dựng sẵn lúc build. **React** chỉ dùng cho hình tương tác.
Test bằng **Vitest** và **Playwright**. Deploy lên **GitHub Pages**.

Mọi thứ miễn phí: không backend, không dịch vụ trả phí.

## 1. Ràng buộc

- **Miễn phí hoàn toàn:** chỉ dùng phần mềm mã nguồn mở và gói hosting miễn phí.
  Riêng tính năng Tự tạo bài giảng (mục 14) gọi Claude bằng khoá API **của người
  học**; web không trả và không thu đồng nào.
- **Web tĩnh:** Version 1 không backend, không tài khoản.
- **Không tải gì từ CDN khi chạy:** font, icon, CSS của KaTeX đều tự host, để
  Phase 5 làm được PWA đọc khi không có mạng. Ngoại lệ duy nhất: trang Tự tạo bài
  giảng gọi `api.anthropic.com` khi người học bấm tạo.
- **Không thu phí, không quảng cáo:** giấy phép CC BY-NC-SA của Nicholson và
  OpenStax yêu cầu vậy.

## 2. Bộ công nghệ

| Phần | Chọn | Vì sao |
| --- | --- | --- |
| Khung web | Astro bản ổn định mới nhất (≥ 6), TypeScript `strict`, xuất web tĩnh | Mỗi bài, mỗi mục § là một trang HTML dựng sẵn. Bên dưới là Vite |
| Nội dung | MDX (`@astrojs/mdx`) + Content Collections, schema Zod trong `src/content.config.ts` | Markdown chèn được component. Khai báo đầu file sai thì build báo lỗi |
| Công thức | `remark-math` + `rehype-katex` + `katex`, CSS import cục bộ. Astro 7 mặc định dùng bộ xử lý Markdown Sätteri (không chạy plugin remark/rehype), nên phải đặt `markdown.processor: unified({...})` từ `@astrojs/markdown-remark` | Công thức thành HTML lúc build, trình duyệt không phải chạy JS |
| Hình tĩnh | SVG viết tay trong component `.astro`, màu lấy từ biến CSS | Nét, đổi sáng/tối theo token |
| Hình tương tác | React (`@astrojs/react`), mỗi hình nạp riêng bằng `client:visible`. Thư viện **Mafs** cho đồ thị toán | Chỉ trang có hình mới tải JS. Mafs chưa ra bản 1.0: thiếu gì thì tự vẽ SVG bằng React |
| Tự tạo bài giảng | React (`client:only`), `@anthropic-ai/sdk`, `pdf-lib`, IndexedDB, unified + `rehype-sanitize` — xem mục 14 | Trang chạy hoàn toàn ở máy khách: đọc PDF, gọi Claude, lưu bài đều trong trình duyệt |
| Giao diện | Token lấy từ `gtich/translator-ui/DESIGN_SPEC.md`, chép vào `src/styles/tokens.css`, thêm bộ màu sáng làm **mặc định**, tối là tuỳ chọn. Người học tự chuyển sáng/tối — xem mục 12 | Đọc lâu trên nền tối dễ mỏi mắt (product_design.md, mục 11) |
| Font | Inter (giao diện), Lora (nội dung), JetBrains Mono (số hiệu). Tự host qua gói `@fontsource/*` | Theo DESIGN_SPEC. Cả ba hỗ trợ tiếng Việt, giấy phép OFL |
| Icon | Lucide, đóng gói cục bộ | Theo DESIGN_SPEC |
| Tiến độ | `localStorage`. Logic viết thành hàm thuần trong `src/lib/` | Không cần tài khoản. Hàm thuần test được |
| Tìm kiếm (Phase 5) | Pagefind | Tạo chỉ mục lúc build, không cần máy chủ. Xem mục 6 |
| Cài lên màn hình chính | `manifest.webmanifest` (dựng lúc build) + thẻ `apple-mobile-web-app-*`, đã làm — xem mục 13 | Mở từ biểu tượng thì không còn thanh của trình duyệt |
| PWA đọc offline (Phase 5) | `@vite-pwa/astro` | Thêm service worker để đọc khi không có mạng |
| Test | Vitest + Playwright | Xem mục 8 |
| Deploy | GitHub Actions + `withastro/action` → GitHub Pages | Xem mục 9 |

Máy hiện tại: Node 24, npm 11, Python 3.12.

## 3. Không dùng

| Không dùng | Lý do |
| --- | --- |
| Vite + React thuần (SPA) | Phải tự viết chuyển trang, nạp Markdown, dựng sẵn HTML. Astro có sẵn cả ba |
| Next.js | Nặng hơn mức cần cho một web tĩnh |
| Starlight (khung tài liệu của Astro) | Bố cục cố định kiểu docs, khó làm thẻ bài tập, gợi ý theo tầng, bảng đối chiếu |
| MathJax | Nặng hơn KaTeX. KaTeX đủ cho cả ba môn |
| Mathpix, Algolia, mọi dịch vụ trả phí | Trái ràng buộc miễn phí (Claude ở mục 14 do người học tự trả bằng khoá của mình) |
| Supabase, backend | Version 1 chưa có tài khoản |
| Google Fonts, CDN | Cần chạy offline |

## 4. Cấu trúc thư mục

Web đặt ở gốc repo. Các thư mục tài liệu đang có (`gtich/`, `dai so/`, `micro/`)
giữ nguyên, không deploy.

```text
hochanh/
├── content/                        nội dung web
│   └── giai-tich/
│       ├── chuong-1/
│       │   ├── giang-day/bai-1.mdx
│       │   ├── sach/1-3.mdx        phần bám theo sách (dịch nguyên văn / theo sách)
│       │   └── bai-tap/1-2-5.mdx
│       └── thuat-ngu.json
├── src/
│   ├── content.config.ts           schema các collection
│   ├── components/                 hộp định nghĩa/định lý, thẻ bài tập, gợi ý theo tầng
│   ├── figures/                    mỗi hình một component
│   ├── layouts/
│   ├── pages/                      route, ví dụ [mon]/[chuong]/giang-day/[bai].astro
│   ├── lib/                        hàm thuần + file *.test.ts cạnh nó
│   └── styles/tokens.css
├── public/tai-ve/                  PDF bài giảng tự soạn để tải về — không bao giờ là sách gốc
├── tests/                          test shell (*.test.sh) và e2e/
└── docs/tech_stack.md              file này
```

Mọi logic nằm trong `src/lib/` dưới dạng hàm thuần. Component chỉ lo hiển thị.

## 5. Quy ước nội dung

Khai báo đầu file (frontmatter) tối thiểu. Tên trường chốt khi làm Phase 1,
nhưng giữ đúng ý:

- **Bài giảng:** `mon`, `chuong`, `bai`, `tieu_de`, `phu_muc` (các mục § bài
  này phủ, ví dụ `["1.3", "1.4"]`).
- **Mục §** (thư mục `sach/`): `mon`, `chuong`, `muc`, `tieu_de`, `loai`
  (`dich-nguyen-van` cho Đại số, Vi mô; `theo-sach` cho Giải tích), `nguon`
  (ghi công và giấy phép — bắt buộc).
- **Bài tập:** `so` (ví dụ `"1.2.5"`), `muc`, `do_kho` (`de` / `vua` / `kho`),
  `nen_lam` (dấu ★), `can_dung`.
- **Khối có số hiệu** (định nghĩa, định lý, ví dụ) viết bằng component, ví dụ
  `<DinhLy so="1.2.6">`. Khối này là đích của liên kết chéo.
- `can_dung` ghi **loại kèm số hiệu**, ví dụ `dinh-nghia-1.2.3`, vì có sách
  đánh số riêng cho từng loại.
- **Liên kết sang chương khác** (Chương 2 dựa trên Archimedes ở Chương 1):
  số hiệu tự mang số chương, nên `can_dung: ["dinh-ly-1.4.2"]`,
  `<XemMuc muc="1.4" />` và `<XemMuc bai-tap="1.2.10" />` viết như bình thường;
  bài giảng chương khác thì thêm `chuong`: `<XemMuc chuong={1} bai={4} />`.
  Khối không số hiệu (`tien-de-day-du`, `dinh-ly-quy-nap`) được tìm ở chương
  đang học trước, rồi ở cả môn. Test dữ liệu đối chiếu mọi liên kết này với
  toàn bộ môn học.
- Phần chưa có nội dung thì **không tạo file rỗng**. Trang chương tự hiện
  "Chưa có" dựa trên file nào tồn tại.

## 6. Tìm kiếm tiếng Việt (Phase 5)

Pagefind có giao diện tiếng Việt, nhưng chưa rõ có tìm được khi gõ không dấu.

**Điều kiện nghiệm thu:** gõ `tap so thuc` phải ra trang "Tập số thực".

Không đạt thì đổi sang **MiniSearch**, kèm hàm bỏ dấu trong `src/lib/`:
`normalize('NFD')`, xoá dấu kết hợp, đổi `đ/Đ` thành `d/D`. Hàm này áp dụng cho
cả chỉ mục lẫn từ khoá, và phải có test.

## 7. Chuyển PDF thành nội dung

**Hiện trạng (kiểm tra 28/09/2026):** không có file nguồn `.tex` hay `.md` nào;
mọi tài liệu chỉ có PDF. Chữ trích tự động từ PDF bị mất khoảng trắng và vỡ công
thức, nên không dùng trực tiếp.

**Quy trình chính** (không tốn thêm tiền):

1. Claude Code đọc PDF bằng công cụ Read, tham số `pages`, tối đa 20 trang một
   lần. Đọc bằng hình nên không bị lỗi mất khoảng trắng.
2. Viết thành file MDX theo mục 5. Công thức gõ lại bằng LaTeX. Hình vẽ lại bằng
   SVG.
   - **Hình có sẵn trong sách gốc giấy phép mở** (Nicholson, OpenStax): không vẽ tay
     mà cắt thẳng vùng hình vector từ PDF gốc bằng `scripts/pdf-hinh-svg.py`
     (PyMuPDF). Script đổi màu cứng sang lớp CSS (`net`, `nhan-manh`, `to-nhan`,
     `to-dam`, `chu-sach`) để hình đổi sáng/tối, rồi lưu vào `src/figures/sach/`.
     Dùng trong MDX: `<HinhSach ten="…" moTa="…" />`. Nguồn từng hình (trang,
     vùng cắt) ghi ở `src/figures/sach/nguon.json`; test kiểm tra hình không có
     màu cứng và không có hình mồ côi.
   - Hình mà bản gốc nhắc tới nhưng không in thì vẽ lại từ dữ liệu của ví dụ, kèm
     test đối chiếu (ví dụ `src/lib/mang.ts` cho Ví dụ 1.4.1).
3. Chạy build và test (mục 8).
4. Người soát mở trang web cạnh PDF, đối chiếu một lượt.

**Thứ tự:** Giải tích Chương 1 (bài giảng và lời giải), rồi Đại số Chương 1
(bản dịch). Ghi lại mỗi chương mất bao lâu để ước lượng phần còn lại.

**Dự phòng** khi khối lượng quá lớn (ví dụ bản dịch Đại số 8 chương): **marker**
— mã nguồn mở, chạy trên máy, xuất Markdown kèm LaTeX, mô hình miễn phí cho cá
nhân. Kết quả chỉ là bản nháp, vẫn phải qua bước 2–4.

## 8. Test và nghiệm thu

Theo `CLAUDE.md`: sau mỗi thay đổi phải có test liên quan, và mọi test phải đạt
trước khi giao.

| Lệnh | Kiểm gì |
| --- | --- |
| `npm run build` | Astro build. Frontmatter sai schema thì lỗi |
| `npm test` | Vitest: hàm trong `src/lib/`; dữ liệu nội dung — liên kết chéo trỏ tới mục có thật, không trùng số hiệu bài tập, mục § nào cũng có `nguon`, bài giảng đủ 8 mục. Gọi luôn các `tests/*.test.sh` |
| `npm run test:e2e` | Playwright chạy vòng học cốt lõi Version 1: mở web → Giải tích → Chương 1 → Bài 1 → sang mục § → bài tập → mở gợi ý → tự đánh giá → tải lại trang, nút **Học tiếp** đưa về đúng chỗ |

Test dữ liệu đọc thẳng file trong `content/`, không phụ thuộc runtime Astro.

Playwright chạy server ở cổng 4322 và dùng lại server đang chạy sẵn ở cổng đó.
Khi nhiều bản làm việc (worktree) chạy song song trên cùng máy, đặt cổng riêng để
khỏi test nhầm bản build của bản khác: `PW_CONG=4337 npm run test:e2e`.

Khi chưa có `package.json`, chạy test shell bằng:

```bash
for t in tests/*.test.sh; do sh "$t" || exit 1; done
```

## 9. Deploy

- **Mặc định:** GitHub Actions → GitHub Pages. Miễn phí khi repo **công khai**.
  Workflow `.github/workflows/deploy.yml` tự viết các bước (cài, `npm test`,
  build, đẩy lên Pages) thay cho `withastro/action`, để **test phải đạt thì mới
  deploy**.
- **Nếu repo riêng tư:** GitHub Pages gói miễn phí không hỗ trợ. Dùng Cloudflare
  gói miễn phí, cùng lệnh build.
- Repo: `https://github.com/duahnproducts/math` (công khai, kiểm tra 28/09/2026).
  Địa chỉ web: `https://duahnproducts.github.io/math/`, nên `astro.config.mjs` đặt
  `site: 'https://duahnproducts.github.io'` và `base: '/math'`. Mọi link nội bộ
  phải đi qua `base` (hàm trong `src/lib/duong-dan.ts`).
- Lần đầu cần bật Pages trong repo: *Settings → Pages → Source: GitHub Actions*.

## 10. Bẫy thường gặp

- **MDX:** dấu `<` và `{` trong đoạn văn thường bị hiểu là code. Bất đẳng thức
  luôn viết trong công thức: `$a < b$`.
- **Ký hiệu tiền `$`** (Vi mô) bị hiểu là mở công thức. Viết `\$`.
- **KaTeX:** chữ tiếng Việt trong công thức phải bọc `\text{…}`.
- **Sách gốc:** `.gitignore` đã chặn. Không chép PDF sách gốc vào `public/` dưới
  tên khác.
- **Đường dẫn có dấu cách** (`dai so/`): luôn đặt trong ngoặc kép khi chạy lệnh.
- **`npm create astro`** không chạy trong thư mục đã có file. Tạo ở thư mục tạm
  rồi chép vào, hoặc tự viết `package.json` và `astro.config`.

## 11. Việc cần làm cho Phase 1, theo thứ tự

1. Khởi tạo Astro ở gốc repo (TypeScript `strict`). Thêm `@astrojs/mdx`,
   `@astrojs/react`, `remark-math`, `rehype-katex`, `katex`.
2. Thêm `node_modules/`, `dist/`, `.astro/` vào `.gitignore`, cập nhật
   `tests/gitignore.test.sh`.
3. Cài Vitest, Playwright. `npm test` gọi luôn các test shell.
4. Chuyển token từ DESIGN_SPEC sang `src/styles/tokens.css`, thêm bộ màu sáng
   và nút chuyển sáng/tối (mục 12).
5. Viết `src/content.config.ts` và hàm liên kết chéo trong `src/lib/`, kèm test.
6. Dựng 6 màn hình của Phase 1 bằng dữ liệu mẫu nhỏ.
7. Chuyển Giải tích Chương 1, rồi Đại số Chương 1, theo mục 7.
8. Viết workflow deploy.

## 12. Chế độ màn hình sáng/tối

Người học chọn giao diện **sáng** hoặc **tối** bằng một nút trên thanh trên cùng
(biểu tượng mặt trời / mặt trăng), có ở mọi trang.

**Quy tắc:**

- **Mặc định là sáng**, kể cả khi hệ điều hành đang để tối — vì đọc lâu trên nền
  tối dễ mỏi mắt (product_design.md, mục 11). Chỉ khi người học bấm chuyển thì
  mới sang tối.
- Lựa chọn lưu trong `localStorage`, khoá `hochanh:giao-dien`, giá trị `sang` hoặc
  `toi`. Giá trị lạ hoặc `localStorage` bị chặn (chế độ ẩn danh) thì coi như
  sáng; web không được lỗi.
- Lựa chọn áp dụng cho mọi trang và giữ nguyên khi tải lại hay mở lại web.

**Cách làm:**

| Phần | Làm gì |
| --- | --- |
| Token màu | `src/styles/tokens.css`: bộ sáng đặt ở `:root`, bộ tối (giá trị gốc của DESIGN_SPEC) đặt ở `:root[data-theme="dark"]`. Component chỉ dùng biến CSS, không viết mã màu cứng — nhờ vậy đổi một thuộc tính là đổi cả trang |
| Tránh nháy trắng | Một đoạn script nhỏ nhúng thẳng vào `<head>` (`is:inline`), chạy **trước khi vẽ trang**: đọc `localStorage`, đặt `data-theme` lên `<html>`. Script lấy từ `src/lib/giao-dien.ts` để có test |
| Nút chuyển | Component `NutGiaoDien.astro`: `<button>` có `aria-label` ("Chuyển sang giao diện tối/sáng") và `aria-pressed`. Bấm thì đổi `data-theme`, lưu `localStorage` |
| Trình duyệt | Đặt `color-scheme: light` / `dark` theo giao diện để thanh cuộn, ô nhập, hộp thoại của trình duyệt đổi màu theo; cập nhật `<meta name="theme-color">` |
| Công thức, hình | KaTeX dùng `currentColor` nên tự đổi màu. Hình SVG lấy màu từ biến CSS (`var(--text)`, `var(--accent)`…), không dùng màu cứng |
| Chuyển động | Đổi giao diện không có hiệu ứng chuyển màu dài; tôn trọng `prefers-reduced-motion` |

**Test:**

- Vitest (`src/lib/giao-dien.test.ts`): đọc giá trị đã lưu (thiếu, lạ, bị chặn
  → sáng), đổi qua lại, và chạy thử script đầu trang với `localStorage` giả.
- Test shell (`tests/docs.test.sh`): `tokens.css` có đủ hai bộ màu.
- Playwright: mở web → mặc định sáng → bấm nút → tối → tải lại trang vẫn tối →
  sang trang khác vẫn tối.
- Tương phản chữ ≥ 4.5:1 ở **cả hai** giao diện (checklist DESIGN_SPEC, mục 10).

## 13. Giao diện điện thoại: tối giản và bong bóng

Trên điện thoại, thanh địa chỉ và thanh công cụ của trình duyệt đã chiếm hai đầu
màn hình. Trang web **không tự ẩn được** các thanh đó, nên làm hai việc:

1. **Cài lên màn hình chính.** Mở từ biểu tượng thì web chạy toàn màn hình, không
   còn thanh nào của trình duyệt.
2. **Thanh của chính Hochanh gọn lại và biết lùi đi.** Cuộn xuống để đọc thì thanh
   trên và thanh dưới lùi ra khỏi màn hình; cuộn lên một chút, hoặc chạm đáy trang,
   thì hiện lại. Laptop giữ nguyên.

Kiểu bong bóng học từ thanh điều hướng của `learner`
(https://duahnproducts.github.io/language-learning/, mã ở `learner/src/styles/bubble.css`).

| Phần | Làm gì |
| --- | --- |
| Thanh dưới | Viên thuốc kính mờ nổi, tách khỏi mép, **chỉ có icon**. Tên mục nằm ở `aria-label` và `title`. Một bong bóng trượt tới ô đang chọn. Danh sách tab: `src/lib/thanh-duoi.ts` |
| Bong bóng trượt | Cơ chế chung `.ray-bong` / `.bong-truot` trong `global.css`. Vị trí tính bằng CSS từ `--count` (số ô) và `--index` (ô đang chọn), nên không phải đo phần tử nào. Đường cong `--ease-bubble` vượt đích một chút rồi nảy về |
| Trượt qua trang mới | Mỗi lần bấm là tải cả trang. Lúc bấm, script ghi ô cũ vào `sessionStorage` (khoá `hochanh:bong-truoc`, hạn 5 giây). Trang mới chạy `SCRIPT_BONG_THANH_DUOI` ngay sau thanh, trước khi thanh kịp vẽ: đặt bong bóng về ô cũ, rồi cho trượt sang ô mới |
| Công tắc tab | Tab *Giảng dạy / Theo sách* ở trang chương là công tắc: rãnh lõm, bong bóng trắng nổi (`.cong-tac`). Các ô rộng bằng nhau nhờ lưới `1fr` |
| Nút | `.nut` bo tròn hẳn, có vệt sáng trên đỉnh. Bấm thì lún xuống nhanh, thả ra thì nảy về. `.nut-icon` hình tròn |
| Ẩn khi cuộn | Lô-gic thuần `capNhatCuon` trong `src/lib/cuon.ts`: bỏ qua lần cuộn dưới 8px, gần đầu trang hoặc chạm đáy thì luôn hiện. Script đặt `data-an-thanh` trên `<html>`, còn CSS chỉ áp dụng khi màn hình rộng ≤ 760px |
| Màu | Token `--glass`, `--glass-line`, `--glass-shadow`, `--bubble`, `--track`, `--bubble-raised`, `--gloss` có ở cả hai giao diện |
| Cài lên màn hình chính | `manifest.webmanifest` dựng lúc build từ `src/pages/manifest.webmanifest.ts` (nội dung ở `taoManifest`, `src/lib/bieu-tuong.ts`), dùng đường dẫn **tương đối** (`./`), nên đúng với base `/math/`. `display: standalone`. Biểu tượng (ảnh đại diện của app) là ảnh chụp, tạo bằng `scripts/tao-bieu-tuong.py` từ `scripts/anh-bieu-tuong.jpg` (ảnh vuông đã cắt quanh khuôn mặt): icon 192/512 bo góc, bản maskable lấy rộng hơn để mặt nằm trong vùng an toàn, `apple-touch-icon` phủ kín, `favicon.png` 64px cho tab trình duyệt. **Mọi đường dẫn biểu tượng kèm `?v=`** = 10 ký tự đầu sha256 của file: điện thoại lưu biểu tượng theo đường dẫn, nên đổi ảnh mà giữ nguyên đường dẫn thì cài lại vẫn ra ảnh cũ. Đổi ảnh chỉ cần chạy lại script, mã tự đổi lúc build. `id` của manifest giữ nguyên để Android coi là cùng một app. Thẻ `apple-mobile-web-app-capable`, `apple-touch-icon`, `viewport-fit=cover`. Thanh trạng thái để `default` để iOS lấy màu `theme-color`, tránh chữ trắng trên nền sáng |
| Chuyển động | `prefers-reduced-motion` thì mọi hiệu ứng bong bóng chạy tức thì (`--t-bubble: 1ms`) |

**Cách cài** (ghi cho người học):

- **iPhone:** mở web bằng **Safari**. Nếu đang ở trình duyệt trong app (Zalo,
  Messenger…), bấm biểu tượng la bàn để mở bằng Safari. Sau đó bấm *Chia sẻ*, rồi
  *Thêm vào MH chính*.
- **Android:** mở bằng Chrome, bấm menu ⋮, rồi *Cài đặt ứng dụng* hoặc *Thêm vào
  màn hình chính*.
- **Đã cài rồi, muốn lấy ảnh đại diện mới:** iPhone không bao giờ tự cập nhật biểu
  tượng đã có trên màn hình chính — xoá biểu tượng cũ (giữ lâu biểu tượng → Xoá), mở
  lại web bằng Safari rồi thêm lại. Android tự cập nhật sau vài ngày khi mở app
  (có thể hỏi xác nhận); muốn ngay thì gỡ rồi cài lại.

**Test:** `src/lib/thanh-duoi.test.ts`, `src/lib/cuon.test.ts` và `src/lib/bieu-tuong.test.ts` (mã phiên bản biểu tượng) (Vitest). `tests/pwa.test.ts`
kiểm tra manifest, kích thước biểu tượng, các thẻ trong `Khung.astro` và token có đủ ở
hai giao diện. Playwright có `tests/e2e/dien-thoai.spec.ts` (viên thuốc, bong bóng trượt
qua trang mới, ẩn khi cuộn, nút tròn, manifest tải được, `?v=` của từng biểu tượng khớp ảnh máy nhận về) và `tests/e2e/bong-bong.spec.ts`
(công tắc tab, laptop không đổi).

## 14. Tự tạo bài giảng từ PDF

Người học nạp PDF giáo trình của một môn bất kỳ; Claude soạn bài giảng theo cách soạn
các môn có sẵn (product_design.md, mục 15). Web vẫn tĩnh: mọi việc chạy trong trình
duyệt.

**Luồng dữ liệu**

```text
PDF (máy người học) ─pdf-lib─► cắt đúng trang của chương ─base64─► api.anthropic.com
      ▲                                                               │ JSON đúng khuôn
      └── IndexedDB: môn, dàn ý, bài giảng, file PDF ◄── kiểm tra ◄────┘
Trang đọc: JSON → Markdown → HTML đã lọc sạch → KaTeX → cùng lớp CSS với bài soạn tay
```

**Cách làm**

| Phần | Làm gì |
| --- | --- |
| Trang | `src/pages/tu-tao/` (`index`, `mon`, `bai`). Component React `client:only` trong `src/components/tu-tao/`. Mã môn, chương, bài nằm ở `?…` vì môn chỉ có trong trình duyệt (`taoDuongDan().monTuTao`, `.baiTuTao`, `thamSoBaiTuTao`) |
| Gọi Claude | `src/lib/tu-tao/goi-claude.ts`: SDK `@anthropic-ai/sdk` với `dangerouslyAllowBrowser: true` (khoá là của chính người dùng trình duyệt), mô hình `claude-opus-5-5` (`mo-hinh.ts`), `thinking: adaptive`, luồng SSE để hiện số chữ đang viết. Dự phòng khi bị từ chối: `fallbacks: "default"`, beta `server-side-fallback-2026-07-01` |
| Khuôn câu trả lời | Structured outputs (`output_config.format`) với ba JSON schema trong `khung.ts`: mục lục → dàn ý chương → bài giảng 8 mục (ví dụ mẫu đủ 6 bước, Hiểu · Nhớ · Làm, bài tập dễ → vừa → khó). Câu trả lời được kiểm tra lại bằng chính schema đó |
| Lời nhắc | `loi-nhac.ts`: phương pháp của `gtich/GIA_SU.md` viết lại cho mọi môn, khung 8 mục (`TAM_MUC`), hai bài giảng mẫu import `?raw` từ `content/giai-tich/`. Không chứa gì thay đổi theo lần gọi |
| Bộ nhớ đệm | `cache_control` trên lời nhắc hệ thống và trên khối PDF. Một chương = một lần lập dàn ý + mỗi bài một lần gọi, các lần sau đọc lại PDF từ bộ nhớ đệm |
| Quy trình | `quy-trinh.ts`: cắt PDF → dàn ý → từng bài; lưu sau mỗi bước, nên Dừng / mất mạng thì Tạo tiếp chỉ viết bài còn thiếu. Việc thật được truyền vào để test |
| PDF | `pdf.ts` (pdf-lib, nạp động chỉ khi cần): đọc, cắt trang, base64. Giới hạn trong `trang.ts`: đọc mục lục 40 trang đầu, một chương ≤ 120 trang, phần cắt ≤ 22 MB (API nhận tối đa 32 MB sau base64) |
| Lưu trữ | `kho.ts`: IndexedDB `hochanh-tu-tao`, bảng `mon` và `pdf`. Tải về / nhập file `.json` để sao lưu |
| Khoá API | `khoa-api.ts`: `sessionStorage` mặc định, `localStorage` khi người học chọn "Nhớ trên máy này", khoá `hochanh:khoa-claude`. Kho bị chặn thì coi như chưa có khoá |
| Chi phí | `chi-phi.ts`: giá Claude Opus 5.5 (4 / 20 USD mỗi triệu token vào / ra; ghi bộ nhớ đệm 5, đọc 0,2). Ước tính trước khi bấm, cộng chi phí thật từ `usage` |
| Hiển thị an toàn | `hien-thi.ts`: remark → rehype **không** bật HTML thô → `rehype-sanitize` (bỏ script, thuộc tính `on*`, `javascript:`, ảnh) → rồi mới KaTeX. Tiêu đề `#`/`##` hạ xuống `###` để bài chỉ có 8 tiêu đề cấp 2. Khung 8 mục và hộp màu do web dựng |

**Test:**

- Vitest `src/lib/tu-tao/*.test.ts`: schema hợp lệ với structured outputs (mọi đối tượng
  `additionalProperties: false`, không dùng ràng buộc API chưa hỗ trợ); yêu cầu gửi đi
  (header gọi thẳng từ trình duyệt, bộ nhớ đệm, dự phòng) qua `fetch` giả trả luồng SSE;
  lỗi 401 / 400 / 429 / 529 / dừng thành câu tiếng Việt; bài đủ 8 mục; lọc mã độc;
  cắt trang; khoảng trang; IndexedDB (`fake-indexeddb`); sao lưu `.json`; quy trình tạo
  tiếp sau khi hỏng giữa chừng.
- Playwright `tests/e2e/tu-tao.spec.ts`: giả lập `api.anthropic.com` bằng `page.route`.
  Nhập khoá → chọn PDF → đọc mục lục → lưu môn → tạo một chương → đọc bài 8 mục, công
  thức KaTeX, mã độc bị lọc → tải lại vẫn còn → tải `.json` → xoá → nhập lại. Thêm: khoá
  sai, tự nhập chương, file hỏng, môn không có trên máy. Test không gọi mạng, không tốn tiền.

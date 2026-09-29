// Dựng HTML cho bài giảng tự tạo, ngay trong trình duyệt.
//
// Nội dung do máy sinh ra (và có thể bị file PDF "dặn" viết bậy), nên KHÔNG bao giờ
// chèn thẳng: Markdown → cây HTML → lọc sạch (rehype-sanitize: bỏ HTML thô, script,
// thuộc tính on*, liên kết javascript:, ảnh) → rồi mới dựng công thức bằng KaTeX.
// Khung 8 mục và các hộp màu do web tự dựng, dùng đúng lớp CSS của bài giảng tĩnh.
import katex from 'katex';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema, type Options as SchemaLoc } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { NHAN_DO_KHO, TAM_MUC, type BaiGiangTuTao } from './khung';

const LOP_MATH = ['language-math', 'math-inline', 'math-display'];

const SCHEMA_LOC: SchemaLoc = {
  ...defaultSchema,
  // Không cho ảnh (tải từ máy chủ lạ) và ô đánh dấu
  tagNames: (defaultSchema.tagNames ?? []).filter((t) => !['img', 'picture', 'source', 'input'].includes(t)),
  attributes: {
    ...defaultSchema.attributes,
    code: [['className', ...LOP_MATH]],
  },
};

interface NutMd {
  type: string;
  depth?: number;
  children?: NutMd[];
}

/** Bài giảng chỉ có 8 tiêu đề cấp 2 do web dựng; tiêu đề # và ## trong nội dung hạ xuống ###. */
function haCapTieuDe() {
  const duyet = (nut: NutMd) => {
    if (nut.type === 'heading' && (nut.depth ?? 3) < 3) nut.depth = 3;
    nut.children?.forEach(duyet);
  };
  return (cay: NutMd) => duyet(cay);
}

const boXuLy = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(haCapTieuDe)
  .use(remarkRehype) // không bật allowDangerousHtml: HTML thô trong Markdown bị bỏ
  .use(rehypeSanitize, SCHEMA_LOC)
  .use(rehypeKatex, { strict: 'ignore', output: 'htmlAndMathml' })
  .use(rehypeStringify);

/**
 * Dòng chỉ có "$$…$$" là công thức riêng dòng. remark-math chỉ hiểu vậy khi $$ nằm
 * riêng một dòng, còn máy hay viết gọn trên một dòng — tách ra cho đúng ý.
 */
function tachCongThucRiengDong(md: string): string {
  return md.replace(/^[ \t]*\$\$(?!\$)(.+?)\$\$[ \t]*$/gm, (_m, tex: string) => `$$\n${tex.trim()}\n$$`);
}

/** Markdown (có công thức $…$) → HTML đã lọc sạch. */
export function mdSangHtml(md: string): string {
  return String(boXuLy.processSync(tachCongThucRiengDong(md))).trim();
}

/** Như mdSangHtml, nhưng bỏ thẻ <p> bao ngoài khi chỉ có một đoạn — dùng trong tiêu đề, ô bảng. */
export function mdDong(md: string): string {
  const html = mdSangHtml(md);
  const m = /^<p>([\s\S]*)<\/p>$/.exec(html);
  return m && !m[1].includes('<p>') ? m[1] : html;
}

export function thoatHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Máy đôi khi vẫn bọc công thức trong $…$ dù đã dặn không — bỏ đi. */
function boDauDola(s: string): string {
  return s.trim().replace(/^\$+/, '').replace(/\$+$/, '').trim();
}

function congThucHtml(tex: string, rieng: boolean): string {
  return katex.renderToString(boDauDola(tex), {
    displayMode: rieng,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml',
  });
}

const BUOC_VI_DU: [keyof BaiGiangTuTao['vi_du_mau'], string][] = [
  ['cho_gi', 'Đề cho gì?'],
  ['hoi_gi', 'Đề hỏi gì?'],
  ['chon_kien_thuc', 'Dùng kiến thức nào, và tại sao?'],
  ['giai', 'Giải từng bước'],
  ['kiem_tra', 'Kiểm tra kết quả'],
  ['tom_tat_cach_lam', 'Tóm tắt cách làm để tự áp dụng'],
];

const LOP_DO_KHO = { de: 'ok', vua: 'info', kho: 'warn' } as const;

/** Mục lục bên cạnh: id và tên của 8 mục. */
export const MUC_LUC_BAI = TAM_MUC.map((ten, i) => ({ id: `muc-${i + 1}`, ten }));

function tieuDeMuc(i: number): string {
  return `<h2 id="${MUC_LUC_BAI[i].id}">${MUC_LUC_BAI[i].ten}</h2>`;
}

function hop(loai: string, noiDung: string, tieuDe?: string): string {
  const dau = tieuDe ? `<p class="tieu-de-hop"><span>${tieuDe}</span></p>` : '';
  return `<div class="hop ${loai}" data-loai-hop="${loai}">${dau}${noiDung}</div>`;
}

/** Một bài giảng 8 mục → HTML đặt trong <div class="van-ban bai-giang">. */
export function baiGiangSangHtml(b: BaiGiangTuTao): string {
  const phan: string[] = [];

  phan.push(tieuDeMuc(0), hop('y-tuong', mdSangHtml(b.y_tuong)));
  phan.push(tieuDeMuc(1), mdSangHtml(b.hinh_dung));
  phan.push(tieuDeMuc(2), mdSangHtml(b.kien_thuc));

  phan.push(tieuDeMuc(3));
  for (const ct of b.cong_thuc) {
    phan.push(`<h3>${mdDong(ct.ten)}</h3>`, mdSangHtml(ct.dung_de));
    if (boDauDola(ct.bieu_thuc)) phan.push(congThucHtml(ct.bieu_thuc, true));
    if (ct.ky_hieu.length > 0) {
      const dong = ct.ky_hieu
        .map((k) => `<tr><td>${congThucHtml(k.ky_hieu, false)}</td><td>${mdDong(k.nghia)}</td></tr>`)
        .join('');
      phan.push(`<table><thead><tr><th>Ký hiệu</th><th>Nghĩa</th></tr></thead><tbody>${dong}</tbody></table>`);
    }
    if (ct.khi_nao_dung.trim()) phan.push(`<p><strong>Khi nào dùng?</strong></p>`, mdSangHtml(ct.khi_nao_dung));
  }

  phan.push(tieuDeMuc(4), hop('vi-du', mdSangHtml(b.vi_du_mau.de), 'Đề bài'));
  BUOC_VI_DU.forEach(([khoa, ten], i) => {
    const noiDung = b.vi_du_mau[khoa].trim();
    if (!noiDung) return;
    phan.push(`<h4>Bước ${i + 1} — ${ten}</h4>`);
    phan.push(khoa === 'tom_tat_cach_lam' ? hop('tom-tat', mdSangHtml(noiDung)) : mdSangHtml(noiDung));
  });

  phan.push(tieuDeMuc(5));
  for (const l of b.loi_de_mac) phan.push(hop('loi', mdSangHtml(l.noi_dung), mdDong(l.tieu_de)));

  phan.push(tieuDeMuc(6), `<ul>${b.tom_tat.map((t) => `<li>${mdDong(t)}</li>`).join('')}</ul>`);
  phan.push(
    `<dl class="ba-goc" aria-label="Hiểu, nhớ, làm"><dt>HIỂU</dt><dd>${mdDong(b.hieu)}</dd><dt>NHỚ</dt><dd>${mdDong(
      b.nho,
    )}</dd><dt>LÀM</dt><dd>${mdDong(b.lam)}</dd></dl>`,
  );

  phan.push(tieuDeMuc(7));
  b.bai_tap.forEach((bt, i) => {
    const goiY = bt.goi_y.trim() ? `<details><summary>Gợi ý</summary>${mdSangHtml(bt.goi_y)}</details>` : '';
    phan.push(
      `<div class="bai-luyen"><p class="dau"><span class="pill ${LOP_DO_KHO[bt.do_kho]}">${NHAN_DO_KHO[bt.do_kho]}</span> Bài ${b.so}.${i + 1}</p>${mdSangHtml(bt.de)}${goiY}</div>`,
    );
  });

  return phan.join('\n');
}

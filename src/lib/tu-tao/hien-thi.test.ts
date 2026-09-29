import { describe, expect, it } from 'vitest';
import { baiDocHai, baiMau } from '../../../tests/fixtures/tu-tao';
import { kiemTraBaiGiang } from './khung';
import { kiemTraTamMuc } from '../noi-dung';
import { MUC_LUC_BAI, baiGiangSangHtml, mdDong, mdSangHtml, thoatHtml } from './hien-thi';

const tieuDeCap2 = (html: string) => [...html.matchAll(/<h2 id="muc-\d">([^<]+)<\/h2>/g)].map((m) => m[1]);

describe('mdSangHtml', () => {
  it('dựng công thức bằng KaTeX lúc hiển thị', () => {
    const html = mdSangHtml('Diện tích $S = a^2$ và\n\n$$\n\\sum_{k=1}^n k\n$$');
    expect(html).toContain('class="katex"');
    expect(html).toContain('katex-display');
    expect(html).not.toContain('katex-error');
  });

  it('dòng chỉ có $$…$$ viết gọn trên một dòng vẫn là công thức riêng dòng', () => {
    expect(mdSangHtml('Ta có:\n\n$$ x^2 + 1 $$\n\nXong.')).toContain('katex-display');
    // $$ giữa câu thì vẫn là công thức trong dòng
    expect(mdSangHtml('Ta có $$x$$ nhé.')).not.toContain('katex-display');
  });

  it('có bảng Markdown', () => {
    expect(mdSangHtml('| a | b |\n| --- | --- |\n| 1 | 2 |')).toContain('<table>');
  });

  it('bỏ HTML thô, script, liên kết javascript:, ảnh', () => {
    const html = mdSangHtml(
      'a <script>alert(1)</script> <img src=x onerror=alert(1)> [x](javascript:alert(1)) ![y](https://example.com/a.png) <iframe src="https://e.com"></iframe>',
    );
    for (const cam of ['<script', 'onerror', 'javascript:', '<img', '<iframe']) expect(html).not.toContain(cam);
  });

  it('hạ tiêu đề # và ## xuống ###, để bài chỉ có 8 tiêu đề cấp 2', () => {
    const html = mdSangHtml('# Một\n\n## Hai\n\n### Ba');
    expect(html).not.toMatch(/<h[12]/);
    expect(html.match(/<h3>/g)).toHaveLength(3);
  });
});

describe('mdDong', () => {
  it('bỏ thẻ <p> bao ngoài của một đoạn', () => {
    expect(mdDong('**Đậm**')).toBe('<strong>Đậm</strong>');
    expect(mdDong('a\n\nb')).toBe('<p>a</p>\n<p>b</p>');
  });
});

describe('thoatHtml', () => {
  it('thoát ký tự đặc biệt', () => {
    expect(thoatHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('baiGiangSangHtml', () => {
  const html = baiGiangSangHtml(kiemTraBaiGiang(baiMau(1)));

  it('đủ 8 mục, đúng thứ tự, đúng tên như bài giảng tĩnh', () => {
    expect(kiemTraTamMuc(tieuDeCap2(html))).toEqual([]);
    expect(tieuDeCap2(html)).toHaveLength(8);
    expect(MUC_LUC_BAI.map((m) => m.id)).toEqual(['muc-1', 'muc-2', 'muc-3', 'muc-4', 'muc-5', 'muc-6', 'muc-7', 'muc-8']);
  });

  it('dùng đúng hộp màu của bài giảng tĩnh', () => {
    for (const lop of ['hop y-tuong', 'hop vi-du', 'hop tom-tat', 'hop loi', 'ba-goc', 'bai-luyen']) {
      expect(html).toContain(`class="${lop}`);
    }
  });

  it('công thức riêng dòng, bảng ký hiệu có cả ký hiệu chứa dấu |', () => {
    expect(html).toContain('katex-display');
    expect(html).toContain('<th>Ký hiệu</th>');
    const bang = html.slice(html.indexOf('<table><thead><tr><th>Ký hiệu'));
    expect(bang.match(/<tr><td>/g)).toHaveLength(2);
    expect(html).not.toContain('katex-error');
  });

  it('ví dụ mẫu đủ 6 bước, bước 6 nằm trong hộp tóm tắt', () => {
    for (let i = 1; i <= 6; i++) expect(html).toContain(`<h4>Bước ${i} — `);
    expect(html).toMatch(/Bước 6 — Tóm tắt cách làm để tự áp dụng<\/h4>\s*<div class="hop tom-tat"/);
  });

  it('bài tập dễ → vừa → khó, đánh số theo bài', () => {
    const nhan = [...html.matchAll(/<span class="pill (\w+)">(\S+)<\/span> Bài (1\.\d)/g)].map((m) => `${m[2]} ${m[3]}`);
    expect(nhan).toEqual(['Dễ 1.1', 'Vừa 1.2', 'Khó 1.3']);
    expect(html).toContain('<details><summary>Gợi ý</summary>');
  });

  it('bỏ dấu $ thừa quanh công thức', () => {
    const b = baiMau(1);
    b.cong_thuc[0].bieu_thuc = '$$ x^2 $$';
    const h = baiGiangSangHtml(b);
    expect(h).not.toContain('$$');
    expect(h).toContain('katex-display');
  });

  it('lọc sạch mã độc trong nội dung do máy sinh ra', () => {
    const h = baiGiangSangHtml(baiDocHai(2));
    for (const cam of ['<script', 'onerror', 'onmouseover', 'javascript:', '<img', '<iframe', 'example.com']) {
      expect(h).not.toContain(cam);
    }
    expect(h).toContain('Chữ thường');
  });
});

"""Dựng 163 bài Ross từ dữ liệu đã đối chiếu; chạy từ bất kỳ thư mục nào."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
COUNTS = [12, 8, 8, 16, 7, 5, 5, 10, 18, 12, 11, 14, 15, 14, 8]
TITLES = ['Số tự nhiên và quy nạp', 'Số hữu tỉ', 'Số thực và thứ tự',
          'Tiên đề đầy đủ', 'Các ký hiệu vô cực', 'Lát cắt Dedekind',
          'Giới hạn dãy số', 'Chứng minh bằng định nghĩa giới hạn',
          'Các định lý giới hạn', 'Dãy đơn điệu và Cauchy', 'Dãy con',
          'Giới hạn trên và giới hạn dưới', 'Không gian metric và compact',
          'Chuỗi số', 'Chuỗi đan dấu và tiêu chuẩn tích phân']

SETS4 = r'''Các tập được xét (cùng ký hiệu với bài 4.1):

| Ý | Tập |
| --- | --- |
| a | $[0,1]$ |
| b | $(0,1)$ |
| c | $\{2,7\}$ |
| d | $\{\pi,e\}$ |
| e | $\{1/n:n\ge1\}$ |
| f | $\{0\}$ |
| g | $[0,1]\cup[2,3]$ |
| h | $\bigcup_{n\ge1}[2n,2n+1]$ |
| i | $\bigcap_{n\ge1}[-1/n,1+1/n]$ |
| j | $\{1-1/(3n):n\ge1\}$ |
| k | $\{n+(-1)^n/n:n\ge1\}$ |
| l | $\{r\in\mathbb Q:r<2\}$ |
| m | $\{r\in\mathbb Q:r^2<4\}$ |
| n | $\{r\in\mathbb Q:r^2<2\}$ |
| o | $\{x\in\mathbb R:x<0\}$ |
| p | $\{1,\pi/3,\pi^2,10\}$ |
| q | $\{0,1,2,4,8,16\}$ |
| r | $\bigcap_{n\ge1}(1-1/n,1+1/n)$ |
| s | $\{1/p:p\in\mathbb P\}$, với $\mathbb P$ là tập số nguyên tố |
| t | $\{x\in\mathbb R:x^3<8\}$ |
| u | $\{x^2:x\in\mathbb R\}$ |
| v | $\{\cos(n\pi/3):n\ge1\}$ |
| w | $\{\sin(n\pi/3):n\ge1\}$ |'''
EXTREMA4 = r'''| Ý | $\inf$ | $\sup$ |
| --- | --- | --- |
| a, b | $0$ | $1$ |
| c | $2$ | $7$ |
| d | $e$ | $\pi$ |
| e | $0$ | $1$ |
| f | $0$ | $0$ |
| g | $0$ | $3$ |
| h | $2$ | $+\infty$ |
| i | $0$ | $1$ |
| j | $2/3$ | $1$ |
| k | $0$ | $+\infty$ |
| l | $-\infty$ | $2$ |
| m | $-2$ | $2$ |
| n | $-\sqrt2$ | $\sqrt2$ |
| o | $-\infty$ | $0$ |
| p | $1$ | $10$ |
| q | $0$ | $16$ |
| r | $1$ | $1$ |
| s | $0$ | $1/2$ |
| t | $-\infty$ | $2$ |
| u | $0$ | $+\infty$ |
| v | $-1$ | $1$ |
| w | $-\sqrt3/2$ | $\sqrt3/2$ |'''


def main():
    entries = []
    for block in (ROOT/'scripts/data/bai-tap-ross.txt').read_text(encoding='utf-8').split('\n@@ '):
        if not block.strip():
            continue
        lines = block.removeprefix('@@ ').splitlines()
        number, title, difficulty = lines[0].split(' | ')
        fields = dict(re.findall(r'^([DHKSCE]): (.*?)(?=^[DHKSCE]: |\Z)', '\n'.join(lines[1:]), re.M | re.S))
        fields = {k: v.strip().replace('@SETS4@', SETS4).replace('@EXTREMA4@', EXTREMA4) for k, v in fields.items()}
        assert set(fields) == set('DHKSCE'), (number, fields.keys())
        # Các ý nhỏ và phần phát biểu/chứng minh cần đoạn riêng để đọc trên điện thoại.
        fields['S'] = re.sub(r' (?=\*\*(?:[a-z](?:[–-][a-z])?\.|Chứng minh|Phát biểu))', '\n\n', fields['S'])
        entries.append((number, title, difficulty, fields))
    expected = [f'{s}.{n}' for s, count in enumerate(COUNTS, 1) for n in range(1, count+1)]
    assert [e[0] for e in entries] == expected, 'Danh mục thiếu, trùng hoặc sai thứ tự'
    manifest = []
    for number, title, difficulty, f in entries:
        section = int(number.split('.')[0])
        chapter = 1 if section <= 6 else 2
        path = ROOT/f'content/giai-tich/chuong-{chapter}/bai-tap/{number.replace(".", "-")}.mdx'
        path.parent.mkdir(parents=True, exist_ok=True)
        lesson = section if chapter == 1 else section-6
        learning = (f'\n\n<XemMuc bai={{{lesson}}} />' if section <= 10 else '')
        body = f'''---
so: "{number}"
muc: "{section}"
so_sach: "{number}"
tieu_de: {json.dumps(title, ensure_ascii=False)}
do_kho: {difficulty}
nen_lam: {str(number.split('.')[1] == '1').lower()}
de_tom_tat: true
can_dung: []
---

<De>
{f['D']}
</De>

<GoiY so={{1}}>
{f['H']}
</GoiY>

<GoiY so={{2}}>
{f['K']}
</GoiY>

<LoiGiai>

**Bước 1. Đọc dữ kiện.**

Xét các giả thiết và ký hiệu trong đề; $n$ chạy qua các số nguyên dương nếu không ghi khác.

**Bước 2. Xác định yêu cầu.**

{title}. Cần xử lý từng ý trong đề.

**Bước 3. Chọn kiến thức.**

{f['H']}

**Bước 4. Giải từng bước.**

{f['S']}

**Bước 5. Kiểm tra.**

{f['C']}

**Bước 6. Cách tự làm bài tương tự.**

{f['K']}

</LoiGiai>

<LoiHayMac>
{f['E']}
</LoiHayMac>

<div class="can-dung" data-kien-thuc-ross>
<b>Cần dùng</b>
<span>{TITLES[section-1]}</span>{learning}
</div>
'''
        path.write_text(body, encoding='utf-8')
        manifest.append({'so': number, 'muc': str(section), 'chuong': chapter})
    (ROOT/'content/giai-tich/bai-tap-goc.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    # Bộ bài tập §1–§15 không sở hữu danh mục chương/bài giảng §1–§27.
    # Giữ nguyên mon.json khi tái dựng để không xóa §16 hoặc chương 3–4.
    for section in range(1, 11):
        chapter, lesson = (1, section) if section <= 6 else (2, section-6)
        path = ROOT/f'content/giai-tich/chuong-{chapter}/giang-day/bai-{lesson}.mdx'
        text = path.read_text(encoding='utf-8')
        text = re.sub(r'^phu_muc: .*$', f'phu_muc: ["{section}"]', text, flags=re.M)
        path.write_text(text, encoding='utf-8')
    print(f'Đã dựng {len(entries)} bài Ross.')


if __name__ == '__main__':
    main()

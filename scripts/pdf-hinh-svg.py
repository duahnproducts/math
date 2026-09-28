# Chuyển một vùng hình vector trong PDF gốc (giấy phép mở) thành SVG gọn cho web.
# Màu cứng được đổi sang lớp CSS (net, nhan-manh, to-nhan, to-dam, chu-sach) để hình
# đổi được sáng/tối. Cần: pip install pymupdf
# Dùng: python scripts/pdf-hinh-svg.py [tuỳ chọn] <pdf> src/figures/sach ten:trang:x0,y0,x1,y1 ...
#   --chu-toi-da=10.5   bỏ chữ lớn hơn cỡ này (chữ thân bài lọt vào vùng cắt)
#   --lop-chu=chu       lớp CSS cho chữ (mặc định chu-sach: có chân)
#   --mau=4a79b4:net/to-dam,...   màu gốc -> lớp cho nét/phần tô (mặc định: xám -> net, màu -> nhan-manh)
import pymupdf, sys, os, html, math

BANG_MAU = {}  # '4a79b4' -> ('net', 'to-dam'): lớp cho nét / cho phần tô

def lop_mau(mau, loai):
    """Màu gốc -> lớp CSS. loai: 'stroke' hoặc 'fill'."""
    if mau is None:
        return None
    hx = '%02x%02x%02x' % tuple(int(round(v * 255)) for v in mau)
    if hx in BANG_MAU:
        return BANG_MAU[hx][0 if loai == 'stroke' else 1]
    r, g, b = mau
    xam = max(r, g, b) - min(r, g, b) < 0.08
    if xam and max(r, g, b) > 0.92:
        return 'nen'  # trắng: nền
    if xam:
        return 'net' if loai == 'stroke' else 'to-dam'
    return 'nhan-manh' if loai == 'stroke' else 'to-nhan'

def so(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')

def duong(items, dx, dy):
    d = []
    cuoi = None
    for it in items:
        k = it[0]
        if k == 'l':
            a, b = it[1], it[2]
            if cuoi is None or abs(cuoi.x - a.x) > 0.01 or abs(cuoi.y - a.y) > 0.01:
                d.append(f'M{so(a.x-dx)} {so(a.y-dy)}')
            d.append(f'L{so(b.x-dx)} {so(b.y-dy)}')
            cuoi = b
        elif k == 'c':
            a, c1, c2, b = it[1], it[2], it[3], it[4]
            if cuoi is None or abs(cuoi.x - a.x) > 0.01 or abs(cuoi.y - a.y) > 0.01:
                d.append(f'M{so(a.x-dx)} {so(a.y-dy)}')
            d.append(f'C{so(c1.x-dx)} {so(c1.y-dy)} {so(c2.x-dx)} {so(c2.y-dy)} {so(b.x-dx)} {so(b.y-dy)}')
            cuoi = b
        elif k == 're':
            r = it[1]
            d.append(f'M{so(r.x0-dx)} {so(r.y0-dy)}H{so(r.x1-dx)}V{so(r.y1-dy)}H{so(r.x0-dx)}Z')
            cuoi = None
        elif k == 'qu':
            q = it[1]
            d.append(f'M{so(q.ul.x-dx)} {so(q.ul.y-dy)}L{so(q.ur.x-dx)} {so(q.ur.y-dy)}L{so(q.lr.x-dx)} {so(q.lr.y-dy)}L{so(q.ll.x-dx)} {so(q.ll.y-dy)}Z')
            cuoi = None
    return ''.join(d)

def chuyen(src, ten, trang, hop, out):
    doc = pymupdf.open(src)
    p = doc[trang - 1]
    vung = pymupdf.Rect(*hop)
    dx, dy = vung.x0, vung.y0
    phan = []
    for dr in p.get_drawings():
        # Nới khung bao 1pt: đoạn thẳng ngang/dọc có khung cao hoặc rộng bằng 0
        khung = pymupdf.Rect(dr['rect']) + (-1, -1, 1, 1)
        if not khung.intersects(vung) or dr['rect'].width > 300 or dr['rect'].height > 300:
            continue
        lop = []
        ls = lop_mau(dr.get('color'), 'stroke') if dr.get('type') in ('s', 'fs') else None
        lf = lop_mau(dr.get('fill'), 'fill') if dr.get('type') in ('f', 'fs') else None
        if lf == 'nen':
            continue
        if ls and ls != 'nen':
            lop.append(ls)
        if lf:
            lop.append(lf)
        d = duong(dr['items'], dx, dy)
        if not d:
            continue
        tt = [f'd="{d}"', f'class="{" ".join(lop)}"']
        if not lf:
            tt.append('fill="none"')
        if ls:
            tt.append(f'stroke-width="{so(dr.get("width") or 0.5)}"')
            gach = (dr.get('dashes') or '').split(']')[0].strip('[ ')
            if gach:
                tt.append(f'stroke-dasharray="{gach}"')
        phan.append(f'<path {" ".join(tt)}/>')
    for b in p.get_text('dict', clip=vung)['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                t = s['text'].strip()
                # Chỉ lấy chữ nằm trọn trong vùng hình (bỏ chữ của đoạn văn bên cạnh)
                if not t or not vung.contains(pymupdf.Rect(s['bbox'])):
                    continue
                # Nhãn trong hình nhỏ hơn chữ thân bài (Nicholson: 9pt so với 12pt)
                if s['size'] > CHU_TOI_DA:
                    continue
                x, y = s['origin']
                nghieng = 'Ital' in s['font'] or 'It' in s['font'].split('-')[-1] or s['flags'] & 2
                kieu = ' font-style="italic"' if nghieng else ''
                if s['flags'] & 16 or 'Bold' in s['font']:
                    kieu += ' font-weight="bold"'
                # Chữ xoay (nhãn trục dọc): hướng dòng (cos, sin) -> rotate quanh gốc chữ
                cos, sin = l['dir']
                if abs(cos - 1) > 1e-3:
                    goc = math.degrees(math.atan2(sin, cos))
                    kieu += f' transform="rotate({so(goc)} {so(x-dx)} {so(y-dy)})"'
                phan.append(f'<text x="{so(x-dx)}" y="{so(y-dy)}" font-size="{so(s["size"])}"{kieu} class="{LOP_CHU}">{html.escape(t)}</text>')
    w, h = vung.width, vung.height
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {so(w)} {so(h)}" width="{so(w * 1.6)}" '
           f'role="img">\n' + '\n'.join(phan) + '\n</svg>\n')
    open(os.path.join(out, ten + '.svg'), 'w', encoding='utf-8').write(svg)
    return len(svg), len(phan)

CHU_TOI_DA = 1000.0  # mặc định: không lọc theo cỡ chữ
LOP_CHU = 'chu-sach'  # chữ kiểu sách (có chân); biểu đồ slide dùng 'chu' (không chân)

if __name__ == '__main__':
    for a in list(sys.argv):
        if a.startswith('--chu-toi-da='):
            CHU_TOI_DA = float(a.split('=')[1]); sys.argv.remove(a)
        elif a.startswith('--lop-chu='):
            LOP_CHU = a.split('=')[1]; sys.argv.remove(a)
        elif a.startswith('--mau='):
            # --mau=4a79b4:net/to-dam,8e3a99:nhan-manh/to-nhan
            for cap in a.split('=')[1].split(','):
                hx, lop = cap.split(':')
                BANG_MAU[hx.lower()] = tuple(lop.split('/'))
            sys.argv.remove(a)
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    for spec in sys.argv[3:]:
        ten, trang, hop = spec.split(':')
        print(ten, *chuyen(src, ten, int(trang), [float(v) for v in hop.split(',')], out))

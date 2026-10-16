"""Nhập đề gốc chương 2–3 từ PDF Nicholson 2023 người dùng cung cấp.

python scripts/nhap-bai-tap-nicholson.py --source <PDF> --inventory <inventory.json>
Chỉ xuất các vùng bài tập thành SVG; không đưa cả sách gốc lên web.
"""
from pathlib import Path
import argparse, json, re, xml.etree.ElementTree as ET
import pymupdf

ROOT=Path(__file__).resolve().parents[1]

def optimize_svg(svg, name, width, height):
    ns='http://www.w3.org/2000/svg';link='http://www.w3.org/1999/xlink'
    ET.register_namespace('',ns);ET.register_namespace('xlink',link)
    root=ET.fromstring(svg)
    root.set('width',str(round(width*1.8,2)));root.attrib.pop('height',None)
    defs=root.find(f'{{{ns}}}defs')
    # PDF forms retain off-crop page glyphs. Remove those before subsetting fonts.
    for parent in root.iter():
        if parent is defs:continue
        for child in list(parent):
            if child.tag==f'{{{ns}}}use':
                m=re.search(r'matrix\(([^)]+)\)',child.get('transform',''))
                if m:
                    a,b,c,d,x,y=map(float,m[1].replace(',',' ').split())
                    if x < -30 or x > width+30 or y < -30 or y > height+30:parent.remove(child)
    used={node.get(f'{{{link}}}href','')[1:]for node in root.iter(f'{{{ns}}}use')}
    if defs is not None:
        for node in list(defs):
            if node.get('id','').startswith('font_') and node.get('id')not in used:defs.remove(node)
    # Isolate glyph and clipping IDs when several excerpts share an HTML page.
    for node in root.iter():
        for key,value in list(node.attrib.items()):
            if key=='id':node.set(key,name+'-'+value)
            elif key==f'{{{link}}}href' and value.startswith('#'):node.set(key,'#'+name+'-'+value[1:])
            elif 'url(#'in value:node.set(key,value.replace('url(#','url(#'+name+'-'))
    return ET.tostring(root,encoding='unicode')+'\n'

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',required=True)
    parser.add_argument('--inventory',required=True)
    args=parser.parse_args()
    doc=pymupdf.open(args.source)
    inventory=json.loads(Path(args.inventory).read_text(encoding='utf-8'))
    solutions=json.loads((ROOT/'scripts/data/loi-giai-nicholson.json').read_text(encoding='utf-8'))
    figures=ROOT/'src/figures/sach'
    credits=json.loads((figures/'nguon.json').read_text(encoding='utf-8'))
    book=next(key for key,value in credits['sach'].items() if 'Nicholson' in value)
    subjects=json.loads((ROOT/'content/dai-so/mon.json').read_text(encoding='utf-8'))
    titles={m['so']:m['ten']for c in subjects['chuong']for m in c.get('muc',[])}
    manifest=[]
    for item in inventory:
        section,number=item['section'],item['number']
        supplement=section.endswith('.0')
        chapter=int(section[0])
        internal=f'{chapter}.0.{number.split(".")[-1]}'if supplement else number
        exists=ROOT/f'content/dai-so/chuong-{chapter}/bai-tap/{internal.replace(".","-")}.mdx'
        # Existing translated questions and worked solutions are kept intact.
        if section in ['2.1','2.2']:
            manifest.append({'so':internal,'so_sach':number,'muc':section,'trang':sorted({p['page']for p in item['pieces']})})
            continue
        tags=[]
        for i,piece in enumerate(item['pieces'],1):
            name=f'ds-de-{internal.replace(".","-")}-{i}'
            rect=pymupdf.Rect(*piece['rect'])
            excerpt=pymupdf.open()
            page=excerpt.new_page(width=rect.width,height=rect.height)
            page.show_pdf_page(page.rect,doc,piece['page']-1,clip=rect)
            svg=page.get_svg_image(text_as_path=True)
            svg=re.sub(r'<\?xml[^>]+>\s*','',svg)
            svg=svg.replace('<svg ','<svg class="de-goc-svg" role="img" fill="currentColor" ',1)
            svg=re.sub(r'<path\b[^>]*\bfill="#ffffff"[^>]*/>', '', svg)
            svg=re.sub(r'(fill|stroke)="#(?:000000|000)"',r'\1="currentColor"',svg)
            svg=re.sub(r'(fill|stroke)="#[0-9a-fA-F]{3,6}"',r'\1="currentColor"',svg)
            svg=optimize_svg(svg,name,rect.width,rect.height)
            (figures/f'{name}.svg').write_text(svg,encoding='utf-8')
            credits['hinh'][name]={'sach':book,'trang':piece['page'],'hop':piece['rect']}
            tags.append(f'<HinhSach ten="{name}" moTa="Đề gốc Nicholson bài {number}, phần {i}; xem bản văn bản bên dưới hình" />')
        title=f'Bài bổ sung {number}'if supplement else f'{titles[section]} — bài {number.split(".")[-1]}'
        # PDF text is supplied for selection / assistive reading, alongside exact vector math.
        source_text='\n\n'.join(doc[p['page']-1].get_text(clip=pymupdf.Rect(*p['rect']),sort=True)for p in item['pieces'])
        source_text=''.join(c for c in source_text if c in '\n\t' or ord(c)>=32)
        body=f'''---
so: "{internal}"
muc: "{section}"
do_kho: vua
tieu_de: {json.dumps(title,ensure_ascii=False)}
can_dung: []
de_goc_tieng_anh: true
so_sach: "{number}"
---

<De>
Đề gốc tiếng Anh, giữ nguyên các ý và số liệu của bài {number} trong giáo trình Nicholson 2023. Hình bên dưới giữ đúng công thức, ma trận và sơ đồ của sách.

{(chr(10)*2).join(tags)}

<details>
<summary>Văn bản đề gốc để chọn và sao chép</summary>

```text
{source_text.strip()}
```

Công thức và ma trận được trình bày đầy đủ trong hình đề gốc phía trên.
</details>
</De>

'''
        answer=solutions[number]
        for tag,key in [('<GoiY so={1}>','goi_y_1'),('<GoiY so={2}>','goi_y_2'),('<LoiGiai>','loi_giai'),('<LoiHayMac>','loi_hay_mac')]:
            end='GoiY'if tag.startswith('<GoiY')else tag[1:-1]
            text=re.sub(r'\$\$(.+?)\$\$',lambda m:'\n\n$$\n'+m[1].strip()+'\n$$\n\n',answer[key],flags=re.S)
            body+=tag+'\n\n'+text.strip()+'\n\n</'+end+'>\n\n'
        exists.parent.mkdir(parents=True,exist_ok=True)
        body='\n'.join(line.rstrip()for line in body.splitlines()).rstrip()+'\n'
        exists.write_text(body,encoding='utf-8')
        manifest.append({'so':internal,'so_sach':number,'muc':section,'trang':sorted({p['page']for p in item['pieces']})})
    (figures/'nguon.json').write_text(json.dumps(credits,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (ROOT/'content/dai-so/bai-tap-goc.json').write_text(json.dumps({'giao_trinh':'Nicholson 2023 – Revision A','bai_tap':manifest},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Indexed {len(manifest)} original exercises.')

if __name__=='__main__': main()

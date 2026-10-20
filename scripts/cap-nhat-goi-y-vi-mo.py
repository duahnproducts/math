"""Bổ sung gợi ý do người biên soạn viết, giữ nguyên bản dịch và lời giải hiện có."""
from pathlib import Path
import re
from loi_giai_bien_soan import MICRO_HINTS,goi_y_thao_luan

ROOT=Path(__file__).resolve().parents[1]
for key in MICRO_HINTS:
    chapter,file,slide=key.split('/')
    path=ROOT/f'content/vi-mo/chuong-{chapter}/sach/{file}.mdx'
    source=path.read_text(encoding='utf-8')
    pattern=r'(<div data-loi-giai-thao-luan="'+slide+r'">)(.*?)(</div>)'
    def replace(match):
        body=re.sub(r'\s*<GoiY\b[^>]*>.*?</GoiY>','',match[2],flags=re.S)
        position=body.index('<LoiGiai>')
        return match[1]+body[:position].rstrip()+'\n\n'+goi_y_thao_luan(key)+'\n\n'+body[position:]+match[3]
    source,count=re.subn(pattern,replace,source,flags=re.S)
    assert count==1,(key,count)
    path.write_text(source,encoding='utf-8')
print(f'Updated hints for {len(MICRO_HINTS)} microeconomics discussions.')

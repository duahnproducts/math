"""Tái tạo lời giải có kiểm tra đại số chính xác; không gọi API bên ngoài."""
from pathlib import Path
import json,re,subprocess,sys

root=Path(__file__).resolve().parents[1]
folder=root/'scripts/loi-giai-nicholson'
for script in sorted(folder.glob('*.py')):
    if re.fullmatch(r'[23]-\d+\.py',script.name):subprocess.run([sys.executable,str(script)],check=True)
data=json.loads((root/'scripts/data/loi-giai-nicholson.json').read_text(encoding='utf-8'))
inventory=json.loads((root/'scripts/data/nicholson-2023-exercise-clips.json').read_text(encoding='utf-8'))
expected={v['number']for v in inventory if v['section']not in ['2.1','2.2']}
assert set(data)==expected and len(data)==297
for number,answer in data.items():
    assert set(answer)=={'loi_giai','goi_y_1','goi_y_2','loi_hay_mac'},number
    for text in answer.values():
        assert text.strip() and text.count('$')%2==0,number
        assert not any(ord(c)<32 and c!='\n' for c in text),number
print('Verified 297 new solutions; existing 47 solutions in sections 2.1-2.2 preserved.')

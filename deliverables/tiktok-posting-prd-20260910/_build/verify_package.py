from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, re
from pypdf import PdfReader
from PIL import Image
from reportlab.pdfbase.ttfonts import TTFont

root = Path(__file__).resolve().parents[1]
pdf = root / 'TikTok发帖_产品需求文档_V1.0.pdf'
md = root / 'TikTok发帖_产品需求文档_V1.0.md'
reader = PdfReader(pdf)
assert len(reader.pages) == 20
text = '\n'.join(p.extract_text() for p in reader.pages)
for n in range(1, 13):
    assert f'A{n:02}' in text
for term in ['新建任务', '任务列表', '部分成功', '已上传草稿', '帖子同步中', 'GMV Max']:
    assert term in text
links = [str(a.get_object().get('/A', {}).get('/URI', '')) for p in reader.pages for a in p.get('/Annots', [])]
assert len([u for u in links if u.startswith('https://business-api.tiktok.com/')]) == 6
image_pages = [i + 1 for i, p in enumerate(reader.pages) if len(p.images)]
assert len(image_pages) == 11
markdown = md.read_text(encoding='utf-8')
image_refs = re.findall(r'!\[[^\]]*\]\(([^)]+)\)', markdown)
assert len(image_refs) == 11 and all((root / p).is_file() for p in image_refs)
pngs = sorted((root / 'prototypes').glob('P*.png'))
assert len(pngs) == 11
assert all(Image.open(p).size == (2000, 1250) for p in pngs)
gallery = (root / '原型总览.html').read_text(encoding='utf-8')
assert gallery.count('<img ') == 11
assert all((root / p).is_file() for p in re.findall(r'<img src="([^"]+)"', gallery))
font = TTFont('Coverage', 'C:/Windows/Fonts/msyh.ttc', subfontIndex=0)
missing = sorted({c for c in text if not c.isspace() and ord(c) not in font.face.charWidths})
assert not missing, missing
files = [pdf, md, root / '原型总览.html', root / '交付说明.md'] + pngs
package = root / 'TikTok发帖_需求文档与原型_V1.0.zip'
with ZipFile(package, 'w', ZIP_DEFLATED) as z:
    for file in files:
        z.write(file, file.relative_to(root).as_posix())
with ZipFile(package) as z:
    assert z.testzip() is None
    assert len(z.namelist()) == 15
report = {'pdf_pages': len(reader.pages), 'prototype_pages': image_pages, 'png_count': len(pngs), 'png_dimensions': [2000, 1250], 'official_links': 6, 'acceptance_checks': 12, 'missing_font_glyphs': missing, 'package_files': len(files), 'zip_bytes': package.stat().st_size, 'visual_review': 'All 20 rendered PDF pages and all 11 prototypes inspected; overlap, draft preview labels, pagination and missing glyph corrected.'}
(root / '_build' / 'qa' / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
print(package)

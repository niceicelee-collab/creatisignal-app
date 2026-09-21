from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha256
from lxml import etree
from PIL import Image
from pypdf import PdfReader
import json, re
from content import ROOT, PAGES, SOURCES

docx = ROOT / 'TikTok发帖_产品需求文档_V1.1.docx'
norm = lambda s: re.sub(r'\s+', '', s)
with ZipFile(docx) as z:
    assert z.testzip() is None
    xml = etree.fromstring(z.read('word/document.xml'))
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    body = ''.join(xml.xpath('//w:t/text()', namespaces=ns))
    assert len(xml.xpath('//w:tbl', namespaces=ns)) == 9
    media = [n for n in z.namelist() if n.startswith('word/media/')]
    assert len(media) == 10
    embedded = {sha256(z.read(n)).hexdigest() for n in media}
    expected = {sha256(p.read_bytes()).hexdigest() for p in (ROOT/'prototypes').glob('P*.png')}
    assert embedded == expected
    rels = etree.fromstring(z.read('word/_rels/document.xml.rels'))
    links = {r.get('Target') for r in rels if r.get('Type', '').endswith('/hyperlink')}
    assert links == {url for _, url in SOURCES}
    for page in PAGES:
        strings = [page['title']]
        if 'proto' in page:
            strings += [page['proto'], page['note']]
        else:
            for block in page['blocks']:
                if block[0] == 'table':
                    strings.extend(block[1])
                    strings.extend(value for row in block[2] for value in row)
                elif block[0] != 'sources':
                    strings.append(block[1])
        assert all(norm(s) in norm(body) for s in strings), page['title']

pdf = PdfReader(ROOT/'_build/word-qa/word-render.pdf')
assert len(pdf.pages) == len(PAGES) == 19
for page, rendered in zip(PAGES, pdf.pages):
    assert norm(page['title']) in norm(rendered.extract_text()), page['title']

gallery = (ROOT/'原型总览.html').read_text(encoding='utf-8')
images = re.findall(r'<img[^>]+src="([^"]+)"', gallery)
assert len(images) == 10
for src in images:
    assert Image.open(ROOT/src).size == (2000, 1250)
assert 'P11' not in gallery
assert not (ROOT/'prototypes/P11.png').exists()
for field in ['video_views','likes','comments','shares','favorites','reach','new_followers','average_time_watched','full_video_watched_rate','total_time_watched']:
    assert field in body

files = [docx, ROOT/'TikTok发帖_产品需求文档_V1.1.md', ROOT/'原型总览.html', ROOT/'交付说明.md']
files += sorted((ROOT/'prototypes').glob('P*.png'))
out = ROOT/'TikTok发帖_需求与原型_V1.1.zip'
with ZipFile(out, 'w', ZIP_DEFLATED) as z:
    for p in files:
        z.write(p, p.relative_to(ROOT).as_posix())
with ZipFile(out) as z:
    assert z.testzip() is None
    assert len(z.namelist()) == 14
    assert not any('_build' in name or 'P11' in name for name in z.namelist())
report = {'docx':docx.name, 'word_render_engine':'WPS read-only export', 'rendered_pages':19, 'editable_tables':9, 'embedded_prototypes':10, 'source_links':7, 'package_files':14, 'docx_sha256':sha256(docx.read_bytes()).hexdigest(), 'zip_sha256':sha256(out.read_bytes()).hexdigest(), 'checks':'passed'}
(ROOT/'_build/verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
print(out)

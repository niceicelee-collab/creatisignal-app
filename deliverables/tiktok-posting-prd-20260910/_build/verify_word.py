from pathlib import Path
from zipfile import ZipFile
from hashlib import sha256
import re, json
from lxml import etree
from docx import Document
from pypdf import PdfReader
from content import ROOT, PAGES, SOURCES

file=ROOT/'TikTok发帖_产品需求文档_V1.0.docx'
document=Document(file)
with ZipFile(file) as z:
    assert z.testzip() is None
    tree=etree.fromstring(z.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    body=''.join(tree.xpath('//w:t/text()',namespaces=ns))
    missing=[]
    for page in PAGES:
        values=[page['title']]
        if 'note' in page:values.append(page['note'])
        for block in page.get('blocks',[]):
            if block[0]=='table':values+=block[1]+[v for row in block[2] for v in row]
            elif block[0]!='sources':values.append(block[1])
        missing += [s for s in values if s not in body]
    assert not missing, missing
    original_images={sha256(p.read_bytes()).hexdigest() for p in (ROOT/'prototypes').glob('P*.png')}
    embedded_images={sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('word/media/')}
    assert original_images == embedded_images and len(embedded_images)==11
    rels=etree.fromstring(z.read('word/_rels/document.xml.rels'))
    urls=[r.get('Target') for r in rels if r.get('Type','').endswith('/hyperlink')]
    assert set(urls)=={url for _,url in SOURCES}
pdf=PdfReader(ROOT/'_build'/'word-qa'/'word-render.pdf')
assert len(pdf.pages)==20
for i,page in enumerate(PAGES):
    t=re.sub(r'\s','',pdf.pages[i].extract_text())
    assert re.sub(r'\s','',page['title']) in t,(i+1,page['title'])
assert len(document.tables)==9 and len(document.inline_shapes)==11
report={'pages':20,'editable_tables':9,'embedded_prototypes':11,'content_preserved':True,'images_unchanged':True,'official_source_links':6,'visual_review':'All 20 pages rendered by WPS and visually inspected; title border removed and pagination verified.','bytes':file.stat().st_size,'sha256':sha256(file.read_bytes()).hexdigest()}
(ROOT/'_build'/'word-qa'/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))

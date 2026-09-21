from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
from pypdf import PdfReader
import json, re

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/'_build'
pdf=ROOT/'Hook资产_产品需求文档_V1.0.pdf'
reader=PdfReader(pdf)
text='\n'.join(p.extract_text() or '' for p in reader.pages)
required=['需求背景','需求目标','核心用户场景','功能优先级','Hook 提取系统提示词初稿','Qwen3.7plus','Seedance2.0','Seedance2.5','A32']
missing=[x for x in required if x not in text]
pages=sorted(BUILD.glob('page-*.png'))
for i in range(0,len(pages),2):
    imgs=[Image.open(p).convert('RGB') for p in pages[i:i+2]]
    panel=Image.new('RGB',(sum(x.width for x in imgs)+12*(len(imgs)-1),max(x.height for x in imgs)), '#dfe4e7')
    offset=0
    for im in imgs:panel.paste(im,(offset,0));offset+=im.width+12
    panel.save(BUILD/f'review-{i//2+1:02d}.jpg',quality=94)
for i in range(0,12,2):
    imgs=[Image.open(ROOT/'prototypes'/f'F{k:02d}.png').convert('RGB').resize((1200,740)) for k in [i+1,i+2]]
    panel=Image.new('RGB',(1200,1490),'#dfe4e7');panel.paste(imgs[0],(0,0));panel.paste(imgs[1],(0,750));panel.save(BUILD/f'screen-review-{i//2+1:02d}.jpg',quality=95)
report={'pages':len(reader.pages),'pdf_bytes':pdf.stat().st_size,'missing_text':missing,'screens':len(list((ROOT/'prototypes').glob('*.png'))),'rendered_pages':len(pages),'replacement_characters':text.count('\ufffd'),'prompt_present':(ROOT/'Qwen3.7plus_Hook提取系统提示词_V1.0.txt').exists()}
(BUILD/'qa_summary.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False))
assert not missing and len(reader.pages)==26 and len(pages)==26

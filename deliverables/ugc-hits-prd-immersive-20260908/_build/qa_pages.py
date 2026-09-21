from pathlib import Path
import json,sys
from pypdf import PdfReader
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parent
if '--inspect' in sys.argv:
    pdf=PdfReader(ROOT/'word-render.pdf')
    report=[]
    for i,p in enumerate(pdf.pages):
        text=p.extract_text() or ''
        lines=text.splitlines()
        report.append({'page':i+1,'chars':len(text),'head':lines[:4],'tail':lines[-4:]})
    (ROOT/'page_text_qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
else:
    paths=sorted((ROOT/'word-pages').glob('page-*.png'))
    out=ROOT/'review';out.mkdir(exist_ok=True)
    for i in range(0,len(paths),2):
        pics=[Image.open(p).convert('RGB') for p in paths[i:i+2]]
        canvas=Image.new('RGB',(pics[0].width*2,max(p.height for p in pics)+26),'#d7dbe0')
        d=ImageDraw.Draw(canvas)
        for j,pic in enumerate(pics):
            canvas.paste(pic,(j*pic.width,26));d.text((j*pic.width+12,6),paths[i+j].stem,fill='black')
        canvas.save(out/f'pair-{i//2+1:02d}.png')
    print('Review sheets:',len(paths),'pages')

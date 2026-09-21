from pathlib import Path
import re
import html
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, PageBreak, KeepTogether
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'pdf'
STEM = '电商生图模型效果与成本评测_2026-09-18'
SRC = OUT / (STEM + '.md')
DEST = OUT / (STEM + '.pdf')
pdfmetrics.registerFont(TTFont('YaHei', 'C:/Windows/Fonts/msyh.ttc', subfontIndex=0))
pdfmetrics.registerFont(TTFont('YaHeiBold', 'C:/Windows/Fonts/msyhbd.ttc', subfontIndex=0))
pdfmetrics.registerFontFamily('YaHei', normal='YaHei', bold='YaHeiBold', italic='YaHei', boldItalic='YaHeiBold')
NAVY = colors.HexColor('#183C4A')
TEXT = colors.HexColor('#222D33')
MUTED = colors.HexColor('#5A6972')
WIDTH = A4[0] - 88
styles = {
    'body': ParagraphStyle('body', fontName='YaHei', fontSize=9.4, leading=15.2, textColor=TEXT, spaceAfter=8, wordWrap='CJK'),
    'title': ParagraphStyle('title', fontName='YaHeiBold', fontSize=25, leading=34, textColor=colors.black, spaceAfter=13, wordWrap='CJK'),
    'h2': ParagraphStyle('h2', fontName='YaHeiBold', fontSize=17.5, leading=25, textColor=colors.black, spaceAfter=14, keepWithNext=True, wordWrap='CJK'),
    'h3': ParagraphStyle('h3', fontName='YaHeiBold', fontSize=11.3, leading=17, textColor=NAVY, spaceBefore=7, spaceAfter=6, keepWithNext=True, wordWrap='CJK'),
    'cell': ParagraphStyle('cell', fontName='YaHei', fontSize=8.25, leading=12.3, textColor=TEXT, wordWrap='CJK'),
    'head': ParagraphStyle('head', fontName='YaHeiBold', fontSize=8.3, leading=12.3, textColor=colors.white, wordWrap='CJK'),
    'bullet': ParagraphStyle('bullet', fontName='YaHei', fontSize=9.4, leading=15.2, textColor=TEXT, leftIndent=12, firstLineIndent=-9, spaceAfter=5, wordWrap='CJK'),
    'small': ParagraphStyle('small', fontName='YaHei', fontSize=8.5, leading=13.5, textColor=MUTED, spaceAfter=9, wordWrap='CJK'),
}

def inline(s):
    s = html.escape(s)
    s = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', lambda m: '<a href="'+m[2]+'" color="#17657C">'+m[1]+'</a>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'`([^`]+)`', r'\1', s)
    return s

def paragraph(s, style='body'):
    return Paragraph(inline(s), styles[style])

def table(lines):
    rows = [[c.strip() for c in x.strip().strip('|').split('|')] for x in lines]
    rows = [r for r in rows if not all(re.fullmatch(r'[:\- ]+', c or '-') for c in r)]
    count = len(rows[0])
    if count == 4:
        if 'T2I' in rows[0][1]:
            ratios = [.39, .12, .12, .37]
        elif '每张' in rows[0][1]:
            ratios = [.36, .22, .16, .26]
        else:
            ratios = [.3, .23, .23, .24]
    elif count == 3:
        if '任务' == rows[0][0]:
            ratios = [.24, .38, .38]
        elif '模型' == rows[0][0]:
            ratios = [.22, .39, .39]
        else:
            ratios = [.32, .32, .36]
    else:
        ratios = [1/count]*count
    data = [[paragraph(c,'head' if i == 0 else 'cell') for c in r] for i,r in enumerate(rows)]
    t = Table(data, colWidths=[WIDTH*r for r in ratios], repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),NAVY),
        ('VALIGN',(0,0),(-1,-1),'TOP'),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#F1F5F6'),colors.white]),
        ('LINEBELOW',(0,0),(-1,0),.5,NAVY),
        ('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#D9E2E5')),
        ('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),
        ('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))
    return [t,Spacer(1,10)]

story=[]
lines=SRC.read_text(encoding='utf-8').splitlines()
i=0
while i<len(lines):
    line=lines[i].strip()
    if not line:
        i+=1; continue
    if line=='---':
        story.append(PageBreak()); i+=1; continue
    if line.startswith('|'):
        chunk=[]
        while i<len(lines) and lines[i].strip().startswith('|'):
            chunk.append(lines[i]); i+=1
        story.extend(table(chunk)); continue
    if line.startswith('# '):
        story.append(paragraph(line[2:],'title'))
    elif line.startswith('## '):
        story.append(paragraph(line[3:],'h2'))
    elif line.startswith('### '):
        story.append(paragraph(line[4:],'h3'))
    elif line.startswith('- '):
        story.append(paragraph('• '+line[2:],'bullet'))
    else:
        chunk=[line]
        while i+1<len(lines) and lines[i+1].strip() and not lines[i+1].startswith(('#','|','---','- ')):
            i+=1; chunk.append(lines[i].strip())
        val='<br/>'.join(inline(x) for x in chunk)
        sty='small' if line.startswith('公开盲测') or re.match(r'\*\*S\d+ ',line) else 'body'
        story.append(Paragraph(val,styles[sty]))
    i+=1

def page_frame(c,doc):
    c.saveState()
    if doc.page>1:
        c.setFillColor(MUTED); c.setFont('YaHei',7.2)
        c.drawString(44,A4[1]-27,'电商生图模型效果与成本评测')
    c.setFillColor(MUTED); c.setFont('YaHei',7.2)
    c.drawString(44,25,'公开证据研究  ·  2026-09-18')
    c.drawRightString(A4[0]-44,25,str(doc.page))
    c.restoreState()

doc=SimpleDocTemplate(str(DEST),pagesize=A4,leftMargin=44,rightMargin=44,topMargin=46,bottomMargin=43,
                      title='电商生图模型效果与成本评测',author='Research',subject='电商商品图 广告素材 商品一致性 API成本 含Wan2.7')
doc.build(story,onFirstPage=page_frame,onLaterPages=page_frame)
reader=PdfReader(DEST)
all_text='\n'.join(p.extract_text() for p in reader.pages)
required=['Wan 2.7','0.20','0.50','Sunburst','Seedream','未执行','261','Reve']
for token in required:
    assert token in all_text,token
assert not any(t in all_text for t in ['turn13','turn14','','�'])
print('PDF',DEST)
print('PAGES',len(reader.pages))
for ix,p in enumerate(reader.pages,1):
    txt=p.extract_text()
    print(ix,len(txt),txt[:85].replace('\n',' | '))

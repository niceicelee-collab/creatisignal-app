from pathlib import Path
import json, re, html, subprocess, concurrent.futures, zipfile
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage, ImageOps, ImageDraw, ImageFont
from pypdf import PdfReader
from content import ROOT,PAGES,SOURCES

TMP=ROOT/'_build';OUT=ROOT/'prototypes'; QA=TMP/'qa'; QA.mkdir(exist_ok=True)
POPPLER=Path('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
for name,path in [('UI','C:/Windows/Fonts/msyh.ttc'),('UIB','C:/Windows/Fonts/msyhbd.ttc')]:
 pdfmetrics.registerFont(TTFont(name,path,subfontIndex=0))
pdfmetrics.registerFontFamily('UI',normal='UI',bold='UIB',italic='UI',boldItalic='UIB')

def render_one(i):
 key=f'P{i:02}';subprocess.run([str(POPPLER),'-png','-r','90','-singlefile',str(TMP/(key+'.pdf')),str(OUT/key)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 return key

def contact_sheet(files,out,thumb=(640,400),cols=2):
 rows=(len(files)+cols-1)//cols
 sheet=PILImage.new('RGB',(cols*(thumb[0]+20)+20,rows*(thumb[1]+50)+20),'#e9ece7')
 d=ImageDraw.Draw(sheet);font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',18)
 for i,path in enumerate(files):
  im=PILImage.open(path).convert('RGB');im.thumbnail(thumb);x=20+(i%cols)*(thumb[0]+20);y=20+(i//cols)*(thumb[1]+50)
  sheet.paste(im,(x,y));d.text((x,y+thumb[1]+6),path.stem,font=font,fill='#183322')
 sheet.save(out)

def ep(s):return html.escape(str(s))
STYLE={
 'title':ParagraphStyle('title',fontName='UIB',fontSize=24,leading=32,textColor=HexColor('#111916'),spaceAfter=15,keepWithNext=True),
 'h1':ParagraphStyle('h1',fontName='UIB',fontSize=19,leading=26,textColor=HexColor('#111916'),spaceAfter=13,keepWithNext=True),
 'h':ParagraphStyle('h',fontName='UIB',fontSize=12.3,leading=18,spaceBefore=8,spaceAfter=5,keepWithNext=True,textColor=HexColor('#17201c')),
 'p':ParagraphStyle('p',fontName='UI',fontSize=10.2,leading=15.7,spaceAfter=8,wordWrap='CJK',textColor=HexColor('#27342c')),
 'sub':ParagraphStyle('sub',fontName='UI',fontSize=10,leading=15,spaceAfter=15,textColor=HexColor('#758177')),
 'cell':ParagraphStyle('cell',fontName='UI',fontSize=9.4,leading=14,wordWrap='CJK',textColor=HexColor('#27342c')),
 'th':ParagraphStyle('th',fontName='UIB',fontSize=9.8,leading=14,wordWrap='CJK',textColor=HexColor('#16231b')),
 'note':ParagraphStyle('note',fontName='UI',fontSize=9.2,leading=14,wordWrap='CJK',spaceBefore=4,spaceAfter=4,textColor=HexColor('#5c6c60')),
 'caption':ParagraphStyle('caption',fontName='UI',fontSize=10.2,leading=15.7,wordWrap='CJK',spaceAfter=8,textColor=HexColor('#57685b')),
}
def p(s,style='p'):return Paragraph(ep(s),STYLE[style])
def tab(headers,rows):
 n=len(headers)
 widths=[133,631] if n==2 else [129,392,243]
 if n==3 and headers[1]=='默认':widths=[185,61,518]
 if headers[0]=='编号':widths=[58,706]
 vals=[[p(v,'th') for v in headers]]+[[p(v,'cell') for v in row] for row in rows]
 t=Table(vals,colWidths=widths,repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),HexColor('#edf6df')),('BOX',(0,0),(-1,-1),.6,HexColor('#dde5d9')),('INNERGRID',(0,0),(-1,-1),.45,HexColor('#e5eae1')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('ROWBACKGROUNDS',(0,1),(-1,-1),[HexColor('#ffffff'),HexColor('#fafbf8')])]))
 return t
def on_page(c,doc):
 w,h=landscape(A4);c.setFillColor(HexColor('#ffffff'));c.setFont('UI',8);c.setFillColor(HexColor('#7c867d'))
 c.drawString(38,22,'CreatiSignal  ·  TikTok 发帖产品需求文档  V1.0')
 c.drawRightString(w-38,22,f'{doc.page}')

def build():
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:print('Rendered:',list(ex.map(render_one,range(1,12))))
 md=['# TikTok 发帖产品需求文档','\nCreatiSignal · V1.0 · 2026-09-10\n']
 story=[];source_lookup={k:v for k,v in SOURCES}
 for idx,pg in enumerate(PAGES):
  if idx:story.append(PageBreak())
  if 'proto' in pg:
   key=pg['proto'];story.append(p(f'{key}  {pg["title"]}','h1'));story.append(p(pg['note'],'caption'))
   image=Image(str(OUT/(key+'.png')),width=700,height=437.5);image.hAlign='CENTER';story.append(image)
   md.extend([f'\n## {key} {pg["title"]}\n',pg['note'],f'\n![{pg["title"]}](prototypes/{key}.png)\n'])
   continue
  story.append(p(pg['title'],'title' if idx==0 else 'h1'))
  if idx:md.append('\n## '+pg['title']+'\n')
  if pg.get('sub'):story.append(p(pg['sub'],'sub'))
  for b in pg['blocks']:
   if b[0] in ('p','h','note'):
    story.append(p(b[1],b[0]));md.append(('### ' if b[0]=='h' else '> ' if b[0]=='note' else '')+b[1]+'\n')
   elif b[0]=='table':
    story.append(tab(b[1],b[2]));story.append(Spacer(1,9));md.append('| '+' | '.join(b[1])+' |\n| '+' | '.join(['---']*len(b[1]))+' |')
    md.extend('| '+' | '.join(row)+' |' for row in b[2]);md.append('')
   elif b[0]=='sources':
    links=[]
    for name,url in SOURCES:
     links.append(Paragraph(f'<link href="{ep(url)}" color="#255c45">{ep(name)}</link>',STYLE['note']));md.append(f'- [{name}]({url})')
    table=Table([links[:3],links[3:]],colWidths=[254,254,256]);table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.append(table);md.append('')
 pdf=ROOT/'TikTok发帖_产品需求文档_V1.0.pdf'
 doc=SimpleDocTemplate(str(pdf),pagesize=landscape(A4),rightMargin=38,leftMargin=38,topMargin=31,bottomMargin=40,title='TikTok 发帖产品需求文档',author='CreatiSignal',subject='新建任务 任务列表 状态与 GMV Max 衔接')
 doc.build(story,onFirstPage=on_page,onLaterPages=on_page)
 (ROOT/'TikTok发帖_产品需求文档_V1.0.md').write_text('\n'.join(md),encoding='utf-8')
 cards=[]
 for pg in PAGES:
  if 'proto' in pg:
   key=pg['proto'];cards.append(f'<section id="{key}"><h2>{key} {ep(pg["title"])}</h2><p>{ep(pg["note"])}</p><a href="prototypes/{key}.png"><img src="prototypes/{key}.png" alt="{ep(pg["title"])}"></a></section>')
 nav=''.join(f'<a href="#{p["proto"]}">{p["proto"]} {ep(p["title"])}</a>' for p in PAGES if 'proto'in p)
 gallery='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>TikTok 发帖 原型示例</title><style>body{margin:0;background:#f3f5f1;color:#17201c;font:15px "Microsoft YaHei",sans-serif}header{padding:30px 40px;background:#fff}h1{font-size:25px;margin:0 0 12px}nav{display:flex;gap:10px;flex-wrap:wrap}nav a{color:#346047;background:#eff7e4;padding:8px 12px;border-radius:8px;text-decoration:none;font-size:12px}main{max-width:1500px;margin:auto;padding:22px}section{background:#fff;padding:22px;margin-bottom:24px;border:1px solid #dfe7d8;border-radius:14px}h2{font-size:20px;margin:0}p{color:#677563;line-height:1.7}img{width:100%;height:auto;display:block;border:1px solid #e3e8df}</style><header><h1>TikTok 发帖 原型示例</h1><p>11 张静态原型 · 配合需求文档阅读 · 点击图片查看原尺寸</p><nav>'+nav+'</nav></header><main>'+''.join(cards)+'</main></html>'
 (ROOT/'原型总览.html').write_text(gallery,encoding='utf-8')
 (ROOT/'交付说明.md').write_text('# TikTok 发帖交付说明\n\n- PDF：正式阅读版，包含需求规则和 11 张原型。\n- Markdown：可编辑需求源稿，图片位于 prototypes 文件夹。\n- 原型总览.html：本地浏览全部静态原型。\n- prototypes/P01.png 至 P11.png：独立原型示例图，尺寸 2000×1250。\n\n原型中的账号、视频与统计数字均为示例。功能与状态按需求文档说明，不代表已接入 TikTok 或已经开发上线。\n',encoding='utf-8')
 reader=PdfReader(str(pdf));print('Document pages:',len(reader.pages))
 subprocess.run([str(POPPLER),'-png','-r','110',str(pdf),str(QA/'page')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 contact_sheet(sorted(OUT.glob('P*.png')),QA/'prototypes-overview.png')
 pages=[QA/f'page-{i:02}.png' for i in range(1,len(reader.pages)+1)]
 for k in range(0,len(pages),6):contact_sheet(pages[k:k+6],QA/f'doc-overview-{k//6+1}.png',thumb=(672,475),cols=2)
 print('Outputs:',pdf)
if __name__=='__main__':build()

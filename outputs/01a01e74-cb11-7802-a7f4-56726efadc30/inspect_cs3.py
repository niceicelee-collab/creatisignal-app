from pathlib import Path
import json
import sys
from openpyxl import load_workbook
from PIL import Image, ImageDraw, ImageFont, ImageOps

sys.stdout.reconfigure(encoding='utf-8')
ROOT=Path(r'C:\Users\ice.li\Desktop\CS-3')
OUT=Path(__file__).resolve().parent/'cs3_qa'
OUT.mkdir(exist_ok=True)
font=ImageFont.truetype(r'C:\Windows\Fonts\msyh.ttc',20)
wb=load_workbook(ROOT/'商品信息汇总表.xlsx',data_only=True)
rows=[]
aliases={'女装-礼裙':'女装-礼服','服装-箱包':'服饰-箱包'}
for i,(industry,category,info,model) in enumerate(list(wb.worksheets[0].values)[1:],1):
    label=f'{industry}-{category}'
    folder=ROOT/aliases.get(label,label)
    files=[]
    for n in range(1,5):
        f=next((folder/f'{n}{ext}' for ext in ['.png','.jpg','.jpeg'] if (folder/f'{n}{ext}').is_file()),None)
        if f: files.append(f)
    item={'index':i,'label':label,'folder':str(folder),'info':info,'model':model,
          'images':[{ 'reference':f'@图片{f.stem}','path':str(f),'size':Image.open(f).size } for f in files]}
    if files:
        canvas=Image.new('RGB',(1600,1260),'#e8eef4')
        draw=ImageDraw.Draw(canvas)
        draw.text((18,12),f'{i:02d} {label}  |  模特：{model}',font=font,fill='#102a43')
        for j,f in enumerate(files):
            x,y=(j%2)*800,(j//2)*600+52
            draw.rectangle((x+8,y+8,x+792,y+590),fill='white')
            draw.text((x+18,y+12),f'@图片{f.stem} / {f.name}',font=font,fill='#102a43')
            im=ImageOps.exif_transpose(Image.open(f)).convert('RGB')
            im.thumbnail((760,530))
            canvas.paste(im,(x+20+(760-im.width)//2,y+48+(530-im.height)//2))
        preview=OUT/f'{i:02d}_product_refs.jpg'
        canvas.save(preview,quality=95)
        item['preview']=str(preview)
    rows.append(item)
(OUT/'source_rows.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([{k:r[k] for k in ['index','label','model','images']} for r in rows],ensure_ascii=False,indent=2))

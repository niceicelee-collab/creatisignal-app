from pathlib import Path
import concurrent.futures, subprocess, html
from content import ROOT,PAGES,SOURCES
POPPLER=Path('C:/Users/ice.li/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
def render(pg):
    key=pg['proto']
    subprocess.run([str(POPPLER),'-png','-r','90','-singlefile',str(ROOT/'_build'/(key+'.pdf')),str(ROOT/'prototypes'/key)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    return key
protos=[p for p in PAGES if 'proto' in p]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:print(list(pool.map(render,protos)))
esc=html.escape
cards=[]
for pg in protos:
    key=pg['proto'];cards.append(f'<section id="{key}"><h2>{key} {esc(pg["title"])}</h2><p>{esc(pg["note"])}</p><a href="prototypes/{key}.png"><img loading="lazy" src="prototypes/{key}.png" alt="{esc(pg["title"])}"></a></section>')
nav=''.join(f'<a href="#{p["proto"]}">{p["proto"]} {esc(p["title"])}</a>' for p in protos)
style='body{margin:0;background:#f3f5f1;color:#17201c;font:15px "Microsoft YaHei",sans-serif}header{padding:28px 38px;background:white}h1{font-size:25px;margin:0 0 10px}nav{display:flex;gap:8px;flex-wrap:wrap}nav a{color:#346047;background:#eff7e4;padding:8px 12px;border-radius:8px;text-decoration:none;font-size:12px}main{max-width:1600px;padding:22px;margin:auto}section{padding:22px;background:white;border:1px solid #e3e8df;border-radius:14px;margin-bottom:22px}h2{margin:0;font-size:20px}p{color:#667563;line-height:1.7}img{display:block;width:100%;height:auto;border:1px solid #e3e8df}'
(ROOT/'原型总览.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>TikTok 发帖原型 V1.1</title><style>'+style+'</style><header><h1>TikTok 发帖原型 V1.1</h1><p>10 张静态原型 · 按账号独立任务 · 点击图片查看原尺寸</p><nav>'+nav+'</nav></header><main>'+''.join(cards)+'</main></html>',encoding='utf-8')
md=['# TikTok 发帖产品需求文档\n','CreatiSignal · V1.1 · 2026-09-11\n']
for i,pg in enumerate(PAGES):
    if i:md.append('\n## '+(pg.get('proto','')+' '+pg['title']).strip()+'\n')
    if 'proto' in pg:
        md.extend([pg['note'],f'\n![{pg["title"]}](prototypes/{pg["proto"]}.png)\n']);continue
    for b in pg['blocks']:
        if b[0]=='table':
            md.append('| '+' | '.join(b[1])+' |\n| '+' | '.join(['---']*len(b[1]))+' |')
            md.extend('| '+' | '.join(row)+' |' for row in b[2]);md.append('')
        elif b[0]=='sources':md.extend(f'- [{name}]({url})' for name,url in SOURCES)
        else:md.append(('### ' if b[0]=='h' else '> ' if b[0]=='note' else '')+b[1]+'\n')
(ROOT/'TikTok发帖_产品需求文档_V1.1.md').write_text('\n'.join(md),encoding='utf-8')
(ROOT/'交付说明.md').write_text('# TikTok 发帖 V1.1\n\nWord 文档包含可编辑正文、表格和 P01 至 P10 原型。原型总览.html 可在本地打开，prototypes 内为独立 PNG。P11 已移除。\n\n本版调整发帖设置、内联输入与地点下拉、底部发布方式、单账号任务列表及成功详情。原型为静态示例，不代表功能已开发。图片沿用工作区现有示例素材，账号与数据为示例。\n',encoding='utf-8')
print('Gallery and editable requirements created')

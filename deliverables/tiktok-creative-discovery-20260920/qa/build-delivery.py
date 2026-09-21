from pathlib import Path
import html
import re
import zipfile

root = Path(__file__).resolve().parent.parent
doc = root / '带货创意精选_功能清单与详细需求_V1.0.md'
revision = root / '带货精选_修订说明_20260921.md'
lines = (revision.read_text(encoding='utf-8') + '\n\n# 初版需求存档（与当前修订不一致处，以修订说明为准）\n\n' + doc.read_text(encoding='utf-8')).splitlines()

def inline(text):
    text = html.escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text

out = []
toc = []
i = 0
while i < len(lines):
    line = lines[i]
    if not line.strip():
        i += 1
        continue
    match = re.match(r'^(#{1,3}) (.+)$', line)
    if match:
        level, title = len(match[1]), match[2]
        anchor = 'section-' + str(i)
        out.append(f'<h{level} id="{anchor}">{inline(title)}</h{level}>')
        if level == 2:
            toc.append(f'<a href="#{anchor}">{inline(title)}</a>')
        i += 1
    elif line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].startswith('|'):
            cells = [x.strip() for x in lines[i].strip().strip('|').split('|')]
            if not all(re.match(r'^:?-+:?$', x) for x in cells):
                rows.append(cells)
            i += 1
        table = '<div class="table-wrap"><table><thead><tr>' + ''.join('<th>'+inline(x)+'</th>' for x in rows[0]) + '</tr></thead><tbody>'
        table += ''.join('<tr>' + ''.join('<td>'+inline(x)+'</td>' for x in row) + '</tr>' for row in rows[1:])
        out.append(table + '</tbody></table></div>')
    elif line.startswith('- ') or re.match(r'^\d+\. ', line):
        ordered = not line.startswith('- ')
        tag = 'ol' if ordered else 'ul'
        items = []
        while i < len(lines) and (bool(re.match(r'^\d+\. ', lines[i])) if ordered else lines[i].startswith('- ')):
            items.append('<li>'+inline(re.sub(r'^(?:- |\d+\. )', '', lines[i]))+'</li>')
            i += 1
        out.append('<'+tag+'>'+''.join(items)+'</'+tag+'>')
    else:
        paragraphs = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(?:#|\||- |\d+\. )', lines[i]):
            paragraphs.append(lines[i])
            i += 1
        out.append('<p>'+inline(' '.join(paragraphs))+'</p>')

screens = [
    ('01-灵感发现.png','带货精选','?view=curated','地区、达人、粉丝量、商品和视频条件筛选'),
    ('02-素材详情.png','素材详情','?scene=detail','视频互动、关联商品、作者与源视频'),
    ('03-作者信息.png','作者摘要','?scene=detail&id=m3','名称、账号与粉丝量，只读展示'),
    ('04-我的收藏.png','我的收藏','?view=favorites','收藏同步与源视频不可用状态'),
    ('05-更多筛选.png','组合筛选','?scene=filters','地区、达人粉丝量与视频条件组合'),
    ('06-复刻衔接.png','复刻衔接','?view=download&id=m3','模拟下载3秒后，左侧播放器、右侧拆解进度'),
    ('07-无结果.png','无结果','?scene=empty','保留用户条件并提供清空入口'),
    ('08-素材精选管理.png','素材精选管理','?view=review','有限候选、内容审核与独立发布'),
    ('09-分析下载中.png','分析下载中间页','?view=analysis&id=m3','从素材详情进入，下载源视频后衔接分析'),
    ('10-视频分析中.png','视频分析中','?view=analysis&id=m3','模拟下载3秒后展示播放器与脚本分析进度'),
]
gallery = ''.join(f'<article class="preview"><a href="{name}" target="_blank"><img src="{name}" alt="{title}原型"></a><div><small>{n:02d}</small><h3>{title}</h3><p>{desc}</p><a class="preview-link" href="prototype.html{q}">进入交互示例 ↗</a></div></article>' for n,(name,title,q,desc) in enumerate(screens,1))

page = '''<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CreatiSignal 带货创意精选 需求与原型</title><style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f5f7f3;color:#263528;font:14px/1.85 "Microsoft YaHei UI","Microsoft YaHei",sans-serif}a{color:#338846;text-decoration:none}a:hover{text-decoration:underline}.top{padding:40px 6vw 35px;background:linear-gradient(120deg,#e9f6d4,#e3f4ec);border-bottom:1px solid #dce7d3}.top .eyebrow{letter-spacing:2px;font-size:11px;color:#7c9871}.top h1{font-size:32px;margin:10px 0}.top p{color:#72856a;font-size:14px;margin:8px 0 22px}.actions{display:flex;gap:12px;flex-wrap:wrap}.actions a{border:1px solid #d7e5cb;background:#ffffffd9;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:bold;color:#356331}.actions a.primary{background:#bff18b;border-color:#bff18b}.counts{margin-top:20px;font-size:12px;color:#8ba17b;display:flex;gap:26px}.layout{display:grid;grid-template-columns:225px minmax(0,1fr);gap:30px;max-width:1500px;margin:30px auto;padding:0 35px}.toc{position:sticky;top:25px;align-self:start;max-height:95vh;overflow:auto;font-size:12px;padding-right:10px}.toc strong{display:block;margin-bottom:14px;color:#536847}.toc a{display:block;color:#7f8c75;margin:0 0 11px;padding-left:9px;border-left:2px solid transparent}.toc a:hover{border-color:#6bab43;color:#367937;text-decoration:none}.content{min-width:0}.gallery{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:35px}.preview{background:white;border-radius:15px;overflow:hidden;border:1px solid #e4eadf}.preview>a{display:block}.preview img{display:block;width:100%;height:auto;border-bottom:1px solid #e7eddf}.preview>div{padding:15px 18px 18px;position:relative}.preview small{float:right;color:#aac394;font-size:21px;font-family:Georgia,serif}.preview h3{margin:0;font-size:16px}.preview p{font-size:11px;color:#839175;margin:5px 0}.preview-link{font-size:11px}.section-label{font-size:22px;margin:4px 0 20px}.doc{background:#fff;border:1px solid #e5eade;border-radius:17px;padding:38px 42px;min-width:0}.doc h1{font-size:28px;margin:0 0 20px;color:#10180c}.doc h2{font-size:23px;margin:43px 0 16px;color:#1b2b12;scroll-margin-top:24px}.doc h3{font-size:17px;margin:27px 0 13px;color:#3d5633}.doc p{margin:14px 0}.doc ul,.doc ol{padding-left:22px}.doc li{margin:9px 0}.table-wrap{overflow:auto;margin:18px 0 24px}.doc table{border-collapse:collapse;width:100%;font-size:12px;line-height:1.75}.doc th{background:#eef6e6;color:#476137;text-align:left;font-weight:650;border:1px solid #dfe7d8;padding:11px 12px}.doc td{vertical-align:top;padding:11px 12px;border:1px solid #e4eade;min-width:80px}.doc tr:nth-child(even){background:#fcfdfb}.doc code{font-family:monospace;background:#f2f6ee;padding:2px 4px}.bottom{font-size:11px;text-align:center;color:#99a78e;padding:30px}.note{padding:14px 17px;border-radius:10px;background:#edf5e5;color:#7e9270;font-size:12px;margin:0 0 22px}@media(max-width:950px){.layout{grid-template-columns:1fr;padding:0 18px}.toc{position:static;max-height:none;display:none}.doc{padding:25px 20px}.gallery{gap:12px}.top h1{font-size:26px}}@media(max-width:600px){.gallery{grid-template-columns:1fr}.top{padding:25px}.counts{gap:10px;font-size:10px}}@media print{.top,.toc,.gallery,.section-label,.note,.bottom{display:none}.layout{display:block;padding:0;margin:0}.doc{border:0;padding:0}.table-wrap{overflow:visible}.doc h2{break-after:avoid}.doc tr{break-inside:avoid}body{background:white}}
</style></head><body><header class="top"><div class="eyebrow">CREATISIGNAL · PRODUCT REQUIREMENTS</div><h1>带货创意精选 需求与原型</h1><p>从值得参考的营销素材，走向自己的商品创意。</p><div class="actions"><a class="primary" href="prototype.html">打开交互原型 ↗</a><a href="#requirements">查看详细需求</a><a href="带货创意精选_功能清单与详细需求_V1.0.md" download>下载初版存档</a><a href="带货精选_修订说明_20260921.md" download>下载当前修订</a><a href="带货创意精选_需求与原型.zip" download>下载完整交付包</a></div><div class="counts"><span>最新修改以修订说明为准</span><span>10 张原型示例</span><span>2026.09.21 修订</span></div></header><div class="layout"><nav class="toc"><strong>文档导航</strong><a href="#prototypes">原型示例图</a>TOC</nav><main class="content"><h2 class="section-label" id="prototypes">原型示例图</h2><div class="note">点击图片查看完整大图，点击“进入交互示例”体验对应页面。账号、商品、图片和数值为示意；外链与生成动作不会访问真实账号或创建真实任务。</div><div class="gallery">GALLERY</div><article class="doc" id="requirements">DOCUMENT</article></main></div><footer class="bottom">CreatiSignal · 带货创意精选 · 产品需求与原型示例</footer></body></html>'''
page = page.replace('TOC',''.join(toc)).replace('GALLERY',gallery).replace('DOCUMENT','\n'.join(out))
page = page.replace('<a href="带货创意精选_需求与原型.zip" download>下载完整交付包</a>', '')
(root/'index.html').write_text(page,encoding='utf-8')
(root/'README.md').write_text('''# 带货创意精选交付说明

双击 index.html 查看需求全文、功能清单和全部原型图。
双击 prototype.html 体验交互原型，也可从总览进入指定场景。
图片 01 至 10 为桌面版独立 PNG，可直接插入需求文档或评审材料。
详细需求 Markdown 可编辑、复制到其他文档工具。当前要求以带货精选_修订说明_20260921.md为准；V1.0为初版存档。

保留当前文件夹结构。网页依赖同目录 styles.css、prototype.js 与 assets 资源。
所有账号、商品和数据均为示例；外链、下载/复刻能力和创作提交并未连接生产服务。
首期仅链接能力与媒体能力开放后的流程在需求文档中分别说明。
本原型没有修改现有应用页面，也不读取真实账号数据。
''',encoding='utf-8')
with zipfile.ZipFile(root/'带货创意精选_需求与原型.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for file in root.rglob('*'):
        if file.is_file() and 'qa' not in file.relative_to(root).parts and file.suffix != '.zip':
            archive.write(file,file.relative_to(root))
print({'html_chars':len(page),'markdown_chars':sum(map(len,lines)),'screens':len(screens),'package_bytes':(root/'带货创意精选_需求与原型.zip').stat().st_size})

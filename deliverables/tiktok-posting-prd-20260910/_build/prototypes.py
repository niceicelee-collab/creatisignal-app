from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT=Path(__file__).resolve().parents[1]
TMP=ROOT/'_build'; OUT=ROOT/'prototypes'
OUT.mkdir(exist_ok=True)
pdfmetrics.registerFont(TTFont('UI','C:/Windows/Fonts/msyh.ttc',subfontIndex=0))
pdfmetrics.registerFont(TTFont('UIB','C:/Windows/Fonts/msyhbd.ttc',subfontIndex=0))
W,H=1600,1000
BG='#f3f5f3'; WHITE='#ffffff'; INK='#17201c'; MUTED='#748078'; LINE='#e3e8e2'; GREEN='#c6f58d'; LIME='#c2ff22'; DEEP='#25634a'; PALE='#f6ffe6'
c=None

def box(x,y,w,h,fill=WHITE,r=12,stroke=None,sw=1):
 c.setFillColor(HexColor(fill));c.setLineWidth(sw);c.setStrokeColor(HexColor(stroke or fill)); c.roundRect(x,H-y-h,w,h,r,fill=1,stroke=1)
def txt(x,y,s,size=15,color=INK,bold=False):
 s=str(s);caret=s.endswith('▾') or s=='⌄';s=s.replace('▾','').replace('⌄','').replace('‹','<').replace('›','>')
 font='UIB' if bold else 'UI';c.setFont(font,size);c.setFillColor(HexColor(color));c.drawString(x,H-y-size*.92,s)
 if caret:
  xx=x+pdfmetrics.stringWidth(s,font,size)+5;yy=H-y-size*.5;c.setStrokeColor(HexColor(color));c.setLineWidth(1.3);p=c.beginPath();p.moveTo(xx,yy);p.lineTo(xx+4,yy-4);p.lineTo(xx+8,yy);c.drawPath(p)
def para(x,y,w,s,size=14,color=MUTED,leading=None):
 p=Paragraph(s,ParagraphStyle('p',fontName='UI',fontSize=size,leading=leading or size*1.55,textColor=HexColor(color),wordWrap='CJK'))
 _,h=p.wrap(w,500);p.drawOn(c,x,H-y-h);return h
def rule(x,y,w):
 c.setStrokeColor(HexColor(LINE));c.setLineWidth(1);c.line(x,H-y,x+w,H-y)
def button(x,y,w,s,kind='primary',h=36):
 fill=GREEN if kind=='primary' else WHITE if kind=='secondary' else '#f0f2f0'
 box(x,y,w,h,fill,r=18 if kind=='primary' else 7,stroke=None if kind=='primary' else LINE)
 tw=pdfmetrics.stringWidth(s,'UIB' if kind=='primary' else 'UI',13)
 txt(x+(w-tw)/2,y+(h-13)/2-1,s,13,INK if kind!='disabled' else '#a0aaa2',kind=='primary')
def chip(x,y,s,kind='green',w=None):
 colors={'green':(PALE,DEEP),'gray':('#f0f2f1',MUTED),'orange':('#fff3e3','#a76616'),'red':('#fff0ee','#b74e48'),'blue':('#edf4ff','#4166a0')}
 bg,fg=colors[kind];w=w or pdfmetrics.stringWidth(s,'UI',12)+20;box(x,y,w,25,bg,r=6);txt(x+10,y+5,s,12,fg)
 return w
def switch(x,y,on=True,disabled=False):
 box(x,y,40,22,('#d5ddcf' if disabled else GREEN) if on else '#d6dadf',11)
 c.setFillColor(HexColor(WHITE));c.circle(x+(29 if on else 11),H-y-11,8,fill=1,stroke=0)
def check(x,y,on=False,disabled=False):
 box(x,y,18,18,GREEN if on else '#f3f4f2' if disabled else WHITE,4,LINE)
 if on:
  c.setStrokeColor(HexColor(DEEP));c.setLineWidth(1.6);p=c.beginPath();p.moveTo(x+4,H-y-9);p.lineTo(x+8,H-y-13);p.lineTo(x+14,H-y-5);c.drawPath(p)
def field(x,y,w,label,value='',h=39,placeholder=False):
 txt(x,y,label,13,MUTED);box(x,y+25,w,h,WHITE,7,LINE);txt(x+12,y+36,value,14,'#98a299' if placeholder else INK)
def section(x,y,w,h,title,sub='',icon='□'):
 box(x,y,w,h,WHITE,16,LINE);box(x+20,y+19,32,32,LIME,8)
 c.setStrokeColor(HexColor(DEEP));c.setLineWidth(1.5)
 if icon=='○':c.circle(x+36,H-y-35,7,stroke=1,fill=0)
 elif icon=='⚙':
  c.circle(x+36,H-y-35,6,stroke=1,fill=0);c.circle(x+36,H-y-35,2,stroke=1,fill=0)
  for a,b,aa,bb in [(0,7,0,10),(0,-7,0,-10),(7,0,10,0),(-7,0,-10,0)]:c.line(x+36+a,H-y-35+b,x+36+aa,H-y-35+bb)
 else:
  c.roundRect(x+29,H-y-43,14,16,2,stroke=1,fill=0);c.line(x+29,H-y-32,x+43,H-y-32)
  if icon=='▦':c.line(x+32,H-y-26,x+32,H-y-30);c.line(x+40,H-y-26,x+40,H-y-30)
 txt(x+65,y+18,title,17,INK,True)
 if sub:txt(x+65,y+43,sub,12,MUTED)
def avatar(x,y,name,color='#dcebbf',sz=32):
 c.setFillColor(HexColor(color));c.circle(x+sz/2,H-y-sz/2,sz/2,fill=1,stroke=0);txt(x+sz*.28,y+sz*.17,name[0],sz*.5,DEEP,True)
def logo():
 c.setStrokeColor(HexColor('#4eb82a'));c.setLineWidth(2);c.circle(29,H-32,12,stroke=1,fill=0)
 p=c.beginPath();p.moveTo(12,H-32);p.lineTo(24,H-32);p.lineTo(28,H-25);p.lineTo(33,H-40);p.lineTo(37,H-31);p.lineTo(43,H-31);c.drawPath(p)
 txt(50,20,'CreatiSignal',18,INK,True)
def shell(active='new',gmv=False):
 box(0,0,W,H,BG,0)
 for i in range(100):
  a=i/99;c.setFillColor(Color(.91+(.953-.91)*a,.956+(.961-.956)*a,.86+(.953-.86)*a));c.rect(0,H-(i+1)*2,W,2.01,fill=1,stroke=0)
 logo()
 nav=[('首页',92),('洞察',132),('发现',172),('创作',212),('工具',252),('报表制作',295),('GMV Max 创编',335),('TikTok 发帖',375),('浏览器插件',415),('Skills Hub',455),('资产',510),('任务',554),('设置',598),('管理',642)]
 for name,y in nav:
  sel=(name=='GMV Max 创编' if gmv else name=='TikTok 发帖')
  if sel:box(13,y-6,155,33,GREEN,17)
  txt(33 if y<280 or y>490 else 43,y,name,14,DEEP if sel or name=='工具' else '#5a635c',sel)
 chip(18,900,'升级 · 80,203','gray',145);avatar(21,943,'A');txt(63,949,'admin',13)
 box(190,26,1386,66,WHITE,18,LINE)
 txt(212,47,'GMV Max 创编' if gmv else 'TikTok 发帖',22,INK,True)
 chip(394,48,'GMV MAX' if gmv else 'TIKTOK','green')
 box(739,42,222,35,'#f0f3ef',18)
 labels=['新建创编','任务历史'] if gmv else ['新建任务','任务列表']
 for i,l in enumerate(labels):
  if (i==0 and active=='new') or (i==1 and active=='list'):box(743+i*110,45,106,29,WHITE,15)
  txt(767+i*110,52,l,13,INK if (i==0)==(active=='new') else MUTED,(i==0)==(active=='new'))
 button(1405,43,145,'发布广告' if gmv else '新建任务' if active=='list' else '发布到 3 个账号')
 txt(1270,974,'静态原型 · 账号与数据为示例',11,MUTED)
def mug(x,y,w,h,variant=0):
 bg=['#e9d7bd','#dae5d5','#e0dce9','#ead9cf'][variant%4]
 box(x,y,w,h,bg,8)
 c.setFillColor(HexColor('#ccb590'));c.rect(x,H-y-h,w,h*.25,fill=1,stroke=0)
 cx=x+w*.5; cy=y+h*.49
 c.setStrokeColor(HexColor('#68836b'));c.setLineWidth(w*.043);c.ellipse(cx+w*.17,H-cy-h*.18,cx+w*.36,H-cy+h*.02,fill=0,stroke=1)
 box(cx-w*.22,cy-h*.10,w*.45,h*.36,'#eff1e6',w*.08)
 c.setFillColor(HexColor('#674f38'));c.ellipse(cx-w*.20,H-cy+h*.045,cx+w*.20,H-cy+h*.14,fill=1,stroke=0)
 txt(x+w*.08,y+h*.09,'MORNING',max(9,w*.102),'#3c4b3b',True)
 txt(x+w*.08,y+h*.18,'RITUAL',max(8,w*.074),'#66705b')
 if w>130:chip(x+10,y+h-31,'00:15','gray',52)
def phone(x=1299,y=228,draft=False):
 box(x,y,219,425,'#20231f',29,stroke='#4b5048',sw=3)
 mug(x+8,y+9,203,403)
 txt(x+62,y+30,'Following   For You',10,WHITE)
 if not draft:
  txt(x+20,y+299,'@lumahome.us',12,WHITE,True)
  para(x+20,y+321,162,'Make room for a slower morning.<br/>#coffeetime #morningroutine',10,WHITE,14)
  for dy in [184,224,264]:
   c.setFillColor(HexColor(WHITE));c.circle(x+190,H-y-dy,5,fill=1,stroke=0)
def preview(mode='公开发布',time='立即发布'):
 box(1257,108,319,850,WHITE,16,LINE);txt(1277,128,'帖子预览',16,INK,True)
 field(1277,157,276,'','@lumahome.us   ▾',32)
 draft=mode=='上传为草稿';phone(draft=draft);txt(1305,670,'仅预览视频，其他设置请在 App 完成' if draft else '实际展示以 TikTok 页面为准',10,MUTED)
 box(1277,711,277,139,'#f7f9f5',12,LINE)
 txt(1292,727,'上传摘要' if draft else '发布摘要',14,INK,True);txt(1292,760,'目标账号',12,MUTED);txt(1450,760,'3 个账号',12)
 txt(1292,788,'展示方式',12,MUTED);txt(1440,788,mode,12,DEEP)
 txt(1292,816,'执行时间',12,MUTED);txt(1421,816,'立即上传' if draft else time,12)
 if not draft:chip(1277,868,'AI 生成内容','gray');chip(1388,868,'推广内容','green')
def base_new():
 shell();preview()
 section(190,108,1048,164,'账号选择','同一视频与设置将发布到全部已选账号','○')
 txt(211,185,'选择 TikTok 账号 *',13,MUTED);txt(1091,185,'已选择 3/10',12,MUTED)
 box(211,210,1006,42,WHITE,8,LINE)
 for i,name in enumerate(['@lumahome.us','@lumahome.ny','@lumahome.la']):chip(224+i*191,218,name+'  ×','gray',180)
 txt(1178,221,'▾',16,MUTED)
 section(190,288,1048,594,'基础设置','配置要发布的视频、标题与互动方式','▤')
 txt(211,367,'视频内容 *',13,MUTED);mug(211,395,98,141)
 txt(328,398,'晨间咖啡杯展示.mp4',17,INK,True);txt(328,429,'我的创意 · 15 秒 · 1080 × 1920',13,MUTED)
 chip(328,460,'视频校验通过','green');button(328,500,105,'更换视频','secondary');button(445,500,120,'设置封面','secondary');txt(581,511,'当前封面 00:00',12,MUTED)
 txt(211,558,'视频标题',13,MUTED);box(211,583,1006,82,WHITE,7,LINE)
 txt(225,598,'Make room for a slower morning. #coffeetime #morningroutine',15)
 txt(1136,639,f'{len("Make room for a slower morning. #coffeetime #morningroutine")} / 2200',11,MUTED)
 field(211,688,595,'地域标签','New York · United States  ×')
 txt(829,688,'AI 生成内容提示',14);switch(1175,690,True)
 txt(829,719,'发布后将显示 AI 生成内容标识',12,MUTED)
 txt(829,756,'上传为草稿',14);switch(1175,756,False)
 rule(211,800,1006)
 txt(211,819,'仅在广告中显示',14);switch(741,817,False)
 txt(211,847,'开启后不在个人主页公开展示',12,MUTED)
 txt(829,819,'允许评论',14);switch(1175,817,True)
 txt(829,847,'允许其他用户发表评论',12,MUTED)
 section(190,898,1048,60,'高级设置','品牌声明、合拍与拼接   ·   点击展开','⚙')
 txt(1170,920,'⌄',20,MUTED)
def overlay():
 c.setFillColor(Color(.09,.12,.10,alpha=.40));c.rect(0,0,W,H,fill=1,stroke=0)
def modal(x,y,w,h,title):
 overlay();box(x,y,w,h,WHITE,15);txt(x+24,y+21,title,19,INK,True);txt(x+w-39,y+20,'×',23,MUTED);rule(x,y+64,w)
def footnote(s):txt(211,974,s,11,MUTED)

def draw_p01():
 base_new();footnote('P01 / 新建任务 · 首屏示例，向下滚动设置发布时间')
def draw_p02():
 base_new();modal(400,100,790,800,'选择视频')
 for i,l in enumerate(['我的创意','高保真复刻','本地上传']):txt(426+i*150,184,l,15,DEEP if i==0 else MUTED,i==0)
 c.setStrokeColor(HexColor(GREEN));c.setLineWidth(3);c.line(426,H-213,500,H-213)
 field(425,227,737,'','搜索视频名称',36,True)
 for i in range(8):
  x=426+(i%4)*185;y=314+(i//4)*244
  if i==0:box(x-4,y-4,174,242,PALE,10,GREEN,2)
  mug(x,y,166,193,i);check(x+140,y+9,i==0,i==6)
  txt(x,y+203,['晨间咖啡杯展示','轻松打理厨房','周末家居灵感','新品开箱'][i%4],13)
  txt(x,y+223,'生成完成 · 15 秒' if i!=6 else '生成中 · 暂不可选',11,MUTED)
 rule(400,828,790);txt(426,856,'已选 1 个视频',13,MUTED);button(931,847,92,'取消','secondary');button(1035,847,130,'确认选择')
 footnote('P02 / 素材选择 · 使用参考弹窗的网格与底部操作区')
def draw_p03():
 base_new();modal(430,142,740,705,'选择 TikTok 账号')
 field(455,220,690,'','搜索昵称或 @用户名',39,True)
 txt(455,296,'已选择 3/10 个账号',13,DEEP);txt(981,296,'连接新账号',13,DEEP)
 names=[('Luma Home US','@lumahome.us','已授权'),('Luma Home New York','@lumahome.ny','已授权'),('Luma Home Los Angeles','@lumahome.la','已授权'),('Luma Home Studio','@lumahome.studio','已授权'),('Luma Home UK','@lumahome.uk','授权已失效'),('Luma Home Creator','@lumahome.creator','缺少发帖权限')]
 for i,(name,handle,state) in enumerate(names):
  y=337+i*67;check(455,y+13,i<3,i>3);avatar(488,y+4,'L',sz=38);txt(540,y+2,name,15,INK,i<3);txt(540,y+26,handle,12,MUTED)
  chip(886,y+9,state,'green' if i<4 else 'orange',116)
  if i>3:txt(1023,y+16,'重新授权',12,DEEP)
  rule(455,y+59,690)
 txt(455,758,'最多选择 10 个账号；相同设置将应用于全部已选账号。',12,MUTED)
 button(920,791,91,'取消','secondary');button(1025,791,119,'确认选择')
 footnote('P03 / 账号选择 · 未授权账号不可选')
def draw_p04():
 base_new();modal(377,133,846,707,'编辑视频标题')
 txt(405,217,'介绍视频内容或商品亮点，也可以添加 #话题 或 @互关好友。',14,MUTED)
 box(405,253,790,106,WHITE,8,GREEN,1.5);txt(421,274,'Make room for a slower morning. #coffee',17)
 txt(1110,330,f'{len("Make room for a slower morning. #coffee")} / 2200',12,MUTED)
 box(644,366,551,362,WHITE,12,LINE);txt(663,385,'话题建议',14,INK,True);txt(946,386,'按播放量降序',12,MUTED)
 txt(663,412,'搜索参考账号：@lumahome.us',11,MUTED)
 for i,(name,n) in enumerate([('#coffeetime','1.2 亿'),('#coffeelover','385.6 万'),('#coffeeritual','8.6 千'),('#coffeecornerhome','965')]):
  y=451+i*57
  if i==0:box(654,y-6,531,51,PALE,7)
  txt(667,y+4,name,16,DEEP);txt(1042,y+6,n+' 次播放',12,MUTED)
 txt(663,696,'点击插入话题；数据为话题累计播放量',11,MUTED)
 para(405,401,204,'发布说明中的 # 与 @ 按文本提交。请确认提及对象与所有目标账号互相关注。',13,MUTED)
 txt(405,758,'建议加载失败时仍可继续输入文案。',12,MUTED)
 button(969,782,91,'取消','secondary');button(1074,782,120,'保存标题')
 footnote('P04 / 话题建议 · 所有话题名及播放量为原型示例')
def draw_p05():
 base_new();modal(435,140,730,671,'选择地域标签')
 para(461,219,673,'搜索与视频相关的城市、地点或门店，如 New York、Times Square。',14)
 box(461,263,678,44,WHITE,8,GREEN,1.5);txt(475,276,'New York',16);txt(1109,275,'×',19,MUTED)
 txt(461,325,'搜索参考账号：@lumahome.us',12,MUTED)
 entries=[('New York','United States'),('New York City','New York, United States'),('New York New Jersey Stadium','East Rutherford, New Jersey, United States'),('New York Café','Budapest, Hungary')]
 for i,(a,b) in enumerate(entries):
  y=363+i*80
  if i==0:box(451,y-8,695,74,PALE,9)
  txt(470,y,a,16,INK,i==0);txt(470,y+31,b,13,MUTED);check(1104,y+13,i==0);rule(461,y+69,678)
 para(461,698,671,'此地点将用于 3 个账号。提交前检查每个账号是否支持；不可用时需清除地点或调整账号。',12,MUTED)
 button(906,754,100,'取消','secondary');button(1018,754,121,'使用此地点')
 footnote('P05 / 地点搜索 · 地点与地址均为示例')
def draw_p06():
 shell();preview(time='09-12 09:30')
 section(190,108,1048,204,'基础设置','向下滚动后的设置区域','▤')
 for i,(label,desc,on) in enumerate([('仅在广告中显示','开启后不在个人主页公开展示，不会自动创建或启动广告。',False),('允许评论','允许其他用户在视频下发表评论。',True)]):
  y=182+i*64;txt(211,y,label,15);txt(211,y+26,desc,12,MUTED);switch(1175,y+10,on)
 section(190,328,1048,348,'高级设置','根据视频实际内容选择商业声明与互动方式','⚙')
 rows=[('品牌自然流量内容','推广自己的店铺、商品或业务时开启，视频将显示“推广内容”标签。',True),('品牌内容','为第三方品牌进行商业合作推广时开启，视频将显示“付费合作”标签。',False),('允许合拍','允许其他用户将你的视频与其视频同屏合拍。',True),('允许拼接','允许其他用户截取你的视频片段，用于创作新视频。',True)]
 for i,(a,b,on) in enumerate(rows):
  y=404+i*63;txt(211,y,a,15);txt(211,y+26,b,12,MUTED);switch(1175,y+10,on)
 section(190,692,1048,266,'发布时间','计划时间为开始提交时间，实际公开时间以 TikTok 处理结果为准','▦')
 txt(214,771,'○ 立即发布',15,MUTED);chip(381,763,'● 定时发布','green',138)
 field(211,814,287,'日期','2026-09-12');field(515,814,223,'时间','09:30:00');field(754,814,462,'时区','America/New_York (UTC-04:00)')
 txt(211,915,'计划于纽约时间 2026 年 9 月 12 日 09:30:00 开始提交。',12,DEEP)
 button(1405,43,145,'创建定时任务')
 footnote('P06 / 高级设置与时间 · 商业声明互斥，允许两项均关闭')
def draw_p07():
 shell();preview('上传为草稿');button(1375,43,173,'上传草稿到 3 个账号')
 section(190,108,1048,148,'账号选择','同一视频将上传至全部已选账号','○')
 for i,name in enumerate(['@lumahome.us','@lumahome.ny','@lumahome.la']):chip(211+i*198,193,name,'gray',184)
 section(190,272,1048,298,'基础设置','草稿需前往 TikTok App 完成发布','▤')
 mug(211,354,99,140);txt(333,355,'晨间咖啡杯展示.mp4',17,INK,True);txt(333,386,'我的创意 · 15 秒 · 视频校验通过',13,MUTED);button(333,428,113,'更换视频','secondary')
 rule(211,511,1006);txt(211,532,'上传为草稿',15);switch(1175,528,True)
 box(190,586,1048,118,'#fff7e9',13,stroke='#efdfbc')
 txt(211,606,'其他发布设置不会随草稿提交',17,'#855b24',True)
 para(211,638,995,'封面、标题、地点、AI 标识、仅广告、评论及高级设置已暂停使用。请在 TikTok App 中重新设置。关闭草稿模式可恢复当前表单中此前填写的内容。',14,'#855b24')
 section(190,720,1048,154,'上传时间','选择何时将视频上传到 TikTok','▦')
 chip(211,800,'● 立即上传','green',139);txt(379,807,'○ 定时上传',15,MUTED)
 box(190,890,1048,68,WHITE,12,LINE);txt(211,909,'上传成功后，通过 TikTok App 收件箱通知继续编辑并发布。',14,DEEP)
 footnote('P07 / 草稿模式 · 已停用的设置不会伪装成可编辑有效项')
def list_base():
 shell('list')
 for i,(n,l) in enumerate([('24','全部任务'),('5','待执行'),('2','进行中'),('3','需处理')]):
  x=190+i*349;box(x,109,331,85,WHITE,14,LINE);txt(x+20,124,l,13,MUTED);txt(x+20,151,n,27,INK,True)
 box(190,210,1386,738,WHITE,16,LINE)
 box(210,234,382,39,WHITE,7,LINE);txt(222,246,'搜索视频名称、标题或任务编号',13,'#98a299')
 for x,w,l in [(608,195,'全部账号  ▾'),(819,165,'全部状态  ▾'),(1000,183,'全部目标模式  ▾'),(1199,241,'创建时间  ▾')]:
  box(x,234,w,39,WHITE,7,LINE);txt(x+12,246,l,13,MUTED)
 button(1452,235,102,'刷新状态','secondary')
 cols=[(213,'视频 / 任务'),(571,'发布账号'),(761,'目标模式'),(894,'计划执行时间'),(1097,'任务状态 / 账号结果'),(1451,'操作')]
 box(210,292,1344,40,'#f7f9f5',6)
 for x,l in cols:txt(x,306,l,12,MUTED)
 rows=[('晨间咖啡杯展示','TP-0910-024','3 个账号','公开发布','立即发布','部分成功','orange','成功 2 · 失败 1','查看详情'),('周末家居灵感','TP-0910-023','5 个账号','公开发布','09-12 09:30:00','待发布','blue','等待执行','编辑'),('轻松打理厨房','TP-0910-022','2 个账号','公开发布','立即发布','发布中','blue','成功 1 · 处理中 1','查看详情'),('新品开箱片段','TP-0910-021','3 个账号','上传草稿','立即上传','已上传草稿','green','已上传 3 · 待 App 发布','查看详情'),('厨房收纳展示','TP-0910-020','1 个账号','仅广告','立即发布','已发布','green','成功 1','查看详情'),('春日桌面布置','TP-0910-019','2 个账号','公开发布','立即发布','待确认','orange','成功 1 · 待确认 1','刷新状态')]
 for i,(title,tid,ac,mode,when,status,kind,detail,action) in enumerate(rows):
  y=346+i*89;mug(213,y,43,67,i);txt(271,y+4,title,15,INK,True);txt(271,y+33,tid,12,MUTED)
  txt(271,y+55,'09-10 09:20 创建',10,MUTED)
  txt(571,y+9,ac,14);txt(571,y+34,'@lumahome.us…',11,MUTED);chip(761,y+13,mode,'gray',96)
  txt(894,y+9,when,13);txt(894,y+35,'纽约 UTC-04:00',11,MUTED)
  chip(1097,y+4,status,kind);txt(1097,y+39,detail,12,MUTED);txt(1451,y+20,action,13,DEEP);rule(210,y+79,1344)
 box(1560,341,5,527,'#f0f2ef',2);box(1560,341,5,159,'#cbd3c6',2)
 txt(211,915,'共 24 条任务 · 每页 20 条',12,MUTED);button(1341,903,39,'‹','secondary');button(1388,903,39,'1');button(1435,903,39,'2','secondary');button(1482,903,39,'›','secondary')
def draw_p08():list_base();footnote('P08 / 任务列表 · 状态与账号计数同时展示')
def draw_p09():
 list_base();overlay();box(586,106,990,853,WHITE,17)
 txt(612,132,'任务详情',22,INK,True);txt(1533,131,'×',25,MUTED);txt(612,169,'TP-0910-024 · 创建于 2026-09-10 09:20:00',12,MUTED);chip(1409,163,'部分成功','orange',119)
 rule(610,210,942);mug(612,233,112,166);txt(746,235,'晨间咖啡杯展示.mp4',20,INK,True)
 txt(746,274,'目标模式：公开发布   ·   立即执行',14);txt(746,307,'我的创意 · 15 秒 · 3 个账号',13,MUTED)
 chip(746,348,'AI 生成内容','gray');chip(860,348,'推广内容','green');chip(953,348,'New York','gray')
 para(612,423,920,'Make room for a slower morning. #coffeetime #morningroutine',15,INK)
 txt(612,478,'账号发布结果',17,INK,True);txt(1264,482,'最近更新 09:23:18',12,MUTED)
 accounts=[('Luma Home US','@lumahome.us','已发布','green','帖子已同步，可查看','查看帖子'),('Luma Home New York','@lumahome.ny','已发布','green','帖子同步中，稍后刷新','刷新状态'),('Luma Home Los Angeles','@lumahome.la','失败','red','账号授权已失效','重新授权')]
 for i,(name,handle,state,kind,reason,action) in enumerate(accounts):
  y=525+i*94;avatar(612,y+7,'L',sz=36);txt(664,y+2,name,15,INK,True);txt(664,y+29,handle,12,MUTED);chip(995,y+2,state,kind,96);txt(1108,y+9,reason,12,MUTED);txt(1433,y+10,action,13,DEEP);rule(612,y+77,916)
  if i==0:txt(1433,y+38,'去 GMV Max 创编',12,DEEP)
 box(612,822,916,47,'#f7f9f5',8);txt(627,837,'重试只处理明确失败的 1 个账号，已发布的 2 个账号不会重复发布。',13,DEEP)
 button(1084,892,153,'再建任务','secondary');button(1253,892,275,'重试失败账号（1）')
 footnote('P09 / 任务详情 · 查询延迟不能判成失败，成功与重试独立')
def draw_p10():
 list_base();overlay();box(586,106,990,853,WHITE,17)
 txt(612,132,'任务详情',22,INK,True);txt(1533,131,'×',25,MUTED);txt(612,172,'TP-0910-021 · 目标模式：上传草稿',13,MUTED);chip(1389,163,'已上传草稿','green',139)
 rule(610,210,942);mug(612,233,112,166);txt(746,238,'新品开箱片段.mp4',20,INK,True);txt(746,279,'15 秒 · 3 个账号 · 立即上传',14,MUTED)
 box(746,324,782,76,PALE,10);txt(765,340,'3 个账号均已上传成功，请在 App 完成发布',17,DEEP,True);txt(765,369,'请分别登录对应 TikTok 账号，继续完成发布。',13,DEEP)
 box(612,428,916,119,'#f7f9f5',12,LINE);txt(632,448,'下一步',16,INK,True);para(632,478,863,'打开 TikTok App → 登录目标账号 → 查看收件箱中的上传通知 → 继续编辑并发布。文案、地点、AI 与商业内容声明等需在 App 中重新设置。',14,INK)
 for i,handle in enumerate(['@lumahome.us','@lumahome.ny','@lumahome.la']):
  y=578+i*77;avatar(612,y+2,'L');txt(661,y+7,handle,15);chip(997,y+3,'已上传草稿','green',131);txt(1162,y+9,'待在 TikTok App 完成发布',13,MUTED);rule(612,y+60,916)
 para(612,839,902,'当前任务只确认草稿上传结果。未取得实际发帖结果前，不展示帖子链接，也不提供选用该草稿进行 GMV Max 创编的操作。',13,MUTED)
 button(1362,905,165,'再建任务','secondary');footnote('P10 / 草稿结果 · 明确区分已上传与已公开发布')
def draw_p11():
 shell(gmv=True);preview()
 section(190,108,1048,270,'店铺与商品','关联 TikTok Shop 店铺并选择推广商品','□')
 field(211,188,1006,'店铺 *','Luma Home US');field(211,270,1006,'推广商品','Luma 陶瓷咖啡杯')
 section(190,394,1048,360,'创意设置','选择已发布的 TikTok 帖子进行广告创编','▤')
 modal(369,96,865,817,'选择视频')
 for i,l in enumerate(['我的创意视频','私域素材库','TikTok 直发帖']):txt(396+i*175,178,l,15,DEEP if i==2 else MUTED,i==2)
 c.setStrokeColor(HexColor(GREEN));c.setLineWidth(3);c.line(746,H-211,861,H-211)
 box(396,231,810,41,'#f7f9f5',8);txt(411,244,'当前店铺：Luma Home US     推广商品：Luma 陶瓷咖啡杯',13)
 field(396,281,393,'','全部 TikTok 账号  ▾',36);field(809,281,397,'','搜索标题或帖子',36,True)
 states=[('可选用','green'),('帖子同步中','gray'),('缺少商品关联','orange'),('缺少广告授权','orange')]
 for i,(status,kind) in enumerate(states):
  x=396+(i%4)*207;y=368
  if i==0:box(x-4,y-4,191,339,PALE,11,GREEN,2)
  mug(x,y,182,215,i);check(x+153,y+9,i==0,i>0);txt(x,y+228,'晨间咖啡杯展示',14,INK,True);txt(x,y+253,['@lumahome.us','@lumahome.ny','@lumahome.la','@lumahome.studio'][i],11,MUTED);txt(x,y+276,'09-10 09:21 发布',11,MUTED);chip(x,y+302,status,kind,151)
 box(396,711,810,76,'#f7f9f5',10);para(411,729,778,'只有符合当前店铺、商品和广告授权条件的帖子可以选择。发帖成功不代表可用于 GMV Max；同步中或缺少资格的帖子需完成相应操作后刷新。',13,MUTED)
 txt(396,816,'已选 1 个帖子',13,MUTED);button(968,842,93,'取消','secondary');button(1075,842,131,'确认选择')
 footnote('P11 / GMV Max 衔接 · 复用现有标签，资格不足的卡片不可选')

def main():
 global c
 for i,fn in enumerate([draw_p01,draw_p02,draw_p03,draw_p04,draw_p05,draw_p06,draw_p07,draw_p08,draw_p09,draw_p10,draw_p11],1):
  path=TMP/f'P{i:02}.pdf';c=canvas.Canvas(str(path),pagesize=(W,H));c.setTitle(f'CreatiSignal TikTok 发帖原型 P{i:02}');fn();c.showPage();c.save()
 print('11 vector prototypes created')
if __name__=='__main__':main()

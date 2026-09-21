from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader

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

PHOTOS=['person-city.jpg','person-summer.jpg','product-beauty.jpg','product-shirts.jpg','product-jacket.png','coffee.jpg']
ACCOUNTS=['Luma Style US','Luma Daily','Luma Creator']
AVATARS=['product-jacket.png','product-beauty.jpg','avatar-person.jpg']
CAPTION="Today's city look. Which detail is your favorite? #ootd #style"

def photo(x,y,w,h,name='person-city.jpg',r=8,focus=.45):
 path=ROOT/'assets'/name;reader=ImageReader(str(path));iw,ih=reader.getSize();scale=max(w/iw,h/ih);dw,dh=iw*scale,ih*scale
 c.saveState();p=c.beginPath();p.roundRect(x,H-y-h,w,h,r);c.clipPath(p,stroke=0)
 c.drawImage(reader,x-(dw-w)/2,H-y-dh+(dh-h)*focus,width=dw,height=dh,mask='auto');c.restoreState()

def avatar(x,y,name='',color=None,sz=32,index=0):
 photo(x,y,sz,sz,AVATARS[index%3],r=sz/2,focus=.20 if index%3==2 else .4)

def cover(x,y,w,h,index=0,badge=True):
 photo(x,y,w,h,PHOTOS[index%len(PHOTOS)])
 if badge and w>80:
  c.saveState();c.setFillColor(Color(0,0,0,.58));c.roundRect(x+7,H-y-h+7,43,22,5,fill=1,stroke=0);c.restoreState();txt(x+14,y+h-26,'00:18',10,WHITE)

def play(x,y,r=22):
 c.saveState();c.setFillColor(Color(0,0,0,.48));c.circle(x,H-y,r,fill=1,stroke=0);c.setFillColor(HexColor(WHITE));p=c.beginPath();p.moveTo(x-5,H-y+8);p.lineTo(x+8,H-y);p.lineTo(x-5,H-y-8);p.close();c.drawPath(p,fill=1,stroke=0);c.restoreState()

def preview(draft=False,scheduled=False):
 box(1257,108,319,850,WHITE,16,LINE);txt(1277,128,'视频预览',16,INK,True)
 box(1277,174,277,40,WHITE,7,LINE);avatar(1287,181,sz=26);txt(1322,187,ACCOUNTS[0],13);txt(1518,186,'▾',14,MUTED)
 box(1296,238,242,433,'#222629',25);photo(1302,245,230,419)
 txt(1360,265,'Following   For You',10,WHITE);play(1417,432,25)
 if not draft:
  c.saveState();c.setFillColor(Color(0,0,0,.36));c.rect(1302,H-664,230,100,fill=1,stroke=0);c.restoreState()
  txt(1316,580,'@luma.style.us',12,WHITE,True);para(1316,604,192,"Today's city look.<br/>#ootd #style",12,WHITE,17)
 txt(1329,686,'实际展示以 TikTok 页面为准',11,MUTED)
 box(1277,728,277,141,'#f7f9f5',12,LINE);txt(1293,744,'提交摘要',14,INK,True)
 for yy,a,b in [(779,'发布账号','3 个账号'),(808,'发布方式','定时发布' if scheduled else '立即发布'),(837,'目标模式','上传草稿' if draft else '公开发布')]:txt(1293,yy,a,12,MUTED);txt(1446,yy,b,12,DEEP)
 if draft:para(1278,886,274,'草稿上传后，请在 TikTok App 完成发布。',12,MUTED)
 else:chip(1278,887,'AI 生成内容','gray');chip(1390,887,'推广内容','green')

def account_section(y=108):
 section(190,y,1048,130,'账号选择','同一视频与设置应用于已选账号','○')
 txt(1116,y+28,'已选 3/10',12,MUTED);box(211,y+71,1006,41,WHITE,7,LINE)
 for i,name in enumerate(ACCOUNTS):
  x=223+i*225;box(x,y+77,213,29,'#f3f6f1',6);avatar(x+5,y+79,sz=25,index=i);txt(x+39,y+84,name+'   ×',12)
 txt(1180,y+82,'▾',15,MUTED)

def advanced(y=744,w=1006):
 rule(211,y,w);txt(211,y+14,'高级设置',14,INK,True);txt(313,y+15,'品牌声明、合拍与拼接',12,MUTED);txt(1180,y+13,'▾',17,MUTED)

def radio(x,y,selected=False):
 c.setLineWidth(1.2);c.setStrokeColor(HexColor(DEEP if selected else '#a5aea6'));c.circle(x,H-y,7,fill=0,stroke=1)
 if selected:c.setFillColor(HexColor(DEEP));c.circle(x,H-y,3.4,fill=1,stroke=0)

def publish_options(y=818,scheduled=False,draft=False,expanded=False):
 height=258 if expanded and scheduled else 137
 box(190,y,1048,height,WHITE,15,LINE)
 for i,label in enumerate(['立即发布','定时发布']):
  xx=210+i*511;active=(i==1)==scheduled
  box(xx,y+18,494,101,PALE if active else WHITE,10,GREEN if active else LINE,1.3)
  radio(xx+21,y+39,active);txt(xx+40,y+28,label,16,INK,True)
  txt(xx+18,y+69,'上传为草稿',13,INK if active else MUTED);switch(xx+433,y+65,draft,disabled=not active)
  txt(xx+159,y+69,'在 TikTok App 完成发布',11,MUTED)
 if scheduled and expanded:
  field(211,y+139,279,'日期','2026-09-13');field(506,y+139,217,'时间','09:30:00');field(739,y+139,478,'时区','America/New_York  (UTC-04:00)')
  txt(211,y+219,'按纽约时间开始'+('上传草稿，需在 App 完成发布。' if draft else '提交，实际公开时间以 TikTok 处理为准。'),12,DEEP)

def base_new(focus=None):
 shell();preview();account_section()
 section(190,254,1048,546,'发帖设置','选择视频并编辑帖子内容','▤')
 cover(211,323,73,105,0);txt(303,326,'都市穿搭灵感.mp4',17,INK,True);txt(303,355,'我的创意 · 18 秒 · 1080 × 1920',12,MUTED)
 button(303,389,104,'更换视频','secondary');button(419,389,106,'设置封面','secondary');txt(542,400,'当前封面 00:00',12,MUTED)
 txt(211,447,'视频标题',13,MUTED);box(211,471,1006,74,WHITE,7,GREEN if focus=='title' else LINE,1.4 if focus=='title' else 1)
 caption="Today's city look. #oot" if focus=='title' else CAPTION
 txt(225,484,caption,15);txt(1130,525,f'{len(caption)} / 2200',11,MUTED)
 txt(211,562,'地域标签',13,MUTED);box(211,585,1006,38,WHITE,7,GREEN if focus=='location' else LINE,1.4 if focus=='location' else 1)
 txt(225,595,'New York' if focus=='location' else '搜索城市、地点或门店，如 New York、Times Square',14,INK if focus=='location' else '#9aa39c');txt(1179,595,'▾',15,MUTED)
 txt(211,643,'AI 生成内容提示',14);txt(211,668,'发布后将显示 AI 生成内容标识',11,MUTED);switch(657,646,True)
 txt(745,643,'允许评论',14);txt(745,668,'允许其他用户发表评论',11,MUTED);switch(1175,646,True)
 txt(211,704,'仅在广告中显示',14);txt(416,705,'开启后不在个人主页公开展示',11,MUTED);switch(1175,703,False)
 advanced();publish_options()

def overlay():
 c.saveState();c.setFillColor(Color(.09,.12,.10,alpha=.35));c.rect(0,0,W,H,fill=1,stroke=0);c.restoreState()
def modal(x,y,w,h,title):
 overlay();box(x,y,w,h,WHITE,16);txt(x+25,y+22,title,19,INK,True);txt(x+w-40,y+20,'×',24,MUTED);rule(x,y+66,w)
def footnote(s):txt(211,974,s,11,MUTED)

def draw_p01():base_new();footnote('P01 / 默认新建页 · 高级设置收起 · 底部选择发布方式')

def draw_p02():
 base_new();modal(386,104,827,801,'选择视频')
 for i,s in enumerate(['我的创意','高保真复刻','本地上传']):txt(413+i*154,190,s,15,DEEP if i==0 else MUTED,i==0)
 rule(413,220,773);field(413,232,773,'','搜索视频名称',36,True)
 titles=['都市穿搭灵感','夏日风格记录','日常美妆好物','衬衫搭配指南','轻量运动夹克','周末咖啡时光','穿搭日记','商品展示片段']
 for i,title in enumerate(titles):
  x=413+(i%4)*195;y=317+(i//4)*238
  if i==0:box(x-4,y-4,186,231,PALE,9,GREEN,1.8)
  cover(x,y,178,185,i);check(x+151,y+10,i==0,i==7);txt(x,y+195,title,13,INK,i==0);txt(x,y+215,'生成中 · 暂不可选' if i==7 else '生成完成 · 18 秒',11,MUTED)
 rule(386,837,827);txt(413,864,'已选 1 个视频',13,MUTED);button(962,853,91,'取消','secondary');button(1065,853,119,'确认选择')
 footnote('P02 / 素材选择 · 人物与产品照片示例')

def draw_p03():
 base_new();modal(431,145,741,705,'选择 TikTok 账号');field(456,222,689,'','搜索账号名称或 @用户名',37,True);txt(456,294,'已选择 3/10 个账号',13,DEEP);txt(1042,294,'连接账号',13,DEEP)
 names=ACCOUNTS+['Luma Beauty','Luma Studio UK','Luma Home']
 for i,name in enumerate(names):
  y=338+i*65;check(456,y+11,i<3,i>3);avatar(488,y,sz=40,index=i);txt(544,y+3,name,15,INK,i<3);txt(544,y+29,['@luma.style.us','@luma.daily','@luma.creator','@luma.beauty','@luma.studio.uk','@luma.home'][i],11,MUTED)
  chip(899,y+6,'已授权' if i<4 else '授权失效' if i==4 else '缺少发布权限','green' if i<4 else 'orange',110)
  if i>3:txt(1033,y+12,'重新授权',12,DEEP)
  rule(456,y+56,689)
 txt(456,750,'已选账号共用本次设置；最多选择 10 个账号。',12,MUTED);button(932,794,90,'取消','secondary');button(1034,794,111,'确认选择');footnote('P03 / 账号选择 · 使用真实照片外观的示例头像')

def draw_p04():
 base_new('title')
 box(211,550,1006,232,'#edf0ea',9);box(211,547,1006,232,WHITE,9,LINE)
 txt(228,561,'话题建议',13,INK,True);txt(1036,562,'按累计播放量排序',11,MUTED)
 for i,(tag,value) in enumerate([('#ootd','1.2 亿'),('#ootdfashion','385.6 万'),('#ootdinspiration','8.6 千'),('#ootdstyle','965')]):
  y=591+i*41
  if i==0:box(220,y-3,988,37,PALE,5)
  txt(233,y+6,tag,14,DEEP);txt(1082,y+7,value+' 次播放',12,MUTED)
 txt(230,759,'点击即插入当前标题；Esc 收起，继续在原输入框编辑。',11,MUTED);footnote('P04 / 原输入框内编辑 · 下拉建议覆盖下方内容，不另开弹窗')

def draw_p05():
 base_new('location');box(211,630,1006,215,'#edf0ea',9);box(211,627,1006,215,WHITE,9,LINE)
 for i,(name,context) in enumerate([('New York','United States'),('New York City','New York'),('New York Public Library','Manhattan'),('New York Café','Budapest')]):
  y=637+i*42
  if i==0:box(220,y,988,39,PALE,5)
  txt(234,y+11,name,14,INK,i==0);txt(914,y+12,context,12,MUTED)
 txt(232,813,'选择地点后自动收起；地点将应用于全部已选账号。',11,MUTED);footnote('P05 / 地域标签 · 原框下拉，仅简短地域信息辅助区分同名地点')

def draw_p06():
 shell();preview(scheduled=True);button(1353,43,197,'创建定时发布任务')
 section(190,108,1048,368,'发帖设置','向下滚动后的设置区域','▤')
 field(211,179,1006,'地域标签','搜索城市、地点或门店，如 New York、Times Square',38,True)
 txt(211,268,'AI 生成内容提示',14);switch(657,267,True);txt(745,268,'允许评论',14);switch(1175,267,True)
 rule(211,349,1006);txt(211,370,'仅在广告中显示',14);switch(1175,369,False);advanced(413)
 publish_options(494,scheduled=True,expanded=True)
 txt(211,781,'计划于 2026-09-13 09:30:00（纽约）向 3 个账号提交发布。',13,DEEP)
 footnote('P06 / 定时发布 · 无发布时间一级标题 · 高级设置默认收起')

def draw_p07():
 shell();preview(draft=True);button(1353,43,197,'上传草稿到 3 个账号');account_section()
 section(190,254,1048,278,'发帖设置','草稿模式仅提交视频文件','▤')
 cover(211,325,98,139,0);txt(330,329,'都市穿搭灵感.mp4',18,INK,True);txt(330,363,'我的创意 · 18 秒 · 视频校验通过',13,MUTED);button(330,407,106,'更换视频','secondary')
 box(190,548,1048,125,'#fff8ed',13,'#eddfc8');txt(211,567,'标题、封面、地点等设置不会随草稿提交',17,'#8e6224',True)
 para(211,602,994,'请在 TikTok App 中重新设置标题、封面、地点、AI 标识与互动选项。关闭上传为草稿后，可恢复当前表单中此前填写的发布设置。',14,'#8e6224')
 publish_options(691,draft=True);para(211,852,993,'上传成功后，打开 TikTok App 对应账号的收件箱通知，继续编辑并完成发布。定时发布同样可以选择上传为草稿。',14,DEEP)
 footnote('P07 / 草稿在底部发布方式内 · 其他发布设置暂时停用')

ROWS=[
 ('都市穿搭灵感',0,0,'已发布','green','立即发布','09-09 09:21','查看详情'),
 ('都市穿搭灵感',0,1,'已发布','green','立即发布','09-09 09:21','查看详情'),
 ('都市穿搭灵感',0,2,'失败','red','立即发布','09-09 09:21','重试'),
 ('日常美妆好物',2,1,'待发布','blue','定时发布','09-13 09:30','编辑'),
 ('夏日风格记录',1,2,'已上传草稿','green','立即上传草稿','09-11 10:16','查看详情'),
 ('轻量运动夹克',4,0,'发布中','blue','立即发布','09-11 10:20','刷新状态'),
]
def list_base():
 shell('list')
 for i,(label,num) in enumerate([('全部任务','24'),('待执行','5'),('进行中','2'),('需处理','3')]):
  x=190+i*349;box(x,108,332,86,WHITE,13,LINE);txt(x+20,123,label,13,MUTED);txt(x+20,150,num,27,INK,True)
 box(190,210,1386,746,WHITE,15,LINE)
 for x,w,label in [(211,416,'搜索视频名称、标题或任务编号'),(639,198,'全部账号  ▾'),(849,160,'全部状态  ▾'),(1021,178,'全部发布方式  ▾'),(1211,212,'创建时间  ▾')]:
  box(x,232,w,39,WHITE,7,LINE);txt(x+12,244,label,12,MUTED)
 button(1435,233,117,'刷新状态','secondary')
 box(210,291,1344,41,'#f7f9f5',6)
 for x,label in [(227,'视频 / 任务'),(641,'发布账号'),(911,'发布方式'),(1093,'执行时间'),(1284,'状态'),(1452,'操作')]:txt(x,306,label,12,MUTED)
 for i,(title,im,ac,status,kind,mode,time,action) in enumerate(ROWS):
  y=348+i*88;cover(225,y,44,66,im,False);txt(285,y+7,title,15,INK,True);txt(285,y+33,f'TP-{"0909" if i<3 else "0911"}-{(101+i):03}',11,MUTED);txt(285,y+51,'09-11 10:15 创建' if i>2 else '09-09 09:20 创建',10,MUTED)
  avatar(641,y+15,sz=36,index=ac);txt(690,y+25,ACCOUNTS[ac],14)
  txt(911,y+24,mode,13);txt(1093,y+14,time,13);txt(1093,y+39,'纽约 UTC-04:00',10,MUTED);chip(1284,y+18,status,kind,114);txt(1452,y+26,action,13,DEEP);rule(211,y+78,1342)
 txt(212,921,'共 24 条账号任务 · 每页 20 条',12,MUTED)
 for i,label in enumerate(['<','1','2','>']):button(1337+i*44,909,36,label,'primary' if i==1 else 'secondary',32)

def draw_p08():list_base();footnote('P08 / 同一视频 × 三个账号 = 三行 · 每行独立状态与操作')

def drawer(title,status='已发布',kind='green'):
 list_base();overlay();box(463,111,1113,846,WHITE,18);txt(489,136,title,21,INK,True);chip(1424,132,status,kind,101);txt(1535,132,'×',24,MUTED);rule(463,181,1113)

def metric(x,y,w,label,value):
 box(x,y,w,88,'#f8faf6',10,LINE);txt(x+17,y+14,label,12,MUTED);txt(x+17,y+42,value,23,INK,True)

def draw_p09():
 drawer('帖子详情')
 photo(489,209,284,505,'person-city.jpg',10);play(631,450,31)
 c.saveState();c.setFillColor(Color(0,0,0,.5));c.rect(489,H-714,284,43,fill=1,stroke=0);c.restoreState()
 txt(504,683,'00:06 / 00:18',11,WHITE);txt(726,682,'全屏',11,WHITE)
 c.setStrokeColor(HexColor('#dddddd'));c.setLineWidth(2);c.line(504,H-669,757,H-669);c.setStrokeColor(HexColor(GREEN));c.line(504,H-669,589,H-669)
 txt(489,736,'TikTok 已发布视频',13,DEEP);button(489,770,132,'在 TikTok 查看','secondary');button(633,770,139,'复制帖子链接','secondary')
 avatar(803,211,sz=43,index=0);txt(861,211,ACCOUNTS[0],18,INK,True);txt(861,239,'@luma.style.us',12,MUTED)
 txt(803,282,'都市穿搭灵感',19,INK,True);para(803,315,732,CAPTION,14,INK,22)
 txt(803,368,'发布于 2026-09-09 09:21:00（纽约） · 公开发布',12,MUTED)
 txt(803,408,'视频互动数据',17,INK,True);txt(1229,413,'最近同步 09-11 10:30',11,MUTED);txt(1462,410,'刷新数据',12,DEEP)
 for i,(name,val) in enumerate([('播放量','12,480'),('点赞','836'),('评论','42'),('分享','56'),('收藏','128'),('触达人数','9,210')]):metric(803+(i%3)*248,444+(i//3)*102,234,name,val)
 txt(803,665,'观看表现',15,INK,True)
 for i,(name,val) in enumerate([('新增粉丝','36'),('平均观看时长','8.6 秒'),('完播率','32.5%'),('总观看时长','29 时 48 分 48 秒')]):
  x=803+(i%2)*374;y=701+(i//2)*58;txt(x,y,name,12,MUTED);txt(x+158,y-1,val,15,INK,True)
 rule(803,826,731);para(803,846,716,'数据为该帖累计值，通常延迟 24–48 小时。播放量包含自然与付费活动；缺失数据展示“—”。',12,MUTED,19)
 txt(490,884,'任务 TP-0909-101',11,MUTED);txt(490,910,'当前详情仅对应此发布账号',11,MUTED);footnote('P09 / 成功详情 · 查看视频与该账号帖子的互动数据')

def draw_p10():
 drawer('任务详情','已上传草稿')
 photo(489,209,284,505,'person-summer.jpg');play(631,450,30);txt(489,736,'上传源视频预览',13,MUTED)
 avatar(805,211,sz=43,index=2);txt(861,211,ACCOUNTS[2],18,INK,True);txt(861,239,'@luma.creator',12,MUTED)
 txt(803,284,'夏日风格记录',20,INK,True);txt(803,321,'任务 TP-0911-105  ·  立即上传草稿',13,MUTED)
 box(803,368,731,115,PALE,12);txt(824,389,'该账号已上传成功，请在 App 完成发布',20,DEEP,True);txt(824,431,'上传完成：2026-09-11 10:16:00（纽约）',13,DEEP)
 txt(803,522,'下一步',16,INK,True)
 for i,s in enumerate(['打开 TikTok App，切换至 Luma Creator 账号。','在收件箱找到视频上传通知，继续编辑视频。','设置标题、封面及其他发布选项，再完成发布。']):
  y=565+i*61;chip(803,y,str(i+1),'green',29);para(846,y+1,670,s,14,INK,22)
 rule(803,762,731);para(803,786,720,'草稿尚未取得公开发布回执，此处不展示帖子互动数据。后续在 App 中发布，不自动推定该任务已公开发布。',13,MUTED)
 button(1389,883,145,'再建任务','secondary');footnote('P10 / 草稿详情 · 一行对应一个账号 · 无虚构互动数据')

def main():
 global c
 for i,fn in enumerate([draw_p01,draw_p02,draw_p03,draw_p04,draw_p05,draw_p06,draw_p07,draw_p08,draw_p09,draw_p10],1):
  c=canvas.Canvas(str(TMP/f'P{i:02}.pdf'),pagesize=(W,H));c.setTitle(f'TikTok 发帖 V1.1 P{i:02}');fn();c.showPage();c.save()
 print('10 revised prototypes created')
if __name__=='__main__':main()

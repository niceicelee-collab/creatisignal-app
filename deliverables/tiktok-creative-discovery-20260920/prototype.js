(() => {
  'use strict';
  const paths = {
    home:'M3 10 12 3l9 7v10H15v-6H9v6H3z', chart:'M4 19V5h16v14z M8 15v-4 M12 15V8 M16 15v-6', compass:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M15.5 8.5l-2 5-5 2 2-5z', pen:'m5 16-1 4 4-1L20 7l-3-3z M14 7l3 3', tool:'M14 4a6 6 0 0 0-7 7L3 18l3 3 7-5a6 6 0 0 0 7-8l-4 4-4-4z', box:'m3 7 9-4 9 4v10l-9 4-9-4z M3 7l9 5 9-5 M12 12v9', task:'M6 5h12v16H6z M9 3h6v4H9z M9 12h6 M9 16h4', settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2', search:'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15 M16 16l5 5', bookmark:'M6 3h12v18l-6-4-6 4z', external:'M14 3h7v7 M21 3l-11 11 M10 4H4v16h16v-6', eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6', filter:'M3 5h18 M6 12h12 M9 19h6 M7 3v4 M16 10v4 M12 17v4', arrow:'m9 5 7 7-7 7', back:'m15 5-7 7 7 7', close:'m6 6 12 12 M6 18 18 6', check:'m5 12 5 5L20 6', clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2', info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6 M12 16v.5', spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z', copy:'M8 8h12v13H8z M16 8V3H3v13h5', play:'m8 4 12 8-12 8z', download:'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5', heart:'M12 20 3 11a5 5 0 0 1 9-5 5 5 0 0 1 9 5z', globe:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18', refresh:'M20 9a8 8 0 1 0 0 7 M20 3v6h-6'
  };
  Object.assign(paths,{comment:'M21 11a9 8 0 0 1-9 8H5l-3 3V11a9 8 0 0 1 19 0z',share:'m14 3 8 8-8 7v-5C8 13 4 15 2 20 2 9 7 6 14 6z',volume:'M3 9h4l5-5v16l-5-5H3z M16 8a6 6 0 0 1 0 8 M19 5a10 10 0 0 1 0 14',fullscreen:'M3 9V3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6'});
  const icon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.spark}"/></svg>`;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const creators = {
    a1:{name:'Mira Beauty',handle:'@mira.beauty_demo',initial:'M',country:'美国',lang:'英语',gender:'女',fans:8420,industry:'美妆创作者',categories:'美妆个护',gmv:36700,aov:29.9,engagement:'3.28%',audience:'偏好日常彩妆与便捷上妆方法的人群，关注商品的使用步骤和真实妆效。',profile:'依据近期内容进行AI推断，未经实际受众数据验证。'},
    a2:{name:'Elena Bridal',handle:'@elena.bridal_demo',initial:'E',country:'英国',lang:'英语',gender:'女',fans:12800,industry:'婚礼与穿搭',categories:'服饰配饰',gmv:62800,aov:128,engagement:'2.94%',audience:'对婚礼穿搭和礼服细节感兴趣的人群。',profile:'AI推断，不代表实际购买者。'},
    a3:{name:'Olivia Style',handle:'@olivia.style_demo',initial:'O',country:'美国',lang:'英语',gender:'女',fans:5230,industry:'时尚穿搭',categories:'服饰配饰',gmv:18400,aov:59,engagement:'2.81%',audience:'偏好日常通勤、简约配色和季节穿搭的人群。',profile:'AI推断，不代表实际观看者。'},
    a4:{name:'Daily Kitchen',handle:'@daily.kitchen_demo',initial:'D',country:'泰国',lang:'泰语',gender:'未提供',fans:9680,industry:'美食与生活',categories:'食品饮料、家居生活',gmv:25600,aov:18.5,engagement:'3.16%',audience:'关注简单早餐、居家饮食和便携饮品的人群。',profile:'AI推断，仅供参考。'},
    a5:{name:'Move Studio',handle:'@move.studio_demo',initial:'S',country:'美国',lang:'英语',gender:'未提供',fans:3760,industry:'运动健身',categories:'运动户外',gmv:15900,aov:42,engagement:'1.92%',audience:'关注轻运动、户外通勤和运动服饰功能的人群。',profile:'AI推断，仅供参考。'},
    a6:{name:'Lucas Finds',handle:'@lucas.finds_demo',initial:'L',country:'美国',lang:'英语',gender:'男',fans:19600,industry:'服装与生活方式',categories:'服饰配饰',gmv:41700,aov:35,engagement:'2.77%',audience:'关注便捷穿搭与多场景服装搭配的人群。',profile:'AI推断，仅供参考。'}
  };
  const materials = [
    {id:'m1',author:'a1',title:'把日常上妆步骤拍成商品演示',product:'日常彩妆工具组合',price:29.9,category:'美妆个护',cover:'beauty-makeup.jpg',type:'产品演示',views:1286000,likes:38450,comments:1268,shares:2432,date:'2026-09-18',duration:24,reference:'先展示工具与妆效，再呈现使用顺序。适合借鉴清晰的步骤组织和商品特写，让观众快速理解产品怎么用。'},
    {id:'m2',author:'a2',title:'用试穿场景呈现礼服的质感与细节',product:'婚礼礼服',price:128,category:'服饰配饰',cover:'wedding-dress-cover.png',type:'场景体验',views:764000,likes:21490,comments:710,shares:1356,date:'2026-09-17',duration:34,reference:'将商品放入完整穿搭场景，结合面料和版型特写说明视觉效果。适合礼服、连衣裙等需要展示上身效果的商品。'},
    {id:'m3',author:'a3',title:'一件通勤外套的日常穿搭灵感',product:'浅蓝色通勤外套',price:59,category:'服饰配饰',cover:'knit-cardigan.jpg',type:'生活化展示',views:582000,likes:16100,comments:412,shares:954,date:'2026-09-16',duration:19,reference:'在日常外出场景展示服装搭配与版型。可以保留场景和节奏，围绕自己的商品重新组织细节说明。'},
    {id:'m4',author:'a4',title:'从食材到成品，展示一杯早餐果昔',product:'便携早餐饮品杯',price:18.5,category:'食品饮料',cover:'portable-blender.jpg',type:'使用过程',views:413000,likes:11800,comments:368,shares:715,date:'2026-09-15',duration:27,reference:'利用制作过程与成品对比呈现使用场景。参考重点是清楚的过程表达，不把示意图片当作真实商品效果证明。'},
    {id:'m5',author:'a5',title:'运动外套细节，让功能看得见',product:'轻量拉链运动外套',price:42,category:'运动户外',cover:'black-training-jacket.png',type:'细节特写',views:352000,likes:6280,comments:210,shares:295,date:'2026-09-14',duration:15,reference:'用局部特写呈现拉链、领口和版型，适合结构清楚、需要说明细节的服饰商品。'},
    {id:'m6',author:'a6',title:'从配色开始，找到适合通勤的衬衫',product:'日常通勤衬衫',price:35,category:'服饰配饰',cover:'cargo-shorts.jpg',type:'场景体验',views:241000,likes:6480,comments:149,shares:238,date:'2026-09-13',duration:22,reference:'围绕同一类商品展示不同配色与使用场景，借鉴搭配切换与画面节奏。'},
    {id:'m7',author:'a5',title:'出门前的一副太阳镜，完成夏日穿搭',product:'轻量休闲太阳镜',price:24,category:'运动户外',cover:'sports-bra.jpg',type:'使用场景',views:189000,likes:5120,comments:130,shares:240,date:'2026-09-12',duration:18,reference:'将商品放在户外出行的生活情节中展示，突出适用场景与佩戴方式。'},
    {id:'m8',author:'a4',title:'周末的第一杯，简单居家饮品灵感',product:'居家玻璃饮品杯',price:15,category:'家居生活',cover:'portable-blender.jpg',type:'场景体验',views:127000,likes:3020,comments:106,shares:188,date:'2026-09-08',duration:31,reference:'用生活场景呈现商品使用方式。',unavailable:true},
    {id:'m9',author:'a1',title:'出门前五分钟，完成自然通勤妆',product:'便携软毛化妆刷套装',price:19.9,category:'美妆个护',cover:'beauty-makeup.jpg',type:'使用过程',views:168000,likes:4360,comments:126,shares:208,date:'2026-09-11',duration:28,reference:'围绕出门前的化妆过程，展示工具的使用顺序与收纳方式。'},
    {id:'m10',author:'a4',title:'把喜欢的水果装进杯子，带走一份早餐',product:'随行玻璃果昔杯',price:16.5,category:'食品饮料',cover:'portable-blender.jpg',type:'生活化展示',views:146000,likes:3820,comments:94,shares:176,date:'2026-09-10',duration:32,reference:'用准备早餐的生活片段串联制作、装杯和出门场景。'},
    {id:'m11',author:'a3',title:'一件浅色外套，搭出周末出游的松弛感',product:'轻薄长款通勤外套',price:62,category:'服饰配饰',cover:'knit-cardigan.jpg',type:'穿搭展示',views:132000,likes:3540,comments:88,shares:162,date:'2026-09-09',duration:21,reference:'通过户外穿搭展示外套的版型与搭配方式。'}
  ];
  const money = v => '$'+Number(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const compact = n => n == null ? '—' : n >= 10000 ? (n/10000).toFixed(1)+'万' : n.toLocaleString('en-US');
  const percent = m => ((m.likes+m.comments+m.shares)/m.views*100).toFixed(2)+'%';
  const seconds = s => String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  const asset = m => 'assets/'+m.cover;
  const get = id => materials.find(m=>m.id===id) || materials[0];
  const storeKey = 'cs.discovery.prototype.20260920.favorites';
  let favorites; try { const s=JSON.parse(localStorage.getItem(storeKey));favorites=Array.isArray(s)?s.filter(id=>materials.some(m=>m.id===id)):['m8','m5','m3','m1']; } catch {favorites=['m8','m5','m3','m1'];}
  // These content attributes are prototype examples, not verified TikTok data.
  const contentExamples = {
    m1:{ai:'no',content:'演示'},m2:{ai:'unknown',content:'展示'},
    m3:{ai:'no',content:'生活记录'},m4:{ai:'mixed',content:'教程'},
    m5:{ai:'yes',content:'展示'},m6:{ai:'unknown',content:'测评'},
    m7:{ai:'no',content:'生活记录'},m8:{ai:'unknown',content:'教程'},
    m9:{ai:'no',content:'教程'},m10:{ai:'no',content:'生活记录'},m11:{ai:'no',content:'展示'}
  };
  const videoEstimates={m1:{sales:634,gmv:20600,currency:'USD'},m3:{sales:13,gmv:533,currency:'USD'},m4:{sales:11,gmv:3000,currency:'USD'},m6:{sales:0,gmv:0,currency:'USD'},m7:{sales:21},m9:{sales:86,gmv:1711.4,currency:'USD'},m10:{sales:42,gmv:693,currency:'USD'},m11:{sales:18,gmv:1116,currency:'USD'}};
  function estimateStats(m){
    const value=videoEstimates[m.id]||{},stats=[];
    if(Number.isFinite(value.sales))stats.push(`<div><span>预估销量</span><strong>${icon('box')}${compact(value.sales)}</strong></div>`);
    if(Number.isFinite(value.gmv)&&value.currency)stats.push(`<div><span>预估GMV</span><strong>${icon('globe')}${value.currency==='USD'?'$':value.currency+' '}${compact(value.gmv)}</strong></div>`);
    return stats.length?`<div class="commerce-estimates" title="演示数据：当前视频关联商品的累计带货预估，截至2026-09-21；非作者近30天GMV">${stats.join('')}</div>`:'';
  }
  function detailEstimates(m){
    const value=videoEstimates[m.id]||{};
    const gmv=Number.isFinite(value.gmv)&&value.currency?(value.currency==='USD'?'$':value.currency+' ')+compact(value.gmv):'暂无数据';
    const sales=Number.isFinite(value.sales)?compact(value.sales):'暂无数据';
    return `<div class="detail-commerce-estimates" role="group" aria-label="带货预估" title="演示数据：当前视频关联商品的累计带货预估，截至2026-09-21">${[['globe','预估 GMV',gmv],['box','预估销量',sales]].map(([symbol,label,amount])=>`<div><span>${icon(symbol)}${label}</span><strong ${amount==='暂无数据'?'class="estimate-empty"':''}>${amount}</strong></div>`).join('')}</div>`;
  }
  const creatorCategories={a1:'美妆与个人护理',a2:'服装与时尚',a3:'服装与时尚',a4:'美食与饮品',a5:'运动与户外',a6:'服装与时尚'};
  const productCategories={m1:'美妆与个人护理',m2:'女装与内衣',m3:'女装与内衣',m4:'食品与饮料',m5:'运动与户外',m6:'男装与内衣',m7:'时尚配饰',m8:'家居用品',m9:'美妆与个人护理',m10:'食品与饮料',m11:'女装与内衣'};
  const regions=['美国','墨西哥','巴西','越南','泰国','菲律宾','马来西亚','印尼','新加坡','日本','英国','西班牙','德国','意大利','法国','希腊','比利时','捷克','波兰','葡萄牙','奥地利','匈牙利','荷兰','爱尔兰'];
  const countryCodes='AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
  const countryNames=new Intl.DisplayNames(['zh-CN'],{type:'region'}),countryEnglish=new Intl.DisplayNames(['en'],{type:'region'});
  const countries=countryCodes.map(code=>({code,name:countryNames.of(code),english:countryEnglish.of(code),value:code==='ID'?'印尼':countryNames.of(code)})).sort((a,b)=>a.english.localeCompare(b.english,'en'));
  const creatorOptions=['游戏','美妆与个人护理','服装与时尚','健康与医疗','运动与户外','美食与饮品','数码与科技','旅行与生活方式','文化与艺术','Entertainment','宠物','母婴与家庭','汽车与交通','家居与生活','玩具与兴趣','应用分类','财经','图书','学习与教育','职业发展','建筑','科学','文化与习俗','宗教与信仰','社会公益','环保','农业与乡村','安全与应急','政治','法律'];
  const productOptions=['玩具与爱好','宠物用品','家居用品','女装与内衣','电脑与办公设备','工具与五金','厨具','鞋履','虚拟产品','时尚配饰','食品与饮料','二手商品','美妆与个人护理','PPE 自动测试类目','家居装修','图书、杂志与音频','珠宝配饰及衍生品','汽车与摩托车','运动与户外','手机与电子产品','PPE 手动测试类目','行李箱与箱包','家具','纺织品与软装','健康','收藏品','童装','家用电器','穆斯林时尚','母婴用品','男装与内衣'];
  const defaults = () => ({fans:'',views:'',likes:'',duration:'',ai:'',dateStart:'',dateEnd:''});
  const params = new URLSearchParams(location.search);
  let view = params.get('view') || 'curated';
  if (!['discover','curated','favorites','creation','download','analysis','review'].includes(view)) view='curated';
  let category='全部',country='',creatorCategory='',sort='views',filters=defaults(),selectedProduct='',modalType='',activeId='m1',lastFocus=null,toastTimer;
  let referenceId=params.get('id')||'m1';
  let analysisReferenceId=view==='analysis'?referenceId:'m1';
  const expandedFacets={creator:false,category:false};
  let replicateReturn=params.get('from')==='favorites'?'favorites':'curated';
  let analysisReturn=params.get('from')==='favorites'?'favorites':'curated';
  let downloadTimer;
  const reviewStates = {m1:'待审核',m2:'待审核',m3:'已通过',m4:'待补充',m5:'待审核'};
  const main=document.querySelector('#main'),overlay=document.querySelector('#overlay');
  const paging={curated:{page:1,size:10},favorites:{page:1,size:10}};
  function pageItems(list){
    const state=paging[view];
    state.page=Math.min(state.page,Math.max(1,Math.ceil(list.length/state.size)));
    return list.slice((state.page-1)*state.size,state.page*state.size);
  }
  function pagination(total){
    if(!total)return '';
    const {page,size}=paging[view],count=Math.ceil(total/size);
    const pages=[...new Set([1,page-1,page,page+1,count])].filter(n=>n>=1&&n<=count).sort((a,b)=>a-b);
    return `<nav class="pagination" aria-label="素材分页"><span class="pagination-count">共 ${total} 条</span><label>每页 <select data-page-size aria-label="每页条数">${[10,20,50].map(n=>`<option value="${n}" ${n===size?'selected':''}>${n} 条</option>`).join('')}</select></label><div class="pagination-pages"><button data-action="page" data-value="${page-1}" aria-label="上一页" ${page===1?'disabled':''}>${icon('back')}</button>${pages.map((n,i)=>`${i&&n-pages[i-1]>1?'<span class="pagination-gap">…</span>':''}<button data-action="page" data-value="${n}" aria-label="第 ${n} 页" ${n===page?'aria-current="page"':''}>${n}</button>`).join('')}<button data-action="page" data-value="${page+1}" aria-label="下一页" ${page===count?'disabled':''}>${icon('arrow')}</button></div><span class="pagination-position">第 ${page} / ${count} 页</span></nav>`;
  }
  function resetPage(){if(paging[view])paging[view].page=1;}
  const avatar = (a, extra='')=>`<span class="avatar ${extra}">${a.initial}</span>`;
  const button = (label,action,id='',className='',symbol='')=>`<button class="btn ${className}" data-action="${action}" ${id?`data-id="${id}"`:''}>${symbol?icon(symbol):''}${label}</button>`;
  function navigation(){
    document.querySelector('#navigation').innerHTML=`
      <button class="nav-item" data-action="nav-demo">${icon('home')}首页</button><button class="nav-item" data-action="nav-demo">${icon('chart')}洞察<span>⌄</span></button>
      <button class="nav-item ${view!=='favorites'&&view!=='analysis'?'nav-parent':''}" data-action="discover">${icon('compass')}发现<span>⌃</span></button>
      <button class="nav-sub ${view==='discover'?'active':''}" data-action="discover" ${view==='discover'?'aria-current="page"':''}>灵感发现</button><button class="nav-sub ${view==='curated'?'active':''}" data-action="curated" ${view==='curated'?'aria-current="page"':''}>带货精选</button><button class="nav-sub" data-action="nav-demo">AIGC 爆款</button><button class="nav-sub" data-action="nav-demo">品牌追踪</button>
      <button class="nav-item ${view==='download'?'nav-parent':''}" data-action="download">${icon('pen')}创作<span>⌃</span></button><button class="nav-sub ${view==='download'?'active':''}" ${view==='download'?'aria-current="page"':''} data-action="download">高保真复刻</button><button class="nav-item" data-action="nav-demo">${icon('tool')}工具<span>⌄</span></button>
      <button class="nav-item ${view==='favorites'?'nav-parent':''}" data-action="favorites">${icon('box')}资产<span>⌃</span></button><button class="nav-sub ${view==='favorites'?'active':''}" data-action="favorites">我的收藏</button><button class="nav-sub" data-action="nav-demo">商品库</button><button class="nav-sub" data-action="nav-demo">我的创意</button>
      <button class="nav-item ${view==='analysis'?'analysis-active':''}" ${view==='analysis'?'aria-current="page"':''} data-action="tasks">${icon('task')}任务</button><button class="nav-item" data-action="nav-demo">${icon('settings')}设置<span>⌄</span></button>`;
  }
  function matches(m){
    const a=creators[m.author];
    if(view==='favorites' && !favorites.includes(m.id))return false;
    if(view==='curated' && m.unavailable)return false;
    if(view==='favorites')return true;
    if(category!=='全部' && category!==productCategories[m.id])return false;
    if(country && country!==a.country)return false;
    if(creatorCategory && creatorCategory!==creatorCategories[m.author])return false;
    
    if(filters.fans==='low' && !(a.fans<10000))return false;
    if(filters.fans==='medium' && !(a.fans>=10000&&a.fans<100000))return false;
    if(filters.fans==='high' && !(a.fans>=100000))return false;
    if(filters.views==='low' && !(m.views<100000))return false;
    if(filters.views==='medium' && !(m.views>=100000&&m.views<1000000))return false;
    if(filters.views==='high' && !(m.views>=1000000))return false;
    if(filters.likes==='low' && !(m.likes<1000))return false;
    if(filters.likes==='medium' && !(m.likes>=1000&&m.likes<10000))return false;
    if(filters.likes==='high' && !(m.likes>=10000))return false;
    const example=contentExamples[m.id];
    if(filters.ai&&filters.ai!==example.ai)return false;
    if(filters.duration==='short' && !(m.duration<=15))return false;
    if(filters.duration==='medium' && !(m.duration>15&&m.duration<=30))return false;
    if(filters.duration==='long' && !(m.duration>30))return false;
    if(filters.dateStart && m.date<filters.dateStart)return false;
    if(filters.dateEnd && m.date>filters.dateEnd)return false;
    return true;
  }
  function items(){
    const list=materials.filter(matches);
    if(view==='favorites')return list.sort((a,b)=>favorites.indexOf(b.id)-favorites.indexOf(a.id));
    if(sort==='views')list.sort((a,b)=>b.views-a.views);
    if(sort==='rate')list.sort((a,b)=>parseFloat(percent(b))-parseFloat(percent(a)));
    if(sort==='newest')list.sort((a,b)=>b.date.localeCompare(a.date));
    if(sort==='gmv'||sort==='sales')list.sort((a,b)=>(videoEstimates[b.id]?.[sort]??-1)-(videoEstimates[a.id]?.[sort]??-1));
    return list;
  }
  function card(m){
    const saved=favorites.includes(m.id),invalid=m.unavailable;
    const hasProduct=!!m.product,hasSales=Number.isFinite(videoEstimates[m.id]?.sales);
    return `<article class="card commerce-card ${invalid?'unavailable':''} ${hasProduct&&hasSales?'':'duration-at-bottom'}" data-material="${m.id}"><div class="cover">
      <button class="cover-open" data-action="detail" data-id="${m.id}" aria-label="查看${m.title}"><img src="${asset(m)}" alt="${m.title}封面示意"></button>
      ${invalid?`<div class="unavailable-shade">${icon('info')}<b>源视频暂不可用</b><span>已保留收藏与历史信息</span></div>`:''}
      <span class="commerce-duration" title="视频时长 ${m.duration}秒">${icon('clock')}${seconds(m.duration)}</span>
      <button class="bookmark ${saved?'selected':''}" data-action="save" data-id="${m.id}" aria-label="${saved?'取消收藏':'收藏'}${m.title}" aria-pressed="${saved}">${icon('bookmark')}</button>
      <div class="commerce-metrics"><div title="播放量 ${m.views.toLocaleString()}"><span>${icon('eye')}</span><strong>${compact(m.views)}</strong></div><div title="点赞 ${m.likes.toLocaleString()}"><span>${icon('heart')}</span><strong>${compact(m.likes)}</strong></div></div>
      ${hasProduct?`<div class="commerce-bottom"><button class="product-thumb" data-action="detail" data-id="${m.id}" aria-label="查看关联商品：${m.product}" title="${m.product}"><img src="${asset(m)}" alt="${m.product}商品封面"><span>商品</span></button>${estimateStats(m)}</div>`:''}
      </div><h2 class="commerce-title"><button data-action="detail" data-id="${m.id}" title="${m.title}">${m.title}</button></h2></article>`;
  }
  const filterLabels={fans:{low:'1万粉以下',medium:'1万至10万粉',high:'10万粉及以上'},views:{low:'播放10万以下',medium:'播放10万至100万',high:'播放100万及以上'},duration:{short:'15秒以内',medium:'15至30秒',long:'超过30秒'}};
  Object.assign(filterLabels,{
    likes:{low:'1千以下',medium:'1千至1万',high:'1万及以上'},
    ai:{yes:'AI生成'}
  });
  const filterNames={fans:'达人粉丝量',views:'播放量',likes:'点赞数',duration:'时长',ai:'AI视频',dateStart:'开始日期',dateEnd:'结束日期'};
  let activeDropdown=null;
  function closeDropdown(restoreFocus=false){
    if(!activeDropdown)return;
    const {menu,trigger}=activeDropdown;
    menu.remove();trigger.setAttribute('aria-expanded','false');activeDropdown=null;
    if(restoreFocus){trigger.dataset.restoringFocus='true';trigger.focus({preventScroll:true});delete trigger.dataset.restoringFocus;}
  }
  function openDropdown(trigger,select){
    if(activeDropdown?.trigger===trigger){closeDropdown();return;}
    closeDropdown();
    const menu=document.createElement('div');
    menu.className='dropdown-menu';menu.id='active-dropdown';menu.setAttribute('role','listbox');menu.setAttribute('aria-label',select.getAttribute('aria-label'));
    [...select.options].forEach(option=>{
      const item=document.createElement('button');item.type='button';item.className='dropdown-option';
      item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.selected));
      item.textContent=option.value===''?'不限':option.textContent;
      item.addEventListener('click',e=>{
        e.stopPropagation();const key=trigger.dataset.dropdownKey;
        select.value=option.value;closeDropdown();select.dispatchEvent(new Event('change',{bubbles:true}));
        document.querySelector(`[data-dropdown-key="${key}"]`)?.focus({preventScroll:true});
      });
      menu.append(item);
    });
    document.body.append(menu);activeDropdown={menu,trigger};trigger.setAttribute('aria-expanded','true');
    const rect=trigger.getBoundingClientRect(),width=Math.max(220,rect.width);
    menu.style.width=Math.min(width,window.innerWidth-24)+'px';
    menu.style.left=Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px';
    const height=menu.offsetHeight;
    menu.style.top=(rect.bottom+height+8<=window.innerHeight?rect.bottom+8:Math.max(12,rect.top-height-8))+'px';
    menu.querySelector('[aria-selected="true"]')?.focus({preventScroll:true});
    menu.addEventListener('keydown',e=>{
      const options=[...menu.children],index=options.indexOf(document.activeElement);
      if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
        e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();
      }else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeDropdown(true);}
      else if(e.key==='Tab'){closeDropdown(true);}
    });
  }
  function enhanceDropdowns(){
    main.querySelectorAll('select').forEach(select=>{
      const trigger=document.createElement('button');trigger.type='button';trigger.className=select.className+' dropdown-trigger';
      trigger.dataset.dropdownKey=select.dataset.inlineFilter||select.id||'page-size';
      trigger.setAttribute('aria-label',select.getAttribute('aria-label'));trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','active-dropdown');
      trigger.innerHTML=`<span>${esc(select.selectedOptions[0].textContent)}</span>${icon('arrow')}`;
      if(select.title)trigger.title=select.title;
      trigger.addEventListener('click',e=>{e.stopPropagation();openDropdown(trigger,select);});
      trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openDropdown(trigger,select);}});
      select.hidden=true;select.before(trigger);
    });
  }
  function openCountrySearch(input){
    closeDropdown();
    const query=input.value.trim().toLowerCase();
    const results=countries.filter(item=>!query||[item.name,item.english,item.code,item.value].some(value=>value.toLowerCase().includes(query)));
    const menu=document.createElement('div');menu.className='dropdown-menu country-menu';menu.id='active-dropdown';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','国家搜索结果');
    if(!results.length)menu.innerHTML='<div class="country-empty" role="status">未找到匹配国家</div>';
    results.forEach(item=>{
      const option=document.createElement('button');option.type='button';option.className='dropdown-option country-option';option.setAttribute('role','option');option.setAttribute('aria-selected',String(country===item.value));
      option.textContent=item.name;
      option.addEventListener('click',e=>{e.stopPropagation();country=item.value;resetPage();render();document.querySelector('#country-search').focus({preventScroll:true});closeDropdown();});
      menu.append(option);
    });
    document.body.append(menu);activeDropdown={menu,trigger:input};input.setAttribute('aria-expanded','true');
    const rect=input.parentElement.getBoundingClientRect(),width=Math.min(300,window.innerWidth-24);
    menu.style.width=width+'px';menu.style.left=Math.max(12,Math.min(rect.left,window.innerWidth-width-12))+'px';
    menu.style.top=(rect.bottom+menu.offsetHeight+8<=window.innerHeight?rect.bottom+8:Math.max(12,rect.top-menu.offsetHeight-8))+'px';
    menu.addEventListener('keydown',e=>{
      const options=[...menu.querySelectorAll('[role="option"]')],index=options.indexOf(document.activeElement);
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();options[(index+(e.key==='ArrowDown'?1:-1)+options.length)%options.length]?.focus();}
      else if(e.key==='Escape'){e.preventDefault();closeDropdown(true);}
      else if(e.key==='Tab')closeDropdown(true);
    });
  }
  document.addEventListener('pointerdown',e=>{if(activeDropdown&&!activeDropdown.menu.contains(e.target)&&!activeDropdown.trigger.contains(e.target))closeDropdown();});
  window.addEventListener('resize',()=>closeDropdown());
  window.addEventListener('scroll',e=>{if(activeDropdown&&!activeDropdown.menu.contains(e.target))closeDropdown();},true);
  function facetRow(key,label,options,current,allLabel){
    const collapsible=key in expandedFacets;
    const option=(value,text)=>`<button class="facet-chip ${value===current?'selected':''}" data-action="facet" data-key="${key}" data-value="${value}" aria-pressed="${value===current}">${text}</button>`;
    return `<div class="facet-row ${collapsible?'collapsible-facet':''}" ${collapsible?`data-facet="${key}"`:''}><span class="facet-label" ${key==='country'?'title="按作者地区筛选，不代表投放国家"':''}>${label}</span><div class="facet-options" id="${key}-options">${key==='creator'?inlineFilter('fans'):''}${option(key==='category'?'全部':'',allLabel)}${options.map(v=>option(v,v)).join('')}${key==='country'?`<div class="country-search ${country&&!regions.includes(country)?'selected':''}"><input id="country-search" role="combobox" aria-label="搜索全部国家" aria-autocomplete="list" aria-controls="active-dropdown" aria-expanded="false" autocomplete="off" placeholder="搜索国家" value="${esc(country&&!regions.includes(country)?country:'')}"></div>`:''}</div>${collapsible?`<button class="facet-expand" data-action="toggle-facet" data-key="${key}" aria-controls="${key}-options" aria-expanded="${expandedFacets[key]}">${expandedFacets[key]?'收起':'展开'}${icon('arrow')}</button>`:''}</div>`;
  }
  function updateFacetOverflow(){
    document.querySelectorAll('.collapsible-facet').forEach(row=>{
      const options=row.querySelector('.facet-options'),toggle=row.querySelector('.facet-expand'),expanded=expandedFacets[row.dataset.facet];
      toggle.hidden=true;
      const first=options.firstElementChild;
      toggle.hidden=options.scrollHeight<=first.offsetHeight+1;
      const chips=[...options.children].filter(chip=>!chip.hidden);
      const firstLine=chips.filter(chip=>chip.offsetTop<first.offsetTop+first.offsetHeight);
      const lineBottom=Math.max(...firstLine.map(chip=>chip.offsetTop+chip.offsetHeight));
      options.style.maxHeight=expanded?'none':(lineBottom-options.offsetTop)+'px';
      chips.forEach(chip=>{
        const clipped=!expanded&&chip.offsetTop>=lineBottom;
        chip.tabIndex=clipped?-1:0;
        if(clipped)chip.setAttribute('aria-hidden','true');else chip.removeAttribute('aria-hidden');
      });
    });
  }
  window.addEventListener('resize',updateFacetOverflow);
  function inlineFilter(key){
    const note=key==='ai'?'AI属性需独立核验，不能根据粉丝量或封面判断':filterNames[key];
    return `<select class="inline-filter ${filters[key]?'selected':''}" aria-label="${filterNames[key]}" data-inline-filter="${key}" title="${note}"><option value="">${filterNames[key]}</option>${Object.entries(filterLabels[key]).map(([v,l])=>`<option value="${v}" ${filters[key]===v?'selected':''}>${l}</option>`).join('')}</select>`;
  }
  function conditionTags(){
    const tags=[];
    if(country)tags.push(['country','地区：'+country]);
    if(creatorCategory)tags.push(['creator','达人：'+creatorCategory]);
    if(category!=='全部')tags.push(['category','商品：'+category]);
    for(const [k,v] of Object.entries(filters))if(v)tags.push([k,`${filterNames[k]}：${filterLabels[k]?.[v]||v}`]);
    return tags.map(([k,label])=>`<button class="condition-tag" data-action="remove-condition" data-value="${k}" aria-label="移除${esc(label)}">${esc(label)} ${icon('close')}</button>`).join('');
  }
  function renderCurated(){
    const list=items(),visible=pageItems(list),tags=conditionTags();
    main.innerHTML=`<header class="page-head"><div><h1>带货精选</h1><p>发现TikTok上与你的商品相关的热门达人带货创意视频</p></div><span class="platform">TikTok</span></header>
    <section class="surface curated-surface">
    <div class="facets">${facetRow('country','地区',regions,country,'全球')}${facetRow('creator','达人',creatorOptions,creatorCategory,'全部')}${facetRow('category','商品',productOptions,category,'全部')}</div>
    <div class="compact-filters"><span class="facet-label">视频</span><div class="inline-filter-options">${['views','likes','duration','ai'].map(inlineFilter).join('')}
    <div class="date-range" title="按视频原发布日期筛选，起止日期均包含"><span>${icon('clock')}</span><input type="date" aria-label="开始日期" value="${filters.dateStart}" ${filters.dateEnd?`max="${filters.dateEnd}"`:''}><span>—</span><input type="date" aria-label="结束日期" value="${filters.dateEnd}" ${filters.dateStart?`min="${filters.dateStart}"`:''}></div></div><select class="curated-sort" id="sort" aria-label="排序">${[['views','播放量从高到低'],['gmv','GMV从高到低'],['sales','销量从高到低'],['rate','互动率从高到低'],['newest','最新发布']].map(([v,l])=>`<option value="${v}" ${sort===v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="condition-row"><span class="facet-label">过滤条件</span><div class="condition-tags">${tags||'<span class="no-condition">暂无筛选条件</span>'}</div>${tags?button('全部清除','clear','','text small-btn'):''}</div>
    
    ${list.length?`<div class="grid">${visible.map(card).join('')}</div>${pagination(list.length)}`:empty(false)}</section>`;
    enhanceDropdowns();updateFacetOverflow();
    const countrySearch=document.querySelector('#country-search');
    countrySearch.addEventListener('focus',()=>{if(!countrySearch.dataset.restoringFocus)openCountrySearch(countrySearch);});
    countrySearch.addEventListener('input',()=>openCountrySearch(countrySearch));
    countrySearch.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'){e.preventDefault();if(!activeDropdown)openCountrySearch(countrySearch);activeDropdown.menu.querySelector('[role="option"]')?.focus();}
      else if(e.key==='Escape'){e.preventDefault();closeDropdown();}
      else if(e.key==='Enter'){e.preventDefault();activeDropdown?.menu.querySelector('[role="option"]')?.click();}
      else if(e.key==='Tab')closeDropdown();
    });
    document.querySelector('#sort').addEventListener('change',e=>{sort=e.target.value;resetPage();render();});
    document.querySelectorAll('[data-inline-filter]').forEach(input=>input.addEventListener('change',e=>{filters[e.target.dataset.inlineFilter]=e.target.value;resetPage();render();}));
    document.querySelectorAll('.date-range input').forEach(input=>input.addEventListener('change',e=>{
      const key=e.target.getAttribute('aria-label')==='开始日期'?'dateStart':'dateEnd';
      const next={...filters,[key]:e.target.value};
      if(next.dateStart&&next.dateEnd&&next.dateStart>next.dateEnd){e.target.value=filters[key];toast('开始日期不能晚于结束日期');return;}
      filters=next;resetPage();render();
    }));
  }
  function renderDiscover(){
    main.innerHTML=`<header class="page-head"><div><p class="eyebrow">DISCOVER WHAT INSPIRES</p><h1>灵感发现</h1><p>探索更多创意灵感</p></div></header><section class="surface"><div class="empty"><div class="empty-icon">${icon('compass')}</div><h2>带货素材有了专属入口</h2><p>前往「带货精选」，浏览商品营销素材与创意参考。</p>${button('查看带货精选','curated','','primary','arrow')}</div></section>`;
  }
  function render(){
    clearTimeout(downloadTimer);
    closeDropdown();
    navigation();
    if(view==='creation'){renderCreation();return;}
    if(view==='download'){renderDownload();return;}
    if(view==='analysis'){renderAnalysis();return;}
    if(view==='review'){renderReview();return;}
    if(view==='discover'){renderDiscover();return;}
    if(view==='curated'){renderCurated();return;}
    const list=items(),visible=pageItems(list);
    main.innerHTML=`<header class="page-head"><div><h1>我的收藏</h1><p>收藏值得参考的创意到这里</p></div><div class="favorite-head-meta"><span class="head-stat">按收藏时间从新到旧</span></div></header>
    <section class="surface favorites-surface"><div class="result-line"><div>共 <strong id="result-count">${list.length}</strong> 条收藏</div></div>
    ${list.length?`<div class="grid">${visible.map(card).join('')}</div>${pagination(list.length)}`:empty(true)}
    </section>`;
    enhanceDropdowns();
  }
  function empty(isFav){
    const noSaved=isFav&&!favorites.length;
    return `<div class="empty"><div class="empty-icon">${icon(noSaved?'bookmark':'search')}</div><h2>${noSaved?'还没有收藏素材':isFav?'没有找到匹配的收藏':'没有找到符合条件的素材'}</h2><p>${noSaved?'去带货精选发现感兴趣的创意，点击书签就能保存在这里。':'试试更换关键词，或减少筛选条件。'}</p>${button(noSaved?'去带货精选':'清空'+(isFav?'搜索':'筛选'),noSaved?'curated':'clear','','primary',noSaved?'compass':'refresh')}</div>`;
  }
  function show(content,type){
    if(overlay.hidden)lastFocus=document.activeElement;
    overlay.innerHTML=content;overlay.hidden=false;document.body.style.overflow='hidden';modalType=type;
    overlay.querySelector('button,select,input,textarea')?.focus({preventScroll:true});
  }
  function close(){overlay.hidden=true;overlay.innerHTML='';document.body.style.overflow='';modalType='';lastFocus?.isConnected&&lastFocus.focus({preventScroll:true});}
  const closeBtn=()=>`<button class="close" data-action="close" aria-label="关闭弹窗">${icon('close')}</button>`;
  function embeddedPlayer(m,a){
    if(m.unavailable)return `<div class="media-panel tiktok-player" role="group" aria-label="视频不可用"><img src="${asset(m)}" alt="历史视频封面"><div class="unavailable-shade">${icon('info')}<b>源视频暂不可用</b><span>已保留收藏与历史信息</span></div></div>`;
    return `<div class="media-panel tiktok-player" role="group" aria-label="TikTok 内嵌视频播放器原型">
      <img src="${asset(m)}" alt="${m.title}播放器画面示意">
      <div class="player-author">${avatar(a)}<div><strong>${a.name}</strong><span>${a.handle}</span></div><b class="tiktok-mark" aria-label="TikTok">♪</b></div>
      <button class="player-play" data-action="player-demo" aria-label="播放视频（原型演示）" ${m.unavailable?'disabled':''}>${icon('play')}</button>
      <div class="player-social">${[['heart',m.likes,'点赞'],['comment',m.comments,'评论'],['share',m.shares,'分享']].map(([symbol,value,label])=>`<div aria-label="${label} ${value}">${icon(symbol)}<strong>${compact(value)}</strong></div>`).join('')}</div>
      <div class="player-caption"><strong>${m.title}</strong>${contentExamples[m.id].ai==='yes'||contentExamples[m.id].ai==='mixed'?'<span>含有 AI 生成的媒体内容</span>':''}</div>
      <div class="player-controls"><div class="player-progress" role="progressbar" aria-label="视频播放进度" aria-valuemin="0" aria-valuemax="${m.duration}" aria-valuenow="0"><span></span></div><div class="player-control-row"><button data-action="player-demo" aria-label="播放（原型演示）">${icon('play')}</button><button data-action="player-demo" aria-label="音量（原型演示）">${icon('volume')}</button><span>00:00 / ${seconds(m.duration)}</span><button data-action="player-demo" aria-label="全屏（原型演示）">${icon('fullscreen')}</button></div></div>
    </div>`;
  }
  function detail(id){
    activeId=id;const m=get(id),a=creators[m.author];
    const metrics=[['播放量',compact(m.views)],['点赞',compact(m.likes)],['评论',compact(m.comments)],['分享',compact(m.shares)],['互动率',percent(m)]];
    show(`<div class="detail-shell"><div class="modal-access-tip">${icon('globe')}<span>观看 TikTok 视频前，请确保已开启外网访问。</span></div><section class="modal" role="dialog" aria-modal="true" aria-label="素材详情">${closeBtn()}${embeddedPlayer(m,a)}
    <div class="detail-panel"><h2>${m.title}</h2>
    <div class="detail-scroll"><div class="metrics">${metrics.map(([l,v],i)=>`<div class="metric ${i===4?'accent':''}" title="${i===4?'(点赞+评论+分享)/播放量':l}"><strong>${v}</strong><span>${l}</span></div>`).join('')}</div>${detailEstimates(m)}
    <div class="block"><div class="block-title">作者信息</div><div class="mini-author">${avatar(a)}<div><strong>${a.name} <span style="font-weight:400;color:#8d998a;font-size:10px">${a.handle}</span></strong><small>${a.fans.toLocaleString()} 粉丝</small></div></div></div>
    <div class="block"><div class="block-title">关联商品</div><div class="product"><img src="${asset(m)}" alt="${m.product}"><div class="product-text"><strong>${m.product}</strong><span>${money(m.price)}</span></div>${button('查看商品','product',id,'small-btn','external')}</div></div>
    </div>
    <footer class="detail-actions detail-action-grid"><button class="btn" data-action="source" data-id="${id}" ${m.unavailable?'disabled':''}>${icon('external')}打开原视频</button><button class="btn" data-action="copy-source" data-id="${id}" ${m.unavailable?'disabled':''}>${icon('copy')}复制链接</button><button class="btn primary" data-action="replicate" data-id="${id}" ${m.unavailable?'disabled':''}>${icon('spark')}复刻</button><button class="btn soft" data-action="analyze" data-id="${id}" ${m.unavailable?'disabled':''}>${icon('chart')}分析</button></footer></div></section></div>`,'detail');
  }
  function renderDownload(stage='downloading'){
    clearTimeout(downloadTimer);
    const m=get(referenceId),analyzing=stage==='analyzing';
    main.innerHTML=`<div class="replication-transition"><header class="replication-topbar"><button class="btn small-btn" data-action="download-back" aria-label="返回素材列表">${icon('back')}</button><h1>${m.title}</h1><span class="replication-edit">${icon('pen')}</span><button class="btn small-btn" data-action="download-refresh">${icon('refresh')}刷新</button></header>
    <div class="replication-layout"><div class="download-source">${analyzing?embeddedPlayer(m,creators[m.author]):'<div class="video-loading" role="status" aria-label="视频下载中"><span class="loading-ring"></span><span>视频下载中</span></div>'}<div class="video-loading-strip" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
    <div class="download-workspace"><ol class="replication-steps" aria-label="复刻流程">${['爆款拆解','新商品信息确认','脚本转写','视频生成'].map((label,i)=>`<li ${i===0?'aria-current="step"':''}><span>${i+1}</span>${label}</li>`).join('')}</ol><section class="download-status" aria-labelledby="download-heading" aria-busy="true"><div class="download-status-content" role="status" aria-live="polite">${analyzing?`<h2 id="download-heading">正在拆解爆款视频</h2><span class="analysis-status-icon" aria-hidden="true">${icon('spark')}</span><p class="analysis-stage">脚本分析中<span class="analysis-dots">……</span></p><p class="analysis-estimate">预计耗时 3–5 分钟</p>`:'<h2 id="download-heading">正在下载源视频</h2><div class="download-progress" role="progressbar" aria-label="源视频下载中"><span></span></div>'}</div></section></div></div></div>`;
    if(!analyzing)downloadTimer=setTimeout(()=>{
      if(view==='download'&&referenceId===m.id)renderDownload('analyzing');
    },3000);
  }
  function renderAnalysis(stage='downloading'){
    clearTimeout(downloadTimer);
    const m=get(referenceId),analyzing=stage==='analyzing';
    main.innerHTML=`<section class="replication-transition analysis-transition" aria-label="素材分析"><header class="replication-topbar"><button class="btn small-btn" data-action="analysis-back" aria-label="返回素材列表">${icon('back')}</button><h1>${m.title}</h1><span class="replication-edit">${icon('pen')}</span><button class="btn small-btn" data-action="analysis-refresh">${icon('refresh')}刷新</button></header>
      <div class="replication-layout analysis-layout"><div class="download-source">${analyzing?embeddedPlayer(m,creators[m.author]):'<div class="video-loading" role="status" aria-label="视频下载中"><span class="loading-ring"></span><span>视频下载中</span></div>'}<div class="video-loading-strip" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
      <section class="download-status" aria-labelledby="analysis-heading" aria-busy="true"><div class="download-status-content" role="status" aria-live="polite">${analyzing?`<h2 id="analysis-heading">正在分析视频</h2><span class="analysis-status-icon" aria-hidden="true">${icon('spark')}</span><p class="analysis-stage">脚本分析中<span class="analysis-dots">……</span></p><p class="analysis-estimate">预计耗时 3–5 分钟</p>`:'<h2 id="analysis-heading">正在下载源视频</h2><div class="download-progress" role="progressbar" aria-label="源视频下载中"><span></span></div>'}</div></section></div></section>`;
    if(!analyzing)downloadTimer=setTimeout(()=>{
      if(view==='analysis'&&get(referenceId).id===m.id)renderAnalysis('analyzing');
    },3000);
  }
  function renderCreation(){
    const m=get(referenceId);main.innerHTML=`<div class="creation"><header class="page-head"><div><p class="eyebrow">FROM INSPIRATION TO YOUR PRODUCT</p><h1>把参考变成你的创意</h1><p>保留值得借鉴的表达，围绕你的商品重新创作</p></div><span class="head-stat">${icon('copy')}参考素材已带入</span></header><div class="surface"><div class="steps"><span class="active"><b class="step-num">1</b>确认参考与商品</span><span><b class="step-num">2</b>分析与脚本</span><span><b class="step-num">3</b>生成视频</span></div><div class="creation-layout"><div class="ref-card"><img src="${asset(m)}" alt="参考商品示意图"><div><div class="kicker">REFERENCE MATERIAL</div><h3>${m.title}</h3><p>${creators[m.author].handle} · TikTok</p><div class="tag-list"><span>${seconds(m.duration)}</span><span>${m.type}</span><span>${m.category}</span></div><p>原关联商品：${m.product}</p>${button('查看素材详情','detail',m.id,'small-btn','eye')}</div></div><div class="create-main"><h2>选择你的商品</h2><p>参考视频里的商品仅用于理解原创意，请选择本次要推广的商品。</p>${[['p1','柔光日常彩妆套装','美妆个护 · 商品库','beauty-makeup.jpg'],['p2','轻量通勤运动外套','运动户外 · 商品库','black-training-jacket.png']].map(([id,name,sub,img])=>`<button class="product-option ${selectedProduct===id?'selected':''}" data-action="choose-product" data-id="${id}" aria-pressed="${selectedProduct===id}"><img src="assets/${img}" alt=""><div><strong>${name}</strong><small>${sub}</small></div><span class="radio"></span></button>`).join('')}<div class="field"><label for="direction">希望保留或调整的表达 <small>选填</small></label><textarea id="direction" placeholder="例如：保留清晰的使用步骤，换成我的商品，场景更生活化。">${esc(window.creationDirection||'')}</textarea></div><div class="create-actions"><small>下一步进入分析和脚本编辑</small><button class="btn primary" data-action="create-continue" ${selectedProduct?'':'disabled'}>${icon('arrow')}进入创作流程</button></div><div class="ai-box"><div class="block-title">本次会带入</div><p>参考素材与来源、目标商品、你填写的改写方向。生成视频前仍可检查和调整脚本。</p></div></div></div></div></div>`;
    document.querySelector('#direction').addEventListener('input',e=>window.creationDirection=e.target.value);
  }
  function renderReview(){
    const ids=Object.keys(reviewStates),waiting=ids.filter(id=>reviewStates[id]==='待审核').length,approved=ids.filter(id=>reviewStates[id]==='已通过').length,published=ids.filter(id=>reviewStates[id]==='已发布').length;
    main.innerHTML=`<header class="page-head"><div><p class="eyebrow">CURATION WORKSPACE</p><h1>素材精选管理</h1><p>从有限候选中选出有商品营销参考价值的内容</p></div><span class="head-stat">${icon('box')}运营工作空间</span></header><div class="review-stats">${[['本批候选',ids.length,'唯一视频'],['待审核',waiting,'需要内容核验'],['已通过',approved,'尚未发布'],['已发布',published,'客户可见']].map(([l,n,s])=>`<div class="review-stat"><span>${l}</span><b>${n}<small>${s}</small></b></div>`).join('')}</div><section class="surface"><div class="toolbar"><div class="categories"><span class="chip active">本批全部</span><span class="chip">2026-09-20</span></div><span class="platform">TikTok</span></div><div class="review-banner"><span>候选来源：已有达人与关联商品数据</span><span>先审核，再发布</span></div><table class="review-list"><thead><tr><th>候选素材</th><th>作者 / 粉丝量</th><th>商品类目</th><th>状态</th><th>操作</th></tr></thead><tbody>${ids.map(id=>{const m=get(id),a=creators[m.author],s=reviewStates[id];return `<tr><td><div class="work-cell"><img src="${asset(m)}" alt=""><div><strong>${m.title}</strong><small>${m.duration}秒 · 发布 ${m.date} · 商品图</small></div></div></td><td>${a.name}<br><small style="color:#9aaa8a">${a.fans.toLocaleString()} 粉丝</small></td><td>${m.category}</td><td><span class="pill ${s==='待补充'?'amber':''}">${s}</span></td><td>${s==='已通过'?button('发布','publish',id,'primary small-btn','check'):s==='已发布'?button('下线','take-down',id,'small-btn','close'):button('审核详情','audit',id,'small-btn','eye')}</td></tr>`;}).join('')}</tbody></table><p class="review-note">审核通过仅表示内容核验完成，发布后才出现在客户的带货精选中。单次访问失败先待补充。</p></section>`;
  }
  function audit(id){
    activeId=id;const m=get(id);
    show(`<section class="modal author-modal" role="dialog" aria-modal="true" aria-label="审核素材">${closeBtn()}<div class="kicker">CONTENT REVIEW</div><h2 style="margin-top:0">审核素材</h2><div class="audit-grid"><img src="${asset(m)}" alt="商品示意图"><div><strong>${m.title}</strong><p class="reference">${creators[m.author].name} · ${m.category} · ${m.duration}秒</p>${button('查看完整源视频','audit-source',id,'small-btn','external')}<div class="review-reason" style="margin-top:12px">当前为交互演示。正式审核必须查看完整源视频，再确认以下内容。</div>${[['watched','已查看完整内容，身份和源链接一致'],['commercial','商品营销关联明确，具有可说明的参考点'],['quality','内容可理解，必要字段与展示信息完整']].map(([k,l])=>`<label class="check-line"><input type="checkbox" id="audit-${k}">${l}</label>`).join('')}<div class="field"><label for="audit-reference">一句参考点</label><textarea id="audit-reference">${m.reference}</textarea></div></div></div><footer class="filter-footer">${button('待补充','pending',id,'text')}${button('不通过','reject',id,'')}${button('通过审核','approve',id,'primary','check')}</footer></section>`,'audit');
  }
  function toast(message,undo){
    clearTimeout(toastTimer);const el=document.querySelector('#toast');el.innerHTML=esc(message)+(undo?'<button data-action="undo">撤销</button>':'');el.hidden=false;el.undo=undo;toastTimer=setTimeout(()=>el.hidden=true,6000);
  }
  function save(id){
    const had=favorites.includes(id),previous=[...favorites],detailOpen=modalType==='detail';
    favorites=had?favorites.filter(x=>x!==id):[...favorites,id];
    localStorage.setItem(storeKey,JSON.stringify(favorites));render();if(detailOpen)detail(id);
    toast(had?'已取消收藏':'已保存到「我的收藏」',had?()=>{favorites=previous;localStorage.setItem(storeKey,JSON.stringify(favorites));render();if(modalType==='detail')detail(activeId);toast('已恢复收藏');}:null);
  }
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    e.stopPropagation();const a=el.dataset.action,id=el.dataset.id,v=el.dataset.value;
    if(['remove-filter','clear','category','facet','remove-condition'].includes(a))resetPage();
    if(a==='page'){paging[view].page=Number(v);render();document.querySelector('.surface').scrollIntoView({block:'start'});return;}
    if(a==='detail')detail(id);
    else if(a==='save')save(id);
    else if(a==='close')close();
    else if(a==='remove-filter'){filters[v]='';render();}
    else if(a==='clear'){category='全部';country='';creatorCategory='';filters=defaults();render();}
    else if(a==='category'){category=v;render();}
    else if(a==='facet'){if(el.dataset.key==='country')country=v;else if(el.dataset.key==='creator')creatorCategory=v;else category=v;render();}
    else if(a==='toggle-facet'){expandedFacets[el.dataset.key]=!expandedFacets[el.dataset.key];render();document.querySelector(`[data-action="toggle-facet"][data-key="${el.dataset.key}"]`).focus({preventScroll:true});}
    else if(a==='remove-condition'){if(v==='country')country='';else if(v==='creator')creatorCategory='';else if(v==='category')category='全部';else filters[v]='';render();}
    else if(['discover','curated','favorites'].includes(a)){close();view=a;resetPage();category='全部';country='';creatorCategory='';filters=defaults();history.replaceState({},'',`?view=${a}`);render();window.scrollTo(0,0);}
    else if(a==='source'||a==='product'||a==='profile')toast(`原型演示：正式环境将在新标签打开${a==='source'?'这条素材的源视频':a==='product'?'关联商品页面':'作者主页'}。此处不连接真实账号。`);
    else if(a==='copy-source'){
      const source=get(id).sourceUrl;
      if(!source){toast('示例素材未提供真实视频链接，暂无法复制。');return;}
      navigator.clipboard.writeText(source).then(()=>toast('已复制视频链接'),()=>toast('复制失败，请重试。'));
    }
    else if(a==='replicate'){referenceId=id;replicateReturn=view==='favorites'?'favorites':'curated';close();view='download';history.replaceState({},'',`?view=download&id=${id}&from=${replicateReturn}`);render();window.scrollTo(0,0);}
    else if(a==='download'){if(view!=='download')replicateReturn=view==='favorites'?'favorites':'curated';close();view='download';history.replaceState({},'',`?view=download&id=${referenceId}&from=${replicateReturn}`);render();window.scrollTo(0,0);}
    else if(a==='download-refresh')renderDownload();
    else if(a==='download-back'){view=replicateReturn;history.replaceState({},'',`?view=${view}`);render();window.scrollTo(0,0);}
    else if(a==='analyze'){referenceId=id;analysisReferenceId=id;analysisReturn=view==='favorites'?'favorites':'curated';close();view='analysis';history.replaceState({},'',`?view=analysis&id=${id}&from=${analysisReturn}`);render();window.scrollTo(0,0);}
    else if(a==='tasks'){if(view==='analysis')return;referenceId=analysisReferenceId;close();view='analysis';history.replaceState({},'',`?view=analysis&id=${referenceId}&from=${analysisReturn}`);render();window.scrollTo(0,0);}
    else if(a==='analysis-refresh')renderAnalysis();
    else if(a==='analysis-back'){view=analysisReturn;history.replaceState({},'',`?view=${view}`);render();window.scrollTo(0,0);}
    else if(a==='player-demo')toast('当前为 TikTok 内嵌播放器原型；接入真实视频链接后可播放。');
    else if(a==='unavailable')toast('源视频暂不可用，可保留已有信息或取消收藏。');
    else if(a==='nav-demo')toast('此导航仅作布局参考，本原型聚焦素材发现与收藏。');
    else if(a==='choose-product'){selectedProduct=id;renderCreation();}
    else if(a==='create-continue'){show(`<section class="modal simple-dialog" role="dialog" aria-modal="true" aria-label="创作衔接演示">${closeBtn()}<div class="kicker">NEXT STEP</div><h2>参考与商品已确认</h2><p>将进入现有的素材分析与脚本改写流程，携带参考素材、目标商品和改写方向。</p><p>这是原型演示，未创建真实项目或启动视频生成。</p>${button('返回准备页','close','','primary','back')}</section>`,'create-success');}
    else if(a==='undo'){document.querySelector('#toast').undo?.();}
    else if(a==='audit')audit(id);
    else if(a==='audit-source')toast('演示：正式审核时在新标签打开完整源视频，本原型不会访问真实素材。');
    else if(a==='approve'){
      if(!['watched','commercial','quality'].every(k=>document.querySelector('#audit-'+k).checked)||!document.querySelector('#audit-reference').value.trim()){toast('请确认完整内容、营销关联和字段，并填写参考点。');return;}
      reviewStates[id]='已通过';close();renderReview();toast('已通过审核，发布后才会展示给客户。');
    } else if(['pending','reject','take-down'].includes(a)){
      const state={pending:'待补充',reject:'不通过','take-down':'已下线'}[a];
      show(`<section class="modal simple-dialog" role="dialog" aria-modal="true" aria-label="填写${state}原因">${closeBtn()}<h2>${state}</h2><div class="field"><label for="reason">处理原因</label><textarea id="reason" placeholder="请说明本次处理原因"></textarea></div><button class="btn primary" data-action="confirm-state" data-id="${id}" data-value="${state}">确认${state}</button></section>`,'reason');
    } else if(a==='confirm-state'){
      if(!document.querySelector('#reason').value.trim()){toast('请填写处理原因。');return;}reviewStates[id]=v;close();renderReview();toast('已记录状态和原因（演示）。');
    } else if(a==='publish'){reviewStates[id]='已发布';renderReview();toast('已发布（演示）。审核和发布分别记录。');}
  });
  document.addEventListener('change',e=>{if(e.target.matches('[data-page-size]')){paging[view].size=Number(e.target.value);resetPage();render();document.querySelector('.surface').scrollIntoView({block:'start'});}});
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!overlay.hidden){close();return;}
    if(e.key==='Tab'&&!overlay.hidden){const controls=[...overlay.querySelectorAll('button:not(:disabled),input,textarea,select,[tabindex="0"]')].filter(el=>el.offsetParent!==null);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"][data-action]')){e.preventDefault();e.target.click();}
  });
  render();
  const scene=params.get('scene');
  if(scene==='detail')detail(params.get('id')||'m1');
  if(scene==='author')detail(params.get('id')||'m1');
  if(scene==='filters'){country='美国';filters.fans='low';render();}
  if(scene==='empty'){category='家用电器';render();}
  if(view==='creation'&&params.get('selected')){selectedProduct='p1';renderCreation();}
})();

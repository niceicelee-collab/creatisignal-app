// Fixtures from the approved September 2026 prototype. These are not live TikTok data.
export interface Creator {
  name: string; handle: string; initial: string; country: string; lang: string; gender: string
  fans: number; industry: string; categories: string; gmv: number; aov: number
  engagement: string; audience: string; profile: string
}
export interface Material {
  id: string; author: string; title: string; product: string; price: number
  category: string; cover: string; type: string; views: number; likes: number
  comments: number; shares: number; date: string; duration: number; reference: string
  unavailable?: boolean; videoUrl?: string; sourceUrl?: string; productUrl?: string
}
export const creators: Record<string, Creator> = {
    a1:{name:'Mira Beauty',handle:'@mira.beauty_demo',initial:'M',country:'美国',lang:'英语',gender:'女',fans:8420,industry:'美妆创作者',categories:'美妆个护',gmv:36700,aov:29.9,engagement:'3.28%',audience:'偏好日常彩妆与便捷上妆方法的人群，关注商品的使用步骤和真实妆效。',profile:'依据近期内容进行AI推断，未经实际受众数据验证。'},
    a2:{name:'Elena Bridal',handle:'@elena.bridal_demo',initial:'E',country:'英国',lang:'英语',gender:'女',fans:12800,industry:'婚礼与穿搭',categories:'服饰配饰',gmv:62800,aov:128,engagement:'2.94%',audience:'对婚礼穿搭和礼服细节感兴趣的人群。',profile:'AI推断，不代表实际购买者。'},
    a3:{name:'Olivia Style',handle:'@olivia.style_demo',initial:'O',country:'美国',lang:'英语',gender:'女',fans:5230,industry:'时尚穿搭',categories:'服饰配饰',gmv:18400,aov:59,engagement:'2.81%',audience:'偏好日常通勤、简约配色和季节穿搭的人群。',profile:'AI推断，不代表实际观看者。'},
    a4:{name:'Daily Kitchen',handle:'@daily.kitchen_demo',initial:'D',country:'泰国',lang:'泰语',gender:'未提供',fans:9680,industry:'美食与生活',categories:'食品饮料、家居生活',gmv:25600,aov:18.5,engagement:'3.16%',audience:'关注简单早餐、居家饮食和便携饮品的人群。',profile:'AI推断，仅供参考。'},
    a5:{name:'Move Studio',handle:'@move.studio_demo',initial:'S',country:'美国',lang:'英语',gender:'未提供',fans:3760,industry:'运动健身',categories:'运动户外',gmv:15900,aov:42,engagement:'1.92%',audience:'关注轻运动、户外通勤和运动服饰功能的人群。',profile:'AI推断，仅供参考。'},
    a6:{name:'Lucas Finds',handle:'@lucas.finds_demo',initial:'L',country:'美国',lang:'英语',gender:'男',fans:19600,industry:'服装与生活方式',categories:'服饰配饰',gmv:41700,aov:35,engagement:'2.77%',audience:'关注便捷穿搭与多场景服装搭配的人群。',profile:'AI推断，仅供参考。'}
  }

export const materials: Material[] = [
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
  ]

export const contentExamples: Record<string, {ai: string; content: string}> = {
    m1:{ai:'no',content:'演示'},m2:{ai:'unknown',content:'展示'},
    m3:{ai:'no',content:'生活记录'},m4:{ai:'mixed',content:'教程'},
    m5:{ai:'yes',content:'展示'},m6:{ai:'unknown',content:'测评'},
    m7:{ai:'no',content:'生活记录'},m8:{ai:'unknown',content:'教程'},
    m9:{ai:'no',content:'教程'},m10:{ai:'no',content:'生活记录'},m11:{ai:'no',content:'展示'}
  }

export const videoEstimates: Record<string, {sales?: number; gmv?: number; currency?: string}> = {m1:{sales:634,gmv:20600,currency:'USD'},m3:{sales:13,gmv:533,currency:'USD'},m4:{sales:11,gmv:3000,currency:'USD'},m6:{sales:0,gmv:0,currency:'USD'},m7:{sales:21},m9:{sales:86,gmv:1711.4,currency:'USD'},m10:{sales:42,gmv:693,currency:'USD'},m11:{sales:18,gmv:1116,currency:'USD'}}

export const creatorCategories: Record<string, string> = {a1:'美妆与个人护理',a2:'服装与时尚',a3:'服装与时尚',a4:'美食与饮品',a5:'运动与户外',a6:'服装与时尚'}

export const productCategories: Record<string, string> = {m1:'美妆与个人护理',m2:'女装与内衣',m3:'女装与内衣',m4:'食品与饮料',m5:'运动与户外',m6:'男装与内衣',m7:'时尚配饰',m8:'家居用品',m9:'美妆与个人护理',m10:'食品与饮料',m11:'女装与内衣'}

export const regions = ['美国','墨西哥','巴西','越南','泰国','菲律宾','马来西亚','印尼','新加坡','日本','英国','西班牙','德国','意大利','法国','希腊','比利时','捷克','波兰','葡萄牙','奥地利','匈牙利','荷兰','爱尔兰']

export const countryCodes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ')

export const creatorOptions = ['游戏','美妆与个人护理','服装与时尚','健康与医疗','运动与户外','美食与饮品','数码与科技','旅行与生活方式','文化与艺术','Entertainment','宠物','母婴与家庭','汽车与交通','家居与生活','玩具与兴趣','应用分类','财经','图书','学习与教育','职业发展','建筑','科学','文化与习俗','宗教与信仰','社会公益','环保','农业与乡村','安全与应急','政治','法律']

export const productOptions = ['玩具与爱好','宠物用品','家居用品','女装与内衣','电脑与办公设备','工具与五金','厨具','鞋履','虚拟产品','时尚配饰','食品与饮料','二手商品','美妆与个人护理','PPE 自动测试类目','家居装修','图书、杂志与音频','珠宝配饰及衍生品','汽车与摩托车','运动与户外','手机与电子产品','PPE 手动测试类目','行李箱与箱包','家具','纺织品与软装','健康','收藏品','童装','家用电器','穆斯林时尚','母婴用品','男装与内衣']

// Only the wedding fixture has matching playable media in this repository.
materials.find((item) => item.id === "m2")!.videoUrl = "/creative-assets/wedding-dress-ad.mp4"
export const coverUrl = (item: Material) => item.cover === "wedding-dress-cover.png"
  ? "/creative-assets/" + item.cover : "/replicate-covers/" + item.cover
export const findMaterial = (id: string) => materials.find((item) => item.id === id)
export const compact = (value?: number) => value == null ? "—" : value >= 10000
  ? (value / 10000).toFixed(1) + "万" : value.toLocaleString("en-US")
export const money = (value?: number) => value == null ? "暂无数据" : "$" + compact(value)
export const seconds = (value: number) => String(Math.floor(value / 60)).padStart(2, "0") + ":" + String(value % 60).padStart(2, "0")
export const engagement = (item: Material) => item.views > 0 ? (item.likes + item.comments + item.shares) / item.views * 100 : undefined
const chineseNames = new Intl.DisplayNames(["zh-CN"], { type: "region" })
const englishNames = new Intl.DisplayNames(["en"], { type: "region" })
export const countries = countryCodes.map(code => ({ code, name: chineseNames.of(code)!, english: englishNames.of(code)!, value: code === "ID" ? "印尼" : chineseNames.of(code)! })).sort((a, b) => a.english.localeCompare(b.english, "en"))
export type Filters = { country: string; creator: string; product: string; fans: string; views: string; likes: string; duration: string; ai: string; dateStart: string; dateEnd: string }
export const emptyFilters: Filters = { country: "", creator: "", product: "", fans: "", views: "", likes: "", duration: "", ai: "", dateStart: "", dateEnd: "" }
export const filterNames: Record<keyof Filters, string> = { country: "地区", creator: "达人", product: "商品", fans: "达人粉丝量", views: "播放量", likes: "点赞数", duration: "时长", ai: "AI视频", dateStart: "开始日期", dateEnd: "结束日期" }
export const rangeOptions: Record<string, [string, string][]> = {
  fans: [["low", "1万粉以下"], ["medium", "1万至10万粉"], ["high", "10万粉及以上"]],
  views: [["low", "播放10万以下"], ["medium", "播放10万至100万"], ["high", "播放100万及以上"]],
  likes: [["low", "1千以下"], ["medium", "1千至1万"], ["high", "1万及以上"]],
  duration: [["short", "15秒以内"], ["medium", "15至30秒"], ["long", "超过30秒"]],
  ai: [["yes", "AI生成"]],
}
export const sortOptions: [string, string][] = [["views", "播放量从高到低"], ["gmv", "GMV从高到低"], ["sales", "销量从高到低"], ["rate", "互动率从高到低"], ["newest", "最新发布"]]
function inRange(value: number | undefined, range: string, lower: number, upper: number) {
  if (!range) return true
  if (value == null || !Number.isFinite(value)) return false
  return range === "low" ? value < lower : range === "medium" ? value >= lower && value < upper : value >= upper
}
export function filterMaterials(filters: Filters, sort: string, source = materials) {
  return source.filter(item => {
    const author = creators[item.author]
    return !item.unavailable && (!filters.country || author.country === filters.country)
      && (!filters.creator || creatorCategories[item.author] === filters.creator)
      && (!filters.product || productCategories[item.id] === filters.product)
      && inRange(author.fans, filters.fans, 10000, 100000)
      && inRange(item.views, filters.views, 100000, 1000000)
      && inRange(item.likes, filters.likes, 1000, 10000)
      && (!filters.duration || (filters.duration === "short" ? item.duration <= 15 : filters.duration === "medium" ? item.duration > 15 && item.duration <= 30 : item.duration > 30))
      && (!filters.ai || contentExamples[item.id]?.ai === filters.ai)
      && (!filters.dateStart || item.date >= filters.dateStart) && (!filters.dateEnd || item.date <= filters.dateEnd)
  }).sort((a, b) => {
    const value = (item: Material) => sort === "gmv" || sort === "sales" ? videoEstimates[item.id]?.[sort] : sort === "rate" ? engagement(item) : sort === "newest" ? Date.parse(item.date) : item.views
    return (value(b) ?? -1) - (value(a) ?? -1) || a.id.localeCompare(b.id)
  })
}

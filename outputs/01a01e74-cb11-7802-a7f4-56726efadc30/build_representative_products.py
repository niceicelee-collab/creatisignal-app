from __future__ import annotations

import json
import math
import re
import sys
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.worksheet.pagebreak import Break
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
OUT = Path(__file__).resolve().parent
OUTPUT = OUT / "CreatiSignal_28品类_代表商品与TikTok爆款检索_20260902.xlsx"
QA = OUT / "representative_products_qa"
HEADERS = ["行业", "品类", "具体商品", "TikTok爆款关键词", "完整提示词", "Amazon商品关键词"]
EXPECTED = ["男女装", "内衣", "儿童", "鞋靴", "箱包", "配件", "珠宝", "美妆个护", "保健品", "家居日用", "布艺", "厨房用品", "家具", "建材", "五金", "手机与数码", "电脑办公", "家电", "母婴用品", "宠物用品", "运动与户外", "汽车与摩托车", "玩具", "爱好", "图书", "杂志", "音频", "收藏品"]
DATA = []


def add(industry, category, product, tk, amazon, lock, scene, shots, sound, caution, reason, form, source):
    assert len(shots) == 4 and len(tk) == 4
    prompt = (
        f"生成15秒、9:16竖屏TikTok原生商品展示视频。使用已上传的@图片1 @图片2 @图片3作为{product}的参考，保持{lock}一致。"
        "如提供已授权@视频1，仅参考开场钩子、镜头节奏和构图，商品以图片为准，不复制原作者脸、声音、水印或评价。\n"
        f"场景与主体：{scene}。真人出镜时如提供@真人1则保持身份一致。\n"
        + " ".join(f"{t}：{s}" for t, s in zip(["0–3秒", "3–7秒", "7–11秒", "11–15秒"], shots))
        + f"\n声音：{sound}。自然光、真实手机UGC质感，近景细节清楚；{caution}。动作有真实接触，不穿模、不瞬移。结尾预留CTA空白，不生成字幕、价格、销量或未经证实的功效。"
    )
    DATA.append(dict(industry=industry, category=category, product=product, tk="\n".join(tk),
                     amazon="\n".join(amazon), prompt=prompt, reason=reason, form=form,
                     caution=caution, source=source))


add("服饰时尚", "男女装", "HALARA Flex 高腰阔腿弹力牛仔裤（215954款）",
    ["halara flex wide leg jeans", "halara jeans try on", "stretchy wide leg jeans review", "halara jeans outfit ideas"],
    ["HALARA Flex high waisted wide leg jeans", "同类替代检索：women high waisted stretch wide leg jeans"],
    "高腰腰头、前口袋、裤腿轮廓、洗水色与走线", "成年女性在卧室全身镜前，穿简洁上衣展示同一条牛仔裤",
    ["直接展示穿好的全身造型，向前走一步。", "腰部近景，轻拉侧面面料后松手，展示正常回弹。", "侧身走两步，展示阔腿裤随步伐的垂坠。", "镜前正面与侧面各停留，手指口袋，收于全身穿搭。"],
    '原创英文口播：“A wide-leg shape, a little stretch, and an easy everyday outfit.”',
    "不改变人物腰围或腿长，不用拉伸身体表现显瘦；面料只做轻幅拉伸",
    "从泛功能Polo转为牛仔裤试穿：版型、面料、走动和穿搭均能在15秒内直观看到。代表服饰试穿素材，不声称代表所有男女装。",
    "镜前try-on／腰头面料近景／一裤多搭。先用品牌词找同款，再用泛品类词找结构。",
    "https://www.halara.com/products/215954")

add("服饰时尚", "内衣", "SHAPERX 可调肩带无缝短裤式塑身连体衣（SZ5218）",
    ["shaperx shorts bodysuit", "shaperx shapewear try on", "shapewear under dress review", "seamless shorts bodysuit outfit"],
    ["SHAPERX SZ5218 seamless shorts bodysuit", "SHAPERX adjustable straps tummy control shorts bodysuit"],
    "肩带、领口、短裤长度、无缝织纹与颜色", "成年女性在更衣镜前，先手持产品，再展示已穿好外搭连衣裙的状态",
    ["手持连体衣展示完整轮廓。", "手指轻捏面料，特写肩带连接和短裤边缘。", "切到同一女性穿好连衣裙后的自然正侧面，不展示换衣过程。", "她整理外搭，产品包装摆在旁边，画面干净。"],
    '原创英文口播：“Here’s the seamless base layer, and how it sits under this dress.”',
    "全程不裸露；不制造夸张身材前后对比，不承诺瘦身或改变体型",
    "塑身连体衣能集中表现内衣的面料、剪裁与叠穿效果；选短裤式便于展示轮廓，减少暴露镜头。",
    "面料讲解／under-dress试穿。优先找正常站姿、自然身体比例的素材。",
    "https://shaperx.com/products/shaperx-seamless-full-body-control-bodysuit-shapewear")

add("服饰时尚", "儿童", "Little Sleepies Sunshine Zippy 竹浆粘胶双向拉链连体睡衣",
    ["little sleepies sunshine zippy", "little sleepies pajama haul", "bamboo zippy pajamas review", "baby pajamas double zipper demo"],
    ["Little Sleepies Sunshine Zippy pajamas", "同类替代检索：bamboo viscose baby pajamas two way zipper"],
    "黄色底色、太阳图案、拉链路径、袖口和脚口结构", "成年家长在明亮卧室桌面手持童装，只拍成人双手与产品",
    ["把完整睡衣平铺在干净桌面，图案正对镜头。", "一只手固定衣料，另一只手沿既有轨道拉动一个拉链头。", "近景展示袖口与脚口翻折结构，轻捏面料。", "折叠成整齐小叠放入收纳格，正面图案仍可见。"],
    '原创英文口播：“A sunny print, a two-way zipper, and little details worth a closer look.”',
    "无婴儿入镜，不演示睡眠姿势；不宣称防过敏、助眠或适用于所有儿童",
    "具体印花与拉链童装比抽象防晒衣更便于锁定同款；家长手部演示可覆盖童装面料与细节，避免儿童表演复杂度。",
    "pajama haul／双向拉链／袖脚口细节。品牌主要渠道需另核验，Amazon无同款时勿混图。",
    "https://littlesleepies.com/products/sunshine-bamboo-viscose-zippy")

add("服饰时尚", "鞋靴", "Skechers Slip-ins GO WALK Flex–Hands Up 免手穿休闲鞋（216324）",
    ["skechers slip ins go walk hands up", "skechers slip ins try on", "hands free shoes step in demo", "skechers go walk everyday shoes"],
    ["Skechers 216324 GO WALK Flex Hands Up", "Skechers mens Slip ins GO WALK Flex Hands Up"],
    "鞋面网布、后跟结构、鞋带、鞋底纹路、标识和配色", "成年模特在明亮玄关，固定低机位拍双脚和地面",
    ["一只鞋置于脚前，产品侧面清楚可见。", "保持脚尖先入鞋，脚跟自然下压进入鞋口，手不碰鞋。", "切侧面走两步，鞋底接触地面并自然弯曲。", "双脚并排停稳，补一个鞋面和鞋跟近景。"],
    '原创英文口播：“Step in, take a walk, and see the everyday details up close.”',
    "鞋子不得自动套脚或悬浮；不做医疗、矫姿或防摔承诺",
    "免手穿有明确的单一动作钩子，比泛轻量运动鞋更容易找到清晰演示；同时能表现鞋靴穿着、结构与行走。",
    "step-in演示／侧面走动／鞋跟结构。固定款号和配色，库存与地区版本另核验。",
    "https://www.skechers.com/skechers-slip-ins-go-walk-flex---hands-up/216324.html")

add("服饰时尚", "箱包", "BAGSMART The Bubble 20L Puffy 绗缝通勤托特包（15.6英寸电脑款）",
    ["bagsmart bubble puffy tote", "bagsmart tote pack with me", "puffer tote bag whats in my bag", "bagsmart work tote review"],
    ["BAGSMART Bubble 20L puffy tote 15.6 laptop", "BAGSMART quilted puffer tote bag 20L"],
    "绗缝格纹、提手、袋口、拉链、分区与颜色", "成年女性在通勤出门前的桌边，包放在桌上且始终可见",
    ["桌面平铺电脑、笔记本和水瓶，打开包口。", "先把尺寸合适的电脑放入内层，再放笔记本。", "水瓶放入对应口袋，近景展示物品排列，随后拉上拉链。", "单肩背包从桌边转身，停留展示侧面厚度。"],
    '原创英文口播：“Pack my work bag with me: laptop, notebook, bottle, and we’re ready.”',
    "每次只放一件物品，袋内体积合理，不凭空增加口袋或物品",
    "通勤托特包有可重复的装包内容格式，能集中展示箱包容量、分区、手提和上身效果。",
    "pack with me／what’s in my bag／通勤上身。不要用超出实际容量的装包挑战。",
    "https://www.bagsmart.com/products/bagsmart-20l-puffy-tote-bag-15-6-laptop")

add("服饰时尚", "配件", "KITSCH Black & Tort Large 大号鲨鱼夹两件套（单条视频只用一只）",
    ["kitsch large claw clip", "claw clip easy hairstyle", "kitsch claw clip review", "claw clip half up tutorial"],
    ["Kitsch Black Tort large claw clips 2pc", "Kitsch eco friendly large claw clip black tortoise"],
    "所选单只发夹的夹齿、弹簧、外形与黑色或玳瑁纹理", "成年女性在梳妆镜前，头发已整理成简单半扎发束",
    ["把单只发夹拿到脸侧，展示正面。", "手部近景，捏压夹柄使夹齿正常张开一次。", "切到后侧角度，固定发束后夹住头发，释放夹柄。", "模特小幅转头，展示完成的半扎发与发夹细节。"],
    '原创英文口播：“One clip, a simple half-up style, and the detail that finishes the look.”',
    "左右手分工清楚，不同时编发与夹发；发夹夹住真实发束，不穿过头部",
    "发饰能表现配件的装饰与使用双重价值；鲨鱼夹是外观清晰、搜索语义明确的单品，比无差异帽子更利于动作演示。",
    "easy hairstyle／半扎发／发夹开合。优先单次夹发，复杂盘发用真实镜头。",
    "https://www.mykitsch.com/products/eco-friendly-large-claw-clip-black")

add("服饰时尚", "珠宝", "PAVOI Chunky Double Hoops 金色双圈耳环",
    ["pavoi chunky double hoops", "pavoi earrings try on", "gold double hoop earrings close up", "everyday gold earrings styling"],
    ["PAVOI Chunky Double Hoops gold", "PAVOI double hoop earrings gold plated"],
    "双圈轮廓、扣合位置、金属颜色和左右尺寸", "成年女性在窗边，佩戴已扣好的耳环，穿无图案上衣",
    ["耳环放在干净首饰托盘，近景展示双圈外形。", "手持一只耳环缓慢小幅转动，表现自然金属反光。", "切到已佩戴好的侧脸，模特把头发拨到耳后。", "模特正侧面小幅转头，收于耳环与脸部近景。"],
    '原创英文口播：“A simple double-hoop detail to finish an everyday look.”',
    "不生成穿耳或穿针过程；耳环不融入耳垂，不夸大克重、纯度或防过敏属性",
    "耳环更容易用单个近景交代珠宝的造型、材质感和佩戴效果；双圈造型比层叠细链更易保持结构。",
    "jewelry try-on／金属反光／耳边细节。避免极小扣件连续操作。",
    "https://www.pavoi.com/products/chunky-double-hoops")

add("美妆健康", "美妆个护", "e.l.f. Glow Reviver Lip Oil 高光泽唇油（固定一个色号）",
    ["elf glow reviver lip oil", "elf lip oil swatch", "elf glow reviver lip oil review", "elf lip oil lip combo"],
    ["e.l.f. Glow Reviver Lip Oil", "elf Glow Reviver Lip Oil 加所选英文色号"],
    "透明管身、瓶盖、标签、刷头、所选唇油颜色与光泽", "成年女性在明亮梳妆台前，前置手机近景",
    ["产品放在脸侧，正面标签可见。", "左手拿管身，右手取出刷头，轻触左手手背划一道试色。", "切到脸部近景，右手在嘴唇中央轻涂，左手不入镜。", "模特微笑，左手拿产品在脸侧，展示自然唇部光泽。"],
    '原创英文口播：“Here’s the shade up close. A sheer tint, a glossy finish, and an easy lip look.”',
    "刷头真实接触手背与嘴唇；不把唇油变成厚重口红，不增加未经核实的配方或功效",
    "延续原案例的唇油：产品、试色、上唇构成完整的美妆演示链条，品牌和系列便于搜索同款。",
    "swatch／lip combo／UGC口播。选一个色号后再采集全部参考图。",
    "https://www.elfcosmetics.com/products/glow-reviver-lip-oil")

add("美妆健康", "保健品", "Goli Apple Cider Vinegar 苹果醋营养软糖（原版红瓶）",
    ["goli apple cider vinegar gummies", "goli acv gummies unboxing", "goli gummies bottle close up", "goli supplement routine"],
    ["Goli Apple Cider Vinegar Gummies original red bottle", "Goli ACV gummy vitamins original"],
    "红色瓶身、瓶盖、标签版式、软糖颜色与形状", "成年出镜者在干净厨房台面展示包装，不出现儿童",
    ["将红瓶放到台面，标签面向镜头。", "一只手固定瓶身，另一只手打开盖子。", "取一粒软糖放在白色小碟上，特写外观，不拍吞咽。", "盖好瓶盖，与小碟同框，收于包装近景。"],
    '原创英文口播：“A closer look at the bottle and gummy. Check the label for directions and ingredients.”',
    "只做包装与剂型展示；不暗示减肥、排毒、治疗、改善疾病或推荐剂量，不做效果前后对比",
    "以有明确瓶身识别度的营养软糖代表保健品包装/日常展示；不把补充剂当普通糖果或虚构健康效果。",
    "包装开箱／剂型近景／成人routine。避开减肥见证、疾病宣称和未经证实的功效素材。",
    "https://goli.com/pages/goli-acv")

add("家居家装", "家居日用", "Scrub Daddy Original 黄色笑脸清洁海绵",
    ["scrub daddy original cleaning", "scrub daddy cleaning demo", "scrub daddy satisfying clean", "scrub daddy kitchen clean with me"],
    ["Scrub Daddy Original yellow smile sponge", "Scrub Daddy Original 1 count"],
    "黄色海绵颜色、圆形轮廓、眼孔、笑脸开口与纹理", "厨房水槽边，成人双手清洗有少量普通食物残留的白色盘子",
    ["海绵与待清洗盘子同框，笑脸清楚可见。", "湿润海绵，手持沿盘面轻擦两次，清洁区域随接触逐渐出现。", "流水冲洗同一个盘子，水流和泡沫自然滑落。", "将盘子立在沥水架，笑脸海绵放在旁边。"],
    "轻微流水与擦洗声，无口播，生活感清洁ASMR",
    "不让污渍无接触消失，不展示极端去污或灭菌效果；海绵保持同一大小",
    "笑脸海绵外观辨识度高，单次清洁动作清楚，可代表日用清洁消耗品；避免和家电清洗机重复。",
    "clean with me／satisfying clean／洗盘演示。用普通污渍，拒绝剪辑伪造的一擦全新。",
    "https://scrubdaddy.com/product/scrub-daddy-original/")

add("家居家装", "布艺", "NICETOWN 双片打孔式遮光窗帘（Super-heavy Grommet款）",
    ["nicetown blackout curtains", "blackout curtains room makeover", "nicetown curtains light test", "bedroom curtains before after"],
    ["NICETOWN super heavy blackout grommet curtains 2 panels", "NICETOWN blackout curtains grommet 加颜色尺寸"],
    "面料颜色、褶皱、金属环、遮光背衬与窗帘长度", "同一间卧室，同一扇窗，固定机位与曝光",
    ["窗帘打开，侧边面料与窗边光线同框。", "手指捏住面料，近景展示厚度与背衬。", "回到固定机位，成人缓慢将两片窗帘拉拢。", "展示合拢后的自然室内光线与垂坠褶皱，停留收尾。"],
    '原创英文口播：“A closer look at the fabric, the lining, and how the curtains change this room.”',
    "只呈现合理光线变化，不换房间或偷改曝光，不把缝隙漏光抹掉，不承诺助眠或节能比例",
    "窗帘可同时展示布艺的质感、垂坠、空间搭配与功能，固定机位开合也便于控制AI一致性。",
    "room makeover／面料特写／同机位开合。搜索before after只用于找结构，不照搬夸大效果。",
    "https://nicetown.com/products/blackout-grommet-bedroom-curtains-2-panels")

add("家居家装", "厨房用品", "Fullstar Pro Original 4-in-1 手压蔬菜切丁器（灰绿款）",
    ["fullstar vegetable chopper", "fullstar chopper demo", "vegetable chopper cucumber prep", "fullstar chopper meal prep"],
    ["Fullstar Pro Original vegetable chopper 4 in 1 gray green", "Fullstar 4 in 1 vegetable chopper container"],
    "灰绿色上盖、透明集料盒、压板、所装刀网与铰链结构", "明亮厨房台面，成人手部展示备菜过程",
    ["切丁器和一段预切黄瓜同框。", "设备稳定放置，手把黄瓜段放到刀网上后完全移开。", "双手在盖板安全区域向下压一次，黄瓜丁落入下方集料盒。", "取出集料盒倒入碗中，补一个整机近景。"],
    '原创英文口播：“A quick look at one press, the diced pieces, and the prep bowl.”',
    "手指远离刀网；食材必须经刀网进入盒内，颗粒数量和大小合理，不展示换刀或危险切割",
    "手压切丁的单一动作和落料结果直观，比搅拌杯的高速液体漩涡更容易设计为短演示；仍需检查切丁物理一致性。",
    "one-press demo／meal prep／备菜ASMR。优先只有一种蔬菜和一次按压的视频。",
    "https://fullstarkitchenware.com/products/viral-vegetable-chopper")

add("家居家装", "家具", "PUKAMI Criss Cross 无扶手宽座交叉腿办公椅（布艺无轮款）",
    ["pukami criss cross chair", "criss cross chair review", "pukami chair desk setup", "wide seat armless chair try on"],
    ["PUKAMI criss cross chair no wheels fabric", "PUKAMI armless cross legged desk chair beige"],
    "宽座垫、靠背、无扶手结构、交叉底座、布料和颜色", "成年女性在明亮家庭书桌旁，椅子已组装完成",
    ["侧面展示整把椅子与书桌比例。", "近景轻压座垫一次，布面自然回弹。", "模特正常坐下，随后切到已盘腿坐稳的姿态，不拍连续抬腿过程。", "模特小幅转向桌面，保留椅子全貌。"],
    '原创英文口播：“A wide seat, a simple shape, and a new look for this desk corner.”',
    "底座始终稳定接地，不悬浮、不剧烈旋转；不宣称治疗腰痛或适合所有身高体重",
    "宽座椅拥有清晰的使用姿态和desk setup场景，可代表家具的造型、材质、尺度和使用；比普通边桌更有演示主题。",
    "criss cross chair review／desk setup／座垫特写。固定无轮版本，勿混用带轮或翻扶手款。",
    "https://shop.tiktok.com/us/pdp/criss-cross-chair-by-pukami-adjustable-height-ergonomic-design-soft-fabric-seat/1731301269038666301")

add("家居家装", "建材", "Art3d A17728 自粘地铁砖纹防溅墙贴（加厚款）",
    ["art3d peel and stick backsplash", "peel and stick subway tile install", "art3d backsplash kitchen makeover", "peel stick backsplash diy"],
    ["Art3d A17728 peel and stick backsplash subway tiles", "Art3d subway tiles backsplash thicker version 10 sheets"],
    "地铁砖纹、砖缝比例、单片边缘、厚度、表面光泽与配色", "干燥平整的厨房墙面局部，远离明火和插座，成人双手施工",
    ["手持一片墙贴，与已贴好的边缘同框。", "左手固定墙贴，右手揭开一小段背纸。", "对齐已有砖缝，贴上一片并从中央向边缘压平。", "切稍宽镜头展示这一小块区域的效果，手轻拂表面。"],
    '原创英文口播：“Peel, line up the pattern, and press one tile into place.”',
    "一次只增加一片，砖缝不变形；不声称可无损撕除、防火或适用于所有墙面",
    "自粘墙贴用局部DIY体现建材的纹理、铺贴与空间改造，可在15秒内呈现动作，不必做整屋施工。",
    "peel-and-stick安装／局部改造。不要复制跳切后整面墙瞬间完成的效果。",
    "https://www.art3d.com/designs/a17728na10-art3dsubway-tiles-peel-and-stick-backsplashstick-on-tiles-kitchen-backsplash-%2810-tiles-thicker-version%29/")

add("家居家装", "五金", "HOTO 3.6V Electric Screwdriver Kit 无线电动螺丝刀（12批头套装）",
    ["hoto electric screwdriver", "hoto screwdriver demo", "hoto 3.6v screwdriver unboxing", "electric screwdriver furniture assembly"],
    ["HOTO 3.6V Electric Screwdriver Kit 12 bits", "HOTO cordless screwdriver 3.6V aluminum case"],
    "圆柱机身、按钮、环形灯、批头接口、收纳盒和配色", "干净工作台，成人使用工具固定一颗已预定位的家具螺丝",
    ["打开收纳盒，螺丝刀和批头整齐排布。", "手持已安装好正确批头的螺丝刀，对准螺丝头。", "批头保持同轴接触，短暂旋紧一次后松开按钮。", "抬起工具展示机身，成品连接处留在背景。"],
    '原创英文口播：“Pick the bit, line it up, and finish this small assembly step.”',
    "只拍低风险家具装配，不带电作业；螺丝随旋转逐渐进入，不生成无接触旋紧",
    "电动螺丝刀集中表达五金工具的收纳、操作与装配价值；一颗螺丝比复杂多配件安装更容易复刻。",
    "unboxing／furniture assembly／单颗螺丝演示。不要用精密笔式款图片替换本套装。",
    "https://hototools.com/products/3-6v-electric-screwdriver-kit")

add("数码家电", "手机与数码", "Anker MagGo 10K 磁吸充电宝（A1654，支架与显示屏款）",
    ["anker maggo 10k a1654", "anker maggo power bank review", "magnetic power bank stand demo", "anker maggo travel essentials"],
    ["Anker MagGo A1654 10000 power bank stand display", "Anker MagGo 10K built in stand smart display"],
    "充电宝厚度、显示屏位置、背部磁吸面、支架和接口", "成年出镜者在咖啡桌前，使用一台匹配机型与保护壳的手机",
    ["手机与充电宝并排放在桌面，展示产品侧面。", "手把充电宝磁吸面与手机背面对齐后贴合，手仍托住手机。", "打开支架，把组合稳妥支在桌面，保留接触点。", "切到侧面与背面近景，展示支撑姿态。"],
    '原创英文口播：“Attach it, open the stand, and set your phone down for the next task.”',
    "不生成电量快速上涨、虚假功率或续航；手机、充电宝、支架比例不变，屏幕数值后期处理",
    "磁吸充电宝能表现手机配件的连接和使用情境；A1654有明确结构，避免与薄款、无支架款混淆。",
    "attach-and-stand demo／travel essentials。优先产品背面与接触过程清楚的素材。",
    "https://www.anker.com/au/products/a1654-maggo-10000mah-qi2-power-bank-magsafe-compatible")

add("数码家电", "电脑办公", "EPOMAKER × AULA F75 75%机械键盘（固定配色与轴体）",
    ["aula f75 keyboard", "aula f75 sound test", "aula f75 desk setup", "aula f75 keyboard unboxing"],
    ["EPOMAKER AULA F75 wireless mechanical keyboard", "AULA F75 加所选配色与轴体名称"],
    "75%布局、键帽配色、旋钮、机身轮廓与键位数量", "整洁书桌，成人双手在键盘前，屏幕内容虚化",
    ["键盘从桌面稍远处滑入画面，整体布局清楚。", "俯拍双手轻打少量按键，指尖按下后键帽正常回弹。", "斜侧近景，单手转动旋钮少许，展示键帽高度。", "回到桌搭全景，手离开键盘，保留产品。"],
    "轻柔通用键盘环境声，不声称是该轴体实录；正式声音测试用所选实物的真实录音替换",
    "不凭空增加按键，不生成屏幕文字；不把AI模拟声音当真实声学测试",
    "机械键盘有成熟的开箱、桌搭与敲击内容形式，可代表办公外设的外观和操作；避免便携屏文字/UI复现难度。",
    "sound test／desk setup／开箱。找到同轴体版本，AI模拟声音只作氛围。",
    "https://epomaker.com/products/epomaker-aula-f75")

add("数码家电", "家电", "BISSELL Little Green 1400B 便携布艺清洗机（有线绿机款）",
    ["bissell little green 1400b", "bissell little green couch cleaning", "little green cleaner satisfying", "bissell little green demo"],
    ["BISSELL Little Green 1400B portable carpet cleaner", "BISSELL 1400B upholstery cleaner green"],
    "绿色机身、双水箱、软管、透明吸头、电源线与标识", "客厅沙发局部，成人处理一小块普通日常污渍，整机在侧面可见",
    ["吸头与待清洁区域同框，产品机身在背景。", "吸头贴紧布面，手握手柄缓慢沿一个方向移动。", "透明吸头出现合理水流，清洁轨迹随移动逐渐出现，保留布料湿润感。", "停机后展示同一局部与清洗机，不制造全新沙发。"],
    '原创英文口播：“A closer look at the tool, the pass across the fabric, and the cleaned area.”',
    "软管始终连接，污渍不凭空消失；不把AI画面当去污率测试或承诺一遍彻底清除",
    "便携布艺清洗机有可视化吸头和清洁轨迹，能代表家电功能演示；比泛手持吸尘器更有可观察的过程。",
    "couch cleaning／satisfying clean／吸头特写。锁定1400B有线款，别混无线SmartMix。",
    "https://www.bissell.com/en-us/product/little-green-portable-carpet-upholstery-cleaner-1400B.html")

add("母婴宠物", "母婴用品", "Momcozy KleanPal Pro 奶瓶清洗机（BS03）",
    ["momcozy kleanpal pro", "momcozy bottle washer demo", "kleanpal pro loading bottles", "bottle washer newborn essentials"],
    ["Momcozy KleanPal Pro BS03 baby bottle washer", "Momcozy KleanPal Pro bottle washer sterilizer dryer"],
    "机身、透明上盖、内部支架、喷嘴位置、控制区与颜色", "成年家长在干净厨房台面操作，旁边放拆分好的奶瓶配件，无婴儿入镜",
    ["清洗机和待装载的奶瓶同框，展示完整机身。", "按照参考说明的支架位置，放入一个倒置奶瓶，再摆一个配件。", "盖好上盖，手按启动键一次，从外部看设备运行。", "切回整机外观，家长收好台面，不展示15秒内洗净烘干。"],
    '原创英文口播：“Load the bottle, place the parts, close the lid, and start the cycle.”',
    "不虚构清洗周期、除菌率或婴儿健康效果；瓶子与支架不穿模，装载位置按实物说明",
    "奶瓶清洗机对应父母的明确日常任务，具有装载、合盖、启动的演示结构；相比复杂婴儿车折叠更便于限定动作。",
    "loading demo／newborn essentials／台面routine。只展示启动，不压缩完整洗消烘流程。",
    "https://momcozy.com/products/momcozy-kleanpal-pro-baby-bottle-washer")

add("母婴宠物", "宠物用品", "PETLIBRO Dockstream PLWF115 电池式宠物饮水机",
    ["petlibro dockstream cordless fountain", "petlibro dockstream cat drinking", "petlibro fountain review", "cat water fountain setup"],
    ["PETLIBRO Dockstream PLWF115 cordless water fountain", "PETLIBRO battery operated cat water fountain PLWF115"],
    "水箱形状、饮水盘、出水口、底座、传感区域与配色", "安静客厅角落，一只普通成年家猫和已正确组装的饮水机",
    ["饮水机放在地面，整机清楚可见，猫从侧面靠近。", "近景展示真实低幅水流，饮水盘水面轻微波动。", "猫自愿低头短暂舔水，舌头与水面接触自然。", "猫抬头停留，镜头收于饮水机与宠物同框。"],
    "轻微水声与室内环境声，无口播",
    "电池模式只在接近触发的合理时间内出水；不增加APP屏幕，不强迫猫喝水，不承诺健康疗效",
    "宠物饮水机同时体现设备与宠物使用，保留原有方向并明确到PLWF115，避免混入APP/RFID型号。",
    "cat drinking／setup／水流特写。宠物互动随机性高，失败时使用真实喝水镜头。",
    "https://uk.petlibro.com/collections/fall-sale/products/dockstream-battery-operated-water-fountain")

add("运动出行", "运动与户外", "Sunny Health & Fitness 012-S 迷你踏步机（附阻力带）",
    ["sunny mini stepper 012s", "mini stepper workout demo", "sunny stepper resistance bands", "mini stepper small space workout"],
    ["Sunny Health Fitness NO 012 S mini stepper resistance bands", "Sunny mini stepper 012-S LCD monitor"],
    "双踏板、液压连杆、底座、显示区、阻力带连接点与配色", "成年模特在有足够空间的平整客厅地面，穿运动鞋，器材已稳定放好",
    ["低机位展示踏步机，模特站到踏板上并先稳住身体。", "双脚始终接触踏板，慢速交替下压两次。", "切侧面展示腿部动作和设备结构，阻力带自然放在两侧不同时拉伸。", "停止踏步后稳妥下机，展示器材在角落的占地。"],
    '原创英文口播：“A small-space setup, a few steady steps, and a closer look at the movement.”',
    "不跳跃或加速，不改变踏板机械轨迹，不写燃脂、瘦腿、减重或卡路里承诺",
    "踏步机在短视频中有连续可视动作和空间尺度，可代表家庭健身器材；本案例不覆盖帐篷等全部户外子类。",
    "workout demo／small space setup。优先慢速踏步，避免上下肢复杂同步运动。",
    "https://sunnyhealthfitness.com/products/sunny-health-and-fitness-no-012-s-mini-stepper-step-machine-w-resistance-bands-and-lcd-monitor")

add("运动出行", "汽车与摩托车", "Fanttik X8 APEX 便携无线轮胎充气泵",
    ["fanttik x8 apex tire inflator", "fanttik tire inflator demo", "portable tire inflator car essentials", "fanttik x8 apex motorcycle tire"],
    ["Fanttik X8 APEX tire inflator", "Fanttik X8 Apex portable air compressor cordless"],
    "机身、显示屏、按键、气管、接头与配色", "停稳熄火的汽车轮胎旁，平整安全车库，成人操作",
    ["手持充气泵与车轮同框，产品正面清楚。", "气管已连接机身，成人将另一端接到轮胎气门上并固定。", "按键启动，设备稳放地面，气管连接点始终可见。", "展示产品与车轮，不宣称已完成整个充气过程。"],
    '原创英文口播：“Connect the hose, start the inflator, and keep the setup clearly in view.”',
    "不拍行车操作，不生成推荐胎压或虚假数字，不让瘪胎瞬间鼓起；气管连接真实",
    "轮胎充气泵横跨汽车与摩托车保养使用场景，商品指向比手机支架更明确；单一接管动作便于短视频展示。",
    "car essentials／连接演示／motorcycle tire。胎压和时长必须以实物测试为准。",
    "https://fanttik.com/products/x8-apex-tire-inflator")

add("兴趣收藏", "玩具", "MAGNA-TILES Classic 32-Piece 彩色磁力片套装",
    ["magna tiles classic 32", "magna tiles building ideas", "magnetic tiles house build", "magna tiles play setup"],
    ["MAGNA TILES Classic 32 Piece Set", "MAGNA TILES 32 piece magnetic building tiles classic"],
    "彩色透明片、正方形与三角形比例、边框、磁力连接与包装", "成人双手在干净地垫上展示积木，儿童不必入镜",
    ["同一套磁力片整齐平铺，包装放在后方。", "成人把两片沿边对齐，磁吸形成一个直角。", "在预先搭好的低矮墙体上放一片三角形屋顶，完成简单小屋。", "手离开，镜头轻移展示小屋与剩余片数。"],
    "轻微磁吸咔嗒声与轻快原创背景音乐，无口播",
    "每块都由手放置，数量不凭空变化，不悬浮；不拆开磁力片或展示吞咽风险动作",
    "磁力片覆盖玩具的开箱、玩法、搭建和成品展示；几何构件能控制步骤，但仍需检查磁吸与计数。",
    "building ideas／简单小屋／磁吸ASMR。低矮结构优于复杂大型城堡。",
    "https://magnatiles.com/products/magna-tiles-classic-32-piece-set")

add("兴趣收藏", "爱好", "The Woobles Pierre the Penguin 企鹅新手钩织材料包",
    ["woobles pierre penguin kit", "woobles beginner crochet unboxing", "woobles penguin crochet progress", "crochet kit beginner finished project"],
    ["The Woobles Pierre the Penguin crochet kit", "Woobles beginner crochet penguin kit"],
    "材料包包装、蓝白毛线、钩针、预起针半成品和企鹅成品外形", "成年创作者在温暖书桌前，只拍双手与材料",
    ["打开材料包，毛线和预起针小片排在桌上。", "左手固定已有织片，右手钩针缓慢完成一个简单线圈动作。", "用明显剪辑切到另行准备的完成样品，放在材料包旁。", "手拿小企鹅轻转四分之一圈，展示针织纹理。"],
    '原创英文口播：“Start with the kit, practice a stitch, and here’s a finished example.”',
    "不表现15秒织完，不从一圈线瞬间变成成品；钩针、毛线与手指接触清楚，不复制付费教程",
    "钩织材料包代表成人手工爱好，能展示材料、过程和结果；具体企鹅形象便于检索同款。",
    "kit unboxing／crochet progress／成品展示。真实针法复杂，主打材料与成品，过程只留一个动作。",
    "https://thewoobles.com/collections/impressing-your-friends/products/penguin-crochet-kit")

add("兴趣收藏", "图书", "Mel Robbins《The Let Them Theory》英文纸质精装书",
    ["the let them theory book", "mel robbins let them book review", "the let them theory booktok", "the let them theory reading vlog"],
    ["The Let Them Theory Mel Robbins hardcover English", "Mel Robbins The Let Them Theory hardcover"],
    "书名、作者名、封面版式、书脊、厚度与版本", "成年读者在窗边阅读椅旁，只有这一本实体书为主角",
    ["手把书封面朝镜头举起，书名清楚可见。", "翻开到中段，拇指轻翻一页，只表现纸张，不展示可读正文。", "切到侧面读书的安静片段，把空白书签夹入书中。", "合上书，封面朝上放在桌面，收于书名近景。"],
    '原创英文口播：“Today’s reading pick: The Let Them Theory. A quiet moment, a bookmark, and a new chapter.”',
    "不生成书中金句、长段正文或作者背书，不冒充读后疗效，不把电子版图片当实体书",
    "用具体书名替代泛互动书，便于BookTok检索；实体封面、阅读与书签是图书类通用表达结构。",
    "BookTok／reading vlog／封面展示。观点评论不等于带货转化，避免伪造读者见证。",
    "https://www.melrobbins.com/book/the-let-them-theory/")

add("兴趣收藏", "杂志", "VOGUE 美国版2025年9月号纸质杂志（固定同一期封面）",
    ["vogue september 2025 magazine", "vogue september issue flip through", "vogue magazine unboxing", "fashion magazine reading aesthetic"],
    ["Vogue US September 2025 magazine single issue", "Vogue American September 2025 print magazine"],
    "美国版期号、封面人物图片、刊名、封面排版、装订和厚度", "成年读者在自然光桌边，杂志与一杯水相隔放置",
    ["把杂志封面放在桌面中心，期号与刊名可见。", "从页角翻过一页，斜角展示纸张和版面布局，不让正文可读。", "手指轻扶纸页边缘，近景表现纸张质感。", "合上同一期杂志，封面向上，收于桌面氛围镜头。"],
    "自然翻页声与轻柔原创背景音乐，无口播",
    "不换封面人物、国家版或期号；不复制可读文章，不生成新的封面肖像，不剪杂志拼贴",
    "用知名刊物的具体期号作为搜索锚点，代表杂志的封面、纸张和翻阅体验；是历史内容案例，不是当前热销判断。",
    "flip-through／unboxing／阅读氛围。此类更偏编辑与收藏内容，带货样本需额外核验。",
    "https://archive.vogue.com/issue/20250901")

add("兴趣收藏", "音频", "Taylor Swift《Midnights》Moonstone Blue Edition 实体黑胶唱片",
    ["midnights moonstone blue vinyl", "taylor swift midnights vinyl unboxing", "midnights vinyl collection", "moonstone blue vinyl aesthetic"],
    ["Taylor Swift Midnights Moonstone Blue Edition vinyl", "Midnights Moonstone Blue vinyl LP"],
    "专辑封面、唱片套、蓝色大理石纹盘面、中心标签和版本", "桌面唱片展示场景，成人只触碰唱片边缘与中心孔附近",
    ["封套立在桌面，手把同一张蓝色唱片从内袋缓慢取出。", "手托盘边小幅倾斜，展示纹理，不把指纹按到音轨。", "切到已正确放在唱机上的唱片，缓慢旋转，封套在背景。", "近景展示封套与盘面，构图为收藏开箱风格。"],
    "纸袋摩擦声与原创纯器乐，不使用Taylor Swift歌曲、歌词、声音或仿唱",
    "此处音频指实体音乐内容而非耳机；不改变封面和盘色，不复制唱片内页歌词，不生成艺人出镜推荐",
    "保留音频作为内容商品的分类逻辑；具体黑胶版本有开箱、盘色与收藏展示，不与数码耳机类重复。",
    "vinyl unboxing／record collection／盘面展示。单独核验音乐、封面和商业使用权限。",
    "https://store.taylorswift.com/products/midnights-vinyl")

add("兴趣收藏", "收藏品", "POP MART THE MONSTERS Big into Energy 搪胶毛绒挂件盲盒（固定一个常规款）",
    ["labubu big into energy unboxing", "pop mart big into energy blind box", "labubu big into energy bag charm", "the monsters big into energy collection"],
    ["POP MART THE MONSTERS Big into Energy vinyl plush pendant", "Labubu Big into Energy blind box original POP MART"],
    "同一常规款的脸型、牙齿、耳朵、毛色、挂环、吊牌与外盒", "成年收藏者在干净桌面开箱，旁边有一个素色包",
    ["外盒与手同框，展示系列包装。", "打开已拆封的盒盖，手拿出与参考图一致的挂件。", "挂件轻转小角度，展示脸部和毛绒纹理。", "切到已挂在包上的状态，近景停留，不做复杂扣环过程。"],
    '原创英文口播：“A closer look at this Big into Energy character, from the box to the bag.”',
    "不混系列或随机换色，不承诺隐藏款、真伪或升值；不把拆盒视频当真实抽中记录",
    "具体系列盲盒有开箱悬念、角色细节和包挂场景，能代表潮流收藏品；采用常规款减少稀缺性误导。",
    "blind-box unboxing／bag charm／collection。核验正版来源与角色使用权限，不能借AI伪造中奖。",
    "https://www.popmart.com/us/collection/11/the-monsters")


COLORS = {"服饰时尚": "E9DDF7", "美妆健康": "FBE0EC", "家居家装": "DEF2E5", "数码家电": "DCEBFA", "母婴宠物": "FFF0C5", "运动出行": "FCE4C9", "兴趣收藏": "E8E2F8"}
NAVY, INK, MUTED, LINE = "102A43", "243B53", "526D82", "D9E2EC"
FONT_PATH = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
MEASURE_FONT = ImageFont.truetype(str(FONT_PATH), 15)
measure = ImageDraw.Draw(Image.new("RGB", (1, 1)))


def wrapped(text, font, width):
    result = []
    for paragraph in str(text).split("\n"):
        line = ""
        # Keep ordinary English words intact; Chinese characters can wrap individually.
        raw_tokens = re.findall(r"@[A-Za-z\u4e00-\u9fff]+\d+|[A-Za-z0-9][A-Za-z0-9@'’.%+×:_–\-]*|[^A-Za-z0-9@]", paragraph)
        tokens = []
        for token in raw_tokens:
            if token in "，。；：！？、）】》”’" and tokens:
                tokens[-1] += token
            else:
                tokens.append(token)
        parts = []
        for token in tokens:
            if measure.textlength(token, font=font) > width:
                parts.extend(token)
            else:
                parts.append(token)
        for token in parts:
            if line and measure.textlength(line + token, font=font) > width:
                result.append(line.rstrip())
                line = token.lstrip()
            else:
                line += token
        result.append(line.rstrip())
    return result


def sheet_style(ws, widths, table_name=None, header=1):
    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = 80
    for idx, width in enumerate(widths, 1):
        ws.column_dimensions[ws.cell(1, idx).column_letter].width = width
    for row in ws.iter_rows():
        for c in row:
            c.font = Font(name="Microsoft YaHei", size=11, color=INK)
            c.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
            c.fill = PatternFill("solid", fgColor="FFFFFF" if c.row % 2 == 0 else "F6F8FB")
        ws.row_dimensions[row[0].row].height = 28
    for c in ws[header]:
        c.font = Font(name="Microsoft YaHei", size=11, color="FFFFFF", bold=True)
        c.fill = PatternFill("solid", fgColor=NAVY)
        c.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    ws.row_dimensions[header].height = 32
    for r in range(header + 1, ws.max_row + 1):
        max_lines = max(len(wrapped(ws.cell(r, col).value or "", MEASURE_FONT, widths[col - 1] * 7 - 22)) for col in range(1, len(widths) + 1))
        height = max(44, math.ceil((max_lines * 22 + 22) * 0.75))
        assert height <= 409, (ws.title, r, height)
        ws.row_dimensions[r].height = height
    if table_name:
        t = Table(displayName=table_name, ref=ws.dimensions)
        t.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=False, showColumnStripes=False)
        ws.add_table(t)
        ws.auto_filter.ref = ws.dimensions
    ws.print_options.horizontalCentered = True
    ws.page_setup.orientation = "landscape"
    ws.page_setup.paperSize = ws.PAPERSIZE_A3
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_title_rows = f"{header}:{header}"
    ws.print_area = ws.dimensions
    ws.oddFooter.center.text = "CreatiSignal | 2026-09-02 | &P / &N"


def create():
    assert [d["category"] for d in DATA] == EXPECTED
    wb = Workbook()
    wb.properties.title = "CreatiSignal 28品类代表商品与TikTok爆款检索"
    wb.properties.subject = "TikTok Shop GTM案例选品及Seedance 2.0提示词"
    wb.properties.creator = "CreatiSignal"
    ws = wb.active
    ws.title = "28品类案例库"
    ws.append(HEADERS)
    for d in DATA:
        ws.append([d["industry"], d["category"], d["product"], d["tk"], d["prompt"], d["amazon"]])
    sheet_style(ws, [14, 18, 40, 46, 112, 48], "CaseLibrary")
    ws.freeze_panes = "D2"
    prev = None
    for r, d in enumerate(DATA, 2):
        for col in (1, 2, 3):
            ws.cell(r, col).fill = PatternFill("solid", fgColor=COLORS[d["industry"]])
        ws.cell(r, 2).font = Font(name="Microsoft YaHei", size=11, color=INK, bold=True)
        if d["industry"] != prev:
            for c in ws[r]:
                c.border = Border(top=Side(style="medium", color="BACBDC"))
        prev = d["industry"]
        if (r - 1) % 3 == 0:
            ws.row_breaks.append(Break(id=r))

    guide = wb.create_sheet("使用说明")
    guide.append(["项目", "说明"])
    notes = [
        ("版本与范围", "2026-09-02｜按红框原顺序覆盖7个行业、28个细分品类，每个品类一个代表商品。不含红框外的食品饮料；按最新截图保留男女装、内衣等服饰品类。"),
        ("选品口径", "优先兼顾：品类识别度、精确检索能力、15秒内可见的商品动作/细节、参考图可锁定程度。是GTM案例选品建议，不是销量榜，也不声称一个单品代表该品类全部商品。"),
        ("市场与核验边界", "默认美国市场、英文搜索词。公开商品页用于核对名称、型号及基本结构；尚未逐条核验TikTok视频播放量、销量、发布时间或转化表现，也未完成Amazon各站点库存、真伪和同款可得性核验。"),
        ("TikTok怎么搜", "主表每行提供4条独立查询词，一次复制一条。先用品牌/系列找同款，结果太少再用泛品类+内容形式扩搜；review、try on、demo、unboxing、ASMR等词用于寻找结构，不等于爆款认证。"),
        ("怎么挑候选爆款", "同品类、同市场、相近发布时间比较；记录链接、账号、日期、时长、播放/点赞/评论及评论购买意图。优先商品清楚、前三秒钩子明确、动作可复现的视频。播放高不等于卖得好，不将娱乐热度直接当购买转化。建议每品类先留3条候选，再选1条试做。"),
        ("广告参考入口", "TikTok Creative Center > Top Ads：可按产品/关键词、地区、行业、目标和时间等条件找广告参考。它不是全量自然流量视频库；指标与权限以实际页面为准。官方说明：https://ads.tiktok.com/help/article/how-to-use-the-top-ads-dashboard?lang=en"),
        ("Top Ads样本边界", "官方资料说明，Top Ads是满足一定表现阈值且获得广告主授权展示的广告集合；不要把出现于其中理解为可自由搬运或可直接获得素材商用授权。来源：https://ads.tiktok.com/business/library/NA_Creative_Center_Top_Ads_One_Pager.pdf"),
        ("Amazon怎么搜", "先搜品牌+型号/系列，再加入颜色、尺寸、色号或版本。对HALARA、Little Sleepies提供的泛词仅用于找同类替代，不保证找到同品牌。无同款时优先用品牌官方页取经授权图片；若改选相似商品，应同步修改商品名、关键词和提示词，不能混用参考图。"),
        ("提示词与素材绑定", "每条完整提示词可独立复制。@图片1/2/3必须替换为界面中实际上传的引用标签，建议同SKU正面、侧面、关键细节图；只有1张图就删除不存在的引用。@真人1与@视频1仅在已上传且有权使用时保留；无参考视频也可按所写分镜生成。"),
        ("生成时长与变体", "默认15秒、9:16，四段结构为开场—动作—细节/结果—收尾。若生成10秒，缩为0–2秒、2–6秒、6–10秒，保留一个主要动作并删去一段细节。商品不变时可只替换场景、开场构图或口播，得到可比较的变体；这是提示词设计，不是模型效果保证。"),
        ("复刻与商业使用", "主要借鉴钩子、节奏、构图和演示顺序，不直接复制他人原片、身份、声音、评价、水印和音乐。品牌/角色仅作选品锚点；GTM公开展示前另核验图片、商品标识、人物、角色和音频的使用权限及适用平台要求，不暗示品牌合作。"),
        ("功效与模拟演示", "保健品不做医疗或减重承诺；儿童/母婴不生成不安全使用；清洁、遮光、键盘声音等AI镜头不是实测证据。若作为商业功效演示，必须用可核实的实物表现支持，并审核适用披露要求。"),
        ("特殊品类", "杂志采用VOGUE固定历史期号，偏翻阅/编辑内容；音频按实体音乐商品处理，用黑胶而非耳机；收藏品采用固定常规款，不宣传隐藏款概率或升值。它们不一定有同等密度的TikTok Shop带货样本，需单独筛选。"),
        ("生产建议", "商品包装文字、标签、书封、微小结构、手部、宠物互动都应逐帧复核；无法保持商品一致时改用实拍商品镜头配AI场景。字幕、准确规格、价格和CTA后期添加。正式GTM资料标注AI生成/模拟演示，不将样片当真实用户见证。"),
        ("来源怎么看", "“选品理由与来源”表逐行提供商品核验链接和设计判断。来源支持商品名称/结构，不支持当期TikTok爆款、广告ROI或模型生成稳定性；少数来源为地区站或TikTok商品页，站点与版本需再确认。"),
    ]
    for row in notes:
        guide.append(row)
    sheet_style(guide, [25, 138])
    guide.freeze_panes = "B2"
    for r in range(2, guide.max_row + 1):
        guide.cell(r, 1).fill = PatternFill("solid", fgColor="E8EFF7")
        guide.cell(r, 1).font = Font(name="Microsoft YaHei", size=11, bold=True, color=INK)

    sources = wb.create_sheet("选品理由与来源")
    sources.append(["序号", "品类", "选品理由（编辑判断）", "优先寻找的视频形式", "复刻难点与边界", "商品核验来源（仅产品信息）"])
    for i, d in enumerate(DATA, 1):
        sources.append([i, d["category"], d["reason"], d["form"], d["caution"], d["source"]])
    sheet_style(sources, [8, 19, 65, 57, 61, 66], "ProductSources")
    sources.freeze_panes = "C2"
    for r, d in enumerate(DATA, 2):
        sources.cell(r, 1).number_format = "00"
        sources.cell(r, 1).alignment = Alignment(horizontal="center", vertical="top")
        sources.cell(r, 2).fill = PatternFill("solid", fgColor=COLORS[d["industry"]])
        c = sources.cell(r, 6)
        c.hyperlink = d["source"]
        c.font = Font(name="Microsoft YaHei", size=11, color="176B87", underline="single")
    wb.save(OUTPUT)


def render_sheet(ws, step):
    widths = [int(ws.column_dimensions[ws.cell(1, c).column_letter].width * 7 + 5) for c in range(1, ws.max_column + 1)]
    title_font = ImageFont.truetype(str(FONT_BOLD), 23)
    files = []
    for page, start in enumerate(range(2, ws.max_row + 1, step), 1):
        rows = [1] + list(range(start, min(start + step, ws.max_row + 1)))
        heights = [math.ceil(ws.row_dimensions[r].height * 4 / 3) for r in rows]
        image = Image.new("RGB", (sum(widths) + 40, sum(heights) + 100), "#FFFFFF")
        draw = ImageDraw.Draw(image)
        draw.text((20, 14), f"CreatiSignal  |  {ws.title}  |  {start - 1:02d}–{rows[-1] - 1:02d}", font=title_font, fill="#102A43")
        y = 64
        for ridx, r in enumerate(rows):
            x = 20
            for c, w in enumerate(widths, 1):
                cell = ws.cell(r, c)
                bg = cell.fill.fgColor.rgb
                bg = "#" + bg[-6:] if isinstance(bg, str) else "#FFFFFF"
                draw.rectangle((x, y, x + w, y + heights[ridx]), fill=bg)
                font = ImageFont.truetype(str(FONT_BOLD if cell.font.bold else FONT_PATH), 15)
                color = "#" + cell.font.color.rgb[-6:] if cell.font.color and cell.font.color.type == "rgb" else "#243B53"
                text_value = cell.value if cell.value is not None else ""
                if ws.title == "选品理由与来源" and c == 1 and r > 1:
                    text_value = f"{text_value:02d}"
                lines = wrapped(text_value, font, w - 22)
                assert len(lines) * 22 + 16 <= heights[ridx] + 1, (ws.title, r, c, len(lines), heights[ridx])
                assert all(draw.textlength(line, font=font) <= w - 22 for line in lines), (ws.title, r, c, "horizontal overflow")
                for line_i, line in enumerate(lines):
                    draw.text((x + 10, y + 8 + line_i * 22), line, font=font, fill=color)
                x += w
            draw.line((20, y + heights[ridx], sum(widths) + 20, y + heights[ridx]), fill="#D9E2EC", width=1)
            y += heights[ridx]
        file = QA / f"{ws.title}_{page:02d}.png"
        image.save(file)
        files.append(file)
    return files


def validate_and_render():
    QA.mkdir(exist_ok=True)
    with ZipFile(OUTPUT) as z:
        assert z.testzip() is None
    wb = load_workbook(OUTPUT)
    ws = wb["28品类案例库"]
    assert (ws.max_row, ws.max_column) == (29, 6)
    assert [c.value for c in ws[1]] == HEADERS
    assert [ws.cell(r, 2).value for r in range(2, 30)] == EXPECTED
    assert not ws.merged_cells.ranges
    assert ws.freeze_panes == "D2" and ws.auto_filter.ref == "A1:F29"
    assert len(set(ws.cell(r, 3).value for r in range(2, 30))) == 28
    for r in range(2, 30):
        for c in range(1, 7):
            assert isinstance(ws.cell(r, c).value, str) and ws.cell(r, c).value.strip()
        assert len(ws.cell(r, 4).value.splitlines()) == 4
        for needle in ["15秒", "9:16", "@图片1", "@视频1", "0–3秒", "3–7秒", "7–11秒", "11–15秒", "CTA"]:
            assert needle in ws.cell(r, 5).value, (r, needle)
    for sheet in wb:
        for row in sheet:
            for c in row:
                assert c.data_type not in ("f", "e"), (sheet.title, c.coordinate)
    assert wb["选品理由与来源"].max_row == 29
    previews = []
    for sheet, step in [(ws, 3), (wb["使用说明"], 7), (wb["选品理由与来源"], 7)]:
        previews.extend(render_sheet(sheet, step))
    # A compact visual index lets every rendered page be checked without truncating any content.
    thumb_w, thumb_h = 640, 650
    montage = Image.new("RGB", (thumb_w * 3, thumb_h * math.ceil(len(previews) / 3)), "#D9E2EC")
    draw = ImageDraw.Draw(montage)
    labelfont = ImageFont.truetype(str(FONT_PATH), 18)
    for i, p in enumerate(previews):
        im = Image.open(p)
        im.thumbnail((thumb_w - 18, thumb_h - 40))
        x, y = (i % 3) * thumb_w + 9, (i // 3) * thumb_h + 30
        montage.paste(im, (x, y))
        draw.text((x, y - 27), p.stem, font=labelfont, fill="#102A43")
    montage.save(QA / "all_sheets_contact_sheet.png")
    result = dict(output=str(OUTPUT), sheets=[(s.title, s.max_row, s.max_column) for s in wb],
                  categories=len(EXPECTED), industries=dict(Counter(d["industry"] for d in DATA)),
                  prompt_lengths=[len(d["prompt"]) for d in DATA], preview_pages=len(previews),
                  max_row_height=max(ws.row_dimensions[r].height for r in range(2, 30)),
                  checks="PASS: exact headers, category order, complete prompts, unique products, URLs, ZIP, layout-fit, no formulas/errors")
    (QA / "validation.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    create()
    validate_and_render()

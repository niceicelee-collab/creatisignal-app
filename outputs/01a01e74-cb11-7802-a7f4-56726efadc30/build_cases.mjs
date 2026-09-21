import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "D:/Cursor/creatisignal-app-new/outputs/01a01e74-cb11-7802-a7f4-56726efadc30";
const outputPath = `${outputDir}/CreatiSignal_TikTokShop_Seedance2_Case_Library.xlsx`;
const previewPath = `${outputDir}/CreatiSignal_TikTokShop_Seedance2_Case_Library_preview.png`;

const commonTail = "竖屏9:16，15秒，真实TikTok原生手机拍摄感，产品在首帧清楚出现，使用3—4个连续镜头。保持产品形状、颜色、材质、标签位置、配件数量和人物身份一致；动作符合真实物理逻辑，手指与产品接触明确，不穿模、不凭空变形。不要自行生成价格、折扣、认证、功效数字或难以辨认的包装文字；结尾留出后期添加商品卡和CTA的空间。自然英文口播与动作同步，避免过度商业大片感。";

const entries = [
  {
    industry: "服饰时尚",
    category: "塑身衣／塑身连体衣",
    keywords: "主搜：women's seamless shapewear bodysuit tummy control\n长尾：under dress；adjustable straps；snap closure；front back detail",
    prompt: "生成一条“穿搭困扰＋上身展示”的TikTok UGC视频。使用@图片1 @图片2 @图片3作为[塑身衣名称]参考，@真人1作为成年女性身份参考。0—3秒，真人拿着产品面对镜头：\"I wanted a smoother base without feeling squeezed.\" 3—9秒，近景展示面料弹性、肩带、缝线和开合结构，双手自然拉伸后回弹；随后穿在日常连衣裙内，以全身镜展示正面和侧面轮廓。9—15秒，真人自然坐下、抬手和转身：\"It stays comfortable and disappears under my outfit.\" 不制造夸张身材变化，不使用瘦身或减重承诺。"
  },
  {
    industry: "服饰时尚",
    category: "男士功能Polo",
    keywords: "主搜：men's performance polo moisture wicking\n长尾：stretch polo；quick dry golf shirt；wrinkle resistant；fabric close up",
    prompt: "生成一条“办公室到下班场景切换”的男装TikTok UGC视频。使用@图片1—3作为[功能Polo名称]参考，@真人1作为成年男性参考。0—3秒，真人在镜前整理衣领：\"This polo looks polished but moves like activewear.\" 3—9秒，展示领型、纽扣、面料纹理和侧向拉伸，随后完成坐下办公、伸手拿包和走出办公室的连续动作。9—15秒，切换到户外咖啡店，全身展示版型：\"One shirt, workday to weekend.\" 仅呈现商品标签可证实的透气、弹力或抗皱卖点。"
  },
  {
    industry: "服饰时尚",
    category: "轻量运动鞋",
    keywords: "主搜：lightweight breathable walking shoes\n长尾：athletic sneakers；flexible sole；mesh upper；side sole detail",
    prompt: "生成一条“上脚测试”的TikTok鞋履UGC视频。使用@图片1—3作为[运动鞋名称]参考，保持鞋型、鞋底纹路、鞋带、配色和标识一致；@真人1作为成年人物参考。0—3秒，人物拿鞋靠近镜头：\"These might be the easiest sneakers in my rotation.\" 3—9秒，手指按压鞋面、弯折前掌，再自然系紧鞋带；镜头切到脚部完成行走、转向和轻微慢跑。9—15秒，全身街头穿搭展示：\"Light on foot and easy to style.\" 左右鞋数量、鞋底接地和步态必须真实。"
  },
  {
    industry: "服饰时尚",
    category: "多功能通勤托特包",
    keywords: "主搜：women work tote bag laptop compartment\n长尾：zipper closure；multiple pockets；water bottle pocket；inside compartments",
    prompt: "生成一条“看起来不大但很能装”的TikTok包袋UGC视频。使用@图片1—3作为[托特包名称]参考，@真人1作为成年女性参考。0—3秒，真人举包面对镜头：\"This bag holds way more than it looks.\" 3—10秒，俯拍桌面，依次把笔记本电脑、水瓶、钱包、钥匙和化妆包真实放入对应隔层，展示拉链和肩带细节。10—15秒，真人拉好拉链、单肩背起并走向门口：\"Everything has its own place.\" 每件物品只能出现一次，放入后不能留在桌上或穿过包体。"
  },
  {
    industry: "美妆健康",
    category: "唇油／唇釉",
    keywords: "主搜：hydrating tinted lip oil glossy non sticky\n长尾：large applicator；clear tube；lip swatch；applicator close up",
    prompt: "生成一条美妆博主对镜口播视频。使用@图片1—3作为[唇油名称]参考，保持瓶身、色号、盖子、标签和刷头一致；@真人1作为成年女性参考。0—3秒，真人把产品放在脸侧：\"This gives my lips instant glossy shine.\" 3—9秒，左手握瓶身，右手旋开盖子并拉出刷头，在左手手背划出一条轻透试色：\"Glossy, smooth, and not sticky.\" 9—15秒，右手刷头轻涂嘴唇，最后左手持产品展示：\"Definitely staying in my bag.\" 刷头、手背和嘴唇接触必须明确。"
  },
  {
    industry: "美妆健康",
    category: "护肤精华",
    keywords: "主搜：hydrating facial serum with dropper\n长尾：hyaluronic acid serum；lightweight texture；glass bottle；serum swatch",
    prompt: "生成一条“晨间轻量护肤”的TikTok UGC视频。使用@图片1—3作为[精华名称]参考，@真人1作为成年女性参考。0—3秒，浴室镜前，真人拿起精华：\"If you hate heavy skincare, look at this texture.\" 3—9秒，右手旋开滴管，在左手手背滴下一滴，近景展示透明度、流动速度和推开后的肤感；随后只在脸颊轻拍少量产品。9—15秒，真人在自然窗光下展示清爽肤感：\"It layers so easily under makeup.\" 不生成祛痘、抗衰或治疗效果，不制造虚假即时前后对比。"
  },
  {
    industry: "美妆健康",
    category: "热风造型梳",
    keywords: "主搜：hot air brush blow dryer brush\n长尾：one step volumizer；heated straightening brush；brush bristle detail；before after hair",
    prompt: "生成一条“单侧头发快速整理”的美发工具TikTok视频。使用@图片1—3作为[造型梳名称]参考，@真人1作为成年女性参考。0—3秒，真人展示一侧略毛躁的头发：\"I tried this on one section so you can see the difference.\" 3—10秒，她将头发分成清晰的一束，右手握住造型梳，从中段缓慢滑到发尾，梳齿持续接触头发，伴随自然热风声。10—15秒，左右两侧并列展示光泽和顺滑度：\"One pass, and it looks much more polished.\" 电线、开关和发丝不能穿过手或工具。"
  },
  {
    industry: "美妆健康",
    category: "维生素软糖／营养补充剂",
    keywords: "主搜：adult multivitamin gummies\n长尾：women multivitamin gummies；vegan gummies；berry flavor；bottle gummy close up",
    prompt: "生成一条成年创作者的“日常习惯分享”视频。使用@图片1—3作为[营养补充剂名称]参考，保持瓶身、瓶盖、软糖形状和标签布局一致；@真人1作为成年人物参考。0—3秒，人物在厨房拿起产品：\"This is the easiest part of my morning routine.\" 3—9秒，旋开瓶盖，将正确数量的软糖倒入掌心，近景展示颜色和质地，并说明一个包装上可验证的卖点。9—15秒，把瓶子放在咖啡杯旁：\"Simple, convenient, and easy to remember.\" 不承诺治病、减重、改善焦虑或确定性健康结果。"
  },
  {
    industry: "家居家装",
    category: "蒸汽拖把／地面清洁工具",
    keywords: "主搜：steam mop for hardwood and tile floors\n长尾：detachable water tank；microfiber pads；lightweight；product in use",
    prompt: "生成一条“厨房黏渍快速清理”的TikTok问题解决视频。使用@图片1—3作为[清洁工具名称]参考。0—3秒，低机位展示地板上一小块可见污渍，成年创作者把拖把推入画面：\"This sticky kitchen spot was driving me crazy.\" 3—10秒，展示水箱安装、按钮开启和拖布贴合地面，拖把沿同一方向缓慢经过污渍。10—15秒，镜头展示清理后的同一区域和拖布细节：\"That was one simple pass.\" 拖把始终接触地面，不夸大消毒、杀菌或适用材质范围。"
  },
  {
    industry: "家居家装",
    category: "橱柜／冰箱收纳架",
    keywords: "主搜：pull out cabinet organizer under sink\n长尾：sliding drawer organizer；two tier；stackable；before after cabinet",
    prompt: "生成一条“杂乱空间变整齐”的家居收纳TikTok视频。使用@图片1—3作为[收纳架名称]参考。0—3秒，俯拍凌乱橱柜：\"If your cabinet looks like this, try using the vertical space.\" 3—10秒，成年创作者双手展开或安装收纳架，将罐子、调料和餐具逐件放入，展示抽拉、旋转或叠放功能。10—15秒，镜头平滑拉远，展示整理后的整体空间：\"Now I can actually see everything.\" 保持物品数量前后一致，禁止凭空消失或穿过隔板。"
  },
  {
    industry: "家居家装",
    category: "便携搅拌杯／无线榨汁杯",
    keywords: "主搜：portable rechargeable blender personal size\n长尾：USB blender cup；travel smoothie blender；blade detail；exploded view",
    prompt: "生成一条“办公室三步饮品”的TikTok产品演示视频。使用@图片1—3作为[搅拌杯名称]参考。0—3秒，产品和成品饮料同时出现：\"My desk smoothie takes less effort than my coffee.\" 3—10秒，成年人物依次加入水果、液体并正确盖紧杯盖，按下按钮；近景展示刀片启动、食材旋转和液体逐渐均匀。10—15秒，停止机器后再打开饮用盖，倒入透明杯：\"Blend, flip, and take it with you.\" 手指不能靠近旋转刀片，液体不可穿过杯壁或溢出。"
  },
  {
    industry: "家居家装",
    category: "遮光窗帘",
    keywords: "主搜：blackout curtains bedroom grommet 2 panels\n长尾：linen texture；room darkening；thermal insulated；fabric close up",
    prompt: "生成一条“白天在家看电影”的家纺TikTok视频。使用@图片1—3作为[窗帘名称]参考，保持颜色、织法、吊环和长度一致。0—3秒，明亮房间里电视画面被反光影响：\"Movie afternoon, but the room is way too bright.\" 3—9秒，成年人物双手握住窗帘边缘，沿轨道自然拉合；近景展示面料厚度和自然褶皱。9—15秒，同一机位展示房间明显变暗，人物坐回沙发：\"That instantly made the room feel cozier.\" 不声称具体遮光百分比，除非包装明确标注。"
  },
  {
    industry: "数码家电",
    category: "磁吸手机壳／折叠支架",
    keywords: "主搜：magnetic phone case with stand\n长尾：MagSafe compatible；foldable kickstand；magnetic ring；front back side",
    prompt: "生成一条“手机配件一物多用”的TikTok UGC视频。使用@图片1—3作为[手机壳名称]参考，保持镜头开孔、按键、颜色和支架结构一致。0—3秒，成年人物把手机壳靠近镜头：\"This case does more than just cover my phone.\" 3—10秒，将手机准确装入壳体，展开支架，分别横放看视频、竖放查看食谱，再连接兼容的磁吸配件。10—15秒，折回支架并放入口袋：\"Slim when I carry it, useful when I need it.\" 不做无法验证的高空防摔演示。"
  },
  {
    industry: "数码家电",
    category: "便携显示器",
    keywords: "主搜：portable monitor for laptop USB C\n长尾：15.6 inch；built in stand；travel monitor；ports side view",
    prompt: "生成一条“咖啡店双屏办公”的TikTok数码演示。使用@图片1—3作为[便携显示器名称]参考。0—3秒，桌上只有笔记本电脑：\"One screen was slowing down my travel setup.\" 3—10秒，成年人物展开显示器支架，用一根正确接口的线连接笔记本；显示器从黑屏自然亮起，呈现简洁且无可读小字的工作界面。10—15秒，人物把窗口自然拖到副屏并开始工作：\"Now I have a second screen anywhere.\" 屏幕比例、线缆连接和支架承重必须真实。"
  },
  {
    industry: "数码家电",
    category: "开放式耳机／无线耳夹",
    keywords: "主搜：open ear bluetooth headphones\n长尾：clip on earbuds；ear cuff headphones；charging case；wearing demonstration",
    prompt: "生成一条“通勤佩戴体验”的TikTok UGC视频。使用@图片1—3作为[耳机名称]参考，@真人1作为成年人物参考。0—3秒，真人打开充电盒：\"I wanted earbuds that don’t feel sealed in.\" 3—9秒，近景展示左右耳机，分别从充电盒取出并正确佩戴在左右耳朵，轻触控制区域。9—15秒，人物在公园正常行走并保持对周围环境的自然反应：\"Comfortable for my everyday walks.\" 不宣传医疗、听力保护或绝对安全效果；耳机不可复制、悬浮或穿过耳朵。"
  },
  {
    industry: "数码家电",
    category: "手持吸尘器",
    keywords: "主搜：cordless handheld vacuum for car\n长尾：crevice tool；clear dust cup；mini car vacuum；accessories included",
    prompt: "生成一条“车内缝隙清洁”的TikTok演示视频。使用@图片1—3作为[手持吸尘器名称]参考。0—3秒，展示汽车座椅缝隙里的饼干碎屑：\"This is where all the car snacks disappear.\" 3—10秒，成年人物安装细缝吸头，开启机器并让吸头持续贴近碎屑，碎屑沿吸力方向逐渐消失；随后展示透明集尘仓。10—15秒，清洁同一位置并把吸尘器放入车门储物格：\"Small enough to keep in the car.\" 汽车保持停放状态，不凭空清空集尘仓。"
  },
  {
    industry: "母婴宠物",
    category: "便携奶瓶清洁套装",
    keywords: "主搜：travel baby bottle cleaning brush kit\n长尾：portable drying rack；storage case；silicone bottle brush；all parts displayed",
    prompt: "生成一条成年家长的“外出清洁包”TikTok演示。使用@图片1—3作为[奶瓶清洁套装名称]参考。0—3秒，成年人物打开旅行包：\"This is what I pack for bottle cleanup away from home.\" 3—10秒，依次取出刷柄、刷头、晾干架和收纳盒，正确组装后清洁空奶瓶内壁，再将部件放回各自位置。10—15秒，合上收纳盒放入妈咪包：\"Everything stays together in one compact kit.\" 不让未成年人承担口播或推销，不生成杀菌率等未经证实的数字。"
  },
  {
    industry: "母婴宠物",
    category: "一键折叠婴儿车",
    keywords: "主搜：compact travel stroller one hand fold\n长尾：lightweight stroller；airplane travel；folded size；front side folded view",
    prompt: "生成一条“后备箱收纳测试”的TikTok产品演示。使用@图片1—3作为[婴儿车名称]参考，保持车架、轮子、顶篷、把手和安全带结构一致。0—3秒，成年家长站在打开的空婴儿车旁：\"The best part is how fast this folds.\" 3—10秒，按真实步骤锁定车轮、触发折叠装置，双手或单手把车架连续折叠，再提起放入静止车辆的后备箱。10—15秒，取出并重新展开：\"Compact for the car, ready when I need it.\" 全程不放置真实儿童，不编造承重或安全认证。"
  },
  {
    industry: "母婴宠物",
    category: "宠物自动饮水机",
    keywords: "主搜：cat water fountain stainless steel\n长尾：quiet pump；replaceable filter；water level window；fountain in use",
    prompt: "生成一条“宠物主动喝水”的居家TikTok视频。使用@图片1—3作为[宠物饮水机名称]参考，保持水槽、出水口、滤芯和电源结构一致。0—3秒，成年主人把饮水机放在厨房角落：\"My cat ignored the old water bowl, so I tried moving water.\" 3—9秒，展示主人加水、正确安装顶盖，水流启动并稳定循环；一只放松的猫自行靠近嗅闻和饮水。9—15秒，近景展示安静水流和主人更换滤芯：\"It fits naturally into our routine.\" 不强迫宠物接触，不做疾病预防或饮水量保证。"
  },
  {
    industry: "母婴宠物",
    category: "宠物去浮毛梳",
    keywords: "主搜：pet deshedding brush self cleaning\n长尾：release button；cat slicker brush；dog undercoat brush；bristle close up",
    prompt: "生成一条“梳毛前后”的宠物护理TikTok视频。使用@图片1—3作为[去浮毛梳名称]参考。0—3秒，成年主人展示衣服上的宠物毛：\"Shedding season is officially here.\" 3—10秒，一只放松的猫或狗侧躺，主人用右手沿毛发生长方向缓慢梳理，梳齿持续贴合表层毛发；按下退毛按钮，将梳下的毛完整推出。10—15秒，主人展示梳子和收集到的浮毛：\"Gentle to use and much easier to clean.\" 宠物不能表现疼痛、恐惧或被强制固定。"
  },
  {
    industry: "运动出行",
    category: "阻力带套装",
    keywords: "主搜：resistance loop bands set with carry bag\n长尾：fabric resistance bands；different resistance levels；workout demonstration；set flat lay",
    prompt: "生成一条成年健身创作者的“三个动作”TikTok视频。使用@图片1—3作为[阻力带套装名称]参考，@真人1作为成年人物参考。0—3秒，真人拉开阻力带：\"This is the workout kit I can fit in one drawer.\" 3—11秒，依次完成侧向走、站姿划船和臀桥，每个动作只展示一次，阻力带随动作持续拉伸并自然回弹。11—15秒，把不同阻力带整齐放回收纳袋：\"Three moves, almost no setup.\" 不制造即时减脂或增肌前后对比，保持正确、安全的动作姿势。"
  },
  {
    industry: "运动出行",
    category: "露营灯",
    keywords: "主搜：rechargeable camping lantern dimmable\n长尾：hanging tent light；compact LED lantern；multiple light modes；night campsite",
    prompt: "生成一条“天黑后的营地照明”TikTok场景视频。使用@图片1—3作为[露营灯名称]参考。0—3秒，傍晚帐篷内光线不足：\"This little light changes the whole campsite.\" 3—9秒，成年人物打开灯体、调节一个真实存在的亮度档位，再用挂钩把灯稳固挂在帐篷顶部；环境由暗到亮自然变化。9—15秒，切到露营桌，灯照亮地图、杯子和食物：\"Hang it, dim it, or keep it on the table.\" 不生成不存在的太阳能板、防水等级或续航数字。"
  },
  {
    industry: "运动出行",
    category: "汽车手机支架",
    keywords: "主搜：car phone mount dashboard adjustable\n长尾：air vent phone holder；360 degree rotation；one hand operation；installed view",
    prompt: "生成一条“停车状态安装测试”的汽车用品TikTok视频。使用@图片1—3作为[手机支架名称]参考。0—3秒，静止车辆中，成年人物展示手机在杯架里滑动：\"I needed my map where I could actually see it.\" 3—10秒，车辆保持驻车，人物按真实结构把支架安装到出风口或仪表台，放入手机并旋转横竖方向；支架持续承托手机。10—15秒，展示驾驶位正常视角：\"Easy to adjust before the drive.\" 不遮挡道路视线，不在车辆行驶时操作设备。"
  },
  {
    industry: "运动出行",
    category: "摩托车头盔蓝牙耳机",
    keywords: "主搜：motorcycle helmet bluetooth intercom\n长尾：two rider communication；helmet headset；microphone speakers；installation kit",
    prompt: "生成一条“骑行前装备安装”的TikTok视频。使用@图片1—3作为[头盔耳机名称]参考。0—3秒，成年骑手在静止摩托车旁拿起耳机：\"My ride setup starts before the engine does.\" 3—10秒，在桌面近景中把主机固定在头盔侧面，将扬声器和麦克风安装到正确位置，整理线材并按下电源键。10—15秒，骑手戴好头盔，在停车状态下轻触按钮：\"Connected before I hit the road.\" 不展示骑行中操作，不编造通信距离、防水或安全认证。"
  },
  {
    industry: "兴趣收藏",
    category: "磁力片／拼装玩具",
    keywords: "主搜：magnetic building tiles set\n长尾：3D construction blocks；castle building set；transparent magnetic tiles；all pieces flat lay",
    prompt: "生成一条成年创作者的“从平面到立体”TikTok拼装视频。使用@图片1—3作为[磁力片套装名称]参考，保持颜色、形状和数量逻辑一致。0—3秒，桌上平铺所有零件：\"Flat pieces to a full build—watch this.\" 3—11秒，成年双手依次连接方形和三角形零件，使用快速但可辨认的定格节奏搭成一个小城堡；每个零件必须由手真实拿取和吸附。11—15秒，放上最后一块并缓慢环绕展示：\"That final click is so satisfying.\" 不让未成年人承担推销角色。"
  },
  {
    industry: "兴趣收藏",
    category: "盲盒／潮玩公仔",
    keywords: "主搜：blind box collectible figures\n长尾：mystery box vinyl figure；mini figurine series；sealed package；figure detail",
    prompt: "生成一条“拆盒揭晓”的TikTok收藏玩具视频。使用@图片1—3作为[盲盒系列名称]与包装参考。0—3秒，成年收藏者摇一摇未拆封盒子：\"Okay, let’s see who I got.\" 3—10秒，双手沿真实封口拆开外盒和内袋，公仔只能在包装打开后出现；近景展示脸部、服装、配件和底座。10—15秒，把公仔放入收藏架，与包装并排展示：\"This one is going straight on the shelf.\" 不声称必得隐藏款，不改变包装中实际对应的角色。"
  },
  {
    industry: "兴趣收藏",
    category: "手账文具套装",
    keywords: "主搜：aesthetic journaling supplies kit\n长尾：scrapbook sticker set；washi tape；bullet journal accessories；stationery flat lay",
    prompt: "生成一条安静治愈的TikTok桌面手账视频。使用@图片1—3作为[手账套装名称]参考。0—3秒，俯拍打开的套装：\"A five-minute reset for my desk and my brain.\" 3—11秒，成年双手依次取出笔记本、贴纸、胶带和笔，翻开空白页，贴上一张贴纸并画出简洁布局；加入翻页、撕贴纸和笔尖摩擦的自然ASMR声。11—15秒，完整展示完成页面：\"Simple, calm, and actually fun to use.\" 页面不要生成大量可读小字或乱码。"
  },
  {
    industry: "兴趣收藏",
    category: "编织／串珠手工包",
    keywords: "主搜：bracelet making kit beads for adults\n长尾：friendship bracelet kit；bead organizer box；jewelry making supplies；finished bracelet；crochet kit for beginners adults",
    prompt: "生成一条“材料包到成品”的成人手工TikTok视频。使用@图片1—3作为[手工材料包名称]参考。0—3秒，展示分类整齐的线材或珠子：\"Everything for this project came in one little kit.\" 3—11秒，成年双手按步骤穿线、打结或完成几个清晰的编织动作，使用轻微定格剪辑推进进度，但材料必须保持连续。11—15秒，展示完成的手链或小花与剩余材料：\"Beginner-friendly and so satisfying to finish.\" 针具使用安全，手指、线材和珠孔接触准确。"
  },
  {
    industry: "食品饮料",
    category: "冻干水果／休闲零食",
    keywords: "主搜：freeze dried fruit snacks variety pack\n长尾：freeze dried strawberries；crispy fruit；resealable bag；food texture close up",
    prompt: "生成一条“开袋ASMR＋口感反应”的TikTok食品视频。使用@图片1—3作为[零食名称]参考，保持包装、食品形状和颜色一致；@真人1作为成年人物参考。0—3秒，真人拿着未开封包装：\"Wait until you hear this crunch.\" 3—9秒，双手撕开包装，把几块零食倒入掌心，微距展示多孔或酥脆质地；真人咬下一块，声音清晰同步。9—15秒，包装与食品并排hero展示：\"Light, crispy, and dangerously snackable.\" 不编造低糖、减脂或健康功效。"
  },
  {
    industry: "食品饮料",
    category: "咖啡浓缩液／茶饮",
    keywords: "主搜：liquid coffee concentrate\n长尾：cold brew concentrate；iced coffee；instant latte packets；bottle packaging",
    prompt: "生成一条“在家完成冰饮”的TikTok饮品视频。使用@图片1—3作为[咖啡或茶饮名称]参考。0—3秒，成品冰饮和产品同时出现：\"This is my café-style drink without leaving home.\" 3—10秒，成年人物在透明杯中加入冰块、牛奶或水，再倒入规定份量的浓缩液；近景展示两种液体形成自然渐层，随后用勺子搅匀。10—15秒，人物端起杯子品尝：\"Pour, stir, done.\" 液体流动、冰块浮力和杯中容量必须真实，不自行声称提神或减肥效果。"
  },
  {
    industry: "食品饮料",
    category: "辣酱／复合调味料",
    keywords: "主搜：gourmet hot sauce variety pack\n长尾：chili crisp sauce；spicy seasoning sauce；glass bottle；sauce texture close up",
    prompt: "生成一条“平淡晚餐升级”的TikTok食品演示。使用@图片1—3作为[调味料名称]参考，保持瓶型、瓶盖、酱体颜色和标签一致。0—3秒，一盘简单食物和产品同时出现：\"This is what I add when dinner needs something.\" 3—10秒，成年人物打开瓶盖，将适量酱料连续淋在鸡肉、面条或蔬菜上，近景展示酱料黏度、颗粒和附着效果；夹起一口食物。10—15秒，人物自然试吃：\"Savory, a little spicy, and full of flavor.\" 辣度、配料和过敏原描述只采用商品标签信息。"
  },
  {
    industry: "食品饮料",
    category: "高蛋白零食棒",
    keywords: "主搜：high protein snack bars variety pack\n长尾：soft baked protein bars；peanut butter protein bar；bar cross section；individual packaging",
    prompt: "生成一条“下午零食替换”的TikTok UGC视频。使用@图片1—3作为[零食棒名称]参考，@真人1作为成年人物参考。0—3秒，真人在办公桌前拿起产品：\"This is what I grab when the afternoon snack craving hits.\" 3—9秒，双手撕开包装，把零食棒掰开，微距展示内部夹心、坚果或松软纹理；只口播包装真实标注的[X克蛋白质]或其他营养信息。9—15秒，真人试吃并把剩余部分放回包装旁：\"Chewy, convenient, and easy to keep in my bag.\" 不宣传减肥、代餐治疗或确定性健身结果。"
  }
];

if (entries.length !== 32) {
  throw new Error(`Expected 32 entries, received ${entries.length}`);
}

const rows = [
  ["行业", "品类", "产品关键词", "完整提示词"],
  ...entries.map((entry) => [
    entry.industry,
    entry.category,
    entry.keywords,
    `${entry.prompt}\n\n${commonTail}`,
  ]),
];

await fs.mkdir(outputDir, { recursive: true });
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("案例库");
sheet.showGridLines = false;
sheet.getRange(`A1:D${rows.length}`).values = rows;

sheet.getRange("A1:D1").format = {
  fill: "#102A43",
  font: { bold: true, color: "#FFFFFF", size: 12 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "outside", style: "medium", color: "#102A43" },
};
sheet.getRange("A1:D1").format.rowHeight = 30;

const dataRange = sheet.getRange(`A2:D${rows.length}`);
dataRange.format = {
  font: { color: "#243B53", size: 10 },
  verticalAlignment: "top",
  wrapText: true,
  borders: {
    insideHorizontal: { style: "thin", color: "#D9E2EC" },
    bottom: { style: "thin", color: "#BCCCDC" },
  },
};
sheet.getRange(`A2:B${rows.length}`).format.horizontalAlignment = "center";
sheet.getRange(`C2:D${rows.length}`).format.horizontalAlignment = "left";

const industryColors = {
  "服饰时尚": "#F3E8FF",
  "美妆健康": "#FCE7F3",
  "家居家装": "#DCFCE7",
  "数码家电": "#DBEAFE",
  "母婴宠物": "#FEF3C7",
  "运动出行": "#FFEDD5",
  "兴趣收藏": "#EDE9FE",
  "食品饮料": "#FEE2E2",
};

for (let i = 0; i < entries.length; i += 1) {
  const excelRow = i + 2;
  const fill = industryColors[entries[i].industry];
  sheet.getRange(`A${excelRow}:B${excelRow}`).format.fill = fill;
  sheet.getRange(`A${excelRow}`).format.font = { bold: true, color: "#102A43", size: 10 };
  sheet.getRange(`C${excelRow}`).format.fill = "#F8FAFC";
  sheet.getRange(`D${excelRow}`).format.fill = "#FFFFFF";
  sheet.getRange(`A${excelRow}:D${excelRow}`).format.rowHeight = 122;
}

sheet.getRange(`A1:A${rows.length}`).format.columnWidth = 16;
sheet.getRange(`B1:B${rows.length}`).format.columnWidth = 27;
sheet.getRange(`C1:C${rows.length}`).format.columnWidth = 58;
sheet.getRange(`D1:D${rows.length}`).format.columnWidth = 118;

sheet.freezePanes.freezeRows(1);
sheet.freezePanes.freezeColumns(2);

const table = sheet.tables.add(`A1:D${rows.length}`, true, "CaseLibraryTable");
table.style = "TableStyleMedium2";
table.showFilterButton = true;
table.showBandedRows = false;

const check = await workbook.inspect({
  kind: "table",
  range: `案例库!A1:D${rows.length}`,
  include: "values,formulas",
  tableMaxRows: 6,
  tableMaxCols: 4,
  tableMaxCellChars: 180,
  maxChars: 6000,
});
console.log("TABLE_CHECK");
console.log(check.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log("FORMULA_ERROR_SCAN");
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "案例库",
  range: `A1:D${rows.length}`,
  scale: 0.75,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({ outputPath, previewPath, rowCount: entries.length, columnCount: 4 }));

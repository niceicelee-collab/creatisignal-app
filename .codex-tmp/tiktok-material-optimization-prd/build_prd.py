from __future__ import annotations

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt


ROOT = Path(r"D:\Cursor\creatisignal-app-new")
WORK_DIR = ROOT / ".codex-tmp" / "tiktok-material-optimization-prd"
VISUAL_DIR = WORK_DIR / "visuals"
OUT_DIR = ROOT / "deliverables" / "tiktok-material-optimization-prd"
OUT_PATH = OUT_DIR / "CreatiSignal_TikTokShop投放素材诊断与迭代闭环_PRD_V1.1.docx"
HELPER_PATH = ROOT / ".codex-tmp" / "ai-friendly-inspiration-prd" / "build_prd.py"


def load_helpers():
    spec = spec_from_file_location("doc_helpers", HELPER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load helpers from {HELPER_PATH}")
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


h = load_helpers()


# CreatiSignal visual language used by the current workspace.
BG = "#F5F4EE"
PANEL = "#FFFFFF"
INK = "#20231F"
MUTED = "#737971"
LINE = "#DDE1D8"
LIME = "#C9F36A"
LIME_DARK = "#627D16"
LIME_SOFT = "#EFF8D6"
BLUE = "#5D7FE8"
BLUE_SOFT = "#EEF2FF"
ORANGE = "#E99143"
ORANGE_SOFT = "#FFF2E7"
RED = "#D95850"
RED_SOFT = "#FDECEA"
GREEN = "#3F8F63"
GREEN_SOFT = "#E8F5EC"
PURPLE = "#8867CE"
PURPLE_SOFT = "#F2EDFF"
BLACK = "#171917"

FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")
FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold and FONT_BOLD.exists() else FONT_REGULAR
    if not path.exists():
        path = Path(r"C:\Windows\Fonts\arial.ttf")
    return ImageFont.truetype(str(path), size=size)


def rgb_tuple(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def wrap_text(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    if not value:
        return [""]
    lines: list[str] = []
    for source in value.split("\n"):
        current = ""
        for char in source:
            trial = current + char
            if current and draw.textlength(trial, font=fnt) > max_width:
                lines.append(current)
                current = char
            else:
                current = trial
        lines.append(current)
    return lines


def draw_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    size: int = 24,
    color: str = INK,
    bold: bool = False,
    max_width: int | None = None,
    line_gap: int = 8,
    anchor: str | None = None,
) -> int:
    fnt = font(size, bold)
    x, y = xy
    if max_width is None:
        draw.text((x, y), value, font=fnt, fill=rgb_tuple(color), anchor=anchor)
        return size + line_gap
    lines = wrap_text(draw, value, fnt, max_width)
    step = size + line_gap
    for idx, line in enumerate(lines):
        draw.text((x, y + idx * step), line, font=fnt, fill=rgb_tuple(color))
    return len(lines) * step


def rr(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int = 20,
       fill: str = PANEL, outline: str | None = LINE, width: int = 2) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=rgb_tuple(fill),
                           outline=rgb_tuple(outline) if outline else None, width=width)


def line(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill: str = LINE, width: int = 3) -> None:
    draw.line(points, fill=rgb_tuple(fill), width=width, joint="curve")


def pill(draw: ImageDraw.ImageDraw, x: int, y: int, value: str, fill: str, text_color: str = INK,
         size: int = 18, pad_x: int = 18, height: int = 38) -> int:
    fnt = font(size, True)
    width = int(draw.textlength(value, font=fnt)) + pad_x * 2
    rr(draw, (x, y, x + width, y + height), height // 2, fill, None, 0)
    draw.text((x + width // 2, y + height // 2), value, font=fnt, fill=rgb_tuple(text_color), anchor="mm")
    return width


def canvas(title: str, subtitle: str = "") -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (1600, 900), rgb_tuple(BG))
    d = ImageDraw.Draw(img)
    draw_text(d, (64, 46), title, 36, BLACK, True)
    if subtitle:
        draw_text(d, (64, 96), subtitle, 19, MUTED, False, max_width=1460, line_gap=5)
    return img, d


def save_visual(img: Image.Image, name: str) -> Path:
    VISUAL_DIR.mkdir(parents=True, exist_ok=True)
    path = VISUAL_DIR / name
    img.save(path, format="PNG", optimize=True)
    return path


def visual_data_access() -> Path:
    img, d = canvas("一级代理能拿到什么数据？", "核心结论：代理身份不等于无限权限；数据能力由客户授权、应用 Scope、账户类型与接口开放共同决定。")
    rows = [
        ("01", "Business Center / Ads", "账户、计划、素材、消耗、展示、点击、视频互动、状态与变更", "客户共享资产 + 账号角色", LIME_SOFT, LIME_DARK),
        ("02", "GMV Max 报表", "Campaign / Product / Creative：GMV、订单、成本、商品点击、Ad CVR、2s/6s/分段观看", "Seller Center / Business API 字段可用性", BLUE_SOFT, BLUE),
        ("03", "TikTok Shop Open API", "商品/SKU、价格库存、订单退款、履约、财务；Affiliate 另需权限", "Seller OAuth + 对应 Scope", ORANGE_SOFT, ORANGE),
        ("04", "客户测量与一方数据", "Pixel / Events API、站外事件、CRM、毛利、库存、活动与商品页变更", "客户部署并授权；非代理自动拥有", PURPLE_SOFT, PURPLE),
        ("05", "代理内部运营上下文", "投手备注、预算/目标变更、异常说明、策略标签、创意 Brief 与实验结果", "内部系统沉淀", GREEN_SOFT, GREEN),
    ]
    y = 162
    for number, source, data, gate, fill, accent in rows:
        rr(d, (64, y, 1536, y + 120), 22, PANEL, LINE, 2)
        rr(d, (84, y + 22, 148, y + 86), 18, fill, None, 0)
        draw_text(d, (116, y + 54), number, 20, accent, True, anchor="mm")
        draw_text(d, (174, y + 22), source, 24, BLACK, True)
        draw_text(d, (174, y + 58), data, 18, MUTED, False, max_width=890, line_gap=5)
        pill(d, 1190, y + 40, gate, fill, accent, 16, 16, 38)
        y += 132
    draw_text(d, (64, 838), "不可假设可得：竞品非公开数据、用户级明细、算法分发逻辑、未授权达人数据、原始拍卖日志。", 18, RED, True)
    return save_visual(img, "01-agency-data-access.png")


def visual_closed_loop() -> Path:
    img, d = canvas("从投放异常到新素材上线的闭环", "每个诊断快照只输出一个主诊断与一个主动作；证据、人工反馈、素材版本与投放结果全程可追溯。")
    steps = [
        ("1", "授权与数据健康", "账户 / Shop / Scope / 延迟"),
        ("2", "机会队列", "找出最值得处理的素材"),
        ("3", "漏斗诊断", "Hook / Body / Proof / CTA"),
        ("4", "素材拆解", "时间段 + 人物 + 场景 + 音画"),
        ("5", "动作配对", "锁定项 / 变量 / 置信度"),
        ("6", "增强复刻或生成", "产生 3-5 个显著差异变体"),
        ("7", "人工确认与发布", "不在 V1 自动改投放"),
        ("8", "观察与回流", "胜出 / 落败 / 不可判定"),
    ]
    positions = [(110, 225), (455, 225), (800, 225), (1145, 225), (1145, 555), (800, 555), (455, 555), (110, 555)]
    for idx, ((n, title, sub), (x, y)) in enumerate(zip(steps, positions)):
        fill = LIME_SOFT if idx in (2, 3, 4, 5) else PANEL
        accent = LIME_DARK if idx in (2, 3, 4, 5) else BLUE
        rr(d, (x, y, x + 280, y + 150), 24, fill, LINE, 2)
        rr(d, (x + 18, y + 20, x + 64, y + 66), 14, accent, None, 0)
        draw_text(d, (x + 41, y + 43), n, 18, "#FFFFFF", True, anchor="mm")
        draw_text(d, (x + 82, y + 20), title, 22, BLACK, True, max_width=180, line_gap=4)
        draw_text(d, (x + 22, y + 86), sub, 17, MUTED, False, max_width=235, line_gap=5)
    arrows = [
        ((390, 300), (455, 300)), ((735, 300), (800, 300)), ((1080, 300), (1145, 300)),
        ((1285, 375), (1285, 555)), ((1145, 630), (1080, 630)), ((800, 630), (735, 630)),
        ((455, 630), (390, 630)), ((110, 555), (110, 375)),
    ]
    for (x1, y1), (x2, y2) in arrows:
        line(d, [(x1, y1), (x2, y2)], LIME_DARK, 5)
        if x2 > x1:
            d.polygon([(x2, y2), (x2 - 14, y2 - 8), (x2 - 14, y2 + 8)], fill=rgb_tuple(LIME_DARK))
        elif x2 < x1:
            d.polygon([(x2, y2), (x2 + 14, y2 - 8), (x2 + 14, y2 + 8)], fill=rgb_tuple(LIME_DARK))
        elif y2 > y1:
            d.polygon([(x2, y2), (x2 - 8, y2 - 14), (x2 + 8, y2 - 14)], fill=rgb_tuple(LIME_DARK))
        else:
            d.polygon([(x2, y2), (x2 - 8, y2 + 14), (x2 + 8, y2 + 14)], fill=rgb_tuple(LIME_DARK))
    rr(d, (530, 416, 1070, 506), 22, BLACK, None, 0)
    draw_text(d, (800, 448), "诊断不是结论终点，而是下一次可验证素材实验的起点", 22, "#FFFFFF", True, anchor="mm")
    draw_text(d, (800, 480), "Diagnosis -> Action Intent -> Creative Version -> Delivery -> Result", 16, LIME, False, anchor="mm")
    return save_visual(img, "02-closed-loop.png")


def draw_sidebar(d: ImageDraw.ImageDraw, active: str) -> None:
    rr(d, (36, 34, 235, 866), 26, "#1F221F", None, 0)
    draw_text(d, (70, 68), "CreatiSignal", 25, "#FFFFFF", True)
    menu = ["经营总览", "素材诊断", "素材洞察", "高保真复刻", "视频生成", "任务记录"]
    y = 156
    for item in menu:
        if item == active:
            rr(d, (56, y - 10, 215, y + 38), 14, "#DDFC95", None, 0)
            draw_text(d, (76, y), item, 18, BLACK, True)
        else:
            draw_text(d, (76, y), item, 18, "#BEC3BA")
        y += 68


def visual_dashboard() -> Path:
    img = Image.new("RGB", (1600, 900), rgb_tuple(BG))
    d = ImageDraw.Draw(img)
    draw_sidebar(d, "素材诊断")
    draw_text(d, (278, 52), "素材优化机会队列", 34, BLACK, True)
    draw_text(d, (278, 100), "Hotligh · US Shop  /  Product GMV Max  /  最近 7 天  /  数据更新 10:20", 17, MUTED)
    filters = [("商品", "全部"), ("诊断", "需迭代"), ("置信度", "> 70%"), ("排序", "预估影响")]
    x = 278
    for label, value in filters:
        rr(d, (x, 142, x + 210, 194), 14, PANEL, LINE, 2)
        draw_text(d, (x + 14, 156), f"{label}  {value}", 16, BLACK, True)
        x += 226
    cards = [
        ("待处理素材", "12", "今日 +4", LIME_SOFT, LIME_DARK),
        ("风险消耗", "$6,420", "占总消耗 18%", ORANGE_SOFT, ORANGE),
        ("可直接复刻", "7", "局部变量明确", BLUE_SOFT, BLUE),
        ("需投手确认", "3", "信号冲突/样本不足", PURPLE_SOFT, PURPLE),
    ]
    x = 278
    for label, value, note, fill, accent in cards:
        rr(d, (x, 224, x + 292, 350), 22, PANEL, LINE, 2)
        rr(d, (x + 20, 244, x + 44, 268), 7, fill, None, 0)
        draw_text(d, (x + 56, 242), label, 17, MUTED, True)
        draw_text(d, (x + 20, 282), value, 31, BLACK, True)
        draw_text(d, (x + 20, 322), note, 15, accent, True)
        x += 310
    rr(d, (278, 382, 1540, 844), 22, PANEL, LINE, 2)
    headers = ["优先级", "商品 / 素材", "核心证据", "主诊断", "建议动作", "置信度"]
    widths = [110, 300, 330, 190, 205, 127]
    x = 298
    for hdr, w in zip(headers, widths):
        draw_text(d, (x, 404), hdr, 16, MUTED, True)
        x += w
    line(d, [(298, 442), (1520, 442)], LINE, 2)
    rows = [
        ("P1", "磁吸工作灯 · V27", "2s -24% / 6s|2s -18%", "Hook 吸引力不足", "替换 0-3s Hook", "86%", RED_SOFT, RED),
        ("P2", "便携榨汁杯 · V14", "2s 正常 / 25->50 -31%", "中段证明不足", "重排 Body + Proof", "81%", ORANGE_SOFT, ORANGE),
        ("P3", "免洗地板清洁器 · V08", "观看正常 / 商品点击 -22%", "商品利益不清", "强化卖点 + CTA", "78%", BLUE_SOFT, BLUE),
        ("P4", "女士塑形连衣裙 · V31", "全素材 Ad CVR 同降", "疑似商品/Offer", "交投手确认", "64%", PURPLE_SOFT, PURPLE),
    ]
    y = 462
    for priority, asset, evidence, diagnosis, action, confidence, fill, accent in rows:
        rr(d, (298, y + 4, 360, y + 42), 14, fill, None, 0)
        draw_text(d, (329, y + 23), priority, 16, accent, True, anchor="mm")
        draw_text(d, (408, y + 10), asset, 17, BLACK, True, max_width=260, line_gap=4)
        draw_text(d, (708, y + 10), evidence, 16, MUTED, False, max_width=292, line_gap=4)
        draw_text(d, (1038, y + 10), diagnosis, 16, BLACK, True, max_width=164, line_gap=4)
        rr(d, (1226, y + 5, 1400, y + 45), 14, LIME_SOFT, None, 0)
        draw_text(d, (1313, y + 25), action, 15, LIME_DARK, True, anchor="mm")
        draw_text(d, (1456, y + 10), confidence, 18, accent, True)
        y += 90
        line(d, [(298, y - 18), (1520, y - 18)], "#ECEEE9", 2)
    return save_visual(img, "03-opportunity-dashboard.png")


def visual_diagnosis_detail() -> Path:
    img = Image.new("RGB", (1600, 900), rgb_tuple(BG))
    d = ImageDraw.Draw(img)
    draw_sidebar(d, "素材诊断")
    draw_text(d, (278, 52), "素材诊断 · 磁吸工作灯 V27", 32, BLACK, True)
    draw_text(d, (278, 98), "Product GMV Max / Delivering / Active 9 天 / data_as_of 2026-08-31 10:20", 16, MUTED)
    # Video mock.
    rr(d, (278, 145, 584, 690), 24, "#252825", None, 0)
    rr(d, (310, 178, 552, 610), 20, "#424842", None, 0)
    d.ellipse((396, 332, 466, 402), fill=rgb_tuple(LIME))
    d.polygon([(424, 350), (424, 384), (451, 367)], fill=rgb_tuple(BLACK))
    draw_text(d, (352, 628), "00:00 / 00:18", 15, "#D9DDD6")
    pill(d, 300, 714, "主诊断：Hook", RED_SOFT, RED, 16, 14, 38)
    pill(d, 446, 714, "置信度 86%", LIME_SOFT, LIME_DARK, 16, 14, 38)
    # Evidence panel.
    rr(d, (616, 145, 1538, 438), 24, PANEL, LINE, 2)
    draw_text(d, (644, 170), "观看漏斗与同类基准", 22, BLACK, True)
    metrics = [("2s", 76, 58, "-24%"), ("6s|2s", 68, 56, "-18%"), ("25%", 50, 47, "-6%"), ("50%", 34, 33, "-3%"), ("100%", 15, 15, "0%")]
    x = 650
    for name, baseline, current, delta in metrics:
        draw_text(d, (x, 220), name, 15, MUTED, True)
        rr(d, (x, 254, x + 132, 274), 10, "#ECEFE8", None, 0)
        d.rounded_rectangle((x, 254, x + int(132 * current / 100), 274), radius=10, fill=rgb_tuple(LIME_DARK))
        draw_text(d, (x, 288), f"当前 {current}%", 15, BLACK, True)
        draw_text(d, (x, 318), f"基准 {baseline}%", 14, MUTED)
        draw_text(d, (x, 349), delta, 17, RED if delta != "0%" else GREEN, True)
        x += 172
    draw_text(d, (644, 392), "解释：首个注意力断点显著；进入正文后的条件留存接近同类素材。", 17, BLACK, True)
    # Recommendation panel.
    rr(d, (616, 466, 1538, 807), 24, PANEL, LINE, 2)
    draw_text(d, (644, 492), "确定性动作建议", 22, BLACK, True)
    rr(d, (644, 536, 1032, 768), 20, LIME_SOFT, None, 0)
    draw_text(d, (672, 562), "替换 0-3s Hook", 24, BLACK, True)
    draw_text(d, (672, 608), "锁定", 16, LIME_DARK, True)
    draw_text(d, (742, 608), "商品、人物、Body、Proof、CTA", 16, BLACK)
    draw_text(d, (672, 648), "变化", 16, RED, True)
    draw_text(d, (742, 648), "首帧、第一句口播、前 3 秒节奏", 16, BLACK)
    draw_text(d, (672, 690), "变体", 16, BLUE, True)
    draw_text(d, (742, 690), "结果先出 / 痛点冲突 / 价格利益", 16, BLACK)
    rr(d, (1060, 536, 1508, 648), 18, BLACK, None, 0)
    draw_text(d, (1086, 558), "进入增强复刻", 21, "#FFFFFF", True)
    draw_text(d, (1086, 596), "自动带入诊断、锁定项和 3 个 Hook Brief", 15, "#C9CEC5", max_width=380, line_gap=4)
    rr(d, (1060, 670, 1508, 768), 18, "#F4F5F2", LINE, 2)
    draw_text(d, (1086, 692), "投手反馈", 18, BLACK, True)
    draw_text(d, (1086, 726), "采纳  ·  改为中段问题  ·  暂不处理", 15, MUTED)
    return save_visual(img, "04-diagnosis-detail.png")


def visual_creative_breakdown() -> Path:
    img, d = canvas("粗粒度素材公式化拆解", "V1 先把时间结构与跨段元素拆开：Hook / Body / Proof / CTA 是叙事段落；人物、场景、商品、剪辑、字幕、音频等是跨段特征。")
    start_x, end_x = 110, 1490
    y = 210
    segments = [
        ("HOOK", "0-3s", 0.18, RED_SOFT, RED, "结果先出 + 痛点提问"),
        ("BODY", "3-9s", 0.34, BLUE_SOFT, BLUE, "卖点：磁吸 + 防水"),
        ("PROOF", "9-14s", 0.28, ORANGE_SOFT, ORANGE, "户外实测 + 泼水证明"),
        ("CTA", "14-18s", 0.20, GREEN_SOFT, GREEN, "限时折扣 + Shop Now"),
    ]
    total = end_x - start_x
    x = start_x
    for label, timing, share, fill, accent, desc in segments:
        w = int(total * share)
        rr(d, (x, y, x + w - 8, y + 150), 20, fill, None, 0)
        draw_text(d, (x + 22, y + 20), label, 22, accent, True)
        draw_text(d, (x + 22, y + 54), timing, 17, MUTED, True)
        draw_text(d, (x + 22, y + 90), desc, 17, BLACK, True, max_width=w - 48, line_gap=4)
        x += w
    line(d, [(110, 388), (1490, 388)], BLACK, 3)
    ticks = [(110, "0s"), (355, "3s"), (825, "9s"), (1210, "14s"), (1490, "18s")]
    for tx, label in ticks:
        line(d, [(tx, 380), (tx, 400)], BLACK, 3)
        draw_text(d, (tx, 410), label, 15, MUTED, True, anchor="ma")
    features = [
        ("出镜主体", "真人 1 人 · 中近景 · 正视 · 兴奋", LIME_SOFT, LIME_DARK),
        ("环境", "车库 / 户外夜间 · 高对比光线", BLUE_SOFT, BLUE),
        ("商品呈现", "0.8s 出现 · 占画面 38% · 3 个角度", ORANGE_SOFT, ORANGE),
        ("剪辑与镜头", "平均镜头 1.4s · 3 次硬切 · 1 次推近", PURPLE_SOFT, PURPLE),
        ("字幕与口播", "英文口播 + 大字利益点 · 6.2 字/秒", GREEN_SOFT, GREEN),
        ("音频", "真人口播 + 工具声效 · BGM 弱", RED_SOFT, RED),
        ("Offer / Claim", "20% OFF · 防水 12 小时续航（需证据）", ORANGE_SOFT, ORANGE),
        ("品牌 / 合规", "Logo 末段 · 商品一致 · 声明需审核", BLUE_SOFT, BLUE),
    ]
    x_positions = [110, 460, 810, 1160]
    y_positions = [520, 680]
    for idx, (label, desc, fill, accent) in enumerate(features):
        x = x_positions[idx % 4]
        yy = y_positions[idx // 4]
        rr(d, (x, yy, x + 310, yy + 120), 18, PANEL, LINE, 2)
        rr(d, (x + 18, yy + 18, x + 46, yy + 46), 8, fill, None, 0)
        draw_text(d, (x + 60, yy + 16), label, 18, accent, True)
        draw_text(d, (x + 20, yy + 58), desc, 15, MUTED, False, max_width=270, line_gap=4)
    return save_visual(img, "05-creative-breakdown.png")


def visual_action_mapping() -> Path:
    img, d = canvas("把数据信号配成确定性动作", "先经过非素材原因保护，再把最显著的漏斗断点映射到可编辑变量与产品入口。")
    headers = ["信号组合", "主诊断", "锁定不动", "优先变化", "去向"]
    widths = [400, 250, 280, 350, 180]
    x = 64
    for hdr, w in zip(headers, widths):
        rr(d, (x, 154, x + w - 8, 206), 14, "#272A27", None, 0)
        draw_text(d, (x + 16, 168), hdr, 17, "#FFFFFF", True)
        x += w
    rows = [
        ("2s/6s 低；进入正文后留存正常", "Hook 不足", "商品 / Body / Proof", "首帧、开场句、0-3s 节奏", "增强复刻", RED_SOFT, RED),
        ("2s/6s 正常；25->50% 断崖", "Body 不足", "Hook / 商品 / CTA", "顺序、镜头长度、卖点表达", "增强复刻", BLUE_SOFT, BLUE),
        ("观看正常；商品点击低", "利益/CTA 不清", "叙事基调", "商品露出、价格/利益、CTA", "增强复刻", LIME_SOFT, LIME_DARK),
        ("点击正常；Ad CVR 低", "Proof/Offer 风险", "Hook", "证据、评价、对比；同步检查 PDP", "复刻或转运营", ORANGE_SOFT, ORANGE),
        ("多素材同商品同步下滑", "非素材问题", "不生成素材结论", "价格/库存/评价/目标/审核", "投手工作台", PURPLE_SOFT, PURPLE),
        ("结构整体弱或需换人/场景", "概念需换新", "商品事实/合规边界", "人设、场景、叙事结构、Proof", "视频生成", GREEN_SOFT, GREEN),
    ]
    y = 224
    for row in rows:
        values, fill, accent = row[:5], row[5], row[6]
        x = 64
        for idx, (value, w) in enumerate(zip(values, widths)):
            cell_fill = fill if idx in (1, 4) else PANEL
            rr(d, (x, y, x + w - 8, y + 92), 14, cell_fill, LINE if idx not in (1, 4) else None, 2)
            color = accent if idx in (1, 4) else (BLACK if idx == 0 else MUTED)
            draw_text(d, (x + 14, y + 16), value, 15 if idx != 1 else 17, color, idx in (0, 1, 4), max_width=w - 38, line_gap=4)
            x += w
        y += 102
    draw_text(d, (64, 850), "冲突信号或低样本 -> 待观察；不得为了导流生成而强行归因为素材问题。", 18, RED, True)
    return save_visual(img, "06-action-mapping.png")


def visual_action_workspace() -> Path:
    img = Image.new("RGB", (1600, 900), rgb_tuple(BG))
    d = ImageDraw.Draw(img)
    draw_sidebar(d, "高保真复刻")
    draw_text(d, (278, 52), "从诊断创建素材任务", 32, BLACK, True)
    draw_text(d, (278, 98), "来源：磁吸工作灯 V27 · 主诊断 Hook 不足 · 置信度 86%", 17, MUTED)
    # Recommendation bar.
    rr(d, (278, 140, 1538, 232), 22, LIME_SOFT, None, 0)
    draw_text(d, (304, 160), "推荐：增强复刻", 22, BLACK, True)
    draw_text(d, (304, 195), "原因：原 Body / Proof / CTA 表现稳定，仅替换前 3 秒可获得最干净的单变量实验。", 16, LIME_DARK, True)
    # Left path.
    rr(d, (278, 264, 890, 832), 24, PANEL, LINE, 2)
    draw_text(d, (310, 292), "A. 增强复刻", 25, BLACK, True)
    pill(d, 690, 288, "推荐", LIME, BLACK, 16, 16, 38)
    draw_text(d, (310, 340), "锁定项", 17, MUTED, True)
    x, y = 310, 380
    for value in ["商品 SKU", "原人物", "Body", "Proof", "CTA", "时长 18s"]:
        w = pill(d, x, y, value, "#F0F1ED", BLACK, 15, 14, 36)
        x += w + 10
        if x > 790:
            x, y = 310, y + 48
    draw_text(d, (310, 480), "变化变量", 17, MUTED, True)
    x = 310
    for value in ["首帧", "第一句", "0-3s 节奏"]:
        w = pill(d, x, 520, value, RED_SOFT, RED, 15, 14, 36)
        x += w + 10
    draw_text(d, (310, 580), "生成变体", 17, MUTED, True)
    variants = ["V28 结果先出", "V29 痛点冲突", "V30 价格利益"]
    yy = 618
    for value in variants:
        rr(d, (310, yy, 850, yy + 50), 14, "#F7F8F5", LINE, 2)
        draw_text(d, (330, yy + 13), value, 16, BLACK, True)
        yy += 62
    rr(d, (620, 764, 850, 812), 15, BLACK, None, 0)
    draw_text(d, (735, 788), "生成 3 个版本", 17, "#FFFFFF", True, anchor="mm")
    # Right path.
    rr(d, (918, 264, 1538, 832), 24, PANEL, LINE, 2)
    draw_text(d, (950, 292), "B. 视频生成", 25, BLACK, True)
    pill(d, 1278, 288, "结构性换新", BLUE_SOFT, BLUE, 16, 16, 38)
    draw_text(d, (950, 340), "适用条件", 17, MUTED, True)
    checks = ["需要换人设 / 场景", "原 Proof 无法局部修复", "需测试全新叙事结构", "原素材授权或质量不可用"]
    yy = 382
    for item in checks:
        rr(d, (950, yy, 986, yy + 36), 10, BLUE_SOFT, None, 0)
        line(d, [(959, yy + 18), (966, yy + 25), (978, yy + 10)], BLUE, 4)
        draw_text(d, (1002, yy + 7), item, 16, BLACK)
        yy += 54
    draw_text(d, (950, 606), "自动带入 Brief", 17, MUTED, True)
    rr(d, (950, 646, 1506, 746), 16, "#F7F8F5", LINE, 2)
    draw_text(d, (974, 666), "商品事实 · 失败元素 · 推荐 Hook · Proof 类型", 16, BLACK, True)
    draw_text(d, (974, 704), "合规声明 · 目标市场 · 画幅 · 语言 · 实验变量", 15, MUTED)
    rr(d, (1276, 764, 1506, 812), 15, BLUE, None, 0)
    draw_text(d, (1391, 788), "创建新创意", 17, "#FFFFFF", True, anchor="mm")
    return save_visual(img, "07-action-workspace.png")


def visual_experiment_feedback() -> Path:
    img, d = canvas("变体实验与结果回流", "只有同时满足观察时间和样本门槛才判 Winner；不可比或数据不足统一输出 Inconclusive。")
    rr(d, (64, 152, 980, 806), 24, PANEL, LINE, 2)
    draw_text(d, (92, 180), "V27 原素材 vs 3 个 Hook 变体", 23, BLACK, True)
    # chart axes
    line(d, [(150, 690), (900, 690)], BLACK, 3)
    line(d, [(150, 280), (150, 690)], BLACK, 3)
    for value, y in [(0, 690), (25, 590), (50, 490), (75, 390), (100, 290)]:
        line(d, [(140, y), (900, y)], "#E8EAE5", 2)
        draw_text(d, (124, y - 10), str(value), 14, MUTED, False, anchor="ra")
    bars = [
        ("V27 原", 58, 1.42, "#A9ADA7"),
        ("V28 结果", 72, 1.66, LIME_DARK),
        ("V29 痛点", 68, 1.58, BLUE),
        ("V30 价格", 61, 1.44, ORANGE),
    ]
    x = 220
    for label, hook_score, roi, color in bars:
        top = 690 - int(hook_score * 4)
        d.rounded_rectangle((x, top, x + 92, 690), radius=16, fill=rgb_tuple(color))
        draw_text(d, (x + 46, top - 32), f"{hook_score}", 18, color, True, anchor="mm")
        draw_text(d, (x + 46, 716), label, 15, BLACK, True, anchor="ma")
        draw_text(d, (x + 46, 756), f"ROI {roi:.2f}", 14, MUTED, True, anchor="ma")
        x += 170
    draw_text(d, (94, 238), "Hook 健康分（0-100）", 16, MUTED, True)
    rr(d, (1012, 152, 1536, 806), 24, PANEL, LINE, 2)
    draw_text(d, (1040, 180), "验收状态", 23, BLACK, True)
    states = [
        ("已发布", "8/31 12:10", GREEN_SOFT, GREEN),
        ("观察中", "已满 48h；订单 19/20", BLUE_SOFT, BLUE),
        ("可验收", "观察 72h + 订单≥20", LIME_SOFT, LIME_DARK),
        ("Winner", "V28：Hook +14pt，GMV +18%", LIME, BLACK),
        ("回流", "更新 Hook 模板与推荐权重", PURPLE_SOFT, PURPLE),
    ]
    yy = 242
    for idx, (label, note, fill, accent) in enumerate(states):
        rr(d, (1040, yy, 1506, yy + 86), 18, fill, None, 0)
        rr(d, (1060, yy + 21, 1104, yy + 65), 13, accent, None, 0)
        draw_text(d, (1082, yy + 43), str(idx + 1), 17, "#FFFFFF" if accent != BLACK else "#FFFFFF", True, anchor="mm")
        draw_text(d, (1124, yy + 16), label, 18, BLACK, True)
        draw_text(d, (1124, yy + 49), note, 15, accent if accent != BLACK else BLACK, True, max_width=350, line_gap=4)
        if idx < len(states) - 1:
            line(d, [(1082, yy + 86), (1082, yy + 104)], LINE, 4)
        yy += 104
    return save_visual(img, "08-experiment-feedback.png")


def visual_three_entry_paths() -> Path:
    img, d = canvas("三种素材入口，一套诊断与生成闭环", "投放数据决定诊断深度，但不决定用户能否开始；无数据素材先做可观察的结构质量评估。")
    cards = [
        (64, "A  有投放数据", "TikTok Shop / GMV Max", "指标 + 投放上下文 + 视频", "数据驱动诊断", LIME_SOFT, LIME_DARK),
        (560, "B  自有未投素材", "用户上传 / 历史素材", "画面 + ASR + OCR + 音频", "冷启动素材体检", BLUE_SOFT, BLUE),
        (1056, "C  外部参考素材", "其他渠道“爆款”", "来源/授权 + 结构特征", "参考机制迁移", ORANGE_SOFT, ORANGE),
    ]
    for x, title, source, inputs, mode, fill, accent in cards:
        rr(d, (x, 160, x + 430, 408), 24, PANEL, LINE, 2)
        rr(d, (x + 22, 184, x + 408, 238), 16, fill, None, 0)
        draw_text(d, (x + 42, 198), title, 20, accent, True)
        draw_text(d, (x + 28, 270), source, 17, BLACK, True, max_width=368, line_gap=4)
        draw_text(d, (x + 28, 310), inputs, 16, MUTED, max_width=368, line_gap=4)
        pill(d, x + 28, 352, mode, fill, accent, 15, 14, 36)
        line(d, [(x + 215, 408), (x + 215, 478)], accent, 4)
        d.polygon([(x + 215, 488), (x + 207, 474), (x + 223, 474)], fill=rgb_tuple(accent))

    rr(d, (240, 500, 1360, 626), 24, "#242724", None, 0)
    draw_text(d, (800, 526), "统一素材理解层", 24, "#FFFFFF", True, anchor="ma")
    draw_text(d, (800, 568), "Hook / Body / Proof / CTA  +  人物 / 场景 / 商品 / 剪辑 / 字幕 / 音频 / 合规", 17, LIME, True, anchor="ma")
    draw_text(d, (800, 600), "输出只包含可观察结论；无数据时不预测 CTR、CVR 或 ROI", 15, "#C8CDC5", anchor="ma")
    line(d, [(800, 626), (800, 688)], LIME_DARK, 5)
    d.polygon([(800, 700), (790, 682), (810, 682)], fill=rgb_tuple(LIME_DARK))

    outputs = [
        (250, "保留", "已有优点与硬约束", GREEN_SOFT, GREEN),
        (590, "优化", "可定位的结构缺口", RED_SOFT, RED),
        (930, "待验证", "需要投放数据的假设", PURPLE_SOFT, PURPLE),
    ]
    for x, label, note, fill, accent in outputs:
        rr(d, (x, 710, x + 300, 812), 20, fill, None, 0)
        draw_text(d, (x + 24, 730), label, 21, accent, True)
        draw_text(d, (x + 24, 770), note, 15, BLACK, True, max_width=252, line_gap=4)
    draw_text(d, (800, 844), "确认后进入：增强复刻（最小变量）  /  视频生成（结构换新）  /  待投放验证", 17, BLACK, True, anchor="ma")
    return save_visual(img, "09-three-entry-paths.png")


def visual_cold_start_assessment() -> Path:
    img = Image.new("RGB", (1600, 900), rgb_tuple(BG))
    d = ImageDraw.Draw(img)
    draw_sidebar(d, "素材诊断")
    draw_text(d, (278, 52), "冷启动素材体检", 32, BLACK, True)
    draw_text(d, (278, 98), "来源：用户上传  /  无投放数据  /  目标：US TikTok Shop  /  品类：家居工具", 16, MUTED)
    pill(d, 1322, 48, "非投放预测", ORANGE_SOFT, ORANGE, 15, 14, 36)

    rr(d, (278, 146, 600, 654), 24, "#262926", None, 0)
    rr(d, (310, 178, 568, 578), 20, "#424842", None, 0)
    d.ellipse((400, 328, 478, 406), fill=rgb_tuple(LIME))
    d.polygon([(432, 346), (432, 388), (464, 367)], fill=rgb_tuple(BLACK))
    draw_text(d, (332, 596), "reference_worklight_18s.mp4", 15, "#E0E4DD")
    draw_text(d, (310, 682), "视频理解完整度 92%", 17, BLACK, True)
    draw_text(d, (310, 718), "ASR 已完成  /  OCR 已完成  /  商品匹配已完成  /  音频已完成", 15, MUTED)

    rr(d, (630, 146, 1538, 454), 24, PANEL, LINE, 2)
    draw_text(d, (658, 172), "可观察结构质量", 22, BLACK, True)
    scores = [("Hook", 72, RED), ("商品清晰度", 88, GREEN), ("Body", 61, BLUE), ("Proof", 48, ORANGE), ("CTA", 57, PURPLE), ("平台原生感", 76, LIME_DARK)]
    x_positions = [658, 1088]
    yy = [224, 288, 352]
    for idx, (label, score, color) in enumerate(scores):
        x = x_positions[idx % 2]
        y = yy[idx // 2]
        draw_text(d, (x, y), label, 16, BLACK, True)
        rr(d, (x + 138, y + 2, x + 338, y + 22), 10, "#ECEFE8", None, 0)
        d.rounded_rectangle((x + 138, y + 2, x + 138 + int(200 * score / 100), y + 22), radius=10, fill=rgb_tuple(color))
        draw_text(d, (x + 350, y - 3), str(score), 16, color, True)
    draw_text(d, (658, 414), "评分表示结构质量，不等于爆款概率或效果预估。", 15, RED, True)

    columns = [
        (630, "保留", ["商品 0.8s 出现", "夜间实测环境", "真人演示方式"], GREEN_SOFT, GREEN),
        (928, "优化", ["开场利益点偏弱", "Proof 缺前后对比", "CTA 出现过晚"], RED_SOFT, RED),
        (1226, "待验证", ["Hook 是否提升留存", "Offer 是否促进转化", "市场/受众匹配"], PURPLE_SOFT, PURPLE),
    ]
    for x, label, items, fill, accent in columns:
        rr(d, (x, 486, x + 282, 722), 20, fill, None, 0)
        draw_text(d, (x + 22, 508), label, 20, accent, True)
        y = 556
        for item in items:
            rr(d, (x + 20, y, x + 38, y + 18), 6, accent, None, 0)
            draw_text(d, (x + 50, y - 3), item, 14, BLACK, True, max_width=205, line_gap=3)
            y += 54

    rr(d, (630, 758, 1078, 826), 18, BLACK, None, 0)
    draw_text(d, (854, 792), "增强复刻：只换 Hook + 补 Proof", 17, "#FFFFFF", True, anchor="mm")
    rr(d, (1100, 758, 1538, 826), 18, BLUE, None, 0)
    draw_text(d, (1319, 792), "视频生成：测试新概念", 17, "#FFFFFF", True, anchor="mm")
    return save_visual(img, "10-cold-start-assessment.png")


def build_visuals() -> dict[str, Path]:
    return {
        "access": visual_data_access(),
        "loop": visual_closed_loop(),
        "dashboard": visual_dashboard(),
        "diagnosis": visual_diagnosis_detail(),
        "breakdown": visual_creative_breakdown(),
        "mapping": visual_action_mapping(),
        "workspace": visual_action_workspace(),
        "feedback": visual_experiment_feedback(),
        "three_paths": visual_three_entry_paths(),
        "cold_start": visual_cold_start_assessment(),
    }


def add_bullet(doc: Document, text: str, num_id: int, bold_prefix: str | None = None) -> None:
    p = doc.add_paragraph(style="Normal")
    h.apply_numbering(p, num_id)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        h.set_run_font(r1, 11, h.INK, bold=True)
        r2 = p.add_run(text[len(bold_prefix) :])
        h.set_run_font(r2, 11, h.BLACK)
    else:
        r = p.add_run(text)
        h.set_run_font(r, 11, h.BLACK)


def add_numbered(doc: Document, text: str, num_id: int, bold_prefix: str | None = None) -> None:
    add_bullet(doc, text, num_id, bold_prefix)


def add_formula(doc: Document, name: str, formula: str, note: str) -> None:
    p = doc.add_paragraph(style="Normal")
    p.paragraph_format.left_indent = Inches(0.14)
    p.paragraph_format.right_indent = Inches(0.08)
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(7)
    p_pr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), "F4F6F1")
    p_pr.append(shd)
    r1 = p.add_run(f"{name}  ")
    h.set_run_font(r1, 10.5, h.DARK_BLUE, bold=True)
    r2 = p.add_run(formula)
    h.set_run_font(r2, 10.2, h.BLACK, bold=True, name="Consolas")
    r3 = p.add_run(f"\n{note}")
    h.set_run_font(r3, 9.4, h.MUTED)


def add_figure(doc: Document, path: Path, caption: str, alt: str, width: float = 6.5) -> None:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run()
    shape = run.add_picture(str(path), width=Inches(width))
    shape._inline.docPr.set("descr", alt)
    cp = doc.add_paragraph(style="Caption Text")
    cp.paragraph_format.keep_with_next = False
    cp.add_run(caption)


def add_hyperlink(paragraph, text: str, url: str) -> None:
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)
    new_run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), "2E74B5")
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.append(color)
    r_pr.append(underline)
    new_run.append(r_pr)
    text_node = OxmlElement("w:t")
    text_node.text = text
    new_run.append(text_node)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_source(doc: Document, code: str, title: str, url: str, note: str) -> None:
    p = doc.add_paragraph(style="Normal")
    p.paragraph_format.space_after = Pt(5)
    r1 = p.add_run(f"[{code}] ")
    h.set_run_font(r1, 10.5, h.INK, bold=True)
    add_hyperlink(p, title, url)
    r2 = p.add_run(f" — {note}")
    h.set_run_font(r2, 10.2, h.MUTED)


def add_section_intro(doc: Document, text: str) -> None:
    h.add_callout(doc, "本章要回答", text, fill="F1F7DE", accent="627D16")


def add_module_spec(
    doc: Document,
    code: str,
    title: str,
    priority: str,
    purpose: str,
    entry: str,
    inputs: Iterable[str],
    logic: Iterable[str],
    outputs: Iterable[str],
    exceptions: Iterable[str],
    acceptance: Iterable[str],
    bullet_id: int,
) -> None:
    doc.add_heading(f"{code} {title}（{priority}）", level=2)
    h.add_labeled(doc, "业务目的", purpose)
    h.add_labeled(doc, "用户入口", entry)
    doc.add_heading("输入", level=3)
    for item in inputs:
        add_bullet(doc, item, bullet_id)
    doc.add_heading("核心逻辑与交互", level=3)
    for item in logic:
        add_bullet(doc, item, bullet_id)
    doc.add_heading("输出", level=3)
    for item in outputs:
        add_bullet(doc, item, bullet_id)
    doc.add_heading("异常与保护", level=3)
    for item in exceptions:
        add_bullet(doc, item, bullet_id)
    doc.add_heading("验收", level=3)
    for item in acceptance:
        add_bullet(doc, item, bullet_id)


def build_doc() -> None:
    visuals = build_visuals()
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    doc = Document()
    h.configure_page(doc)
    h.configure_styles(doc)
    h.configure_header_footer(doc)
    bullet_id = h.add_num_definition(doc, "bullet")
    number_id = h.add_num_definition(doc, "decimal")

    # Compact reference guide preset, with a memo masthead opening.
    header = doc.sections[0].header.paragraphs[0]
    header.clear()
    hr = header.add_run("CreatiSignal  |  TikTok Shop 素材诊断与迭代闭环 PRD")
    h.set_run_font(hr, 9, h.MUTED, bold=True)

    settings = doc.settings._element
    update_fields = OxmlElement("w:updateFields")
    update_fields.set(qn("w:val"), "true")
    settings.append(update_fields)

    props = doc.core_properties
    props.title = "CreatiSignal TikTok Shop 投放素材诊断与迭代闭环 PRD"
    props.subject = "从投放数据、冷启动视频理解与投手判断出发，完成素材诊断、公式化拆解、动作配对、增强复刻/视频生成与结果回流"
    props.author = "CreatiSignal Product"
    props.keywords = "TikTok Shop, Product GMV Max, 素材诊断, 冷启动体检, 爆款参考迁移, Hook, Body, Proof, CTA, 增强复刻, 视频生成"
    props.comments = "V1.1, cold-start assessment and reference migration added on 2026-08-31"

    # Cover / memo masthead.
    kicker = doc.add_paragraph()
    kicker.paragraph_format.space_before = Pt(16)
    kicker.paragraph_format.space_after = Pt(5)
    kr = kicker.add_run("PRODUCT REQUIREMENTS DOCUMENT · SOLUTION BLUEPRINT")
    h.set_run_font(kr, 10, h.GREEN, bold=True)

    title = doc.add_paragraph(style="Title")
    title.add_run("TikTok Shop 投放素材诊断与迭代闭环")
    subtitle = doc.add_paragraph(style="Subtitle")
    subtitle.add_run("把投放数据与投手体感，转成可解释诊断、可执行素材动作与可验证生成实验")
    h.add_labeled(doc, "版本", "V1.1（评审稿）")
    h.add_labeled(doc, "日期", "2026-08-31")
    h.add_labeled(doc, "目标读者", "产品、投放 AO、创意策略、数据/算法、前后端、生成平台、客户成功")
    h.add_labeled(doc, "首期范围", "Product GMV Max 数据诊断 + 无数据素材冷启动体检；兼容标准 TikTok Shop Ads 降级路径")
    h.add_labeled(doc, "文档状态", "可进入产品/数据联合评审；字段权限、阈值与归因口径需在目标客户账号做样本探测")

    h.add_callout(
        doc,
        "V1.1 新增",
        "新增无投放数据的冷启动素材体检、外部“爆款”参考迁移、保留/优化/待验证决策、结构质量与识别置信度模型，以及对应的 M00 功能和两张产品示意图。",
        fill="EEF2FF",
        accent=h.BLUE,
    )

    h.add_callout(
        doc,
        "一句话方案",
        "用一套统一素材理解层拆解 Hook / Body / Proof / CTA 及人物、场景、商品露出等可编辑元素：有投放数据时结合 Product × Creative × Context 快照做证据诊断，无数据时输出保留/优化/待验证的冷启动建议；再由用户确认后进入增强复刻或视频生成，并用后续投放结果回流校准。",
        fill=h.LIME_SOFT,
        accent=h.GREEN,
    )

    doc.add_heading("阅读导航", level=1)
    nav_rows = [
        ["管理层 / 业务", "第 1-3、10-11 章", "定位、价值、范围、路线图与成功指标"],
        ["投放 / 创意", "第 3-7 章", "用户旅程、行业 Know How、诊断与动作配对"],
        ["数据 / 算法", "第 2、5、8 章", "数据权限、指标口径、模型、实体与接口"],
        ["产品 / 设计 / 研发", "第 6-9、12 章", "功能模块、页面状态、验收与开放问题"],
    ]
    h.add_table(doc, ["读者", "优先阅读", "核心内容"], nav_rows, [1700, 1700, 5960])
    doc.add_page_break()

    # 1.
    doc.add_heading("1. 执行摘要与产品边界", level=1)
    add_section_intro(doc, "为什么要做、做成什么、首期哪些判断必须克制。")
    h.add_body(doc, "当前投放复盘通常停留在“某条素材 CTR/ROI 低”或依赖投手体感。真正缺失的是一条可复用链路：有数据时先确认诊断资格，再定位注意力、内容承接、商品点击、转化或非素材原因；没有数据时，仍应允许用户上传自有素材或外部参考素材，由视频理解模型评估可观察的结构质量。两条路径最终都将结论映射到具体可改元素，并带着锁定项与变量进入生成工具。")
    doc.add_heading("1.1 核心产品决策", level=2)
    decisions = [
        "V1 以 Product GMV Max 为首要场景。原因是其商品 × 创意报告可形成从观看到商品点击、Ad CVR、订单与 Gross revenue 的更完整链路；标准 TikTok Shop Ads 走 account/campaign/adgroup/ad 粒度的降级模型。",
        "一级代理身份不等于拥有客户所有数据。系统必须先建立 capability_profile，展示已授权资产、可用指标、接口延迟与缺失原因，再决定诊断能力。",
        "V1 采用混合式方案：确定性保护规则 + 稳健统计基准 + 多模态素材拆解 + 投手确认；不直接以黑盒模型替代投手。",
        "无数据时启用 cold_start_assessment：只判断画面、叙事、商品、Proof、CTA、音画与合规等可观察特征；不预测 CTR、CVR、ROI 或“爆款概率”。",
        "外部渠道素材默认为 SELF_DECLARED_REFERENCE，仅抽取结构机制、情绪曲线、镜头节奏和证明方式；人脸、声音、商标和原创画面必须经授权才能直接复用。",
        "同一诊断快照只输出一个主诊断、一个主动作；可保留次级假设，但不能同时给用户多个互相冲突的 CTA。",
        "推荐的默认终点是“生成可测试变体”，不是“自动暂停素材”。涉及投放写操作、预算、Target ROI、素材授权或停用关系时必须人工确认。",
        "素材质量与素材疲劳分开建模：新素材可以一开始就弱，但不应被叫做疲劳；疲劳必须包含相对自身历史的衰减证据。",
    ]
    for item in decisions:
        add_bullet(doc, item, bullet_id)

    doc.add_heading("1.2 三种实现路径与选择", level=2)
    approach_rows = [
        ["纯规则", "快、透明、易评审", "阈值僵硬；跨品类泛化差", "只适合作为 V0 保护与显性规则"],
        ["端到端机器学习", "可学习复杂组合", "需要高质量标签；解释和冷启动困难", "不建议直接做 V1 主判断"],
        ["混合式（推荐）", "保护规则可控；统计诊断可解释；可逐步学习", "工程链路较长", "V1 主方案"],
    ]
    h.add_table(doc, ["路径", "优点", "主要风险", "结论"], approach_rows, [1600, 2300, 3000, 2460])
    doc.add_heading("1.3 首期非目标", level=2)
    for item in [
        "不覆盖 LIVE GMV Max；其归因、素材形态和直播运营节奏需单独建模。",
        "不承诺从聚合指标得出严格因果结论；输出的是证据支持的诊断假设与可验证动作。",
        "不自动抓取或推断竞品非公开投放数据、用户级个人数据、原始拍卖日志或平台算法逻辑。",
        "不在 V1 自动修改预算、Target ROI、商品-素材关系或投放状态。",
        "不在粗粒度拆解阶段推断敏感人口属性；人物只标注出镜类型、人数、景别、表情、动作与身份引用。",
        "不把无数据素材的结构评分包装成投放效果预测；“爆款”标签如无可验证数据，必须显示为用户声明。",
    ]:
        add_bullet(doc, item, bullet_id)
    add_figure(doc, visuals["loop"], "图 1  投放素材诊断与迭代闭环", "从授权与数据健康到机会队列、素材诊断、素材拆解、动作配对、生成、发布和结果回流的八步闭环")
    add_figure(doc, visuals["three_paths"], "图 2  有数据诊断、无数据体检与外部参考迁移的统一入口", "三种素材入口共享统一素材理解层，并输出保留、优化和待验证决策")

    # 2.
    doc.add_heading("2. 一级代理的数据可得性与授权边界", level=1)
    add_section_intro(doc, "作为一级广告代理，哪些数据可能获得、如何获得、哪些不能默认获得。")
    h.add_callout(doc, "关键原则", "TikTok Business Center 的账户/资产权限由客户逐项分享，Admin、Operator、Analyst 的可操作范围不同；合作伙伴关系本身不替代客户授权。TikTok Shop Open API 还需应用、Seller OAuth 与对应 Scope。参见 S1、S2、S8。", fill="FFF4E5", accent="A15C00")
    add_figure(doc, visuals["access"], "图 3  一级代理的数据能力分层与权限闸门", "一级代理通过广告账户、GMV Max、TikTok Shop Open API、客户测量和内部运营获得数据，但每层都有授权条件")

    doc.add_heading("2.1 可获得的数据层", level=2)
    access_rows = [
        ["广告账户与 Business Center", "账户/计划/广告组/广告/素材 ID、状态、预算、目标、消耗、展示、点击、视频互动、部分受众/地域/版位聚合", "客户共享相应账户与资产；API Token 与角色权限", "高"],
        ["Product GMV Max 报表", "Campaign、Product、Creative；Orders、Gross revenue、Cost、CPO、ROI、商品展示/点击、Product ad click rate、Ad CVR、2s/6s/25/50/75/100%", "GMV Max 权限；字段可能按账号/市场开放", "最高"],
        ["TikTok Shop Open API", "Shop、商品/SKU、价格、库存、订单、退款、履约、财务；Affiliate 数据视单独权限", "Seller/Creator/Partner 不同 OAuth；Scope 审核", "高"],
        ["Pixel / Events API / MMP", "站外浏览、加购、支付、App 事件、测量诊断", "客户完成部署与授权；Shop 原生链路不等于自动具备站外事件", "条件性"],
        ["内部投放与创意上下文", "投手体感、预算/目标变更、活动、价格、库存、素材授权、Brief、生成版本、人工反馈", "代理内部系统与客户协作", "必须自建"],
    ]
    h.add_table(doc, ["层级", "数据与上下文", "前置条件", "V1 价值"], access_rows, [1700, 3650, 2850, 1160], keep_rows=False)

    doc.add_heading("2.2 Product GMV Max 的关键字段", level=2)
    h.add_body(doc, "TikTok 官方说明，Product GMV Max 会综合 paid 与 organic 流量；在产品/创意报告中可查看商品、创意状态、Owner/Authorization Type，以及商业指标、商品点击和分段观看指标，但部分指标可能尚未对所有账号开放（S3、S4、S5）。")
    gmv_rows = [
        ["经营结果", "Gross revenue, Orders (SKU), Cost, Cost per order, ROI", "判断 GMV 规模与效率；ROI/CPO 不可单独判视频质量"],
        ["商品意图", "Product impressions, Product ad clicks, Product ad click rate, Ad CVR", "定位看完是否愿意点、点后是否愿意买"],
        ["视频观看", "2s, 6s, 25%, 50%, 75%, 100% ad video view rate", "定位前段与中后段留存断点"],
        ["素材上下文", "TikTok Account, Authorization Type, In Queue/Learning/Delivering 等状态", "判断是否可投、是否仍在学习、来源与授权风险"],
        ["计划上下文", "campaign/product、预算/目标、运行时间、状态、变更日志", "避免把投放/商品问题误判为素材问题"],
    ]
    h.add_table(doc, ["模块", "指标/维度", "用途"], gmv_rows, [1700, 3500, 4160])

    doc.add_heading("2.3 必须显式标记的不可得与限制", level=2)
    for item in [
        "字段缺失不等于指标为 0；所有 rate/score 计算均需支持 null、not_supported、not_authorized、delayed。",
        "GMV Max Gross revenue、Orders、ROI 受 paid + organic 归因口径影响；不可把 ROI 低直接等同于创意无效。TikTok 官方建议在评估产品/视频质量时重点结合 Gross revenue（S4、S5）。",
        "Product GMV Max 的同日订单采用一日归因窗，并可能把未直接与广告互动的相应商品订单归因到 GMV Max；诊断页面必须显示 attribution_scope（S5、S6）。",
        "达人/Creator 侧数据、Affiliate API 或批量授权并非 Seller Token 天然包含；Creator 与 Seller 授权凭证不可混用。",
        "用户级观看序列、原始人群列表、平台投放探索逻辑和竞品后台数据不进入方案。",
    ]:
        add_bullet(doc, item, bullet_id)

    doc.add_heading("2.4 Capability Profile（数据能力画像）", level=2)
    cap_rows = [
        ["授权", "advertiser/shop/tiktok account/catalog/pixel/audience 是否共享", "决定可读维度与可写动作"],
        ["接口", "Business API、Shop API、手动导出、Webhook", "决定自动化程度与更新频率"],
        ["粒度", "campaign / product / creative / video / post / day", "决定诊断主键"],
        ["字段", "metric_name、source、availability、permission、last_seen", "决定模型是否可计算"],
        ["质量", "data_as_of、latency、completeness、attribution_window、currency/timezone", "决定结论可信度"],
    ]
    h.add_table(doc, ["能力块", "记录内容", "产品作用"], cap_rows, [1600, 4100, 3660])

    # 3.
    doc.add_heading("3. 用户角色、用户旅程与核心场景", level=1)
    add_section_intro(doc, "谁在什么时刻使用产品，以及诊断如何自然导向增强复刻或视频生成。")
    persona_rows = [
        ["投放 AO", "快速识别值得处理的素材；校验算法建议", "数据分散、误判成本高、无法直接形成 Brief"],
        ["卖家/品牌创意负责人", "上传未投素材或外部参考，先获得可执行建议", "没有投放数据时无从判断保留什么、先改什么"],
        ["创意策略/策划", "理解素材哪里失效，定义单变量/结构性迭代", "投放语言难翻译成创意动作"],
        ["剪辑/生成运营", "拿到锁定项、变量与可执行 Brief", "需求模糊导致只换字幕/颜色等弱变化"],
        ["客户负责人", "解释为什么改、预估影响、追踪结果", "缺乏审计证据和复盘闭环"],
        ["数据/算法", "稳定口径、降低误报、获得反馈标签", "缺少人工纠正与实验回流"],
    ]
    h.add_table(doc, ["角色", "核心任务", "当前痛点"], persona_rows, [1700, 3400, 4260])

    doc.add_heading("3.1 三类素材入口", level=2)
    entry_rows = [
        ["有投放数据", "TikTok Shop / GMV Max / 标准 Shop Ads", "投放指标 + 上下文 + 素材理解", "数据诊断；可评估表现缺口和疲劳"],
        ["自有未投素材", "用户上传、历史库、新产品样片", "视频 + 商品事实 + 目标市场/品类", "冷启动结构体检；不预测投放效果"],
        ["外部参考素材", "Meta/Reels/YouTube Shorts/自然流等", "视频 + 来源/授权 + 目标渠道与 SKU", "抽取机制并做本地化迁移；不默认真实爆款"],
    ]
    h.add_table(doc, ["入口", "来源", "输入", "可输出结论"], entry_rows, [1900, 2300, 2850, 2310], keep_rows=False)

    doc.add_heading("3.2 统一用户旅程", level=2)
    journey = [
        "选择素材入口：选择有投放数据的账户素材，或上传自有未投/外部参考素材；后两者需补充来源、授权、目标市场、品类与 SKU。",
        "分流与数据检查：有数据时选择平台、Shop、广告账户、模式和时间范围；无数据时进入 cold_start_assessment，不展示虚假投放指标。",
        "进入机会队列：系统按影响、置信度和可执行性排序，不只是按 ROI 从低到高。",
        "打开诊断详情：查看当前值、同类基准、历史趋势、素材状态、变更事件与主诊断证据。",
        "查看公式化拆解：播放视频时同步显示 Hook / Body / Proof / CTA 段落和人物、场景、商品、剪辑、字幕、音频等标签；冷启动模式同时给出保留/优化/待验证。",
        "投手确认：采纳、修改主诊断、标记为非素材问题或暂不处理；输入体感备注形成训练标签。",
        "创建动作：系统给出锁定项、变化变量、建议变体数与实验假设；用户选择增强复刻或视频生成。",
        "生成与审核：生成任务继承 diagnosis_snapshot_id；每个素材版本记录来源、变量和模型配置。",
        "发布与观察：人工确认发布/投放；系统同步真实平台状态，不把“创建成功”显示成“正在投放”。",
        "结果回流：达到观察时长与样本门槛后判断 Winner/Loser/Inconclusive，并更新规则、模板与推荐权重。",
    ]
    for item in journey:
        add_numbered(doc, item, number_id)

    doc.add_heading("3.3 典型场景", level=2)
    scenario_rows = [
        ["播放量高但前段留存低", "投放给了量，但 2s/6s 代理指标弱", "替换 Hook；保留正文/证明/CTA；进入增强复刻"],
        ["前段正常、整体完播低", "中段节奏或说服链路不足", "重排 Body / Proof，缩短铺垫、增加演示/对比"],
        ["观看正常、商品点击低", "商品露出、利益点或 CTA 不清", "强化商品占比、价格/利益、购买理由与 CTA"],
        ["点击正常、Ad CVR 低", "Proof/Offer/PDP/价格/物流/评价可能有问题", "先做非素材保护；可补证据型变体"],
        ["Gross revenue 高、ROI 下降", "可能是高消耗高产出，不应简单停", "结合规模与边际趋势；继续投放或补供给"],
        ["同商品所有素材同步下滑", "更可能是商品、库存、价格、目标或平台状态", "转投手/商品运营，不导流生成"],
        ["结构、人物与场景均需换", "局部替换无法形成显著差异", "进入视频生成，创建新概念"],
        ["自有素材尚未投放", "只能评估结构、可理解性、商品和说服链路", "保留清晰商品演示；先换弱 Hook/补 Proof；效果待投放验证"],
        ["外部渠道“爆款”迁移", "无原始效果数据，且存在授权、平台和 SKU 差异", "保留叙事机制/节奏/Proof 类型；替换品牌、人物、商品和 CTA"],
    ]
    h.add_table(doc, ["场景", "正确解释", "建议路径"], scenario_rows, [2500, 3300, 3560], keep_rows=False)

    # 4.
    doc.add_heading("4. 行业公认 Know How 与素材公式化拆解", level=1)
    add_section_intro(doc, "怎样把投放指标翻译成创意结构，又避免把相关性包装成因果。")
    h.add_body(doc, "TikTok 官方创意指南建议在前 3 秒交代内容价值，在前 6 秒优先抓住注意力，并以 Hook、Body/Key Message、Close/CTA 组织内容；同时强调持续测试显著不同的创意，而不是只做微小变化（S9、S10）。本方案在该结构上加入 Proof，并把跨段视觉/音频元素单独建模。")
    add_figure(doc, visuals["breakdown"], "图 4  素材公式化拆解：叙事段落与跨段元素", "将视频时间轴拆分为 Hook、Body、Proof、CTA，同时标记人物、环境、商品、剪辑、字幕、音频、Offer 和合规")

    doc.add_heading("4.1 V1 拆解层级", level=2)
    decomp_rows = [
        ["叙事段落", "Hook / Body(Key Message) / Proof / CTA", "start_ms, end_ms, transcript, on_screen_text, confidence"],
        ["人物", "是否出镜、人数、身份引用、景别、表情、动作、口播方式", "不推断敏感人口属性；保留 face_reference_id"],
        ["环境", "室内/室外、家庭/商店/车库等、光线、背景复杂度", "scene_type, lighting, clutter"],
        ["商品", "首次出现时间、占画面、角度、使用动作、SKU 一致性", "first_product_ms, visibility_ratio, interaction"],
        ["视听", "镜头长度、切换、运动、字幕密度、VO/BGM/SFX", "shot_count, avg_shot_ms, text_rate, audio_type"],
        ["商业表达", "卖点、Claim、Offer、Proof 类型、CTA 类型", "claim_text, proof_type, offer, cta"],
        ["合规与风险", "夸大、缺少证据、商品不一致、授权/音乐/肖像风险", "risk_code, severity, evidence"],
    ]
    h.add_table(doc, ["层级", "粗粒度标签", "关键输出"], decomp_rows, [1600, 4200, 3560], keep_rows=False)

    doc.add_heading("4.2 数据指标与创意段落的映射原则", level=2)
    for item in [
        "2s/6s 是前段吸引力代理，不等于平台直接提供“0-3s 完播率”；若账号没有 3s 指标，产品文案必须写“前段留存/Hook 健康”，不能伪造 3s 指标。",
        "整体 100% 完播受视频时长强烈影响，因此要比较同长度/同品类，并优先使用条件留存：6s/2s、50%/25%、75%/50%、100%/75%。",
        "观看正常而 Product ad click rate 低，才更支持“利益点/商品/CTA 不清”；如果观看本身也低，点击低可能只是上游注意力不足。",
        "Ad CVR 低不是纯创意结论；需要同步检查价格、Offer、库存、商品页、评价、物流、目标与审核/账户状态。",
        "Gross revenue 与 Orders 是规模结果；ROI/CPO 是效率结果。在 GMV Max 中 paid + organic 归因会让两者出现看似矛盾的表现，必须同时解释。",
        "投手体感不是噪音。它应结构化为 diagnosis_feedback：采纳/修改/非素材/样本不足 + reason_code + note。",
    ]:
        add_bullet(doc, item, bullet_id)

    doc.add_heading("4.3 推荐的实验粒度", level=2)
    h.add_callout(doc, "单变量优先", "原素材只有一个显著断点时，默认只改变一个变量族：例如只换 Hook，不同时换人物、场景、卖点和 CTA。结构整体弱或存在授权/一致性问题时，才创建多变量的新概念实验。", fill="EAF4FF", accent=h.BLUE)
    experiment_rows = [
        ["Hook 单变量", "首帧、第一句、0-3s 节奏", "Body/Proof/CTA/商品/人物", "增强复刻"],
        ["Body 单变量族", "段落顺序、镜头长度、卖点表达", "Hook/CTA/商品事实", "增强复刻"],
        ["Proof 单变量族", "实测/对比/评价/数据/UGC 证明", "Hook/主卖点/Offer", "增强复刻或生成"],
        ["CTA/Offer 呈现", "字幕/口播/卡片/出现时间", "价格事实与上游结构", "增强复刻"],
        ["概念换新", "人物、场景、叙事、Proof 组合", "SKU、品牌事实、合规", "视频生成"],
    ]
    h.add_table(doc, ["实验类型", "允许变化", "必须锁定", "产品入口"], experiment_rows, [1800, 2900, 2900, 1760])

    doc.add_heading("4.4 无数据时：可观察质量与不可观察效果", level=2)
    h.add_callout(doc, "冷启动边界", "视频理解模型可以判断信息是否清晰、结构是否完整、Proof 是否存在、CTA 是否明确、商品是否可见以及是否存在合规风险；但无法在没有投放样本时确定用户反应、竞价环境、转化率或 ROI。", fill="FFF4E5", accent="A15C00")
    cold_dimensions = [
        ["Hook 可理解性", "首个有效信息时间、开场句、视觉显著性、情绪/冲突", "可判断结构风险；不等于 2s/6s 留存"],
        ["商品清晰度", "首次出现、可见面积、使用动作、多角度、SKU 一致性", "可评估可见/可理解；不等于商品点击意愿"],
        ["Body / Proof", "卖点顺序、信息密度、演示/对比/评价/数据证明", "可评估说服链路完整度；不等于实际购买说服力"],
        ["CTA / Offer 表达", "行动词、出现时间、利益/紧迫感、口播与字幕一致", "可评估表达清晰度；不验证价格竞争力"],
        ["平台原生感", "竖屏、节奏、真人表达、字幕、音画同步、内容广告化程度", "仅为目标平台适配建议，需按市场/品类校准"],
        ["合规与授权", "Claim 证据、商品一致、商标、音乐、肖像、声音与原创画面来源", "高风险作为硬阻断；模型不代替法务/平台审核"],
    ]
    h.add_table(doc, ["维度", "可观察特征", "结论边界"], cold_dimensions, [1900, 4300, 3160], keep_rows=False)

    doc.add_heading("4.5 保留 / 优化 / 待验证决策", level=2)
    preservation_rows = [
        ["保留", "强商品演示、清晰的人设/场景、有效 Proof 形式、特色节奏", "写入 locked_elements；增强复刻不得静默改变"],
        ["优化", "可观察的延迟 Hook、信息堆叠、证明缺失、CTA 模糊、字幕遮挡", "写入 variable_elements；默认只改一个变量族"],
        ["待验证", "Hook 是否提升留存、Offer 是否提升转化、受众/市场是否匹配", "写入 experiment_hypothesis；投放前不升级为确定性结论"],
        ["禁止复用", "未授权人脸/声音/音乐/商标/原创镜头；无证据 Claim", "作为 blocked_elements；只能抽象迁移机制"],
    ]
    h.add_table(doc, ["决策", "常见判断", "对生成链路的约束"], preservation_rows, [1500, 4300, 3560], keep_rows=False)

    # 5.
    doc.add_heading("5. 数据计算与诊断模型", level=1)
    add_section_intro(doc, "从数据资格、稳健基准、分段健康到主诊断、置信度和动作优先级的完整计算。")

    doc.add_heading("5.1 诊断主键与时间窗", level=2)
    add_formula(doc, "诊断主键", "shop_id × campaign_mode × campaign_id × product_id × creative_asset_id/video_id/post_id × context_id", "所有指标、拆解、人工反馈、动作与实验结果都绑定 immutable diagnosis_snapshot_id。")
    add_formula(doc, "默认窗口", "current = last 3 complete days; baseline = previous 7 stable days", "窗口按账户时区闭合。周末/活动/价格变更时可切同星期或事件前后基准；不得混入未完整的当天数据。")
    h.add_body(doc, "对标准 TikTok Shop Ads，主键可降级为 advertiser_id × campaign/adgroup/ad × creative_id × product_id（若可关联）；对 GMV Max 优先使用 product × creative。")

    doc.add_heading("5.2 数据资格与保护门槛", level=2)
    add_formula(doc, "MVP 成熟度", "is_mature = data_complete AND active_hours >= 24 AND (orders >= 5 OR spend >= 2 × target_cpo)", "这是产品建议的可配置默认值，不是 TikTok 官方阈值。需用历史数据回放校准；In Queue/Learning 只输出观察。")
    gates = [
        "data_as_of 未更新、归因窗口未闭合或关键字段缺失 -> OBSERVE。",
        "In Queue / Learning / 首投早期 -> 不输出中重度素材结论。",
        "基准样本不足或不可比 -> 只展示实际值与趋势，不输出强动作。",
        "多素材同商品/同账户同步异常 -> 先触发 non_creative_guard。",
        "平台/授权/审核/余额/商品状态异常 -> 屏蔽生成或停投建议，转运营处理。",
    ]
    for item in gates:
        add_bullet(doc, item, bullet_id)

    doc.add_heading("5.3 稳健基准与平滑", level=2)
    h.add_body(doc, "分层基准由近到远回退：同商品同市场同长度同来源 -> 同商品同市场同长度 -> 同类目同价格带同市场 -> 店铺全局；每次记录 benchmark_level、sample_size、window 与 confidence。")
    add_formula(doc, "比率平滑", "rate_smoothed = (successes + alpha) / (trials + alpha + beta)", "alpha/beta 来自同层基准；避免少量点击或订单造成极端率值。")
    add_formula(doc, "相对缺口", "gap(m) = clip((benchmark_smoothed - current_smoothed) / max(benchmark_smoothed, epsilon), -1, 1)", "越高越好的指标使用该式；成本类反向。缺失值不以 0 填充，权重按可用指标重新归一。")
    add_formula(doc, "稳健标准分", "robust_z = (x - median(peer)) / max(1.4826 × MAD(peer), epsilon)", "用于跨商品/类目排序；页面同时展示原始值，不能只展示分数。")

    doc.add_heading("5.4 分段留存与健康分", level=2)
    add_formula(doc, "条件留存", "r_6|2 = views_6s / views_2s; r_50|25 = views_p50 / views_p25; r_75|50; r_100|75", "相比直接看 100% 完播，更容易定位哪个段落失效；分母为 0 返回 null。")
    add_formula(doc, "Hook 缺口分", "S_hook = 100 × [0.45 gap(vr_2s) + 0.35 gap(r_6|2) + 0.20 gap(r_25|6)]", "r_25|6 仅在可以由原始计数或一致口径计算时启用；否则重新归一可用权重。")
    add_formula(doc, "Body/Proof 缺口分", "S_body = 100 × [0.35 gap(r_50|25) + 0.35 gap(r_75|50) + 0.30 gap(r_100|75)]", "断点时间还需结合视频总时长与自动拆解段落边界；分位点不等同固定语义。")
    add_formula(doc, "点击意图分", "S_click = 100 × gap(product_ad_click_rate)", "若观看上游也显著弱，主诊断优先 Hook/Body；点击弱作为次级证据。")
    add_formula(doc, "转化风险分", "S_conversion = 100 × [0.55 gap(ad_cvr) + 0.25 gap(orders_per_1k_product_views) + 0.20 gap(gross_revenue_per_1k_product_views)]", "命中后先跑非素材保护；Proof/Offer 仅为可验证假设。")

    doc.add_heading("5.5 素材质量与疲劳分开", level=2)
    add_formula(doc, "质量缺口", "quality_deficit = weighted_gap(current, matched_peer_benchmark)", "回答“这条素材相对同类是否弱”；新素材也可质量差。")
    add_formula(doc, "疲劳分", "fatigue = 100 × [0.45 own_history_decay + 0.25 exposure_pressure + 0.20 spend_without_output + 0.10 age/exposure]", "回答“它是否从自己的稳定表现持续衰减”；若 product×creative 无 frequency，移除该项并重新归一。")
    h.add_callout(doc, "命名保护", "只要没有稳定历史与持续衰减证据，页面使用“表现弱/漏斗缺口”，不使用“素材疲劳”。", fill="FFF4E5", accent="A15C00")

    doc.add_heading("5.6 主诊断规则", level=2)
    diagnosis_rules = [
        ["R0", "资格失败", "任一关键 gate 未通过", "OBSERVE", "补数据/等待"],
        ["R1", "非素材保护", "多素材同步下滑或商品/账户事件命中", "NON_CREATIVE", "转运营"],
        ["R2", "Hook", "S_hook 最高且效应显著", "HOOK", "替换 0-3/6s"],
        ["R3", "Body/Proof", "Hook 正常；中段条件留存断点", "BODY_PROOF", "重排/补证明"],
        ["R4", "点击意图", "观看正常；Product ad click rate 弱", "VALUE_CTA", "强化商品/利益/CTA"],
        ["R5", "转化风险", "点击正常；Ad CVR/订单弱；保护未命中", "PROOF_OFFER", "补证据并检查 PDP"],
        ["R6", "结构换新", "多段均弱或授权/画质/一致性问题", "NEW_CONCEPT", "视频生成"],
        ["R7", "健康/可放量", "规模、效率与漏斗均健康", "HOLD_SCALE", "保持/补供给"],
    ]
    h.add_table(doc, ["规则", "结论", "条件摘要", "结果码", "主动作"], diagnosis_rules, [900, 1500, 3500, 1600, 1860])

    doc.add_heading("5.7 置信度与动作优先级", level=2)
    add_formula(doc, "置信度", "C = 0.30 sample + 0.25 data_quality + 0.20 comparability + 0.15 trend_consistency + 0.10 model_agreement", "任一维度都可解释。C<0.60 默认观察；0.60-0.75 建议投手确认；>=0.75 可推荐动作，但仍不自动执行投放写操作。")
    add_formula(doc, "机会优先级", "priority = normalized_effect × confidence × spend_or_gmv_exposure × actionability", "用于队列排序，不替代主诊断。actionability 体现是否有明确可编辑变量、授权和足够素材。")
    add_formula(doc, "实验净提升", "uplift_DiD = (post_variant - pre_variant) - (post_control - pre_control)", "Phase 2 使用匹配控制或分层实验降低大盘、活动与商品波动影响；V1 先做同时间窗对照与规则化 Winner。")
    add_figure(doc, visuals["mapping"], "图 5  信号、主诊断、变量与产品入口的确定性映射", "将前段观看、中段留存、商品点击、转化和非素材信号映射到增强复刻、视频生成或投手工作台")

    doc.add_heading("5.8 诊断示例", level=2)
    example_rows = [
        ["A", "播放量高；2s -24%；6s|2s -18%；25% 后接近基准", "HOOK / 86%", "锁定商品、人物、Body、Proof、CTA；生成 3 个 Hook 变体"],
        ["B", "2s/6s 正常；25->50% -31%；点击稍弱", "BODY_PROOF / 81%", "重排卖点、加实测/对比；保留 Hook"],
        ["C", "观看与点击正常；Ad CVR 低；同商品全部素材同降；价格刚变", "NON_CREATIVE / 79%", "转投手检查 Offer/PDP；不导流生成"],
        ["D", "Gross revenue +22%；ROI -9%；消耗 +35%；订单 +18%", "HOLD_SCALE / 74%", "不因 ROI 下降停素材；观察边际并补供给"],
    ]
    h.add_table(doc, ["示例", "证据", "主诊断", "动作"], example_rows, [700, 3500, 1900, 3260], keep_rows=False)

    doc.add_heading("5.9 冷启动结构质量模型", level=2)
    add_formula(doc, "分流", "analysis_mode = DATA_DRIVEN if eligible_metric_snapshot else COLD_START", "无数据、数据未授权、字段不完整或样本未成熟时，均可以进入 COLD_START；页面要明确标注原因。")
    add_formula(doc, "分维度结构分", "S_cold,d = 100 × Σ[w_i(category, market, duration) × feature_i × evidence_conf_i] / Σ[w_i available]", "d 分别为 Hook、Product clarity、Body、Proof、CTA、Platform nativeness 和 Compliance。分数表示结构健康度，不与 CTR/CVR/ROI 或数据诊断的缺口分混用。")
    add_formula(doc, "冷启动置信度", "C_cold = 0.30 parse_completeness + 0.25 product_match + 0.20 signal_consistency + 0.15 context_relevance + 0.10 model_agreement", "C_cold<0.60 显示“需要人工确认”；0.60-0.75 可给候选动作；>=0.75 可推荐结构动作，仍不代表投放效果置信度。")
    add_formula(doc, "保留优先级", "preserve_priority = observable_strength × evidence_confidence; reuse_allowed = rights_gate AND compliance_gate", "授权与合规是硬门，不参与加权平均；不通过时即使特征很强也不能进入直接复用。")
    add_formula(doc, "参考素材状态", "SELF_DECLARED_REFERENCE -> VERIFIED_BY_USER_DATA -> VERIFIED_BY_PLATFORM_DATA", "仅在用户提供可校验报表或系统获得平台数据后才升级；账号截图/口述可作辅助证据，不默认为已验证。")
    h.add_callout(doc, "输出形式", "冷启动模式不输出单一“好/坏”或“爆款分”，而是输出分维度分数、观察证据、保留项、优化项、待验证假设、禁止复用项与一个主动作。", fill=h.LIME_SOFT, accent=h.GREEN)
    cold_examples = [
        ["自有未投工具视频", "商品 0.8s 出现、真人实测清晰；开场利益点弱；Proof 无对比", "保留商品/人物/环境；替换 Hook；补对比 Proof", "增强复刻：两轮单变量"],
        ["外部美妆参考", "问题开场 + 近景使用 + 前后对比；原人脸/品牌未授权", "只保留叙事机制和节奏；替换人物、SKU、画面与 CTA", "视频生成：本地化新概念"],
    ]
    h.add_table(doc, ["素材", "可观察证据", "保留/优化", "建议入口"], cold_examples, [1800, 3300, 2760, 1500], keep_rows=False)

    # 6.
    doc.add_heading("6. 功能清单与优先级", level=1)
    add_section_intro(doc, "从数据接入到结果回流，哪些模块属于 P0/P1/P2。")
    feature_rows = [
        ["M00", "冷启动素材体检与参考迁移", "P0", "无投放数据时输出结构证据、保留/优化/待验证"],
        ["M01", "数据连接与能力画像", "P0", "授权、Scope、字段、延迟与可用粒度"],
        ["M02", "素材优化机会队列", "P0", "按影响/置信度/可执行性排序"],
        ["M03", "素材诊断详情", "P0", "证据、趋势、基准、主诊断、人工反馈"],
        ["M04", "素材公式化拆解", "P0", "Hook/Body/Proof/CTA + 跨段元素"],
        ["M05", "优化动作与变量编排", "P0", "锁定项、变量、变体、主入口"],
        ["M06", "增强复刻承接", "P1", "保留有效结构，局部替换失败元素"],
        ["M07", "视频生成承接", "P1", "结构性换新与预填 Brief"],
        ["M08", "实验任务与结果回流", "P1", "版本、投放状态、观察、Winner 与反馈"],
        ["M09", "规则/模型运营台", "P2", "阈值、Benchmark、版本、误判分析"],
        ["M10", "主动提醒与批量计划", "P2", "周报、告警、批量素材供给计划"],
    ]
    h.add_table(doc, ["编号", "模块", "优先级", "一句话范围"], feature_rows, [900, 2500, 1100, 4860])

    # 7.
    doc.add_heading("7. 各功能详细需求", level=1)
    add_section_intro(doc, "每个核心模块的目的、输入、计算、输出、异常状态和验收。")

    add_module_spec(
        doc, "M00", "冷启动素材体检与参考迁移", "P0",
        "让没有任何投放数据的用户也能从视频本身得到可执行的基础建议，并将自有未投素材或其他渠道参考素材安全转为可验证的新版本。",
        "素材诊断首页的“上传素材体检”；素材库多选后体检；增强复刻/视频生成的参考素材入口。",
        ["原视频/音频/字幕", "source_type：OWN_UNDELIVERED / EXTERNAL_REFERENCE", "来源 URL/上传者/授权声明", "目标市场、平台、品类、时长与语言", "目标 SKU 参考图与商品事实", "可选的用户投放证据/自然流证据"],
        ["先识别来源与 rights_gate；外部素材默认 SELF_DECLARED_REFERENCE。", "运行镜头切分、ASR、OCR、音频分析、人物/商品/场景识别，形成 creative_breakdown。", "按目标品类/市场/时长对 Hook、商品清晰度、Body、Proof、CTA、平台原生感和合规分维度评分。", "对每个元素生成 PRESERVE / OPTIMIZE / VALIDATE / BLOCKED 决策，并显示证据和置信度。", "仅选择一个最高优先级结构动作；默认最小变量，整体结构或授权不可用时转视频生成。", "不生成 CTR、CVR、ROI、疲劳或爆款概率预测；这些全部标记为待投放验证。"],
        ["cold_start_assessment", "dimension_score[] + evidence[]", "preserve/optimize/validate/blocked elements", "primary_action_intent", "reference_migration_blueprint"],
        ["无法解析或关键轨道缺失时显示可补传项，不补造结论。", "缺少目标 SKU 时可做结构体检，但禁用商品一致性和直接复刻。", "外部授权不清时只输出抽象机制，不把原人脸、声音、商标或镜头带入生成。", "品类/市场不支持基准时显示通用规则级结论并降低置信度。"],
        ["用户在 90 秒内获得可播放的拆解、分维度分数和一个主动作。", "所有结论都带 evidence、source、confidence 和 model_version。", "页面明确显示“结构质量，非投放效果预测”。", "进入生成后 locked/variable/blocked 完整继承，不越过授权闸门。"], bullet_id,
    )
    add_figure(doc, visuals["cold_start"], "图 6  M00 页面示意：冷启动素材体检", "冷启动体检页面展示视频理解完整度、分维度结构分、保留、优化、待验证以及增强复刻/视频生成入口")

    add_module_spec(
        doc, "M01", "数据连接与能力画像", "P0",
        "在任何诊断前回答“我们被授权看什么、数据到哪一天、哪些指标能用”。",
        "设置 > 数据连接；首次进入素材诊断时自动检查。",
        ["Business Center/advertiser/shop 授权关系", "Business API / Shop API Token 与 Scope", "Seller Center 导出文件（降级）", "timezone、currency、attribution_window、data_as_of"],
        ["对每个目标账号执行只读能力探测，生成 capability_profile。", "把 metric availability 区分为 AVAILABLE / NOT_SUPPORTED / NOT_AUTHORIZED / DELAYED / ERROR。", "展示授权资产、缺失 Scope、最近成功同步与下一步修复动作。", "同一账号字段能力变化时保留历史版本，避免旧结论失去上下文。"],
        ["连接健康度", "可用诊断粒度", "缺失字段与降级路径", "数据延迟与归因口径"],
        ["Token 过期时阻断新诊断，但保留旧快照。", "部分字段不可用时重新归一模型权重，并在页面明确显示。", "手动导入文件必须校验字段、时区、币种、重复行和时间范围。"],
        ["用户能在 30 秒内知道当前账号能做哪一级诊断。", "所有下游响应携带 capability_profile_id 和 data_as_of。", "任何缺失值都不会被渲染为 0。"], bullet_id,
    )
    add_figure(doc, visuals["access"], "图 7  M01 页面示意：数据能力画像", "数据能力画像以分层方式显示广告账户、GMV Max、Shop API、测量和代理内部数据及其授权条件")

    add_module_spec(
        doc, "M02", "素材优化机会队列", "P0",
        "让投手先处理影响最大且最可执行的素材，而不是浏览全量报表。",
        "洞察 > 素材诊断；也可从自动报表或 Agent 结果进入。",
        ["diagnosis_snapshot 聚合结果", "商品/素材状态、GMV/Spend exposure", "confidence、actionability、priority contribution"],
        ["默认排序使用 effect × confidence × exposure × actionability。", "筛选 Product GMV Max/标准 Shop Ads、市场、商品、诊断、素材来源、状态、置信度与时间。", "队列行只展示一个主诊断和一个主 CTA；次级证据收在详情。", "支持投手标记稍后处理、忽略、分配给创意负责人。"],
        ["待处理数、风险消耗、可直接复刻数、需人工确认数", "素材级机会列表", "批量选择但不批量自动执行"],
        ["无数据时解释权限/延迟/筛选条件；不显示虚假 0，同时提供“上传素材体检”进入 M00。", "全商品同步异常时优先显示账户/商品级事件，而不是数十条重复素材建议。"],
        ["排序每项可解释贡献值。", "点击行打开对应 immutable snapshot。", "筛选与上下文切换不会混用币种/时区。"], bullet_id,
    )
    add_figure(doc, visuals["dashboard"], "图 8  M02 页面示意：素材优化机会队列", "素材优化机会队列显示待处理、风险消耗、可复刻数和按优先级排序的诊断列表")

    add_module_spec(
        doc, "M03", "素材诊断详情", "P0",
        "用可解释证据回答“为什么这么判断、下一步具体改什么”。",
        "机会队列素材行；投放报表素材详情；Agent 建议卡片。",
        ["指标当前值/基准/趋势（数据模式）", "冷启动分维度分数（无数据模式）", "素材状态与授权", "变更事件", "素材自动拆解", "规则/模型版本与置信度"],
        ["首屏显示唯一主诊断、置信度、三条关键证据、被保护的替代解释。", "视频播放与留存/段落时间轴联动。", "展示 raw metric、benchmark、gap、sample size、data_as_of。", "投手可采纳、改诊断、标非素材问题或暂不处理；所有反馈追加不覆盖。"],
        ["diagnosis_snapshot", "primary_action", "locked_elements / variable_elements", "feedback record"],
        ["信号冲突时默认 OBSERVE，并列出需要的额外数据。", "字段不可用时隐藏对应判断，不降低透明度。", "素材无法播放时仍展示指标，但阻断拆解/生成。"],
        ["用户 60 秒内能复述主诊断与动作。", "每个结论有 evidence、rule_version、data_as_of。", "关闭页面后反馈和草稿保留。"], bullet_id,
    )
    add_figure(doc, visuals["diagnosis"], "图 9  M03 页面示意：素材诊断详情", "诊断详情同时展示视频、观看漏斗、主诊断、置信度、锁定项和进入增强复刻的动作")

    add_module_spec(
        doc, "M04", "素材公式化拆解", "P0",
        "把指标断点定位到可编辑的时间段和素材元素，形成生成工具可消费的结构化表示。",
        "诊断详情中的“查看拆解”；上传/选择任意历史素材时也可独立触发。",
        ["视频、音频、字幕/ASR", "OCR、镜头切分、物体/商品识别", "商品/SKU 参考图与事实", "品牌/合规规则"],
        ["自动建议 Hook/Body/Proof/CTA 边界，并允许用户拖动修正。", "输出段落 transcript、on-screen text、shot、product/face/scene/audio 标签与 confidence。", "人物用引用 ID、人数、动作、景别和表达，不推断敏感属性。", "商品不一致、夸大 Claim、缺证据和授权风险单独标记。"],
        ["creative_breakdown_version", "segment[]", "element_tag[]", "risk[]", "human_correction[]"],
        ["低置信度边界显示“待确认”，不静默当成事实。", "ASR/OCR 失败不阻断视觉拆解；模块输出缺失类型。", "用户修改边界后生成新版本，不覆盖自动原始结果。"],
        ["所有段落覆盖时间轴且不重叠。", "关键标签包含 confidence 与 source。", "修改能回传至 M05 动作编排。"], bullet_id,
    )
    add_figure(doc, visuals["breakdown"], "图 10  M04 页面示意：粗粒度素材拆解", "素材拆解页面以时间轴展示 Hook、Body、Proof、CTA，并在下方展示人物、环境、商品、剪辑和音画标签")

    add_module_spec(
        doc, "M05", "优化动作与变量编排", "P0",
        "把诊断转成可执行的实验 Brief，并明确哪些必须保留、哪些要变化。",
        "诊断详情主 CTA；投手采纳或修正诊断后生成 Action Intent。",
        ["primary_diagnosis 或 cold_start_assessment", "creative_breakdown", "product facts", "preserve/optimize/validate/blocked", "授权/合规边界", "目标市场与生成能力"],
        ["根据规则映射 default locked_elements、variable_elements、variant_count、experiment_hypothesis。", "同一快照只允许一个 active action_intent；切换动作会版本化旧意图。", "推荐增强复刻或视频生成并解释原因；用户可改，但需记录 override_reason。", "默认 3 个显著差异变体；不鼓励只换字体/颜色等弱变化。"],
        ["Action Intent", "实验 Brief", "推荐入口", "预估成本/时长（若生成平台可提供）"],
        ["非素材问题、低样本、授权缺失或合规高风险时阻断生成 CTA。", "多个变量族同时被选择时标记 multivariate 并提示归因难度。"],
        ["每个动作包含 hypothesis、locked、variables、variant_count、success_metric。", "进入生成工具后所有字段一致。", "返回诊断页时草稿可恢复。"], bullet_id,
    )
    add_figure(doc, visuals["mapping"], "图 11  M05 页面示意：数据信号或冷启动结构证据到动作的映射", "动作编排表展示每类证据对应的主诊断、锁定项、变化项和增强复刻/视频生成入口")

    add_module_spec(
        doc, "M06", "增强复刻承接", "P1",
        "保留已验证有效的结构、商品与人物，只替换明确失败的段落/元素。",
        "M05 推荐入口；也可从高保真复刻项目新建并关联 diagnosis_snapshot_id。",
        ["原素材、creative_breakdown_version", "locked_elements、variable_elements", "3-5 个变体 Brief", "商品/人物/音频参考与授权"],
        ["在现有拆解 -> 商品确认 -> 脚本/生成 -> 视频生成流程中预填诊断上下文。", "锁定项以不可静默修改的 Chip 展示；如模型不支持局部锁定，必须提示为近似复刻。", "生成新版本追加到 videoVersions，不覆盖历史成功版本。", "失败重试保留脚本、商品、锁定/变量与已成功版本。"],
        ["creative_version[]", "generation_task", "diagnosis lineage", "差异摘要"],
        ["模型能力不支持约束组合时阻断或要求改入口。", "商品/人物一致性检查失败时显示具体镜头并允许单项重试。", "旧素材授权失效时不得继续使用。"],
        ["生成任务能追溯到 diagnosis_snapshot_id 和 action_intent_id。", "用户能在历史中播放/下载旧版本。", "变量之外的结构差异被系统标记。"], bullet_id,
    )

    add_module_spec(
        doc, "M07", "视频生成承接", "P1",
        "当结构、人物、场景或 Proof 需要换新时，用诊断直接创建完整新创意。",
        "M05 推荐入口；Zero-to-Video/视频生成模块支持从诊断创建。",
        ["商品事实、目标受众/市场", "失败元素与建议创意方向", "合规 Claim、Offer、CTA", "视频长度、语言、画幅、模型能力"],
        ["系统生成 3 个创意方向，每个方向至少在 Hook、主卖点、Proof 或结构中有两项差异。", "商品事实、品牌禁区和合规声明作为硬约束。", "用户选择方向后生成 storyboard/voiceover/on-screen text，再进入视频生成。", "输出中明确哪些是投放诊断建议、哪些是生成模型创作。"],
        ["creative_brief[]", "storyboard", "generation_task", "creative_version[]"],
        ["缺少商品参考或关键 Claim 证据时显示待补充，不自动编造。", "模型不支持指定人物/音频/时长时提供兼容方案并要求确认。"],
        ["Brief 自动带入且可编辑。", "三个方向差异可被结构化比较。", "生成版本带诊断来源与实验假设。"], bullet_id,
    )
    add_figure(doc, visuals["workspace"], "图 12  M06/M07 页面示意：增强复刻与视频生成双路径", "根据诊断强度选择增强复刻或视频生成，并分别展示锁定项、变化变量与自动带入的 Brief")

    add_module_spec(
        doc, "M08", "实验任务与结果回流", "P1",
        "证明素材动作是否有效，并把结果变成下一轮可学习的数据。",
        "任务记录；生成完成后创建实验；平台状态同步后进入观察。",
        ["creative_version、delivery relation", "发布/审核/投放状态", "实验窗指标", "原素材/变体/控制组", "人工结论"],
        ["创建、审核、ACTIVE、LIMITED/NOT_DELIVERING、OBSERVING、READY_TO_VALIDATE、WINNER/LOSER/INCONCLUSIVE 分开记录。", "只有 normalized delivery status=ACTIVE 才显示“投放中”；保留 raw platform_status/reason/message。", "同时满足 observation_hours 与订单/消耗门槛才验收。", "比较 Hook/Body 指标与 GMV/Orders/ROI，结果回写模板、规则和模型特征。"],
        ["experiment_result", "winner_version_id", "uplift", "inconclusive_reason", "next_recommendation"],
        ["创建成功不等于投放成功。", "不可比、数据延迟或商品事件干扰时输出 INCONCLUSIVE。", "失败重试追加 attempt，不覆盖第一条失败证据。"],
        ["所有状态有时间戳、operator、source。", "Winner 判定展示样本与窗口。", "结果能回到素材诊断形成下一快照。"], bullet_id,
    )
    add_figure(doc, visuals["feedback"], "图 13  M08 页面示意：变体实验与结果回流", "实验回流页面比较原素材和 Hook 变体，并展示发布、观察、验收、Winner 和回流状态")

    # 8.
    doc.add_heading("8. 数据实体、接口与输出契约", level=1)
    add_section_intro(doc, "工程上如何保证诊断、动作、素材版本和投放结果可追溯。")
    entity_rows = [
        ["AccessGrant / CapabilityProfile", "授权资产、Scope、字段可用性、延迟与错误", "capability_profile_id"],
        ["AnalysisContext", "shop/account/market/mode/timezone/currency/window", "context_id"],
        ["SourceAssetContext", "source_type、source_url、uploader、rights、target_market/channel/SKU", "source_context_id"],
        ["MetricSnapshot", "raw metrics、source、data_as_of、attribution_scope", "metric_snapshot_id"],
        ["BenchmarkSnapshot", "level、filters、sample、median/MAD/prior", "benchmark_snapshot_id"],
        ["CreativeAsset / CreativeVersion", "video/post/owner/auth/source/version lineage", "creative_asset_id / version_id"],
        ["CreativeBreakdown", "segments、elements、risks、confidence、human correction", "breakdown_version_id"],
        ["ColdStartAssessment", "dimension scores、evidence、preserve/optimize/validate/blocked", "cold_start_assessment_id"],
        ["DiagnosisSnapshot", "eligibility、scores、primary diagnosis、evidence、confidence", "diagnosis_snapshot_id"],
        ["ActionIntent", "locked、variables、hypothesis、route、override", "action_intent_id"],
        ["GenerationTask", "model、inputs、status、attempt、cost、outputs", "generation_task_id"],
        ["DeliveryExecution", "draft、platform response、normalized/raw status", "execution_id"],
        ["ExperimentResult", "control/variant、window、sample、uplift、winner", "experiment_id"],
        ["AuditLog", "operator、before/after、reason、timestamp", "audit_id"],
    ]
    h.add_table(doc, ["实体", "核心内容", "主键"], entity_rows, [2500, 4700, 2160], keep_rows=False)

    doc.add_heading("8.1 诊断输出示例", level=2)
    add_formula(doc, "DiagnosisSnapshot", '{"diagnosis":"HOOK","confidence":0.86,"evidence":["vr2_gap:-0.24","r6|2_gap:-0.18"],"locked":["product","person","body","proof","cta"],"variables":["first_frame","opening_line","pace_0_3s"],"route":"ENHANCED_REPLICATE"}', "生产输出还需包含 context_id、metric_snapshot_id、benchmark_snapshot_id、rule_version、data_as_of、suppressed_rules 与 reason_codes。")
    add_formula(doc, "ColdStartAssessment", '{"mode":"COLD_START","source_status":"SELF_DECLARED_REFERENCE","scores":{"hook":72,"proof":48},"preserve":["product_demo","scene"],"optimize":["opening_line","proof"],"validate":["retention","conversion"],"blocked":["source_face","source_audio"],"route":"ENHANCED_REPLICATE"}', "生产输出还需包含 source_context_id、breakdown_version_id、evidence[]、confidence、model_version、rights_gate 和“非投放预测”说明。")

    doc.add_heading("8.2 服务边界", level=2)
    service_rows = [
        ["Connector Service", "广告/Shop/导入数据；授权与健康", "read-only 为默认；Token 隔离"],
        ["Metric & Benchmark Service", "快照、平滑、同类基准、趋势", "幂等；按时区闭合"],
        ["Creative Understanding", "ASR/OCR/镜头/段落/元素/风险", "输出版本和置信度"],
        ["Cold Start Assessment", "分维度结构分、保留/优化/待验证、参考迁移", "不输出投放效果预测；授权硬门"],
        ["Diagnosis Engine", "保护规则、分数、主诊断、证据", "规则版本化；不写投放"],
        ["Action Orchestrator", "锁定/变量/Brief/入口", "一个快照一个 active intent"],
        ["Generation Integration", "复刻/生成任务与版本", "追加版本；失败可恢复"],
        ["Delivery & Experiment", "人工确认、状态同步、观察、验收", "写操作幂等与审计"],
    ]
    h.add_table(doc, ["服务", "职责", "约束"], service_rows, [2300, 4200, 2860])

    doc.add_heading("8.3 外部接入建议", level=2)
    for item in [
        "优先使用 TikTok Business API 的 integrated reporting / GMV Max report 与官方 SDK 能力；具体端点、字段名、版本和权限必须以目标账户当前文档/沙箱探测为准（S7）。",
        "TikTok Shop 数据通过官方 Partner Center 的 Seller/Creator/Partner 授权路径接入；不同 user_type 和 Scope 不混用（S8）。",
        "Seller Center 导出作为 P0 降级路径时，必须保存原始文件哈希、导入人、时区、币种、字段映射和解析错误。",
        "平台写操作放到 P1：所有请求携带 idempotency_key；CREATE_SUCCEEDED 只表示创建响应成功，不等于真实 ACTIVE。",
    ]:
        add_bullet(doc, item, bullet_id)

    # 9.
    doc.add_heading("9. 页面状态、异常与安全约束", level=1)
    add_section_intro(doc, "产品在缺权限、低样本、冲突信号、生成失败或平台异常时如何诚实工作。")
    state_rows = [
        ["未授权", "显示缺少的资产/Scope 与授权入口", "不加载旧账号数据伪装当前"],
        ["无投放数据", "显示“上传素材体检”并进入 M00", "隐藏 CTR/CVR/ROI；禁止给出疲劳/效果结论"],
        ["外部参考未授权", "只展示可抽象迁移的叙事机制", "阻断复刻人脸、声音、商标和原创镜头"],
        ["冷启动低置信度", "标出待确认段落/标签和缺少上下文", "只保留候选动作；不默认进入生成"],
        ["数据延迟", "显示 data_as_of、延迟时长、预计重试", "阻断新强结论"],
        ["低样本/学习中", "主结果=待观察；显示尚缺订单/消耗/时间", "无暂停/生成主 CTA"],
        ["信号冲突", "展示冲突证据与次级假设", "要求投手确认或补数据"],
        ["非素材保护", "跳转商品/投手工作台", "禁用素材生成主动作"],
        ["拆解低置信度", "突出待确认段落/标签", "人工修正产生新版本"],
        ["生成失败", "保留 Brief、设置、成功版本与失败镜头", "单项重试；不覆盖历史"],
        ["平台创建成功", "显示“已创建，待审核/同步”", "不显示“投放中”"],
        ["Not Delivering", "展示 reason/status_message", "按授权、审核、预算、素材、账户等分类"],
        ["实验不可比", "INCONCLUSIVE + 原因", "不强判 Winner"],
    ]
    h.add_table(doc, ["状态", "页面响应", "保护动作"], state_rows, [2100, 4000, 3260], keep_rows=False)

    doc.add_heading("9.1 合规与隐私", level=2)
    for item in [
        "所有客户数据按 Business Center/Shop 授权隔离；Token、原始报表和创作者资产使用最小权限。",
        "人物标签仅服务素材一致性与创意描述；不得推断或输出敏感属性。",
        "生成 Brief 继承商品事实、禁用 Claim、品牌规范、音乐/肖像/达人授权状态。",
        "外部参考素材必须记录来源、授权声明和允许的复用范围；权利不清时仅允许迁移抽象结构机制。",
        "任何外部写操作、素材关系调整或停用动作都需要可审计的人工确认。",
        "保留数据来源、规则版本、模型版本、操作者、时间戳与 Before/After。",
    ]:
        add_bullet(doc, item, bullet_id)

    # 10.
    doc.add_heading("10. 成功指标与埋点", level=1)
    add_section_intro(doc, "既衡量用户是否使用，也衡量建议是否可信、是否产生增量。")
    kr_rows = [
        ["Time to insight", "从进入队列到确认主动作的中位时长", "<= 3 分钟"],
        ["Cold-start completion", "可解析上传素材中，完成拆解、分维度证据和主动作的占比", ">= 90%"],
        ["Boundary compliance", "冷启动结果中未输出 CTR/CVR/ROI/疲劳/爆款预测的占比", "100%"],
        ["Diagnosis coverage", "可生成非观察结论的 eligible 素材占比", ">= 60%（随字段能力调整）"],
        ["Explanation completeness", "有 evidence/benchmark/data_as_of/rule_version 的结论占比", ">= 99%"],
        ["AO acceptance", "采纳或小改后采纳的诊断占比", ">= 70%"],
        ["Action conversion", "确认后进入复刻/生成并创建任务的占比", ">= 35%"],
        ["Experiment completion", "达到验收或明确 Inconclusive 的任务占比", ">= 70%"],
        ["False-positive rate", "被 AO 标为非素材/误判的强诊断占比", "<= 20%"],
        ["Creative lift", "Winner 变体相对对照的 Hook/GMV/Orders 提升", "按品类建立基线"],
    ]
    h.add_table(doc, ["指标", "定义", "V1 目标"], kr_rows, [2500, 5000, 1860])

    event_rows = [
        ["cold_start_asset_uploaded", "source_type, target_market, category, rights_status"],
        ["cold_start_assessment_completed", "assessment_id, parse_completeness, confidence, primary_action"],
        ["preservation_plan_confirmed", "preserve_count, optimize_count, validate_count, blocked_count"],
        ["diagnosis_queue_viewed", "context_id, filters, data_as_of"],
        ["diagnosis_opened", "snapshot_id, diagnosis, confidence, priority"],
        ["diagnosis_feedback_submitted", "decision, corrected_diagnosis, reason_code"],
        ["action_intent_created", "route, locked_count, variable_count, multivariate"],
        ["generation_task_created", "source_snapshot, route, model, variant_count"],
        ["delivery_confirmed", "execution_id, platform_status"],
        ["experiment_ready", "sample, observation_hours"],
        ["experiment_validated", "winner, uplift, result, inconclusive_reason"],
    ]
    h.add_table(doc, ["事件", "关键属性"], event_rows, [3300, 6060])

    # 11.
    doc.add_heading("11. 迭代路线图", level=1)
    add_section_intro(doc, "先证明数据可得与建议可信，再扩大自动化和模型复杂度。")
    roadmap_rows = [
        ["Phase 0 可行性", "2-3 周", "3-5 个真实客户账号字段探测 + 50-100 条自有/外部素材人工标注", "确认数据粒度与冷启动拆解/权利闸门准确性"],
        ["Phase 1 P0 诊断 MVP", "6-8 周", "M00-M05；冷启动体检、只读数据、机会队列、证据诊断、粗拆解、Action Intent", "无数据用户 90 秒获得基础建议；投手 3 分钟形成可信 Brief"],
        ["Phase 2 生成闭环", "4-6 周", "M06-M08；复刻/生成、版本、人工发布、状态同步与结果回流", "诊断到任务、任务到实验闭环"],
        ["Phase 3 学习与规模化", "持续", "阈值自校准、推荐排序/Uplift、批量计划、周报与多市场", "减少误报，提高 Winner 率"],
    ]
    h.add_table(doc, ["阶段", "建议周期", "范围", "退出标准"], roadmap_rows, [1800, 1200, 4000, 2360], keep_rows=False)

    doc.add_heading("11.1 后续可迭代方向", level=2)
    later = [
        "品类/价格带/市场/时长/创作者来源的分层 Benchmark 与层级贝叶斯模型。",
        "从规则主诊断升级为可解释的多任务模型：Hook、Body、Proof、CTA 与非素材原因并行打分。",
        "用 AO 反馈和实验 Winner 训练 recommendation ranking，而不是直接训练“是否暂停”。",
        "视频帧级留存/评论/搜索词/达人表现等新增信号，但每个新信号必须先确认权限、口径和可解释性。",
        "素材供给规划：按商品健康度、主题覆盖与授权来源推荐下一周应补多少条、哪些变量。",
        "跨平台迁移：Meta/Reels/YouTube Shorts 共享素材结构标签，但平台指标和归因模型分开。",
        "冷启动结构分与后续真实投放数据的校准：学习哪些可观察特征在特定品类/市场中具有稳定参考价值，但仍保留边界声明。",
        "生成成本/成功率/一致性模型，用 expected_win_probability × business_impact / generation_cost 排序。",
        "品牌/类目合规知识库与 Claim 证据绑定，减少生成后审核失败。",
    ]
    for item in later:
        add_bullet(doc, item, bullet_id)

    # 12.
    doc.add_heading("12. 验收标准、风险与开放问题", level=1)
    add_section_intro(doc, "上线前哪些条件必须可验证，哪些决策仍需业务/数据 Owner 确认。")
    acceptance_rows = [
        ["AC01", "数据", "所有指标保留 source、data_as_of、timezone、currency、attribution_scope；null 不作 0"],
        ["AC02", "权限", "一级代理账号必须通过 capability_profile 探测后才启用对应诊断"],
        ["AC03", "保护", "In Queue/Learning/低样本/延迟/非素材事件不产生强动作"],
        ["AC04", "口径", "Product GMV Max 的 paid + organic 归因在页面明确说明；ROI/CPO 不单独判素材"],
        ["AC05", "模型", "每个结论具备 evidence、benchmark、confidence、rule_version 与 suppressed_rules"],
        ["AC06", "拆解", "时间轴完整、不重叠；跨段元素与风险带 confidence/source"],
        ["AC07", "动作", "每个快照只有一个 active primary action；locked/variables/hypothesis/metric 完整"],
        ["AC08", "生成", "增强复刻和视频生成继承同一 Action Intent；历史版本不覆盖"],
        ["AC09", "状态", "CREATE_SUCCEEDED 与 ACTIVE 分开；保留 raw platform status/reason/message"],
        ["AC10", "回流", "观察时间和样本门槛同时满足才判 Winner；不可比输出 INCONCLUSIVE"],
        ["AC11", "审计", "人工修改、平台写入、模型/规则版本均可追溯"],
        ["AC12", "体验", "典型用户在 3 分钟内确认主诊断并创建素材任务"],
        ["AC13", "冷启动", "无投放数据时仅输出可观察结构证据；不生成 CTR/CVR/ROI/疲劳/爆款预测"],
        ["AC14", "参考迁移", "外部素材的来源状态、授权闸门、保留/优化/待验证/禁止复用均可见且被生成任务继承"],
    ]
    h.add_table(doc, ["编号", "模块", "验收条件"], acceptance_rows, [900, 1200, 7260], keep_rows=False)

    doc.add_heading("12.1 主要风险", level=2)
    risk_rows = [
        ["字段/权限差异", "不同市场和账号指标不一致", "能力探测 + 降级模型 + 手动导入"],
        ["归因误读", "GMV Max paid + organic 导致 ROI/GMV 解释偏差", "双口径展示 + 保护规则 + 来源说明"],
        ["误把相关性当因果", "动作未带来提升或伤害有效素材", "人工确认 + 单变量实验 + Inconclusive"],
        ["拆解误差", "段落边界或商品/人物识别错误", "置信度 + 可修正 + 版本化"],
        ["生成漂移", "锁定项被模型改变", "能力预检 + 一致性检查 + 失败可恢复"],
        ["冷启动过度自信", "用户把结构分当作投放预测", "分维度证据 + 置信度 + 强制边界文案 + 投放后升级"],
        ["参考素材侵权", "未授权的人脸、声音、音乐、商标或原创镜头被复刻", "来源/授权必填 + rights_gate + 抽象机制迁移 + 审计日志"],
        ["投放写风险", "重复创建、错误停投或授权失效", "P1 人工确认、幂等、审计、可回滚关系"],
    ]
    h.add_table(doc, ["风险", "后果", "缓解"], risk_rows, [2100, 3500, 3760])

    doc.add_heading("12.2 上线前开放问题", level=2)
    questions = [
        "目标客户账号中，GMV Max product × creative 的关键字段覆盖率分别是多少？是否可稳定通过 API 获得，还是需要 Seller Center 导出？",
        "Product impressions、Product ad click rate、Ad CVR 与分段观看在各市场的 exact denominator 和数据延迟是否一致？",
        "历史账号的 target_cpo / expected_aov 应如何定义；是否有毛利、退款与取消后净收入口径？",
        "V1 默认成熟门槛（24h、Orders≥5 或 Spend≥2×target_cpo）在真实历史回放中的误报/漏报如何？",
        "增强复刻目前对锁定人物、商品、段落、音频和时长的真实约束能力分别是什么？不支持时如何表达“近似复刻”？",
        "投手希望在诊断详情直接创建任务，还是先进入 Brief 抽屉由创意负责人确认？",
        "冷启动 V1 先覆盖哪 3-5 个品类/市场？每个组合能否收集至少 50 条人工复核素材用于校准结构分？",
        "外部参考素材的授权声明由用户勾选、客户上传证明，还是由代理内部资产系统返回？不同状态允许复用到什么粒度？",
        "冷启动结果在获得首批投放数据后，是自动升级为 DATA_DRIVEN，还是要求投手确认分析上下文？",
        "实验 Winner 的主指标按商品阶段是否不同：探索期看 Hook/Product click，成熟期看 Gross revenue/Orders/ROI？",
        "哪些写操作允许由一级代理执行，哪些必须由客户侧再次确认？",
    ]
    for item in questions:
        add_numbered(doc, item, number_id)

    # Sources.
    doc.add_heading("13. 官方资料与口径依据", level=1)
    h.add_body(doc, "核对日期：2026-08-31。以下以 TikTok 官方 Help Center、Partner Center 与官方 Business API SDK 为主。具体 API 字段、版本与权限仍需以目标账号当前文档和探测结果为准。")
    add_source(doc, "S1", "About account and asset level permissions", "https://ads.tiktok.com/resources/help/article/about-assets-and-asset-level-permissions", "Business Center 账户/资产权限与 Admin、Operator、Analyst 能力。")
    add_source(doc, "S2", "How to add partners to your Business Center", "https://ads.tiktok.com/help/article/invite-partners-into-tiktok-business-center", "合作伙伴仍需选择并授权具体账户与资产。")
    add_source(doc, "S3", "How to view reporting for your Product GMV Max campaign", "https://ads.tiktok.com/help/article/how-to-see-reporting-for-your-product-gmv-max-campaign", "Campaign/Product/Creative 报告字段、素材状态与分段观看指标。")
    add_source(doc, "S4", "Tips to measure product and video quality in Product GMV Max", "https://ads.tiktok.com/resources/help/article/tips-to-measure-product-and-video-quality-in-your-product-gmv-max-campaign", "ROI/CPO 包含 paid + organic，应结合 Gross revenue 判断。")
    add_source(doc, "S5", "About Product GMV Max", "https://ads.tiktok.com/resources/help/article/about-product-gmv-max", "GMV Max 自动使用可用素材并优化 paid + organic 及同日归因。")
    add_source(doc, "S6", "About attribution for GMV Max", "https://ads.tiktok.com/help/article/about-attribution-for-gmv-max", "Product/LIVE GMV Max 的归因边界。")
    add_source(doc, "S7", "TikTok Business API SDK", "https://github.com/tiktok/tiktok-business-api-sdk", "官方 SDK 列出 integrated reporting、GMV Max report 与 material report 等能力。")
    add_source(doc, "S8", "TikTok Shop API Developer Guide", "https://partner.tiktokshop.com/docv2/page/tts-developer-guide", "Seller/Creator/Partner 授权与 Shop API 领域。")
    add_source(doc, "S9", "Creative best practices for performance ads", "https://ads.tiktok.com/resources/help/article/creative-best-practices", "前 3/6 秒、Hook、卖点与 CTA 以及持续测试。")
    add_source(doc, "S10", "TikTok Creative Codes", "https://ads.tiktok.com/business/library/TikTok_CreativeCodes_May2023.pdf", "Hook、Body、Close/CTA 的官方结构框架。")

    doc.add_heading("文档结论", level=1)
    h.add_callout(doc, "建议立项方式", "并行做两类可行性验证：用 3-5 个真实客户账号完成数据字段探测/历史回放；用 50-100 条自有未投或外部参考素材验证 M00 的拆解、边界、授权闸门和保留/优化准确性。随后冻结 P0 指标字典与冷启动标签体系，实现 M00-M05 的只读诊断闭环；待采纳率、误判率与边界合规率达标后，再接增强复刻、视频生成与平台写操作。", fill=h.LIME_SOFT, accent=h.GREEN)

    doc.save(OUT_PATH)
    print(OUT_PATH)


if __name__ == "__main__":
    build_doc()

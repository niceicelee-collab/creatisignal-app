from __future__ import annotations

from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt


ROOT = Path(r"D:\Cursor\creatisignal-app-new")
OUT_DIR = ROOT / "deliverables" / "script-generation-optimization-prd"
OUT_PATH = OUT_DIR / "CreatiSignal_创意脚本生成优化_PRD_V1.0.docx"
HELPER_PATH = ROOT / ".codex-tmp" / "ai-friendly-inspiration-prd" / "build_prd.py"

SOURCE_IMAGES = {
    "current_input": Path(r"C:\Users\ice.li\AppData\Local\Temp\codex-clipboard-d523d671-b61a-456d-870a-a482c9d82807.png"),
    "current_output": Path(r"C:\Users\ice.li\AppData\Local\Temp\codex-clipboard-153e7765-d443-4b7a-b644-b81d2552696d.png"),
    "reference_editor": Path(r"C:\Users\ice.li\AppData\Local\Temp\codex-clipboard-97a8221c-cf00-465e-b592-9470ac5f21d7.png"),
    "customer_feedback": Path(r"C:\Users\ice.li\AppData\Local\Temp\codex-clipboard-f5ee360e-fc50-46ab-a245-1802d9c7f4e3.png"),
}


def load_helpers():
    spec = spec_from_file_location("doc_helpers", HELPER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load helper module: {HELPER_PATH}")
    module = module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


h = load_helpers()


def add_numbered(doc: Document, text: str, num_id: int, bold_prefix: str | None = None) -> None:
    p = doc.add_paragraph(style="Normal")
    h.apply_numbering(p, num_id)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.25
    if bold_prefix and text.startswith(bold_prefix):
        a = p.add_run(bold_prefix)
        h.set_run_font(a, 11, h.INK, bold=True)
        b = p.add_run(text[len(bold_prefix):])
        h.set_run_font(b, 11, h.BLACK)
    else:
        r = p.add_run(text)
        h.set_run_font(r, 11, h.BLACK)


def add_prompt_block(doc: Document, title: str, prompt: str, accent: str = "1F4D78") -> None:
    label = doc.add_paragraph()
    label.paragraph_format.space_before = Pt(7)
    label.paragraph_format.space_after = Pt(3)
    lr = label.add_run(title)
    h.set_run_font(lr, 10.5, accent, bold=True)

    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.12)
    p.paragraph_format.right_indent = Inches(0.12)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(9)
    p.paragraph_format.line_spacing = 1.08
    p_pr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), "F4F6F9")
    p_pr.append(shd)
    borders = OxmlElement("w:pBdr")
    left = OxmlElement("w:left")
    left.set(qn("w:val"), "single")
    left.set(qn("w:sz"), "14")
    left.set(qn("w:space"), "8")
    left.set(qn("w:color"), accent)
    borders.append(left)
    p_pr.append(borders)
    r = p.add_run(prompt.strip())
    h.set_run_font(r, 8.3, h.BLACK, name="Consolas")


def add_source_image(doc: Document, key: str, caption: str, alt: str, width: float = 6.4) -> None:
    path = SOURCE_IMAGES[key]
    if not path.exists():
        h.add_callout(doc, "截图缺失", f"未找到原始截图：{path}", fill="FFF4E5", accent="A15C00")
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run()
    shape = run.add_picture(str(path), width=Inches(width))
    shape._inline.docPr.set("descr", alt)
    cp = doc.add_paragraph(style="Caption Text")
    cp.add_run(caption)


def page_break(doc: Document) -> None:
    doc.add_page_break()


BASE_SYSTEM_PROMPT = r'''
你是 CreatiSignal 的出海短视频广告脚本引擎，服务对象是使用中文工作的出海运营、编导和素材团队。默认模型为 Qwen 3.7 Plus。

你的任务是把已确认的商品事实和创作设置转换为可拍摄、可编辑、可直接交给视频生成链路的结构化脚本。你不是投放顾问，不输出预算、竞价、投放建议或泛化注意事项。

【事实约束】
1. product_facts、selected_assets、verified_analysis 是唯一事实来源。不得补造价格、折扣、材质、功效、认证、销量、库存、使用体验或竞品结论。
2. 输入中没有的事实不得写入目标语言口播和屏幕文字。无法确认的内容写入 omitted_facts，不得以“可能、通常”绕过。
3. 商品名称、品牌、外观、颜色、结构、Logo 和已锁定卖点必须在所有分镜中一致。

【语言约束】
1. 面向中国用户的创意标题、方向说明、画面描述、编辑提示统一使用简体中文。
2. voiceover_target 与 on_screen_text_target 使用 target_locale 对应的自然本地语言，不做生硬直译。
3. 每条目标语言文案必须同时返回准确的 voiceover_zh 或 on_screen_text_zh，便于中国用户审核。
4. 不要把全部输出改成英文；也不要把目标语言口播替换为中文。

【多方向约束】
1. 按 script_count 生成 1–5 个脚本；默认 3 个。
2. 当 script_count>1 时，方向之间至少在以下两个维度不同：Hook 机制、叙事结构、核心证明方式、人物关系、使用场景、CTA 表达。仅替换同义词不算不同方向。
3. 每个方向只保留一个清晰的核心假设，并返回 difference_tags，便于比较。

【时长约束】
1. total_duration_sec 取 5–60 秒整数。分镜必须从 0 秒开始，连续、无重叠，最后一个 end_sec 必须等于 total_duration_sec。
2. Hook 原则上占总时长 15%–25%，且不超过 3 秒；CTA 原则上保留 1–2 秒。用户指定结构时以用户输入为准。
3. 控制目标语言口播长度，使 estimated_voice_sec 不超过该分镜时长。语速由 locale_config 提供；未提供时使用保守语速。

【输出内容】
1. 只输出真正用于理解、修改和生产的视频脚本字段：方向信息、分镜时间、画面、目标语言口播、中文释义、屏幕文字、资产引用、必要的真实性/连续性约束。
2. 不输出“投放建议”“建议比例”“泛化注意事项”“为什么要这么投”等字段。
3. 真实性/连续性约束仅在确有生成风险时写入 scene.constraints，并由前端放在“高级设置”中，不单独生成冗长注意事项章节。

【输出格式】
只返回合法 JSON，不使用 Markdown，不输出解释性前后缀。必须符合以下顶层结构：
{
  "request_id": "string",
  "model": "qwen-3.7-plus",
  "scripts": [
    {
      "script_id": "string",
      "title_zh": "string",
      "style": "auto|ugc_review|pain_solution|before_after|tutorial|influencer_recommendation|plot_twist",
      "creative_angle_zh": "string",
      "difference_tags": ["string"],
      "core_product_facts": ["string"],
      "total_duration_sec": 15,
      "scenes": [
        {
          "scene_id": "string",
          "role": "hook|body|proof|cta",
          "start_sec": 0,
          "end_sec": 3,
          "visual_zh": "string",
          "voiceover_target": "string",
          "voiceover_zh": "string",
          "on_screen_text_target": "string",
          "on_screen_text_zh": "string",
          "asset_refs": ["asset_id"],
          "estimated_voice_sec": 2.4,
          "constraints": ["string"]
        }
      ]
    }
  ],
  "omitted_facts": ["string"]
}
'''

AUTO_STYLE_PROMPT = r'''
能力：自动推荐脚本方向。
基于商品事实、目标人群、场景、目标时长和可用资产，在七种风格中选择最适合的 script_count 个方向。优先保证方向差异，不要把所有方案都写成“痛点—展示—CTA”。
选择规则：
1. 有真实体验证据和人物素材时，可选 UGC 真实测评或达人推荐。
2. 有明确问题场景时，可选痛点解决。
3. 有可公平复现的前后状态时，可选前后对比。
4. 有清晰操作步骤时，可选教程演示。
5. 有强冲突、误会或反转空间且不损害商品事实时，可选剧情反转。
6. 无充分证据时，选择风险更低、可验证的产品演示/痛点解决方向。
返回每个方向实际选择的 style，不输出额外推荐报告。
'''

STYLE_PROMPTS = {
    "UGC 真实测评": r'''
能力：UGC 真实测评。
脚本应像普通用户自然分享，不像品牌广告。使用第一人称或朋友式表达，先呈现真实使用场景与购买前顾虑，再用可见动作证明一个核心变化。
禁止编造“我用了几天”“很多人都说”“亲测有效”等未提供的体验事实；如没有真人真实体验输入，应把人物设定为演绎，不伪装真实证言。
画面允许轻微手持、生活化环境和自然停顿，但商品、动作和结果必须清晰。CTA 保持轻量，不使用虚假稀缺。
''',
    "痛点解决": r'''
能力：痛点解决。
前 0–3 秒用一个具体、可视的高频痛点建立共鸣，不使用空泛提问。随后让商品快速进入画面，通过一个完整动作闭环展示“问题发生—商品介入—结果可见”。
一个脚本只解决一个主痛点；卖点只保留与该痛点直接相关的 1–2 个。证明必须来自商品事实和可拍摄动作，不能只靠口播宣称。
''',
    "前后对比": r'''
能力：前后对比。
建立可公平比较的 Before/After：尽量保持同人物、同机位、同光线、同动作和同时间尺度，只改变商品介入这一核心变量。
前后差异必须是输入事实支持且能在画面中验证的变化；禁止夸张不可证实的功效。必要时使用分屏、同框或连续动作强化可比性，并在中文画面描述中写清对齐条件。
''',
    "教程演示": r'''
能力：教程演示。
把商品使用过程拆成 2–4 个清晰步骤，步骤数由总时长决定。每个步骤只包含一个主要动作，口播、屏幕文字与画面同步。
Hook 先承诺用户能学会什么或避免什么错误；主体展示关键动作和结果；CTA 引导查看商品或继续尝试。不得生成商品说明中不存在的使用方法。
''',
    "达人推荐": r'''
能力：达人推荐。
根据 target_persona、目标人群和平台语境组织自然推荐。达人先用与其人设一致的具体场景切入，再解释为什么该商品适合该场景，并用一个可见动作支撑。
不得虚构达人身份、粉丝反馈、长期使用经历或品牌合作关系。输入未提供真实达人时，人物仅作为“推荐型出镜角色”，不写成真实背书。
''',
    "剧情反转": r'''
能力：剧情反转。
用“预期—冲突—反转—商品理由”构造短剧情。前 3 秒必须出现冲突或商品线索，不能把商品拖到结尾才出现。
反转应服务于商品卖点，而不是无关搞笑；角色、场景和动作保持简单可拍。反转后用一个清晰镜头完成商品证明，再用短 CTA 收束。
''',
}

REGENERATE_PROMPT = r'''
能力：单个脚本方向重新生成。
输入包含 original_script、locked_fields、user_edits、regenerate_dimension 和 product_facts。
仅重生成指定 script_id，不改变其他脚本。必须保留 locked_fields 和所有 user_edits；围绕 regenerate_dimension 产生真正的新方案。
若 regenerate_dimension=hook，只改变 Hook 及必要的首镜衔接；正文事实、证明和 CTA 不变。
若 regenerate_dimension=full_direction，可改变 Hook、结构和场景，但仍锁定商品事实、目标语言、总时长和已选资产。
输出与主脚本 schema 相同，并增加 parent_script_id 与 changed_fields。只返回 JSON。
'''

SCENE_REWRITE_PROMPT = r'''
能力：分镜/字段 AI 重写。
输入包含完整 script、scene_id、target_field、rewrite_instruction、locked_fields 和 product_facts。
只修改 scene_id 的 target_field 以及维持时间/语义连续所必需的最少字段；不得覆盖其他分镜和用户已编辑内容。
target_field=voiceover_target 时，同时更新 voiceover_zh 和 estimated_voice_sec；不得超过分镜时长。
target_field=visual_zh 时，保持口播主张、资产引用和商品连续性不变。
返回 {"scene_id":"...","changed_fields":{...},"validation":{"duration_ok":true,"facts_ok":true,"locale_ok":true}}，只输出 JSON。
'''

ANALYSIS_TO_BRIEF_PROMPT = r'''
能力：从创意分析快捷生成脚本 Brief。
输入包含 source_analysis、product_facts、selected_insights、script_count、styles、target_locale、total_duration_sec。
先把分析内容拆为 verified_product_facts、proven_creative_mechanisms、audience_signals、reusable_scene_patterns 和 unsupported_claims。
只有带来源证据的卖点、商品特征和创意机制可以写入脚本；unsupported_claims 不得进入目标语言文案。
按用户选择的数量和风格生成脚本。如果 styles 为空，调用自动推荐逻辑；如果用户选择多个风格，每个风格至少生成一个方向。
输出使用主脚本 schema，并在每个 script 中增加 source_analysis_id 和 source_insight_ids。只返回 JSON。
'''

LOCALIZATION_PROMPT = r'''
能力：目标语言本地化与中文释义。
输入包含 source_script、target_locale、locale_config、product_facts。
保持每个分镜的时间、画面、资产、事实和 CTA 意图不变，只改写 voiceover_target 与 on_screen_text_target，使其符合目标市场自然表达；同步生成准确的中文释义。
本地化不是逐字翻译：允许调整语序、口语和文化表达，但不得新增事实、功效或优惠。控制口播时长不超过分镜时间。
返回完整脚本 JSON，并增加 localization_notes_zh（最多3条，仅说明必要的文化改写），不输出投放建议。
'''

QA_REPAIR_PROMPT = r'''
能力：脚本结构校验与修复。
你是低创造性的 JSON 校验器。输入包含 candidate_json、product_facts、target_locale、total_duration_sec、schema_version。
依次检查：JSON schema、必填字段、分镜连续性、总时长、口播时长、目标语言、中文释义、事实越界、资产 ID、重复方向。
只修复确定性错误；不得擅自重写用户创意。事实越界内容必须删除或改为已验证事实。
返回 {"valid":true|false,"repaired":true|false,"errors":[{"code":"...","path":"...","message_zh":"..."}],"result":{完整脚本JSON}}。只输出 JSON。
'''


def build() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = Document()
    h.configure_page(doc)
    h.configure_styles(doc)
    h.configure_header_footer(doc)
    bullet_id = h.add_num_definition(doc, "bullet")
    number_id = h.add_num_definition(doc, "decimal")

    header = doc.sections[0].header.paragraphs[0]
    header.clear()
    hr = header.add_run("CreatiSignal  |  创意脚本生成优化 PRD")
    h.set_run_font(hr, 9, h.MUTED, bold=True)

    settings = doc.settings._element
    update_fields = OxmlElement("w:updateFields")
    update_fields.set(qn("w:val"), "true")
    settings.append(update_fields)

    props = doc.core_properties
    props.title = "CreatiSignal 创意脚本生成优化 PRD"
    props.subject = "多方向脚本、双语审阅、分镜编辑、比较与视频生成承接"
    props.author = "CreatiSignal Product"
    props.keywords = "创意脚本, Brief, 多方向, 双语, 分镜编辑, Qwen 3.7 Plus, PRD"
    props.comments = "V1.0 engineering-ready product optimization requirements"

    kicker = doc.add_paragraph()
    kicker.paragraph_format.space_before = Pt(18)
    kicker.paragraph_format.space_after = Pt(5)
    kr = kicker.add_run("PRODUCT OPTIMIZATION REQUIREMENTS")
    h.set_run_font(kr, 10, h.GREEN, bold=True)

    title = doc.add_paragraph(style="Title")
    title.add_run("创意脚本生成优化")
    subtitle = doc.add_paragraph(style="Subtitle")
    subtitle.add_run("从单一只读英文表格，升级为多方向、可编辑、双语、可比较的脚本工作台")

    h.add_labeled(doc, "版本", "V1.0")
    h.add_labeled(doc, "日期", "2026-08-31")
    h.add_labeled(doc, "默认模型", "Qwen 3.7 Plus（模型标识由后端配置，不在前端写死）")
    h.add_labeled(doc, "目标用户", "使用中文工作的出海运营、编导、素材团队与视频生成操作者")
    h.add_labeled(doc, "证据范围", "图1–3 当前产品；图4–6 参考产品；图7 客户原声反馈；当前仓库实现基线")
    h.add_labeled(doc, "文档状态", "可进入产品/设计/前后端/模型工程技术评审")

    h.add_callout(
        doc,
        "核心方案",
        "使用“多方向卡片比较 + 单脚本分镜卡片编辑”的混合形态。默认一次生成 3 个机制差异明显的方向；运营先用中文比较，再进入目标语言+中文释义的分镜编辑器。宽表格仅作为桌面端对比/导出视图，连续大文本仅作为复制预览，不作为主编辑界面。",
        fill=h.LIME_SOFT,
        accent=h.GREEN,
    )

    doc.add_heading("阅读导航", level=1)
    nav = [
        ["产品/设计", "第1–7章", "现状诊断、方案选择、流程、功能与交互"],
        ["模型工程", "第8–10章", "数据协议、Qwen 调用策略和完整系统提示词"],
        ["前后端", "第6、8、11章", "功能优先级、实体/接口、状态与验收"],
        ["业务评审", "第2、3、12章", "客户反馈、目标边界和待确认事项"],
    ]
    h.add_table(doc, ["角色", "章节", "重点"], nav, [1700, 1800, 5860])

    page_break(doc)
    doc.add_heading("1. 结论先行：建议怎么改", level=1)
    h.add_body(doc, "当前体验的核心矛盾不是“脚本内容写得不够长”，而是生成结果无法帮助用户快速做方向选择，也无法继续修改并进入生产。因此，优化重点应从单次内容展示转向脚本决策与编辑工作流。")

    doc.add_heading("1.1 三种输出形态比较", level=2)
    layout_rows = [
        ["继续使用宽表格并开放单元格编辑", "结构清晰、改动小、便于导出", "横向滚动严重；长文本难编辑；多版本比较拥挤", "不建议作为主形态"],
        ["采用竞品式连续大文本编辑器", "输入自由、复制方便、开发较简单", "结构弱；分镜时长和字段校验困难；差异比较不直观", "只适合作为纯文本预览"],
        ["方向卡片 + 分镜卡片编辑器", "先比较方向，再逐镜编辑；适合双语、资产、版本和 AI 重写", "组件和状态管理稍复杂", "推荐；复用当前从零成片原型"],
    ]
    h.add_table(doc, ["方案", "优点", "主要问题", "结论"], layout_rows, [2550, 2500, 3000, 1310], keep_rows=False)

    doc.add_heading("1.2 推荐的信息形态", level=2)
    for text in [
        "第一层：3–5 个方向卡片，只展示创意角度、Hook、结构摘要、差异标签和收藏/比较/单独重生成。",
        "第二层：选中脚本进入分镜卡片编辑器，按时间轴编辑画面、目标语言口播、中文释义、屏幕文字和资产引用。",
        "第三层：真实性约束、人物动作、音乐/SFX 等放入高级设置；不在结果首屏输出“投放建议”和泛化“注意事项”。",
        "辅助视图：表格视图用于批量浏览、对比和导出；纯文本视图用于复制，不保存为主结构。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("1.3 为什么不是简单生成 5 个相似脚本", level=2)
    h.add_body(doc, "脚本数量本身不等于可测试方向。系统必须强制不同版本至少在 Hook 机制、叙事结构、证明方式、人物关系、场景或 CTA 中有两个维度不同，并在卡片上展示 difference_tags。否则用户得到的只是同义改写，无法用于素材测试。")

    page_break(doc)
    doc.add_heading("2. 背景与证据", level=1)
    doc.add_heading("2.1 当前产品问题（图1–3）", level=2)
    current_rows = [
        ["一次只生成 1 个脚本", "用户无法快速比较不同 Hook/叙事/证明方向，只能反复提交"],
        ["结果不可修改", "任何局部改动都要复制到外部工具，无法保持版本和回到视频生成"],
        ["目标文案全英文", "中国运营无法快速审核语义、事实和本地化质量"],
        ["冗余字段", "投放建议、泛化注意事项占据结果空间，却不直接帮助脚本生产"],
        ["宽表格承担主展示", "7 列长文本造成横向滚动，阅读和编辑都较困难"],
        ["商品与脚本上下文弱", "商品缩略图/商品库入口不够突出，用户反馈“用起来不方便”"],
    ]
    h.add_table(doc, ["问题", "业务影响"], current_rows, [3000, 6360])

    doc.add_heading("2.2 参考产品可借鉴与不应照搬之处（图4–6）", level=2)
    reference_rows = [
        ["可借鉴", "按时间段连续组织脚本；画面、Voice、Music、SFX 明确；用户可直接改文字"],
        ["不应照搬", "大段文本没有结构化字段、版本比较、中文运营层、资产引用和时长自动校验"],
        ["本产品机会", "在可编辑基础上，增加多方向比较、双语审核、分镜级 AI 重写和到视频生成的结构化承接"],
    ]
    h.add_table(doc, ["判断", "说明"], reference_rows, [2000, 7360])

    doc.add_heading("2.3 客户原声反馈（仅图7）", level=2)
    feedback_rows = [
        ["商品使用效率", "创意 Brief 上的缩略图和产品库需要更快安排，否则积分也难有效使用", "强化商品入口、最近使用、缩略图和资产引用"],
        ["跨能力承接", "创意分析后希望直接生成视频，或把卖点/产品特征提交到 Brief", "增加“从分析生成脚本/视频”的快捷入口与已验证事实承接"],
        ["时长", "不要只固定 15s/30s，需要 10s、12s 等", "支持 5–60s 自定义，并实时校验分镜总时长"],
        ["结果管理", "需要点赞、排前、对比脚本差异和修改", "收藏置顶、最多3个比较、差异高亮、版本编辑"],
    ]
    h.add_table(doc, ["反馈主题", "客户表达", "需求转译"], feedback_rows, [1900, 3900, 3560], keep_rows=False)

    doc.add_heading("2.4 当前仓库可复用能力", level=2)
    h.add_body(doc, "当前仓库的助手结果弹窗仍使用单脚本宽表格；但 /create/zero-to-video 已有 3 个方向、1–60 秒时长、目标语言、收藏、单版本重生成、分镜编辑、拆分/删除和局部 AI 重写的 Mock 原型。本需求应统一两条链路的数据结构和组件，不再新增第三套脚本形态。")

    page_break(doc)
    doc.add_heading("3. 产品目标、边界与成功指标", level=1)
    doc.add_heading("3.1 产品目标", level=2)
    for text in [
        "一次提交即可获得 3–5 个真正差异化方向，并在 30 秒内完成初步选择。",
        "中国用户可以用中文理解画面和策略，同时审核目标市场的自然语言文案。",
        "脚本可以在产品内逐镜修改、AI 重写、保存版本和恢复，不依赖外部文档。",
        "选中的脚本以结构化数据直接进入视频生成，保留商品事实、资产和用户修改。",
        "从创意分析可带着已验证卖点、产品特征和创意机制进入脚本生成。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("3.2 非目标", level=2)
    for text in [
        "本期不建设完整在线文档协作、多人光标、评论审批系统。",
        "不让模型生成预算、投放、竞价或 ROI 建议；脚本模块不替代投放诊断。",
        "不保证模型输出自动具备广告合规性；系统提供事实约束与校验，但关键类目仍需人工审核。",
        "不让 AI 自动覆盖用户编辑；任何重生成与重写都必须限定范围并可撤销。",
        "P0 不根据脚本预测真实 CTR/GMV，也不以虚构评分排序。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("3.3 成功指标", level=2)
    success_rows = [
        ["方向效率", "一次生成后直接选中任一方向的任务占比", "上线4周 ≥60%"],
        ["编辑可用性", "脚本在产品内发生至少一次有效编辑的任务占比", "≥40%"],
        ["外部跳失", "生成后仅复制、未保存/未进入视频生成的占比", "较基线下降 ≥25%"],
        ["双语审核", "非中文目标语言脚本具备中文释义的完整率", "100%"],
        ["结构正确", "分镜连续且总时长有效的生成成功率", "≥99%（含一次修复）"],
        ["事实安全", "未验证商品事实进入目标语言文案", "0 个已知严重事件"],
        ["承接率", "选中脚本后进入视频生成的比例", "较基线提升 ≥20%"],
    ]
    h.add_table(doc, ["维度", "指标", "建议目标"], success_rows, [1900, 4800, 2660])

    page_break(doc)
    doc.add_heading("4. 信息架构与整体流程", level=1)
    doc.add_heading("4.1 页面结构", level=2)
    ia_rows = [
        ["创作输入区", "商品缩略图/商品库、创意描述、风格、目标语言、时长、数量、数字人/人物、参考分析"],
        ["方向比较区", "3–5 个方向卡片；收藏、比较、单独重生成、选择"],
        ["脚本编辑区", "分镜时间轴卡片；画面、口播、中文释义、屏幕文字、资产、AI 重写、拆分/删除"],
        ["生成承接区", "商品与脚本摘要、时长校验、资产缺失、保存草稿、生成视频"],
        ["版本与视图区", "自动保存、历史版本、撤销/恢复；卡片/表格/纯文本视图切换"],
    ]
    h.add_table(doc, ["区域", "内容"], ia_rows, [2300, 7060])

    doc.add_heading("4.2 主流程", level=2)
    main_steps = [
        ("选择商品", "从公共商品库选择；展示最近使用、缩略图、名称和主要资产。"),
        ("设置创作条件", "输入可选创意描述，选择自动/明确风格、目标语言、5–60 秒时长和 1–5 个脚本数量。"),
        ("生成多个方向", "系统冻结商品事实并生成差异化方向；解析失败最多自动修复 1 次。"),
        ("快速比较", "用户收藏、置顶、勾选最多3个脚本，查看差异维度和关键分镜。"),
        ("选择并编辑", "进入分镜卡片编辑器，手动修改或对单字段/单镜 AI 重写。"),
        ("保存版本", "编辑自动保存为草稿；AI 重写产生 revision，可撤销或恢复。"),
        ("校验并生成视频", "检查时长、事实、目标语言和资产；通过后把结构化脚本提交视频生成。"),
    ]
    for title_text, desc in main_steps:
        add_numbered(doc, f"{title_text}：{desc}", number_id, bold_prefix=f"{title_text}：")

    doc.add_heading("4.3 从创意分析进入", level=2)
    for text in [
        "创意分析页新增“生成脚本”与“生成视频”快捷入口；未选择商品时先补选商品。",
        "系统展示从分析中提取的卖点、产品特征、创意机制和场景，用户勾选后提交。",
        "提交时可选择脚本数量和多个风格；默认生成 3 个不同风格方向。",
        "所有分析事实必须保留 source_analysis_id/source_insight_id；无证据内容不得进入文案。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("4.4 编辑与重生成边界", level=2)
    h.add_callout(doc, "不覆盖用户编辑", "手动编辑字段进入 locked_fields。单脚本重生成默认保留用户编辑；分镜重写只修改指定字段；全方向重生成前必须提示哪些字段会变化，并允许撤销。", fill="FFF4E5", accent="A15C00")

    page_break(doc)
    doc.add_heading("5. 需求清单与优先级", level=1)
    requirement_rows = [
        ["R01", "统一商品入口与资产引用", "P0", "商品缩略图、商品库、最近使用、选中资产 alias"],
        ["R02", "自定义创作条件", "P0", "7种风格、目标语言、5–60s、1–5个脚本"],
        ["R03", "多方向差异化生成", "P0", "默认3个；方向至少2个维度不同"],
        ["R04", "双语脚本输出", "P0", "画面/说明中文；目标文案+中文释义"],
        ["R05", "方向卡片与选择", "P0", "摘要、差异标签、收藏、单独重生成"],
        ["R06", "基础比较", "P0", "最多3个脚本并排；差异字段高亮"],
        ["R07", "分镜卡片编辑器", "P0", "逐字段编辑、拆分/删除、时长联动"],
        ["R08", "自动保存与版本恢复", "P0", "手动编辑与 AI revision 可撤销"],
        ["R09", "结构化提交视频生成", "P0", "校验通过后提交，保留资产和编辑"],
        ["R10", "结果瘦身与视图切换", "P0", "移除投放建议/泛化注意事项；表格/纯文本为辅助"],
        ["R11", "分镜/字段 AI 重写", "P1", "限定范围重写，不影响其他字段"],
        ["R12", "从创意分析生成脚本", "P1", "事实与创意机制一键承接"],
        ["R13", "多语言本地化", "P1", "在选中脚本上切换市场并生成双语版本"],
        ["R14", "高级比较与合并", "P1", "逐镜 diff、从 A/B 择优组成新版本"],
        ["R15", "团队协作与模板", "P2", "评论、审批、团队风格模板"],
        ["R16", "效果回流", "P2", "脚本版本与生成视频/投放结果关联"],
    ]
    h.add_table(doc, ["ID", "需求", "优先级", "范围"], requirement_rows, [700, 2550, 900, 5210], keep_rows=False)

    page_break(doc)
    doc.add_heading("6. 每个功能的细节与流程", level=1)
    doc.add_heading("6.1 R01 统一商品入口与资产引用（P0）", level=2)
    for text in [
        "输入区左侧固定商品缩略图；未选择时显示“从商品库选择”，已选择时可更换/移除。",
        "商品选择器按最近使用、更新时间和搜索展示；支持查看名称、品牌、主卖点、商品图/视频数量。",
        "选中的商品事实和资产生成 product_snapshot，防止商品库后续修改覆盖历史脚本。",
        "用户可勾选参与脚本的商品图、视频、数字人或参考素材；模型只引用传入的 asset_id/alias。",
        "资产不可用时保留脚本，但生成视频按钮禁用并提示补充/替换资产。",
    ]:
        h.add_bullet(doc, text, bullet_id)
    h.add_labeled(doc, "验收", "从商品库新增/编辑商品后可在脚本选择器看到；脚本中的 asset_refs 均能回到具体资产。")

    doc.add_heading("6.2 R02 自定义创作条件（P0）", level=2)
    settings_rows = [
        ["脚本风格", "自动推荐、UGC真实测评、痛点解决、前后对比、教程演示、达人推荐、剧情反转", "单选；自动推荐由模型选择实际 style"],
        ["目标语言", "English US、Español MX、Português BR 等", "P0 至少支持当前3种；UI 中文"],
        ["视频时长", "5–60 秒整数", "快捷 10/15/20/30 + 自定义；默认15"],
        ["脚本数量", "1–5", "默认3；超过3提示耗时/积分增加"],
        ["人物/数字人", "可选", "无人物时不得生成依赖真人证言的脚本"],
        ["创意描述", "0–2000字", "用户指令优先，但不得覆盖商品事实与安全规则"],
    ]
    h.add_table(doc, ["设置", "值", "规则"], settings_rows, [1800, 4200, 3360])

    doc.add_heading("6.3 R03 多方向差异化生成（P0）", level=2)
    for text in [
        "默认一次请求返回3个方向；任一方向失败时返回 PARTIAL，不丢弃成功方向。",
        "每个方向必须返回 difference_tags；系统对 Hook、结构、证明、人物、场景、CTA 做结构化去重。",
        "若两个方向仅有文案同义改写，判定 similarity_high，触发一次定向修复/补生成。",
        "Auto 模式可以混合风格；明确选择风格时多个方向仍需在 Hook/证明/场景中产生差异。",
        "方向生成完成后不直接展开所有分镜，先展示摘要卡片，降低阅读负担。",
    ]:
        h.add_bullet(doc, text, bullet_id)
    h.add_labeled(doc, "去重建议", "P0 使用结构字段 exact/集合相似度 + 文本 embedding 阈值；无 embedding 时至少校验 style、hook_mechanism、structure_signature 不能全部一致。")

    doc.add_heading("6.4 R04 双语脚本输出（P0）", level=2)
    for text in [
        "创意标题、方向说明、画面描述、编辑提示使用简体中文。",
        "旁白和屏幕文字使用目标语言，并紧邻展示中文释义；可分别复制。",
        "中文释义用于审核，不参与目标视频配音/字幕导出。",
        "切换目标语言不自动覆盖原版本；创建 localization revision，并保留原文。",
        "目标语言无法识别或中文释义缺失时，脚本校验失败，不允许直接生成视频。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("6.5 R05–R06 方向卡片、收藏与比较（P0）", level=2)
    for text in [
        "卡片字段：方向标签、中文标题、创意角度、目标人群、Hook、结构摘要、差异标签、目标时长。",
        "操作：选择、收藏/取消收藏、单独重生成、复制摘要、加入比较。",
        "收藏脚本在当前任务内置顶，但不改变模型结果顺序；保存 favorite_at。",
        "比较最多3个脚本，按创意机制、Hook、证明方式、场景、CTA、分镜数展示差异；相同项折叠。",
        "P0 比较基于结构字段，无需调用模型；不得生成主观“胜率/CTR评分”。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("6.6 R07 分镜卡片编辑器（P0）", level=2)
    scene_rows = [
        ["基础", "分镜序号、role、start/end、画面描述（中文）", "可编辑；时间连续校验"],
        ["语言", "目标语言口播、中文释义、目标语言屏幕文字、中文释义", "分别编辑/复制；联动语速校验"],
        ["资产", "商品图、视频、人物、参考素材 alias", "从资产选择，不允许模型生成不存在 ID"],
        ["操作", "AI重写、拆分、删除、复制、撤销", "只作用当前 scene/revision"],
        ["高级", "人物动作、真实性/连续性约束、Music/SFX", "默认折叠；无必要不生成"],
    ]
    h.add_table(doc, ["分组", "字段", "交互规则"], scene_rows, [1400, 4200, 3760])
    for text in [
        "手动修改后 800ms 防抖自动保存；顶部显示“保存中/已保存/保存失败”。",
        "修改 start/end 后实时计算空隙、重叠和总时长；未通过时只禁用生成视频，不阻断继续编辑。",
        "拆分在中点创建新镜头并继承必要上下文；删除后提示自动合并时间或要求用户修复。",
        "宽表格作为“表格视图”只在桌面端提供，适合整体扫描与导出；默认仍是卡片编辑。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("6.7 R08 自动保存与版本恢复（P0）", level=2)
    for text in [
        "首次选择方向创建 ScriptDraft V1；手动编辑按批次产生 revision，不每个键盘输入都生成版本。",
        "AI 重写、单方向重生成、本地化、从比较合并均单独产生 revision，并记录 parent_revision_id。",
        "支持撤销最近一次 AI 操作、查看版本时间线、恢复旧版本；恢复会创建新 revision，不删除历史。",
        "切换商品、时长或风格会提示是否保留当前草稿；用户确认后才重新生成。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    doc.add_heading("6.8 R09 结构化提交视频生成（P0）", level=2)
    validation_rows = [
        ["时长", "首镜从0开始；无重叠/间隙；末镜等于目标时长；口播估时不超镜头"],
        ["语言", "目标语言字段存在且与 locale 一致；中文释义完整"],
        ["事实", "口播/字幕只使用 product_snapshot 和 verified_analysis 中的事实"],
        ["资产", "asset_refs 存在、可访问且用途匹配；缺失时定位到具体分镜"],
        ["结构", "至少包含 Hook 和主体；商业脚本默认应有 CTA，用户明确关闭除外"],
    ]
    h.add_table(doc, ["校验", "通过条件"], validation_rows, [1800, 7560])
    h.add_body(doc, "校验通过后提交 script_revision_id，不拼接当前页面文本；视频生成服务从结构化 ScriptScene 编译 Recipe/Prompt。这样可以保留用户修改、资产 alias 和目标语言，不因复制文本丢失。")

    doc.add_heading("6.9 R10 结果瘦身与辅助视图（P0）", level=2)
    remove_rows = [
        ["删除", "投放建议、预算/ROI建议、泛化注意事项、重复的视频比例/总时长段落"],
        ["保留但移位", "真实性/一致性约束放高级设置；视频比例/时长放页面设置和摘要，不由模型重复生成"],
        ["新增", "差异标签、中文释义、资产引用、版本、保存状态、比较入口"],
        ["视图", "卡片编辑（默认）/ 表格扫描 / 纯文本复制；三者读取同一结构化数据"],
    ]
    h.add_table(doc, ["处理", "内容"], remove_rows, [2000, 7360])

    doc.add_heading("6.10 R11–R14 P1 能力", level=2)
    p1_rows = [
        ["分镜/字段 AI 重写", "选择“更口语/更短/更有冲突/自定义”或输入指令；只修改指定范围，返回 changed_fields"],
        ["从创意分析生成", "勾选已验证卖点、特征和机制；选择数量/风格；保留来源 ID"],
        ["多语言本地化", "保留结构与事实，按 locale 改写目标文案并生成中文释义"],
        ["高级比较与合并", "逐镜 diff；可选 A 的 Hook+B 的主体+C 的 CTA，生成新 revision 并重新校验"],
    ]
    h.add_table(doc, ["能力", "流程"], p1_rows, [2600, 6760])

    page_break(doc)
    doc.add_heading("7. 关键交互与状态", level=1)
    doc.add_heading("7.1 生成状态", level=2)
    state_rows = [
        ["IDLE", "未提交/输入已变化", "可生成"],
        ["GENERATING", "请求中", "显示预计数量与进度，不隐藏原草稿"],
        ["PARTIAL", "部分方向成功", "展示成功方向；失败方向可补生成"],
        ["SUCCEEDED", "全部方向成功且校验通过", "进入比较/编辑"],
        ["REPAIRING", "JSON/时长/事实校验失败，自动修复一次", "显示“正在校正结构”"],
        ["FAILED", "生成或修复失败", "保留输入与 request_id；允许重试"],
    ]
    h.add_table(doc, ["状态", "含义", "页面行为"], state_rows, [1500, 3800, 4060])

    doc.add_heading("7.2 编辑状态", level=2)
    edit_rows = [
        ["SAVED", "服务端已保存", "允许离开"],
        ["DIRTY", "本地有未提交修改", "防抖保存；离开前保护"],
        ["SAVING", "保存中", "不阻断继续编辑"],
        ["SAVE_FAILED", "保存失败", "保留本地内容并重试；不能显示已保存"],
        ["LOCKED_ACTION", "AI 重写当前分镜", "只锁定该分镜相关操作，其他分镜可编辑"],
    ]
    h.add_table(doc, ["状态", "定义", "行为"], edit_rows, [1800, 3500, 4060])

    doc.add_heading("7.3 错误与边界", level=2)
    error_rows = [
        ["商品事实不足", "允许生成低风险演示脚本；在输入区提示补充事实，不让模型猜测"],
        ["请求返回非 JSON", "进入 REPAIRING；一次失败后提示重试并记录 raw_output"],
        ["多个脚本高度相似", "保留差异最大的方向，对重复方向定向补生成"],
        ["口播超时", "标出具体分镜；自动修复只压缩文案，不缩短用户已锁定镜头"],
        ["切换语言", "创建新 revision，不覆盖原语言"],
        ["资产删除/无权限", "脚本可读；视频生成禁用并提示替换 asset_ref"],
        ["积分不足", "在提交前显示数量对应消耗；保留脚本草稿，不把生成失败当脚本失败"],
    ]
    h.add_table(doc, ["场景", "处理"], error_rows, [2600, 6760])

    page_break(doc)
    doc.add_heading("8. 数据结构、计算与接口", level=1)
    doc.add_heading("8.1 核心实体", level=2)
    entity_rows = [
        ["ScriptProject", "id, product_snapshot_id, source_analysis_id, settings, status", "一次脚本创作任务"],
        ["GenerationRequest", "request_id, model_id, prompt_version, input_hash, script_count, status, raw_output", "模型请求与审计"],
        ["ScriptVersion", "id, project_id, parent_id, title_zh, style, difference_tags, selected, favorite_at", "一个方向/版本"],
        ["ScriptScene", "role, start/end, visual_zh, target/zh voiceover, target/zh text, asset_refs, constraints", "可编辑分镜"],
        ["ScriptRevision", "id, script_id, parent_revision_id, source, changed_fields, operator, created_at", "手动/AI/本地化版本"],
        ["ProductSnapshot", "product facts, asset aliases, version, captured_at", "冻结事实"],
    ]
    h.add_table(doc, ["实体", "关键字段", "用途"], entity_rows, [1900, 5100, 2360], keep_rows=False)

    doc.add_heading("8.2 关键计算", level=2)
    calc_rows = [
        ["分镜时长", "scene_duration = end_sec - start_sec", "必须 >0"],
        ["脚本总时长", "max(end_sec) - min(start_sec)", "min=0；max=target duration"],
        ["连续性", "next.start_sec - current.end_sec", "绝对值≤0.1s；否则 gap/overlap"],
        ["口播估时", "word_or_char_count / locale_speech_rate", "speech_rate 从 locale_config 读取"],
        ["方向差异", "结构标签差异 + 文本相似度", "至少2个结构维度不同；P0 不生成效果分"],
        ["自动保存", "last_edit_at + 800ms debounce", "批量写 revision；失败保留本地"],
    ]
    h.add_table(doc, ["计算", "公式", "约束"], calc_rows, [2200, 3800, 3360])

    doc.add_heading("8.3 建议接口边界", level=2)
    api_rows = [
        ["POST /script-projects", "product_id/source_analysis/settings", "创建项目与 product_snapshot"],
        ["POST /script-projects/{id}/generate", "script_count/style/locale/duration/idempotency_key", "异步 generation_request"],
        ["GET /script-projects/{id}", "—", "方向、选中、收藏、revision、保存状态"],
        ["PATCH /script-revisions/{id}", "changed_fields/base_version", "乐观锁保存编辑"],
        ["POST /scripts/{id}/regenerate", "dimension/locked_fields", "只重生成当前方向"],
        ["POST /scripts/{id}/scenes/{scene_id}/rewrite", "field/instruction/locked_fields", "局部 AI 重写"],
        ["POST /scripts/{id}/localize", "target_locale", "创建本地化 revision"],
        ["POST /scripts/{id}/validate", "revision_id", "返回结构/事实/语言/资产错误"],
        ["POST /video-tasks", "script_revision_id/idempotency_key", "结构化提交视频生成"],
    ]
    h.add_table(doc, ["接口", "关键输入", "输出/约束"], api_rows, [3200, 3300, 2860], keep_rows=False)

    doc.add_heading("8.4 哪些能力不需要调用模型", level=2)
    no_model_rows = [
        ["收藏/置顶", "直接写 favorite_at 并排序"],
        ["比较相同字段", "读取结构化字段做 diff；无需 Qwen 总结"],
        ["分镜时长/连续性", "确定性计算"],
        ["资产存在性", "资产服务校验"],
        ["保存、撤销、版本恢复", "数据库 revision"],
        ["表格/纯文本视图", "同一 JSON 的前端映射"],
    ]
    h.add_table(doc, ["能力", "实现"], no_model_rows, [3200, 6160])

    page_break(doc)
    doc.add_heading("9. Qwen 3.7 Plus 调用策略", level=1)
    h.add_callout(doc, "提示词分层", "不要为每个风格复制一整套独立大 Prompt。后端按 Base System Prompt + Style Overlay + Task Overlay + User JSON 组装，并记录 prompt_version。这样既能提供每个能力的明确系统提示词，又能减少规则漂移。", fill="EAF4FF", accent=h.BLUE)

    model_rows = [
        ["多方向生成", "Base + 风格 Overlay", "0.70–0.85", "0.90", "JSON/schema 模式优先；一次返回1–5条"],
        ["单方向重生成", "Base + Regenerate", "0.65–0.80", "0.90", "携带 locked_fields/user_edits"],
        ["分镜局部重写", "Base + Scene Rewrite", "0.45–0.65", "0.85", "低发散；只返回 changed_fields"],
        ["分析转脚本", "Base + Analysis-to-Brief + Style", "0.65–0.80", "0.90", "来源 ID 必填"],
        ["本地化", "Base + Localization", "0.30–0.50", "0.80", "结构不变"],
        ["校验修复", "QA Repair", "0.10–0.25", "0.70", "最多自动修复1次"],
    ]
    h.add_table(doc, ["能力", "提示词组合", "temperature建议", "top_p建议", "说明"], model_rows, [1850, 2350, 1500, 1100, 2560], keep_rows=False)
    h.add_body(doc, "参数值为实现建议，需按实际 Qwen 3.7 Plus API、JSON 模式和响应长度测试校准。model_id、max_tokens 和 provider 参数由后端配置中心管理，前端只展示模型名称。")

    doc.add_heading("9.1 请求输入 JSON", level=2)
    input_example = r'''
{
  "request_id": "req_123",
  "product_facts": {
    "product_id": "p_001",
    "name": "...",
    "brand": "...",
    "category": "...",
    "selling_points": [{"id":"sp1","text":"...","verified":true}],
    "audiences": ["..."],
    "scenarios": ["..."],
    "prohibited_claims": ["..."],
    "assets": [{"asset_id":"a1","type":"product_image","description_zh":"..."}]
  },
  "creative_settings": {
    "style": "auto",
    "target_locale": "en-US",
    "total_duration_sec": 12,
    "script_count": 3,
    "target_persona": null,
    "user_idea_zh": "..."
  },
  "verified_analysis": [],
  "locale_config": {"speech_rate": 2.2, "unit": "words_per_sec"}
}
'''
    add_prompt_block(doc, "实现输入示例", input_example, accent="607B12")

    doc.add_heading("9.2 服务端后处理", level=2)
    for text in [
        "先做 JSON parse/schema 校验，再做时长、语言、事实和资产的确定性校验。",
        "只在可修复的结构错误时调用 QA Repair；事实来源不足不调用修复补造，直接提示用户补充。",
        "保存 raw_output、prompt_version、model_id、latency、token_usage 和 validation_errors；前端不展示 raw prompt。",
        "同一 input_hash+prompt_version+idempotency_key 重试不得重复扣费或创建重复项目。",
    ]:
        h.add_bullet(doc, text, bullet_id)

    page_break(doc)
    doc.add_heading("10. 各脚本能力对应的系统提示词", level=1)
    h.add_body(doc, "以下提示词为工程可直接使用的初稿。实际调用时，用户商品与设置以 JSON 作为 user message 传入；不要把用户内容拼进 system prompt。")

    doc.add_heading("10.1 通用基础系统提示词", level=2)
    add_prompt_block(doc, "P00 · BASE_SYSTEM_PROMPT", BASE_SYSTEM_PROMPT, accent="1F4D78")

    doc.add_heading("10.2 七种脚本风格", level=2)
    add_prompt_block(doc, "P01 · 自动推荐", AUTO_STYLE_PROMPT, accent="607B12")
    for idx, (name, prompt) in enumerate(STYLE_PROMPTS.items(), start=2):
        add_prompt_block(doc, f"P{idx:02d} · {name}", prompt, accent="607B12")

    doc.add_heading("10.3 编辑、承接与校验能力", level=2)
    add_prompt_block(doc, "P08 · 单个脚本方向重新生成", REGENERATE_PROMPT, accent="7C3FC1")
    add_prompt_block(doc, "P09 · 分镜/字段 AI 重写", SCENE_REWRITE_PROMPT, accent="7C3FC1")
    add_prompt_block(doc, "P10 · 创意分析转脚本 Brief", ANALYSIS_TO_BRIEF_PROMPT, accent="2368C4")
    add_prompt_block(doc, "P11 · 目标语言本地化", LOCALIZATION_PROMPT, accent="2368C4")
    add_prompt_block(doc, "P12 · 脚本结构校验与修复", QA_REPAIR_PROMPT, accent="9B1C1C")

    doc.add_heading("10.4 Prompt 组装规则", level=2)
    prompt_map = [
        ["自动推荐多方向", "P00 + P01"],
        ["指定风格多方向", "P00 + 对应 P02–P07"],
        ["单方向重生成", "P00 + P08"],
        ["分镜/字段重写", "P00 + P09"],
        ["从分析生成", "P00 + P10 + P01或P02–P07"],
        ["切换目标语言", "P00 + P11"],
        ["校验修复", "只使用 P12；低温；不叠加创作 Prompt"],
    ]
    h.add_table(doc, ["调用场景", "System Prompt 组合"], prompt_map, [3300, 6060])

    page_break(doc)
    doc.add_heading("11. 验收标准", level=1)
    acceptance_rows = [
        ["AC01", "数量", "脚本数量可选1–5，默认3；返回数量与请求一致，部分失败明确标识"],
        ["AC02", "方向差异", "多脚本至少2个结构维度不同；仅同义改写触发补生成"],
        ["AC03", "中文可理解", "创意/画面/说明为中文；目标文案紧邻中文释义，完整率100%"],
        ["AC04", "移除无用字段", "结果首屏不出现投放建议、预算、ROI或独立注意事项章节"],
        ["AC05", "自定义时长", "10s、12s 等5–60s输入有效；总时长、分镜连续和口播估时实时校验"],
        ["AC06", "商品资产", "商品缩略图与商品库可用；每个 asset_ref 可定位真实资产"],
        ["AC07", "编辑", "所有脚本字段可修改；自动保存失败不丢内容；离开保护有效"],
        ["AC08", "AI重写", "只改变指定脚本/分镜/字段，locked_fields 与用户编辑不被覆盖"],
        ["AC09", "收藏比较", "收藏置顶；最多3个脚本比较；差异来自结构字段而非虚构评分"],
        ["AC10", "版本", "手动编辑、重生成、本地化均生成 revision，可撤销/恢复"],
        ["AC11", "事实", "目标语言口播/字幕不包含 product_snapshot 外的商品主张"],
        ["AC12", "分析承接", "从分析进入后保留 source_insight_ids，可选择数量和风格"],
        ["AC13", "视频承接", "提交 script_revision_id；生成视频使用编辑后的结构和资产"],
        ["AC14", "错误", "非JSON、超时长、资产缺失、积分不足、保存失败均有明确状态与可恢复入口"],
        ["AC15", "视图一致", "卡片、表格、纯文本显示同一 revision，不产生三份数据"],
    ]
    h.add_table(doc, ["编号", "范围", "可测试条件"], acceptance_rows, [850, 1700, 6810], keep_rows=False)

    doc.add_heading("11.1 关键边界测试", level=2)
    edge_rows = [
        ["script_count=1/3/5", "数量、耗时提示、部分成功"],
        ["duration=5/10/12/60", "自定义时长、分镜连续、CTA/Hook 调整"],
        ["英文/西语/葡语", "目标语言与中文释义、口播估时"],
        ["商品只有名称无卖点", "不补造事实，提示补充或生成低风险演示"],
        ["用户编辑后单独重生成", "锁定编辑不丢失，其他版本不变化"],
        ["删除中间分镜", "时间修复提示，未通过前禁用生成视频"],
        ["相同脚本高相似", "定向补生成而非全部重跑"],
        ["分析含无来源推断", "unsupported_claims 不进入脚本"],
        ["资产在保存后被删除", "脚本可读，生成受阻并可替换"],
    ]
    h.add_table(doc, ["测试输入", "验证重点"], edge_rows, [3500, 5860])

    page_break(doc)
    doc.add_heading("12. 分期、依赖与待确认事项", level=1)
    roadmap_rows = [
        ["P0", "统一脚本数据结构；商品/设置；多方向；双语；卡片比较；分镜编辑；版本保存；结构化去生成；结果瘦身", "主流程可用"],
        ["P1", "局部 AI 重写；创意分析承接；本地化；高级比较/合并；更多语言", "提高生产效率"],
        ["P2", "团队模板/审批；脚本-视频-投放效果回流；实验知识库", "规模化与学习闭环"],
    ]
    h.add_table(doc, ["阶段", "范围", "目标"], roadmap_rows, [1200, 6500, 1660], keep_rows=False)

    doc.add_heading("12.1 研发依赖", level=2)
    dependencies = [
        ["商品库/资产服务", "product_snapshot、asset alias、权限和可用性"],
        ["Qwen 3.7 Plus 网关", "JSON/schema 模式、token 上限、模型参数、错误码、用量"],
        ["脚本存储", "project/version/scene/revision 与乐观锁"],
        ["创意分析", "verified insight、来源 ID、卖点/特征/机制字段"],
        ["视频生成", "接收 script_revision_id 并编译 Recipe/Prompt"],
        ["积分系统", "按脚本数量预估与实际用量结算，失败不重复扣费"],
    ]
    h.add_table(doc, ["依赖", "需要能力"], dependencies, [2600, 6760])

    doc.add_heading("12.2 待确认", level=2)
    decisions = [
        ["D01", "P0 默认脚本数量是否固定为3；单次最多5是否满足成本"],
        ["D02", "时长下限采用1s还是5s；本 PRD 建议5–60s以保证脚本可用性"],
        ["D03", "P0 首发语言与 locale 语速配置"],
        ["D04", "Qwen 3.7 Plus 实际 API model_id、JSON schema 能力和最大输出长度"],
        ["D05", "自动推荐是否允许同一风格的多个机制方向"],
        ["D06", "创意分析中哪些字段可被标记为 verified，谁负责确认"],
        ["D07", "收藏是任务内排序还是跨项目脚本资产；P0 建议先任务内"],
        ["D08", "表格视图是否允许直接批量编辑；P0 建议只读/轻编辑"],
        ["D09", "视频生成服务现有 Recipe 是否支持双语、asset alias 和 revision_id"],
    ]
    h.add_table(doc, ["编号", "待确认事项"], decisions, [1000, 8360], keep_rows=False)

    page_break(doc)
    doc.add_heading("附录 A：截图证据", level=1)
    h.add_body(doc, "截图仅用于说明现状、参考和客户反馈，不作为最终页面样式或模型输出规范。")
    add_source_image(doc, "current_input", "图 A-1  当前脚本输入：商品、风格、语言、15s", "当前创意脚本输入界面")
    add_source_image(doc, "current_output", "图 A-2  当前结果：单一脚本与宽表格", "当前单一脚本宽表格结果界面")
    add_source_image(doc, "reference_editor", "图 A-3  参考产品：连续文本式脚本编辑", "参考产品脚本编辑页面")
    add_source_image(doc, "customer_feedback", "图 A-4  客户原声反馈（仅图7）", "客户关于商品库、分析承接、自定义时长、点赞和对比的反馈", width=4.6)

    doc.add_heading("附录 B：原型与目标能力映射", level=1)
    mapping = [
        ["助手 BriefMode", "保留商品、风格、语言、时长输入；补数量、资产和自定义时长快捷值"],
        ["TaskResultModal/BriefScriptTable", "替换为方向卡片 + 选中脚本编辑；表格降级为辅助视图"],
        ["ZeroToVideoWorkspace", "复用3方向、收藏、重生成、分镜编辑、拆分/删除和生成承接"],
        ["zero-to-video-data mock", "改为服务端 Qwen 输出与统一 schema；保留前端类型和校验思路"],
        ["创意分析", "新增 verified insight → script project 快捷入口"],
    ]
    h.add_table(doc, ["现有模块", "目标处理"], mapping, [3000, 6360])

    doc.add_heading("文档结束", level=1)
    h.add_body(doc, "建议技术评审优先确认统一 ScriptProject/ScriptRevision 数据结构与 Prompt 组合协议，再合并助手弹窗和从零成片两套脚本体验。", bold=True, color=h.INK)

    doc.save(OUT_PATH)
    print(OUT_PATH)


if __name__ == "__main__":
    build()

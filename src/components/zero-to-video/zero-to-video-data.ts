import type { Product } from "@/components/products/product-data"

export type SceneType = "Hook" | "主体" | "CTA"

export type SceneDraft = {
  id: string
  type: SceneType
  start: number
  end: number
  visual: string
  voiceover: string
  meaningZh: string
  onScreenText: string
  assetRefs: string
  action: string
  constraints: string
}

export type BriefVersion = {
  id: "safe" | "selling" | "explore"
  label: string
  title: string
  mechanism: string
  angle: string
  audience: string
  template: string
  hook: string
  structure: string
  voiceoverSummary: string
  duration: number
  accent: string
  scenes: SceneDraft[]
}

export const SCRIPT_STYLES = [
  "UGC 自然口播",
  "产品演示",
  "专业测评",
  "情景剧情",
  "教程讲解",
  "对比推荐",
]

export const CREATIVE_TEMPLATES = [
  { id: "pain-proof", name: "痛点解决", desc: "痛点共鸣 → 展示方案 → 结果证明", tag: "推荐" },
  { id: "feature-demo", name: "卖点演示", desc: "产品亮相 → 功能拆解 → 场景验证", tag: "高转化" },
  { id: "comparison", name: "对比推荐", desc: "旧方案对比 → 差异放大 → 行动理由", tag: "强说服" },
]

export const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "es-MX", label: "Español (México)" },
  { value: "pt-BR", label: "Português (Brasil)" },
]

type LocalizedLines = {
  painHook: string
  proofHook: string
  exploreHook: string
  body: (productName: string, sellingPoint: string) => string
  proofBody: (productName: string, sellingPoints: string) => string
  exploreBody: (productName: string) => string
  cta: (productName: string) => string
}

const LOCALIZED_LINES: Record<string, LocalizedLines> = {
  "en-US": {
    painHook: "Still settling for a routine that makes things harder than they need to be?",
    proofHook: "Three details make this product different — and you can see each one in action.",
    exploreHook: "I replaced my usual option for seven days. Here is what surprised me.",
    body: (productName, sellingPoint) => `${productName} is built around one practical advantage: ${sellingPoint}. Watch how it fits into a real routine without adding extra steps.`,
    proofBody: (productName, sellingPoints) => `${productName} combines ${sellingPoints}. Each benefit is demonstrated up close, so the value is easy to verify.`,
    exploreBody: (productName) => `Instead of listing features, we put ${productName} into a real-life challenge and let the result tell the story.`,
    cta: (productName) => `See ${productName} in action and decide if it belongs in your routine.`,
  },
  "es-MX": {
    painHook: "¿Sigues usando una rutina que hace todo más difícil de lo necesario?",
    proofHook: "Tres detalles hacen diferente a este producto, y puedes ver cada uno en acción.",
    exploreHook: "Cambié mi opción habitual durante siete días. Esto fue lo que me sorprendió.",
    body: (productName, sellingPoint) => `${productName} se centra en una ventaja práctica: ${sellingPoint}. Mira cómo se integra en una rutina real sin pasos extra.`,
    proofBody: (productName, sellingPoints) => `${productName} combina ${sellingPoints}. Cada beneficio se demuestra de cerca para que puedas comprobar su valor.`,
    exploreBody: (productName) => `En vez de enumerar funciones, pusimos ${productName} a prueba en una situación real y dejamos que el resultado hablara.`,
    cta: (productName) => `Mira ${productName} en acción y descubre si encaja en tu rutina.`,
  },
  "pt-BR": {
    painHook: "Ainda usa uma rotina que deixa tudo mais difícil do que deveria?",
    proofHook: "Três detalhes tornam este produto diferente — e você pode ver cada um em ação.",
    exploreHook: "Troquei minha opção de sempre por sete dias. Isto foi o que me surpreendeu.",
    body: (productName, sellingPoint) => `${productName} foi criado em torno de uma vantagem prática: ${sellingPoint}. Veja como ele entra na rotina sem adicionar etapas.`,
    proofBody: (productName, sellingPoints) => `${productName} combina ${sellingPoints}. Cada benefício aparece de perto para que o valor fique fácil de comprovar.`,
    exploreBody: (productName) => `Em vez de listar funções, colocamos ${productName} em um desafio real e deixamos o resultado contar a história.`,
    cta: (productName) => `Veja ${productName} em ação e descubra se ele combina com a sua rotina.`,
  },
}

function sceneTimes(duration: number) {
  const hookEnd = Math.max(2, Math.round(duration * 0.2))
  const bodyEnd = Math.max(hookEnd + 3, Math.round(duration * 0.78))
  return { hookEnd, bodyEnd: Math.min(bodyEnd, duration - 2) }
}

function makeScenes(
  id: BriefVersion["id"],
  product: Product,
  duration: number,
  locale: string,
): SceneDraft[] {
  const lines = LOCALIZED_LINES[locale] ?? LOCALIZED_LINES["en-US"]
  const { hookEnd, bodyEnd } = sceneTimes(duration)
  const primaryPoint = product.sellingPoints[0] ?? "a simpler everyday experience"
  const sellingPoints = product.sellingPoints.slice(0, 3).join(", ") || "practical design and easy everyday use"
  const hooks = {
    safe: lines.painHook,
    selling: lines.proofHook,
    explore: lines.exploreHook,
  }
  const bodies = {
    safe: lines.body(product.name, primaryPoint),
    selling: lines.proofBody(product.name, sellingPoints),
    explore: lines.exploreBody(product.name),
  }
  const visuals = {
    safe: `数字人在真实使用场景中遇到典型痛点，镜头快速切到 ${product.name}。`,
    selling: `商品近景开场，依次用三个动作演示 ${product.sellingPoints.slice(0, 3).join("、") || "核心卖点"}。`,
    explore: `以“7 天替换挑战”的手持日记形式展示 ${product.name}，保留真实拍摄感。`,
  }

  return [
    {
      id: `${id}-hook`,
      type: "Hook",
      start: 0,
      end: hookEnd,
      visual: visuals[id],
      voiceover: hooks[id],
      meaningZh: id === "safe" ? "还在忍受让日常变复杂的旧方案吗？" : id === "selling" ? "三个细节让这款商品与众不同。" : "我用它替换常用方案 7 天，结果出乎意料。",
      onScreenText: id === "safe" ? "STILL DOING IT THE HARD WAY?" : id === "selling" ? "3 DETAILS THAT MATTER" : "7-DAY SWITCH TEST",
      assetRefs: "@商品图1 @数字人1",
      action: "第一帧直接进入冲突画面，0.5 秒内出现商品。",
      constraints: "保持商品外观、品牌标识和颜色与参考图一致。",
    },
    {
      id: `${id}-body`,
      type: "主体",
      start: hookEnd,
      end: bodyEnd,
      visual: id === "selling" ? "三个连续近景分别验证核心卖点，动作与口播逐句对齐。" : "中近景与商品特写交替，展示从使用到结果的完整过程。",
      voiceover: bodies[id],
      meaningZh: id === "selling" ? `用可验证的演示呈现 ${product.name} 的三个核心卖点。` : `展示 ${product.name} 如何在真实场景中解决问题。`,
      onScreenText: product.sellingPoints.slice(0, 2).join(" · ") || "Simple · Practical · Ready",
      assetRefs: "@商品图1 @商品图2",
      action: "每个卖点对应一个明确动作，避免无意义空镜。",
      constraints: "不新增商品库中未确认的功效、参数、价格或优惠信息。",
    },
    {
      id: `${id}-cta`,
      type: "CTA",
      start: bodyEnd,
      end: duration,
      visual: `商品与数字人同框定格，保留清晰的 ${product.brand || product.name} 品牌识别。`,
      voiceover: lines.cta(product.name),
      meaningZh: `查看 ${product.name} 的实际使用效果，再决定它是否适合你的日常。`,
      onScreenText: "SEE IT IN ACTION",
      assetRefs: "@商品图1",
      action: "最后 1 秒保持稳定定格，CTA 与商品同时可见。",
      constraints: "CTA 不使用虚假稀缺、绝对化承诺或未确认折扣。",
    },
  ]
}

export function buildBriefVersions(product: Product, duration: number, locale: string): BriefVersion[] {
  const audience = product.audiences.slice(0, 2).join("、") || "希望简化日常流程的目标用户"
  const primaryPoint = product.sellingPoints[0] ?? "核心使用价值"
  return [
    {
      id: "safe",
      label: "稳健版",
      title: `把“${primaryPoint}”变成可见的解决方案`,
      mechanism: "痛点共鸣",
      angle: "先呈现真实痛点，再用操作过程完成问题—方案闭环。",
      audience,
      template: "痛点解决",
      hook: "痛点提问 + 商品快速亮相",
      structure: "痛点提问 → 场景代入 → 方案演示 → 行动建议",
      voiceoverSummary: "自然 UGC 语气，强调易理解、可信和低决策压力。",
      duration,
      accent: "#607b12",
      scenes: makeScenes("safe", product, duration, locale),
    },
    {
      id: "selling",
      label: "卖点强化版",
      title: `用 3 个可验证细节证明 ${product.name} 的价值`,
      mechanism: "证据演示",
      angle: "把商品卖点逐条转成可见动作，让用户快速理解差异。",
      audience,
      template: "卖点演示",
      hook: "结果前置 + 三点悬念",
      structure: "结果前置 → 卖点拆解 → 连续验证 → 购买理由",
      voiceoverSummary: "节奏更快、信息密度更高，口播与商品特写逐句对应。",
      duration,
      accent: "#2368c4",
      scenes: makeScenes("selling", product, duration, locale),
    },
    {
      id: "explore",
      label: "探索版",
      title: `把 ${product.name} 放进一次 7 天替换挑战`,
      mechanism: "挑战叙事",
      angle: "用轻剧情和时间推进制造好奇，弱化传统广告感。",
      audience,
      template: "对比推荐",
      hook: "反常识挑战 + 结果延迟揭晓",
      structure: "挑战设定 → 使用片段 → 意外发现 → 轻量 CTA",
      voiceoverSummary: "更像真实体验日记，适合探索新的 Hook 与受众反应。",
      duration,
      accent: "#7c3fc1",
      scenes: makeScenes("explore", product, duration, locale),
    },
  ]
}

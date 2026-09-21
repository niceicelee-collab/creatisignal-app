import type { SCRIPT_SCENES, SCRIPT_BRIEF } from "@/lib/replicate/beta-mock"

export function referenceScript(product: string, description: string, sellingPoints: string, duration: number): typeof SCRIPT_SCENES {
  const boundaries = [0, Math.min(3, duration), Math.max(4, duration - 5), duration]
  return ["生活场景开场", "商品使用演示", "细节与结果展示"].map((name, index) => {
    const start = boundaries[index], end = boundaries[index + 1]
    const detail = index === 1 ? description : index === 2 ? sellingPoints : `在自然的生活场景中引出${product}`
    return {
      id: `reference-scene-${index}`, time: `${start}-${end}s`, role: ["hook", "product_demo", "cta"][index], duration: end - start,
      functionBrief: name, strategy: `围绕${product}组织${name}`, description: detail,
      adaptationLogic: "沿用参考素材的开场、过程、结果结构，替换为本次确认的新商品。", keyMessages: [detail],
      shots: [{ id: `reference-shot-${index}`, time: `${start}-${end}s`, duration: end - start, speaker: "新人物模特", shotSize: index === 2 ? "商品特写" : "中近景", cameraMovement: "稳定跟拍", action: detail, visual: `${name}：${product}`, voiceover: `Let me show you ${product}.`, voiceoverTranslation: `看看我日常使用的${product}。`, subtitle: product, editingNote: "演示脚本，拍摄前核对商品事实与口播。" }],
    }
  })
}
export function referenceBrief(product: string, description: string, sellingPoints: string, reference: string): typeof SCRIPT_BRIEF {
  return { overallStrategy: reference, targetAudience: "按新商品确认目标受众", userProblem: description, corePromise: sellingPoints, useScenarios: [`${product}的日常使用场景`], emotionalJourney: ["好奇", "理解", "兴趣"] }
}

import { aigcMaterials } from "@/lib/aigc-hits/mock"
import {
  BETA_MATERIALS,
  BETA_PROJECTS,
  type BetaMaterial,
} from "@/lib/replicate/beta-mock"

export const REPLICATE_SOURCE_TABS = ["市场爆款", "品牌追踪", "AIGC 爆款", "自有素材", "本地上传"] as const
export const ASSISTANT_SOURCE_TABS = ["市场爆款", "品牌追踪", "AIGC 爆款", "本地上传"] as const

export const MARKET_CATEGORIES = [
  "全部",
  "兴趣推荐",
  "中小型电商",
  "食品生鲜",
  "美食",
  "护肤",
  "平台电商",
  "饮料",
  "个护电器",
  "保健品",
  "女士服饰",
  "医疗服务",
  "手机",
  "家居用品及饰品",
  "生活家电",
  "建材灯饰",
  "学历教育",
]
export const MARKET_SORT_OPTIONS = ["推荐", "互动量", "最新发布"]
export const MARKET_REGION_OPTIONS = ["国家地区", "美国", "英国", "东南亚"]
export const MARKET_SPEND_OPTIONS = ["全部消耗", "低消耗", "中消耗", "高消耗"]

export const AIGC_PLATFORM_OPTIONS = [
  "全部平台",
  ...Array.from(new Set(aigcMaterials.map((material) => material.platform))),
]
export const AIGC_CATEGORY_OPTIONS = [
  "全部类目",
  ...Array.from(new Set(aigcMaterials.map((material) => material.category.split(" / ")[0]))),
]
export const AIGC_SORT_OPTIONS = ["最新发布", "GMV 最高", "播放量最高"]

export const BRAND_PLATFORM_OPTIONS = ["全部平台", "Meta", "TikTok"]
export const BRAND_COUNTRY_OPTIONS = ["全部国家", "美国", "英国", "泰国", "印尼"]
export const BRAND_STATUS_OPTIONS = ["全部状态", "投放中", "已停投"]
export const BRAND_SORT_METRIC_OPTIONS = ["点赞", "收藏", "预估消耗", "开始投放", "总触达", "投放天数"]
export const BRAND_SORT_DIRECTION_OPTIONS = ["倒序", "正序"]

export const MARKET_FILTER_META: Record<string, { category: string; region: string; spend: string; score: number }> = {
  "market-001": { category: "中小型电商", region: "美国", spend: "中消耗", score: 96 },
  "market-beta-product": { category: "平台电商", region: "美国", spend: "高消耗", score: 93 },
  "market-beta-product-coffee": { category: "饮料", region: "东南亚", spend: "中消耗", score: 89 },
  "market-beta-completed-shoes": { category: "女士服饰", region: "英国", spend: "低消耗", score: 86 },
}

export interface BrandFilterMetadata {
  platform: "Meta" | "TikTok"
  country: string
  status: "投放中" | "已停投"
  likes: number
  saves: number
  spend: number
  startDate: string
  reach: number
  days: number
}

export const BRAND_FILTER_META: Record<string, BrandFilterMetadata> = {
  "brand-001": { platform: "Meta", country: "美国", status: "投放中", likes: 380700, saves: 8600, spend: 27370, startDate: "2026-06-27", reach: 1280000, days: 30 },
  "brand-beta-breaking": { platform: "TikTok", country: "英国", status: "已停投", likes: 168000, saves: 5200, spend: 18400, startDate: "2026-06-22", reach: 930000, days: 18 },
  "brand-beta-breaking-jewelry": { platform: "Meta", country: "泰国", status: "投放中", likes: 246000, saves: 7100, spend: 22100, startDate: "2026-06-24", reach: 1160000, days: 24 },
  "brand-beta-rendering-bottle": { platform: "TikTok", country: "印尼", status: "投放中", likes: 192000, saves: 4900, spend: 15600, startDate: "2026-06-20", reach: 870000, days: 16 },
}

const AIGC_FILTER_META = new Map(aigcMaterials.map((material) => [material.id, material]))

function formatSelectionMetric(value: number) {
  if (value >= 10000) {
    const tenThousands = value / 10000
    return `${Number.isInteger(tenThousands) ? tenThousands : tenThousands.toFixed(1)}万+`
  }
  return `${value}+`
}

export const AIGC_SELECTION_MATERIALS: BetaMaterial[] = aigcMaterials.map((material) => {
  const existingMaterial = BETA_MATERIALS.find((item) => item.id === material.id)
  return existingMaterial ?? {
    id: material.id,
    title: material.title,
    account: material.sourceName,
    source: "AIGC 爆款",
    cover: material.cover,
    video: material.previewVideo,
    duration: material.duration,
    evidence: `约 ${formatSelectionMetric(material.gmv)} GMV · ${formatSelectionMetric(material.views)} 播放`,
    updatedAt: material.updateDate,
  }
})

export const MARKET_SELECTION_MATERIALS: BetaMaterial[] = [
  BETA_MATERIALS.find((material) => material.id === "market-001") ?? BETA_MATERIALS[0],
  ...BETA_PROJECTS
    .filter((project) => project.source === "市场爆款")
    .slice(0, 3)
    .map((project) => ({
      id: `market-${project.id}`,
      title: project.title,
      account: "@market.trends",
      source: "市场爆款",
      cover: project.cover,
      video: BETA_MATERIALS[0].video,
      duration: "00:20",
      evidence: project.product,
      updatedAt: project.createdAt,
    })),
]

export const BRAND_SELECTION_MATERIALS: BetaMaterial[] = [
  BETA_MATERIALS.find((material) => material.id === "brand-001") ?? BETA_MATERIALS[0],
  ...BETA_PROJECTS
    .filter((project) => project.source === "品牌追踪")
    .slice(0, 3)
    .map((project) => ({
      id: `brand-${project.id}`,
      title: project.title,
      account: "@brand.tracker",
      source: "品牌追踪",
      cover: project.cover,
      video: BETA_MATERIALS[0].video,
      duration: "00:20",
      evidence: project.product,
      updatedAt: project.createdAt,
    })),
]

export const WORKSPACE_MATERIALS = [
  ...BETA_MATERIALS,
  ...AIGC_SELECTION_MATERIALS.filter((material) => !BETA_MATERIALS.some((item) => item.id === material.id)),
  ...MARKET_SELECTION_MATERIALS.filter((material) => !BETA_MATERIALS.some((item) => item.id === material.id)),
  ...BRAND_SELECTION_MATERIALS.filter((material) => !BETA_MATERIALS.some((item) => item.id === material.id)),
]

export interface SourceMaterialFilters {
  sourceTab: string
  marketCategory?: string
  marketSearch?: string
  marketSort?: string
  marketRegion?: string
  marketSpend?: string
  aigcPlatform?: string
  aigcCategory?: string
  aigcSort?: string
  brandPlatform?: string
  brandCountry?: string
  brandStatus?: string
  brandSortMetric?: string
  brandSortDirection?: string
}

export function filterSourceMaterials({
  sourceTab,
  marketCategory = "全部",
  marketSearch = "",
  marketSort = "推荐",
  marketRegion = "国家地区",
  marketSpend = "全部消耗",
  aigcPlatform = "TikTok",
  aigcCategory = "全部类目",
  aigcSort = "最新发布",
  brandPlatform = "全部平台",
  brandCountry = "全部国家",
  brandStatus = "全部状态",
  brandSortMetric = "点赞",
  brandSortDirection = "倒序",
}: SourceMaterialFilters) {
  if (sourceTab === "AIGC 爆款") {
    return AIGC_SELECTION_MATERIALS
      .filter((material) => {
        const metadata = AIGC_FILTER_META.get(material.id)
        if (!metadata) return false
        const platformMatches = aigcPlatform === "全部平台" || metadata.platform === aigcPlatform
        const categoryMatches = aigcCategory === "全部类目" || metadata.category.startsWith(`${aigcCategory} /`) || metadata.category === aigcCategory
        return platformMatches && categoryMatches
      })
      .sort((left, right) => {
        const leftMeta = AIGC_FILTER_META.get(left.id)
        const rightMeta = AIGC_FILTER_META.get(right.id)
        if (aigcSort === "GMV 最高") return (rightMeta?.gmv ?? 0) - (leftMeta?.gmv ?? 0)
        if (aigcSort === "播放量最高") return (rightMeta?.views ?? 0) - (leftMeta?.views ?? 0)
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      })
  }

  if (sourceTab === "市场爆款") {
    const normalizedSearch = marketSearch.trim().toLowerCase()
    return MARKET_SELECTION_MATERIALS
      .filter((material) => {
        const metadata = MARKET_FILTER_META[material.id]
        const categoryMatches = marketCategory === "全部" || metadata?.category === marketCategory
        const regionMatches = marketRegion === "国家地区" || metadata?.region === marketRegion
        const spendMatches = marketSpend === "全部消耗" || metadata?.spend === marketSpend
        const searchMatches = !normalizedSearch ||
          material.title.toLowerCase().includes(normalizedSearch) ||
          material.account.toLowerCase().includes(normalizedSearch)
        return categoryMatches && regionMatches && spendMatches && searchMatches
      })
      .sort((left, right) => {
        if (marketSort === "最新发布") {
          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        }
        return (MARKET_FILTER_META[right.id]?.score ?? 0) - (MARKET_FILTER_META[left.id]?.score ?? 0)
      })
  }

  if (sourceTab === "品牌追踪") {
    return BRAND_SELECTION_MATERIALS
      .filter((material) => {
        const metadata = BRAND_FILTER_META[material.id]
        if (!metadata) return false
        const platformMatches = brandPlatform === "全部平台" || metadata.platform === brandPlatform
        const countryMatches = brandCountry === "全部国家" || metadata.country === brandCountry
        const statusMatches = brandStatus === "全部状态" || metadata.status === brandStatus
        return platformMatches && countryMatches && statusMatches
      })
      .sort((left, right) => {
        const leftMeta = BRAND_FILTER_META[left.id]
        const rightMeta = BRAND_FILTER_META[right.id]
        if (!leftMeta || !rightMeta) return 0

        const valueFor = (metadata: BrandFilterMetadata) => {
          if (brandSortMetric === "收藏") return metadata.saves
          if (brandSortMetric === "预估消耗") return metadata.spend
          if (brandSortMetric === "开始投放") return new Date(metadata.startDate).getTime()
          if (brandSortMetric === "总触达") return metadata.reach
          if (brandSortMetric === "投放天数") return metadata.days
          return metadata.likes
        }
        const difference = valueFor(leftMeta) - valueFor(rightMeta)
        return brandSortDirection === "正序" ? difference : -difference
      })
  }

  return BETA_MATERIALS
}

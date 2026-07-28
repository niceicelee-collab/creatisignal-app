"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ExternalLink,
  Heart,
  Play,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BRAND_COUNTRY_OPTIONS,
  BRAND_PLATFORM_OPTIONS,
  BRAND_SORT_DIRECTION_OPTIONS,
  BRAND_SORT_METRIC_OPTIONS,
  BRAND_STATUS_OPTIONS,
} from "@/lib/replicate/source-filters"

const sortOptions = ["素材上新", "预估曝光", "预估花费"]

const competitors = [
  {
    brand: "GlowSkin",
    color: "linear-gradient(135deg,#222,#9aa)",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
    title: "夏季防晒新品推广",
    spend: "$18.50K", impression: "1.3M", ctr: "3.50%",
    count: 12, active: true,
  },
  {
    brand: "FitWear",
    color: "linear-gradient(135deg,#445,#b8c)",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80",
    title: "运动系列开箱测评",
    spend: "$12.80K", impression: "920.0K", ctr: "2.80%",
    count: 8, active: true,
  },
  {
    brand: "TechNova",
    color: "linear-gradient(135deg,#234,#8bc)",
    img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=700&q=80",
    title: "智能手表功能演示",
    spend: "$9.60K", impression: "680.0K", ctr: "4.20%",
    count: 5, active: true,
  },
  {
    brand: "NaturaCare",
    color: "linear-gradient(135deg,#3a6,#8d4)",
    img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=700&q=80",
    title: "有机护肤系列上市",
    spend: "$7.20K", impression: "540.0K", ctr: "2.10%",
    count: 3, active: false,
  },
  {
    brand: "PureBrew",
    color: "linear-gradient(135deg,#863,#fa8)",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80",
    title: "精品咖啡订阅招募",
    spend: "$5.80K", impression: "410.0K", ctr: "3.90%",
    count: 7, active: true,
  },
  {
    brand: "StylePeak",
    color: "linear-gradient(135deg,#63a,#c8f)",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80",
    title: "秋冬新品穿搭指南",
    spend: "$14.30K", impression: "1.1M", ctr: "1.80%",
    count: 15, active: true,
  },
]

interface BrandMaterial {
  id: string
  brand: string
  title: string
  image: string
  kind: string
  status: "投放中" | "已停投"
  spend: string
  engagement: string
  saves: string
  startDate: string
  days: string
  platforms: "Meta" | "TikTok"
  country: string
  cta: string
  sourceAssetId: string
  landingUrl: string
  metaUrl: string
  likesValue: number
  savesValue: number
  spendValue: number
  startDateValue: string
  reachValue: number
  daysValue: number
}

const brandSourceAssetIds = [
  "brand-001",
  "brand-beta-breaking",
  "brand-beta-breaking-jewelry",
  "brand-beta-rendering-bottle",
]

const materialTitleSuffixes = ["", " · 场景演示", " · 达人反馈", " · 功能拆解"]
const materialCountries = ["美国", "英国", "泰国", "印尼"]

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

const brandMaterials: BrandMaterial[] = competitors.flatMap((competitor, brandIndex) =>
  materialTitleSuffixes.map((suffix, materialIndex) => {
    const variantIndex = brandIndex * materialTitleSuffixes.length + materialIndex
    const sourceAssetId = brandSourceAssetIds[variantIndex % brandSourceAssetIds.length]
    const likesValue = 380_700 - brandIndex * 31_000 - materialIndex * 18_500
    const savesValue = 8_600 - brandIndex * 470 - materialIndex * 620
    const spendValue = 27_370 - brandIndex * 1_320 - materialIndex * 1_850
    const reachValue = 1_280_000 - brandIndex * 78_000 - materialIndex * 96_000
    const daysValue = 30 - brandIndex * 2 - materialIndex * 3
    const startDateValue = `2026-06-${String(27 - brandIndex - materialIndex).padStart(2, "0")}`

    return {
      id: `brand-material-${brandIndex + 1}-${materialIndex + 1}`,
      brand: competitor.brand,
      title: `${competitor.title}${suffix}`,
      image: competitors[(brandIndex + materialIndex) % competitors.length].img,
      kind: materialIndex % 3 === 2 ? "图片" : "视频",
      status: materialIndex === 3 || (!competitor.active && materialIndex > 0) ? "已停投" : "投放中",
      spend: `$${(spendValue / 1_000).toFixed(2)}K`,
      engagement: formatCompact(likesValue),
      saves: formatCompact(savesValue),
      startDate: startDateValue,
      days: `${daysValue} 天`,
      platforms: materialIndex % 2 === 0 ? "Meta" : "TikTok",
      country: materialCountries[(brandIndex + materialIndex) % materialCountries.length],
      cta: materialIndex % 2 === 0 ? "Shop now" : "Learn more",
      sourceAssetId,
      landingUrl: "https://www.instagram.com/",
      metaUrl: "https://www.facebook.com/ads/library/",
      likesValue,
      savesValue,
      spendValue,
      startDateValue,
      reachValue,
      daysValue,
    } satisfies BrandMaterial
  }),
)

interface FilterSelectProps {
  value: string
  options: readonly string[]
  ariaLabel: string
  onChange: (value: string) => void
}

function FilterSelect({ value, options, ariaLabel, onChange }: FilterSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 cursor-pointer rounded-lg border border-[var(--line)] bg-white px-3 pr-8 text-[12px] font-bold text-[#555961] outline-none transition hover:border-[#c7cbd1] focus:border-[#a8acb3]"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )
}

export function CompetitorsContent() {
  const [sortBy, setSortBy] = useState(0)
  const [search, setSearch] = useState("")
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [brandPlatform, setBrandPlatform] = useState("全部平台")
  const [brandCountry, setBrandCountry] = useState("全部国家")
  const [brandStatus, setBrandStatus] = useState("全部状态")
  const [brandSortMetric, setBrandSortMetric] = useState("点赞")
  const [brandSortDirection, setBrandSortDirection] = useState("倒序")
  const [selectedMaterial, setSelectedMaterial] = useState<BrandMaterial | null>(null)

  useEffect(() => {
    if (!selectedMaterial) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMaterial(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedMaterial])

  const filtered = competitors.filter((competitor) =>
    competitor.brand.toLowerCase().includes(search.toLowerCase()) ||
    competitor.title.includes(search)
  )

  const selectedCompetitor = competitors.find((competitor) => competitor.brand === selectedBrand)
  const filteredMaterials = useMemo(() => {
    const valueFor = (material: BrandMaterial) => {
      if (brandSortMetric === "收藏") return material.savesValue
      if (brandSortMetric === "预估消耗") return material.spendValue
      if (brandSortMetric === "开始投放") return new Date(material.startDateValue).getTime()
      if (brandSortMetric === "总触达") return material.reachValue
      if (brandSortMetric === "投放天数") return material.daysValue
      return material.likesValue
    }

    return brandMaterials
      .filter((material) => {
        const brandMatches = material.brand === selectedBrand
        const platformMatches = brandPlatform === "全部平台" || material.platforms === brandPlatform
        const countryMatches = brandCountry === "全部国家" || material.country === brandCountry
        const statusMatches = brandStatus === "全部状态" || material.status === brandStatus
        return brandMatches && platformMatches && countryMatches && statusMatches
      })
      .sort((left, right) => {
        const difference = valueFor(left) - valueFor(right)
        return brandSortDirection === "正序" ? difference : -difference
      })
  }, [brandCountry, brandPlatform, brandSortDirection, brandSortMetric, brandStatus, selectedBrand])

  return (
    <>
      <div className="mb-[22px] flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-[850] leading-snug text-[#17181c]">品牌追踪</h1>
          <p className="mt-2 text-[14px] text-[#8b8f98]">关注品牌的最新素材动态与投放趋势</p>
        </div>
        <button className="flex h-[34px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border-0 bg-[var(--lime)] px-[18px] text-[13px] font-extrabold text-[#20251a]">
          <Plus size={14} strokeWidth={2.5} />
          关注品牌
        </button>
      </div>

      {!selectedBrand ? (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-[3px] rounded-full border border-[var(--line)] bg-[#f5f5f6] p-[3px]">
              {sortOptions.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSortBy(index)}
                  className={cn(
                    "h-[26px] cursor-pointer whitespace-nowrap rounded-full border px-3 text-[12px] font-extrabold transition-colors",
                    sortBy === index
                      ? "border-white bg-white text-[#181b20] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      : "border-transparent bg-transparent text-[#777b83]",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex h-[34px] w-[210px] items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-[11px] text-[13px] text-[var(--muted-2)]">
              <Search size={14} strokeWidth={2} className="shrink-0" />
              <input
                className="flex-1 border-0 bg-transparent text-[13px] outline-none placeholder:text-[var(--muted-2)]"
                placeholder="搜索品牌或素材..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-extrabold text-[#25282e]">关注品牌</h2>
                <p className="mt-1 text-[12px] text-[#9699a1]">快速查看品牌投放概况</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((competitor) => (
                <button
                  key={competitor.brand}
                  type="button"
                  onClick={() => setSelectedBrand(competitor.brand)}
                  className="cursor-pointer overflow-hidden rounded-[10px] border border-[var(--line)] bg-white text-left transition-shadow hover:shadow-[0_4px_16px_rgba(9,9,11,0.08)]"
                >
                  <span className="flex h-[42px] items-center justify-between border-b border-[var(--line)] px-3">
                    <span className="flex min-w-0 items-center gap-2 text-[13px] font-extrabold text-[#33363d]">
                      <span className="h-[22px] w-[22px] shrink-0 rounded-full" style={{ background: competitor.color }} />
                      <span className="truncate">{competitor.brand}</span>
                      <span className="ml-1 shrink-0 text-[11px] font-bold text-[var(--muted-2)]">{competitor.count} 条素材</span>
                    </span>
                    {competitor.active && (
                      <span className="flex h-5 shrink-0 items-center rounded-full bg-[var(--green)] px-2 text-[11px] font-extrabold text-[var(--green-text)]">
                        活跃
                      </span>
                    )}
                  </span>
                  <span className="relative block aspect-video overflow-hidden bg-[#eceef2]">
                    <Image src={competitor.img} alt={`${competitor.brand} creative`} fill className="object-cover" sizes="(max-width: 1240px) 50vw" />
                  </span>
                  <span className="block px-[13px] pb-[14px] pt-3">
                    <span className="mb-[9px] block text-sm font-extrabold text-[#2d3037]">{competitor.title}</span>
                    <span className="flex flex-wrap gap-x-[14px] gap-y-2 text-[12px] leading-[1.5] text-[#8b8f98]">
                      <span>花费 <strong className="font-extrabold text-[#31343b]">{competitor.spend}</strong></span>
                      <span>展示 <strong className="font-extrabold text-[#31343b]">{competitor.impression}</strong></span>
                      <span>CTR <strong className="font-extrabold text-[#31343b]">{competitor.ctr}</strong></span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section>
          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedBrand(null)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-3 text-[12px] font-bold text-[#676b73] transition hover:border-[#c5c8ce] hover:text-[#24272d]"
            >
              <ArrowLeft size={14} />
              返回品牌列表
            </button>
            <span className="h-7 w-7 rounded-full" style={{ background: selectedCompetitor?.color }} />
            <div>
              <h2 className="text-[18px] font-extrabold text-[#25282e]">{selectedBrand}</h2>
              <p className="mt-0.5 text-[11px] text-[#9699a1]">品牌投放素材</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect value={brandPlatform} options={BRAND_PLATFORM_OPTIONS} ariaLabel="投放平台" onChange={setBrandPlatform} />
              <FilterSelect value={brandCountry} options={BRAND_COUNTRY_OPTIONS} ariaLabel="投放国家" onChange={setBrandCountry} />
              <FilterSelect value={brandStatus} options={BRAND_STATUS_OPTIONS} ariaLabel="投放状态" onChange={setBrandStatus} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#838790]">排序</span>
              <FilterSelect value={brandSortMetric} options={BRAND_SORT_METRIC_OPTIONS} ariaLabel="排序字段" onChange={setBrandSortMetric} />
              <FilterSelect value={brandSortDirection} options={BRAND_SORT_DIRECTION_OPTIONS} ariaLabel="排序方向" onChange={setBrandSortDirection} />
            </div>
          </div>

          <p className="mb-3 text-[12px] text-[#9699a1]">当前筛选 {filteredMaterials.length} 条素材</p>
          {filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
              {filteredMaterials.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => setSelectedMaterial(material)}
                  className="group overflow-hidden rounded-[10px] border border-[var(--line)] bg-white text-left transition hover:-translate-y-0.5 hover:border-[#bec2c8] hover:shadow-[0_8px_24px_rgba(9,9,11,0.08)]"
                >
                  <span className="relative block aspect-[4/5] overflow-hidden bg-[#eceef2]">
                    <Image src={material.image} alt={material.title} fill className="object-cover transition duration-300 group-hover:scale-[1.02]" sizes="(max-width: 1240px) 50vw" />
                    <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold text-white">{material.status}</span>
                    {material.kind === "视频" && (
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#202229]"><Play size={13} fill="currentColor" /></span>
                    )}
                  </span>
                  <span className="block p-3">
                    <span className="block text-[11px] font-bold text-[#8c9098]">{material.platforms} · {material.country} · {material.kind}</span>
                    <span className="mt-1.5 block line-clamp-2 min-h-10 text-[13px] font-extrabold leading-5 text-[#2c2f35]">{material.title}</span>
                    <span className="mt-3 flex items-center gap-4 border-t border-[var(--line)] pt-3 text-[11px] text-[#8d9199]">
                      <span className="flex items-center gap-1"><Heart size={12} />{material.engagement}</span>
                      <span className="flex items-center gap-1"><Bookmark size={12} />{material.saves}</span>
                      <span className="ml-auto font-bold text-[#586020]">查看详情</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-[#fafafa] text-[13px] text-[#92969e]">
              当前筛选条件下暂无素材
            </div>
          )}
        </section>
      )}

      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5" role="presentation" onMouseDown={() => setSelectedMaterial(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedMaterial.title}素材详情`}
            onMouseDown={(event) => event.stopPropagation()}
            className="grid max-h-[88vh] w-full max-w-[920px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)] lg:grid-cols-[1.08fr_0.92fr]"
          >
            <div className="relative min-h-[360px] bg-black">
              <Image src={selectedMaterial.image} alt={selectedMaterial.title} fill className="object-cover" sizes="55vw" priority />
              <span className="absolute bottom-4 left-4 flex h-9 items-center gap-2 rounded-full bg-black/65 px-3 text-[12px] font-bold text-white">
                <Play size={13} fill="currentColor" />预览素材
              </span>
            </div>
            <div className="flex min-h-0 flex-col">
              <header className="flex items-start justify-between border-b border-[var(--line)] p-5">
                <div>
                  <p className="text-[11px] font-bold text-[#91949b]">{selectedMaterial.brand}</p>
                  <h2 className="mt-1 text-[17px] font-extrabold leading-6 text-[#22252b]">{selectedMaterial.title}</h2>
                </div>
                <button type="button" onClick={() => setSelectedMaterial(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f4f5] text-[#666a72]" aria-label="关闭素材详情">
                  <X size={16} />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-[#eef0f2] px-2 py-1 text-[10px] font-bold text-[#5d6169]">{selectedMaterial.status}</span>
                  <span className="rounded bg-[#eef0f2] px-2 py-1 text-[10px] font-bold text-[#5d6169]">{selectedMaterial.kind}</span>
                </div>

                <h3 className="mt-5 text-[12px] font-extrabold text-[#2e3137]">核心指标</h3>
                <div className="mt-3 grid grid-cols-3 divide-x divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[#fafafa] py-3">
                  <div className="px-3"><p className="text-[10px] text-[#9699a1]">互动数据</p><p className="mt-1 text-[13px] font-extrabold">{selectedMaterial.engagement}</p></div>
                  <div className="px-3"><p className="text-[10px] text-[#9699a1]">预估消耗</p><p className="mt-1 text-[13px] font-extrabold">{selectedMaterial.spend}</p></div>
                  <div className="px-3"><p className="text-[10px] text-[#9699a1]">收藏</p><p className="mt-1 text-[13px] font-extrabold">{selectedMaterial.saves}</p></div>
                </div>

                <h3 className="mt-5 text-[12px] font-extrabold text-[#2e3137]">投放信息</h3>
                <dl className="mt-3 space-y-3 text-[11.5px]">
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#989ba2]">开始投放</dt><dd className="font-semibold text-[#555961]">{selectedMaterial.startDate}</dd></div>
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#989ba2]">投放天数</dt><dd className="font-semibold text-[#555961]">{selectedMaterial.days}</dd></div>
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#989ba2]">投放平台</dt><dd className="font-semibold leading-5 text-[#555961]">{selectedMaterial.platforms}</dd></div>
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#989ba2]">投放国家</dt><dd className="font-semibold text-[#555961]">{selectedMaterial.country}</dd></div>
                  <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#989ba2]">行动号召</dt><dd className="font-semibold text-[#555961]">{selectedMaterial.cta}</dd></div>
                </dl>

                <div className="mt-5 space-y-1">
                  <a href={selectedMaterial.landingUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md px-2 py-2 text-[11.5px] font-bold text-[#555961] hover:bg-[#f6f7f8]">
                    查看落地页 <ExternalLink size={13} />
                  </a>
                  <a href={selectedMaterial.metaUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md px-2 py-2 text-[11.5px] font-bold text-[#555961] hover:bg-[#f6f7f8]">
                    在 Meta 广告库查看 <ArrowRight size={13} />
                  </a>
                  <Link
                    href={`/replicate/beta-brand-${selectedMaterial.id}?asset=${selectedMaterial.sourceAssetId}&source=brand&title=${encodeURIComponent(selectedMaterial.title)}`}
                    className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#17181b] text-[12.5px] font-extrabold text-white hover:bg-black"
                  >
                    <Sparkles size={14} />
                    一键复刻
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

"use client"

import { useMemo, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, FileVideo2, Play, RefreshCw, Upload, X } from "lucide-react"
import type { BetaMaterial } from "@/lib/replicate/beta-mock"
import {
  AIGC_CATEGORY_OPTIONS,
  AIGC_PLATFORM_OPTIONS,
  AIGC_SORT_OPTIONS,
  ASSISTANT_SOURCE_TABS,
  BRAND_COUNTRY_OPTIONS,
  BRAND_PLATFORM_OPTIONS,
  BRAND_SORT_DIRECTION_OPTIONS,
  BRAND_SORT_METRIC_OPTIONS,
  BRAND_STATUS_OPTIONS,
  MARKET_CATEGORIES,
  MARKET_REGION_OPTIONS,
  MARKET_SORT_OPTIONS,
  MARKET_SPEND_OPTIONS,
  filterSourceMaterials,
} from "@/lib/replicate/source-filters"
import { cn } from "@/lib/utils"

type SourceTab = (typeof ASSISTANT_SOURCE_TABS)[number]

export interface ReplicateSourceChoice extends BetaMaterial {
  assetId: string
}

function FilterSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  ariaLabel: string
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 cursor-pointer rounded-lg border border-[var(--line)] bg-white px-2.5 text-[11px] font-bold text-[#555961] outline-none hover:border-[#b9bdc4]"
    >
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )
}

export function ReplicateSourceModal({
  open,
  selectedId,
  onOpenChange,
  onSelect,
  onUpload,
}: {
  open: boolean
  selectedId?: string
  onOpenChange: (open: boolean) => void
  onSelect: (choice: ReplicateSourceChoice, startImmediately: boolean) => void
  onUpload: (file: File) => void
}) {
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<SourceTab>("市场爆款")
  const [marketCategory, setMarketCategory] = useState("全部")
  const [marketSort, setMarketSort] = useState("推荐")
  const [marketRegion, setMarketRegion] = useState("国家地区")
  const [marketSpend, setMarketSpend] = useState("全部消耗")
  const [aigcPlatform, setAigcPlatform] = useState("TikTok")
  const [aigcCategory, setAigcCategory] = useState("全部类目")
  const [aigcSort, setAigcSort] = useState("最新发布")
  const [brandPlatform, setBrandPlatform] = useState("全部平台")
  const [brandCountry, setBrandCountry] = useState("全部国家")
  const [brandStatus, setBrandStatus] = useState("全部状态")
  const [brandSortMetric, setBrandSortMetric] = useState("点赞")
  const [brandSortDirection, setBrandSortDirection] = useState("倒序")

  const isUploadTab = tab === "本地上传"
  const sources = useMemo<ReplicateSourceChoice[]>(
    () => filterSourceMaterials({
      sourceTab: tab,
      marketCategory,
      marketSort,
      marketRegion,
      marketSpend,
      aigcPlatform,
      aigcCategory,
      aigcSort,
      brandPlatform,
      brandCountry,
      brandStatus,
      brandSortMetric,
      brandSortDirection,
    }).map((material) => ({ ...material, assetId: material.id })),
    [
      tab,
      marketCategory,
      marketSort,
      marketRegion,
      marketSpend,
      aigcPlatform,
      aigcCategory,
      aigcSort,
      brandPlatform,
      brandCountry,
      brandStatus,
      brandSortMetric,
      brandSortDirection,
    ],
  )

  function select(choice: ReplicateSourceChoice, startImmediately: boolean) {
    onSelect(choice, startImmediately)
    onOpenChange(false)
  }

  function upload(file?: File) {
    if (!file) return
    onUpload(file)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#09090b]/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-x-6 bottom-6 top-6 z-50 mx-auto flex max-w-[1180px] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[#fafafa] shadow-[0_28px_90px_rgba(0,0,0,0.25)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-[var(--line)] bg-white px-6 py-4">
            <div>
              <Dialog.Title className="text-[18px] font-extrabold text-[#18191d]">选择爆款参考素材</Dialog.Title>
              <Dialog.Description className="mt-1 text-[12px] text-[#8b8f98]">
                从爆款素材池选择，或上传本地视频，保留结构与节奏并替换为你的商品和模特。
              </Dialog.Description>
            </div>
            <Dialog.Close className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#777b84] hover:bg-[#f1f2f3] hover:text-[#18191d]">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] bg-white px-6 py-3">
            <div className="flex flex-wrap gap-1">
              {ASSISTANT_SOURCE_TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={cn(
                    "h-8 rounded-lg px-3 text-[12px] font-extrabold transition-colors",
                    tab === item
                      ? "bg-[#18191d] text-white"
                      : "text-[#7e828b] hover:bg-[#f1f2f3] hover:text-[#35373d]",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isUploadTab ? (
              <div className="flex min-h-[430px] items-center justify-center">
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="group flex w-full max-w-[620px] flex-col items-center rounded-[22px] border border-dashed border-[#c8ccd1] bg-white px-8 py-20 text-center transition-colors hover:border-[#9ebf2b] hover:bg-[#fbfff1]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efffc3] text-[#40550b] transition-transform group-hover:-translate-y-0.5">
                    <Upload size={23} />
                  </span>
                  <span className="mt-5 text-[15px] font-extrabold text-[#202228]">上传本地爆款视频</span>
                  <span className="mt-2 text-[12px] text-[#92969e]">支持 MP4、MOV 格式，选择后进入爆款拆解流程</span>
                </button>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime"
                  aria-label="上传本地爆款视频"
                  className="sr-only"
                  onChange={(event) => {
                    upload(event.target.files?.[0])
                    event.currentTarget.value = ""
                  }}
                />
              </div>
            ) : (
              <>
                {tab === "市场爆款" && (
                  <div className="mb-5 space-y-3 rounded-xl border border-[var(--line)] bg-white p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {MARKET_CATEGORIES.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setMarketCategory(category)}
                          className={cn(
                            "h-7 rounded-full border px-2.5 text-[10.5px] font-bold",
                            marketCategory === category
                              ? "border-[#b3d833] bg-[#efffc5] text-[#344507]"
                              : "border-[var(--line)] bg-white text-[#747881]",
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <FilterSelect ariaLabel="市场爆款排序" value={marketSort} options={MARKET_SORT_OPTIONS} onChange={setMarketSort} />
                      <FilterSelect ariaLabel="市场爆款国家地区" value={marketRegion} options={MARKET_REGION_OPTIONS} onChange={setMarketRegion} />
                      <FilterSelect ariaLabel="市场爆款消耗" value={marketSpend} options={MARKET_SPEND_OPTIONS} onChange={setMarketSpend} />
                    </div>
                  </div>
                )}

                {tab === "AIGC 爆款" && (
                  <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-3">
                    <FilterSelect ariaLabel="AIGC爆款平台" value={aigcPlatform} options={AIGC_PLATFORM_OPTIONS} onChange={setAigcPlatform} />
                    <FilterSelect ariaLabel="AIGC爆款类目" value={aigcCategory} options={AIGC_CATEGORY_OPTIONS} onChange={setAigcCategory} />
                    <span className="ml-auto text-[10px] font-bold text-[#9599a1]">排序</span>
                    <FilterSelect ariaLabel="AIGC爆款排序" value={aigcSort} options={AIGC_SORT_OPTIONS} onChange={setAigcSort} />
                    <button type="button" aria-label="刷新AIGC爆款" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[#70747c] hover:bg-[#f5f6f7]">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                )}

                {tab === "品牌追踪" && (
                  <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-white p-3">
                    <FilterSelect ariaLabel="品牌追踪平台" value={brandPlatform} options={BRAND_PLATFORM_OPTIONS} onChange={setBrandPlatform} />
                    <FilterSelect ariaLabel="品牌追踪国家" value={brandCountry} options={BRAND_COUNTRY_OPTIONS} onChange={setBrandCountry} />
                    <FilterSelect ariaLabel="品牌追踪状态" value={brandStatus} options={BRAND_STATUS_OPTIONS} onChange={setBrandStatus} />
                    <span className="ml-auto text-[10px] font-bold text-[#9599a1]">排序</span>
                    <FilterSelect ariaLabel="品牌追踪排序指标" value={brandSortMetric} options={BRAND_SORT_METRIC_OPTIONS} onChange={setBrandSortMetric} />
                    <FilterSelect ariaLabel="品牌追踪排序方向" value={brandSortDirection} options={BRAND_SORT_DIRECTION_OPTIONS} onChange={setBrandSortDirection} />
                  </div>
                )}

                {sources.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {sources.map((choice) => {
                  const selected = selectedId === choice.id
                  return (
                    <article
                      key={choice.id}
                      className={cn(
                        "group overflow-hidden rounded-2xl border bg-white transition-all",
                        selected
                          ? "border-[#a8cf25] shadow-[0_0_0_2px_rgba(185,219,72,0.25)]"
                          : "border-[var(--line)] hover:-translate-y-0.5 hover:border-[#c8ccd1] hover:shadow-[0_12px_30px_rgba(17,24,39,0.09)]",
                      )}
                    >
                      <button type="button" onClick={() => select(choice, true)} className="block w-full text-left">
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#eceef0]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={choice.cover} alt={choice.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
                          <span className="absolute left-2.5 top-2.5 rounded-md bg-black/70 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
                            {choice.source}
                          </span>
                          <span className="absolute bottom-2.5 left-2.5 flex h-7 items-center gap-1 rounded-full bg-white/92 px-2.5 text-[10px] font-extrabold text-[#1d2025] shadow-sm">
                            <Play size={10} fill="currentColor" />
                            {choice.duration}
                          </span>
                          {selected && (
                            <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lime)] text-[#1c2309] shadow">
                              <Check size={14} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <div className="px-3.5 pb-4 pt-3">
                          <h3 className="line-clamp-2 min-h-9 text-[13px] font-extrabold leading-[18px] text-[#202228]">{choice.title}</h3>
                          <p className="mt-1 truncate text-[10.5px] text-[#92969e]">{choice.account} · {choice.evidence}</p>
                        </div>
                      </button>
                    </article>
                  )
                    })}
                  </div>
                ) : (
                  <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-[#d6d9dd] bg-white text-[12px] font-bold text-[#999da5]">
                    当前筛选条件下暂无素材
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--line)] bg-white px-6 py-4">
            <p className="flex items-center gap-1.5 text-[11px] text-[#92969e]">
              {isUploadTab ? (
                <>
                  <FileVideo2 size={13} />
                  上传视频后将直接作为本次复刻参考
                </>
              ) : "选择素材后将直接进入拆解"}
            </p>
            <Dialog.Close className="h-9 rounded-lg border border-[var(--line)] px-4 text-[12px] font-bold text-[#656971] hover:bg-[#f5f5f5]">
              取消
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

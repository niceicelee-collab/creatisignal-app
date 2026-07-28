"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Flame, Pause, Play, RotateCcw, Search } from "lucide-react"
import { AigcMaterialDrawer } from "./aigc-material-drawer"
import { aigcMaterials, AIGC_SOURCE, type AigcMaterial } from "@/lib/aigc-hits/mock"
import { cn } from "@/lib/utils"

type SortMode = "latest" | "gmv" | "views"

interface Filters {
  platform: string
  category: string
  issue: string
}

const defaultFilters: Filters = {
  platform: "TikTok",
  category: "全部类目",
  issue: "全部期次",
}

const platforms = ["TikTok"]
const categories = ["全部类目", ...Array.from(new Set(aigcMaterials.map((material) => material.category)))]
const issues = ["全部期次", "6月第4期", "6月第3期", "6月第2期", "6月第1期", "5月第4期"]
const PAGE_SIZE = 20

function formatCompact(value: number) {
  if (value >= 10000) {
    const tenThousands = value / 10000
    return `${Number.isInteger(tenThousands) ? tenThousands : tenThousands.toFixed(1)}万+`
  }
  return `${value}+`
}

function SelectFilter({ value, options, onChange, ariaLabel }: { value: string; options: string[]; onChange: (value: string) => void; ariaLabel: string }) {
  return (
    <label className="relative min-w-0">
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[122px] appearance-none rounded-md border border-[var(--line)] bg-white pl-3 pr-8 text-[12px] font-semibold text-[#454851] outline-none hover:border-[var(--line-strong)] focus:border-[#9aa36d]"
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8f98]" />
    </label>
  )
}

function SortSelect({ value, onChange }: { value: SortMode; onChange: (value: SortMode) => void }) {
  return (
    <label className="relative">
      <span className="sr-only">排序方式</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortMode)}
        className="h-9 min-w-[132px] appearance-none rounded-md border border-[var(--line)] bg-white pl-3 pr-8 text-[12px] font-semibold text-[#454851] outline-none hover:border-[var(--line-strong)] focus:border-[#9aa36d]"
      >
        <option value="latest">最新发布</option>
        <option value="gmv">GMV从高到低</option>
        <option value="views">播放量从高到低</option>
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8f98]" />
    </label>
  )
}

function MaterialCard({ material, activePreviewId, onPreviewChange, onOpen }: { material: AigcMaterial; activePreviewId: string | null; onPreviewChange: (id: string | null) => void; onOpen: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [videoFailed, setVideoFailed] = useState(false)
  const previewing = activePreviewId === material.id

  const startPreview = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onPreviewChange(material.id), 300)
  }

  const stopPreview = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    if (previewing) onPreviewChange(null)
  }

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <article
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      className="group overflow-hidden rounded-lg border border-[var(--line)] bg-white text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#c7c9cf] hover:shadow-[0_12px_30px_rgba(24,24,27,0.10)]"
    >
      <div className="relative aspect-[9/16] overflow-hidden bg-[#e9eaed]">
        <Image
          src={material.cover}
          alt={material.productName}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1440px) 25vw, 20vw"
          className={cn("object-cover transition-transform duration-500", previewing ? "scale-[1.03]" : "group-hover:scale-[1.02]")}
        />
        <button
          type="button"
          onClick={onOpen}
          className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b5ca6e]"
          aria-label={`查看${material.title}详情`}
        />
        {previewing && !videoFailed && (
          <video
            src={material.previewVideo}
            poster={material.cover}
            autoPlay
            muted
            playsInline
            loop
            onError={() => setVideoFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-2">
          <div className="flex flex-wrap gap-1">
            <span className="rounded bg-white/94 px-1.5 py-1 text-[10px] font-extrabold text-[#202229] shadow-sm">AIGC</span>
            <span className="rounded bg-[#15161a]/78 px-1.5 py-1 text-[10px] font-bold text-white">{material.platform}</span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onPreviewChange(previewing ? null : material.id)
            }}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-sm"
            aria-label={previewing ? "暂停预览" : "播放预览"}
            title={previewing ? "暂停预览" : "播放预览"}
          >
            {previewing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
        </div>
        {videoFailed && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-4 text-center text-xs font-bold text-white">视频暂不可用</div>
        )}
        <span className="absolute bottom-2 right-2 z-20 rounded bg-black/70 px-1.5 py-1 text-[10px] font-bold tabular-nums text-white">{material.duration}</span>
      </div>

      <div className="p-3">
        <div className="mb-2 flex min-h-5 flex-wrap items-center gap-1">
          {[material.tag, material.category].map((tag) => (
            <span key={tag} className="rounded bg-[#f1f2f4] px-1.5 py-1 text-[10px] font-bold text-[#62666f]">{tag}</span>
          ))}
        </div>
        <button type="button" onClick={onOpen} className="block w-full text-left focus:outline-none focus:underline">
          <h2 className="line-clamp-2 min-h-[40px] text-[13px] font-extrabold leading-5 text-[#202229]">{material.title || material.productName}</h2>
        </button>
        <p className="mt-1 truncate text-[11px] text-[#8b8f98]">{material.productName}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#f0f0f2] pt-3">
          <div>
            <p className="text-[10px] text-[#9a9da5]">GMV</p>
            <p className="mt-0.5 text-[12px] font-extrabold text-[#2b2e34]">约 ${formatCompact(material.gmv)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#9a9da5]">播放量</p>
            <p className="mt-0.5 text-[12px] font-extrabold text-[#2b2e34]">{formatCompact(material.views)}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-[#9a9da5]">
          <span>{material.updateDate} 更新</span>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-[#17181c] px-2.5 text-[10px] font-extrabold text-white transition-colors hover:bg-[#303238] focus:outline-none focus:ring-2 focus:ring-[#b5ca6e]"
          >
            查看详情<ChevronRight size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  )
}

export function AigcHitsContent() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [sortMode, setSortMode] = useState<SortMode>("latest")
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<AigcMaterial | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const resultsRef = useRef<HTMLDivElement>(null)

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setCurrentPage(1)
  }

  const filteredMaterials = useMemo(() => {
    const items = aigcMaterials.filter((material) => {
      return (filters.platform === "全部平台" || material.platform === filters.platform)
        && (filters.category === "全部类目" || material.category === filters.category)
        && (filters.issue === "全部期次" || material.issue === filters.issue)
    })

    return items.sort((a, b) => {
      if (sortMode === "gmv") return b.gmv - a.gmv
      if (sortMode === "views") return b.views - a.views
      return b.updateDate.localeCompare(a.updateDate)
    })
  }, [filters, sortMode])

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE))
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredMaterials.slice(start, start + PAGE_SIZE)
  }, [currentPage, filteredMaterials])

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    setActivePreviewId(null)
    setCurrentPage(page)
    requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }
  const activeFilterLabels = [
    filters.platform !== "全部平台" ? filters.platform : null,
    filters.category !== "全部类目" ? filters.category : null,
    filters.issue !== "全部期次" ? filters.issue : null,
  ].filter(Boolean)

  const resetFilters = () => {
    setFilters(defaultFilters)
    setSortMode("latest")
    setCurrentPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-[1540px] px-5 py-7 pb-20 lg:px-7">
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[var(--line)] pb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#efffc4] text-[#516a12]"><Flame size={18} /></span>
          <div>
            <h1 className="text-[24px] font-[850] leading-tight text-[#17181c]">AIGC爆款</h1>
            <p className="mt-1 text-[13px] text-[#858992]">发现近期行业高表现 AIGC 素材，快速获取创意结构与制作线索</p>
          </div>
        </div>
        <div className="rounded-md border border-[#e5e7dc] bg-[#fafbf6] px-3.5 py-2.5 text-[11px] leading-5 text-[#74786b]">
          <p className="whitespace-nowrap">
            <span className="font-bold text-[#4d5147]">最近更新：{AIGC_SOURCE.updatedAt}</span>
            <span className="ml-3">来源：{AIGC_SOURCE.name}</span>
          </p>
        </div>
      </header>

      <section className="py-5" aria-label="素材筛选">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[#fafafa] p-3">
          <SelectFilter value={filters.platform} options={platforms} onChange={(value) => updateFilter("platform", value)} ariaLabel="平台" />
          <SelectFilter value={filters.category} options={categories} onChange={(value) => updateFilter("category", value)} ariaLabel="类目" />
          <SelectFilter value={filters.issue} options={issues} onChange={(value) => updateFilter("issue", value)} ariaLabel="期次" />
          <div className="ml-auto flex items-center gap-2 pl-2">
            <span className="text-[11px] font-semibold text-[#8a8e97]">排序</span>
            <SortSelect value={sortMode} onChange={(value) => { setSortMode(value); setCurrentPage(1) }} />
            <button type="button" onClick={resetFilters} className="flex h-9 items-center gap-1.5 rounded-md px-3 text-[12px] font-bold text-[#686c75] hover:bg-white" title="重置全部筛选">
              <RotateCcw size={13} />重置
            </button>
          </div>
        </div>
      </section>

      <div ref={resultsRef} className="mb-4 scroll-mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-[#888c95]">
          共 <strong className="font-extrabold text-[#2c2f35]">{filteredMaterials.length}</strong> 条素材
          <span className="mx-2 text-[#d0d1d5]">·</span>
          当前筛选：{activeFilterLabels.length ? activeFilterLabels.join("、") : "全部素材"}
        </p>
        <p className="text-[11px] text-[#a0a3aa]">筛选条件按 AND 组合</p>
      </div>

      {filteredMaterials.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 min-[1440px]:grid-cols-5">
          {paginatedMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              activePreviewId={activePreviewId}
              onPreviewChange={setActivePreviewId}
              onOpen={() => setSelectedMaterial(material)}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center border-y border-[var(--line)] text-center">
          <Search size={24} className="text-[#b0b3b9]" />
          <p className="mt-4 text-sm font-extrabold text-[#363940]">没有找到匹配素材</p>
          <button type="button" onClick={resetFilters} className="mt-3 text-xs font-bold text-[#61751d] hover:underline">重置筛选条件</button>
        </div>
      )}

      {filteredMaterials.length > 0 && (
        <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5" aria-label="素材分页">
          <p className="text-[11px] text-[#9699a1]">第 {currentPage} / {totalPages} 页 · 每页 {PAGE_SIZE} 条</p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[#555962] disabled:cursor-not-allowed disabled:text-[#c4c6cb]"
              aria-label="上一页"
              title="上一页"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => changePage(page)}
                className={cn(
                  "h-9 min-w-9 rounded-md border px-3 text-[12px] font-extrabold tabular-nums",
                  page === currentPage ? "border-[#9ebd3f] bg-[#efffc4] text-[#405409]" : "border-[var(--line)] bg-white text-[#555962] hover:bg-[#f5f6f7]",
                )}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`第 ${page} 页`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[#555962] disabled:cursor-not-allowed disabled:text-[#c4c6cb]"
              aria-label="下一页"
              title="下一页"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </nav>
      )}
      <AigcMaterialDrawer material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
    </div>
  )
}
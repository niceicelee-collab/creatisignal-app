"use client"

import { useMemo, useRef, useState } from "react"
import {
  ArrowDownAZ,
  Calendar,
  Check,
  ChevronDown,
  Circle,
  Download,
  Filter,
  HardDrive,
  LayoutGrid,
  List,
  Plus,
  RefreshCcw,
  Sparkles,
  Star,
  Trash2,
  Video,
  Wand2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { STORAGE_USAGE, type AssetItem, type AssetTab } from "@/lib/assets/mock"
import { useAssetsState } from "@/lib/assets/state"
import { Topbar } from "@/components/layout/topbar"
import { AssetCard } from "./asset-card"

interface Props {
  tab: AssetTab
}

const TYPE_OPTIONS = ["全部类型", "图片", "视频", "数字人", "商品"]
const UPLOAD_TYPE_OPTIONS = ["全部类型", "图片", "视频"]
const KIND_FILTER_OPTIONS = ["全部", "高质量", "AI 生成", "上传", "已收藏"]
const SORT_OPTIONS = ["从新到旧", "从旧到新", "按名称", "按大小"]
const AVATAR_GENDER_OPTIONS = ["全部性别", "男性", "女性"]

export function AssetShell({ tab }: Props) {
  const { getItems, addAsset } = useAssetsState()
  const items: AssetItem[] = getItems(tab)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState(TYPE_OPTIONS[0])
  const [kindFilter, setKindFilter] = useState(KIND_FILTER_OPTIONS[0])
  const [sort, setSort] = useState(SORT_OPTIONS[0])
  const [avatarScope, setAvatarScope] = useState<"official" | "mine">("official")
  const [avatarGender, setAvatarGender] = useState(AVATAR_GENDER_OPTIONS[0])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const avatarUploadRef = useRef<HTMLInputElement>(null)
  // 模拟列表 mutations 后的可见集
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

  const visibleItems = useMemo(
    () => items.filter((it, index) => {
      if (hiddenIds.has(it.id)) return false
      if (tab === "uploaded" && typeFilter !== "全部类型") {
        const expectedKind = typeFilter === "图片" ? "image" : "video"
        return it.kind === expectedKind
      }
      if (tab === "briefs") return !favoritesOnly || favoriteIds.has(it.id)
      if (tab !== "avatars") return true
      const inScope = it.avatarScope ? it.avatarScope === avatarScope : avatarScope === "official" ? index < 6 : index >= 6
      const matchesGender = avatarGender === "全部性别" || it.avatarGender === (avatarGender === "男性" ? "male" : "female")
      const matchesFavorite = !favoritesOnly || favoriteIds.has(it.id)
      return inScope && matchesGender && matchesFavorite
    }),
    [avatarGender, avatarScope, favoriteIds, favoritesOnly, hiddenIds, items, tab, typeFilter]
  )

  const allSelected = selecting && visibleItems.length > 0 && visibleItems.every((it) => selected.has(it.id))

  function toggleBatchMode() {
    if (selecting) {
      setSelecting(false)
      setSelected(new Set())
    } else {
      setSelecting(true)
    }
  }
  function toggleItem(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(visibleItems.map((it) => it.id)))
    }
  }
  function hideSelected() {
    setHiddenIds((prev) => {
      const next = new Set(prev)
      selected.forEach((id) => next.add(id))
      return next
    })
    setSelected(new Set())
  }

  function toggleFavorite(id: string) {
    setFavoriteIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function uploadAvatar(files: FileList | null) {
    const file = files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    addAsset("avatars", {
      id: `uploaded-avatar-${Date.now()}`,
      kind: "avatar",
      thumb: URL.createObjectURL(file),
      ratio: "1:1",
      timeLabel: new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
      sizeKB: Math.max(1, Math.round(file.size / 1024)),
      caption: file.name.replace(/\.[^.]+$/, ""),
      avatarScope: "mine",
    })
    if (avatarUploadRef.current) avatarUploadRef.current.value = ""
  }

  return (
    <>
      <Topbar title="资产库" showActions={false} bordered={false} />
      <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]">
        {/* 资产分类已迁移到左侧二级菜单；正文只保留当前页面操作 */}
        <div className="bg-white sticky top-0 z-10">
          {tab !== "avatars" ? <div className="px-6 pt-3 pb-3 flex items-center gap-2 flex-wrap justify-end">

            {/* 存储用量 */}
            <StorageBar />

            {/* 批量操作 / 生成按钮 */}
            <button
              type="button"
              onClick={toggleBatchMode}
              className={cn(
                "h-9 px-3 rounded-lg text-[12.5px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors",
                selecting
                  ? "bg-[var(--soft)] text-[var(--text)] border border-[var(--line-strong)]"
                  : "border border-[var(--line)] text-[var(--text)] hover:bg-[var(--soft-2)]"
              )}
            >
              <RefreshCcw size={12} strokeWidth={2.4} />
              批量操作
            </button>
            {tab !== "uploaded" ? <>
              <button type="button" className="h-9 px-3 rounded-lg bg-[#18181b] text-white text-[12.5px] font-extrabold flex items-center gap-1.5 cursor-pointer hover:opacity-90"><Wand2 size={12} strokeWidth={2.4} />生成图片</button>
              <button type="button" className="h-9 px-3 rounded-lg bg-[#18181b] text-white text-[12.5px] font-extrabold flex items-center gap-1.5 cursor-pointer hover:opacity-90"><Video size={12} strokeWidth={2.4} />生成视频</button>
            </> : null}
          </div> : null}

          {tab === "avatars" ? (
            <div className="px-6 py-3">
              <div className="inline-flex h-10 items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--soft)] p-1" aria-label="数字人分类">
                {([['official', '官方数字人'], ['mine', '我的数字人']] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setAvatarScope(value)} className={cn("h-8 rounded-lg px-4 text-[12.5px] font-extrabold transition-colors", avatarScope === value ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]")}>{label}</button>
                ))}
              </div>
            </div>
          ) : null}

          {/* 批量模式 toolbar（下拉式 slide-in） */}
          {selecting && (
            <div className="px-6 py-2.5 bg-[var(--soft-2)] flex items-center justify-between gap-3 animate-cs-slide-down">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="h-8 rounded-md flex items-center gap-2 text-[12px] font-bold text-[var(--text)] cursor-pointer hover:opacity-80"
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                    allSelected ? "bg-[#18181b] text-white" : "border-2 border-[var(--line-strong)]"
                  )}>
                    {allSelected && <Check size={9} strokeWidth={3.2} />}
                  </span>
                  全选
                </button>
                <span className="text-[11.5px] font-extrabold text-[var(--muted)]">
                  已选择 <span className="text-[var(--text)] tabular-nums">{selected.size}</span> 项
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <BatchBtn icon={Download} label="下载"        disabled={selected.size === 0} />
                <BatchBtn icon={Trash2}   label="移入回收站"   disabled={selected.size === 0} onClick={hideSelected} />
                <BatchBtn icon={Trash2}   label="彻底删除"     disabled={selected.size === 0} tone="danger" onClick={hideSelected} />
                <button
                  type="button"
                  onClick={toggleBatchMode}
                  className="h-8 px-3 rounded-md text-[12px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-white cursor-pointer flex items-center gap-1"
                >
                  <X size={11} strokeWidth={2.4} />
                  退出
                </button>
              </div>
            </div>
          )}

          {/* 筛选行 */}
          {tab === "avatars" ? (
            <div className="flex items-center gap-2 px-6 py-3">
              <FilterPill icon={Filter} value={avatarGender} options={AVATAR_GENDER_OPTIONS} onChange={setAvatarGender} />
              <button type="button" onClick={() => setFavoritesOnly((current) => !current)} className={cn("flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-bold transition", favoritesOnly ? "border-[#a7c948] bg-[#f3ffd5] text-[#415714]" : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--line-strong)]")}><Star size={12} fill={favoritesOnly ? "currentColor" : "none"} />收藏</button>
            </div>
          ) : (
            <div className="px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <FilterPill icon={Filter} value={typeFilter} options={tab === "uploaded" ? UPLOAD_TYPE_OPTIONS : TYPE_OPTIONS} onChange={setTypeFilter} />
                <FilterPill icon={Calendar} value={tab === "uploaded" ? "上传时间日期" : "选择日期范围"} options={["近 7 天", "近 30 天", "近 90 天", "全部"]} onChange={() => {}} />
                {tab !== "uploaded" ? <FilterPill icon={Sparkles} value={kindFilter} options={KIND_FILTER_OPTIONS} onChange={setKindFilter} /> : null}
                {tab === "briefs" ? <button type="button" onClick={() => setFavoritesOnly((current) => !current)} className={cn("flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-bold transition", favoritesOnly ? "border-[#a7c948] bg-[#f3ffd5] text-[#415714]" : "border-[var(--line)] bg-white text-[var(--text)] hover:border-[var(--line-strong)]")}><Star size={12} fill={favoritesOnly ? "currentColor" : "none"} />收藏</button> : null}
              </div>
              <div className="flex items-center gap-2">
                <FilterPill icon={ArrowDownAZ} value={sort} options={SORT_OPTIONS} onChange={setSort} />
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>
          )}
        </div>

        {/* 网格 */}
        <div className="px-6 py-5">
          {visibleItems.length === 0 ? (
            <EmptyState tab={tab} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-4 gap-3.5">
              {tab === "avatars" && avatarScope === "mine" ? (
                <>
                  <input ref={avatarUploadRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadAvatar(event.target.files)} />
                  <button type="button" onClick={() => avatarUploadRef.current?.click()} className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--line-strong)] bg-white text-[var(--muted)] transition hover:border-[#93b43b] hover:bg-[#fbfff2] hover:text-[#273019]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--soft)] transition group-hover:bg-[#eaffaa]"><Plus size={22} /></span>
                    <span className="text-[12px] font-extrabold">上传数字人</span>
                  </button>
                </>
              ) : null}
              {visibleItems.map((it) => (
                <AssetCard
                  key={it.id}
                  item={it}
                  selecting={selecting}
                  selected={selected.has(it.id)}
                  onToggleSelect={() => toggleItem(it.id)}
                  favorite={favoriteIds.has(it.id)}
                  onToggleFavorite={() => toggleFavorite(it.id)}
                  favoritable={tab === "avatars" || tab === "briefs"}
                />
              ))}
            </div>
          ) : (
            <ListView items={visibleItems} selecting={selecting} selected={selected} onToggle={toggleItem} />
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes csSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-cs-slide-down) { animation: csSlideDown 180ms ease-out both; }
      `}</style>
    </>
  )
}

// ─── Storage bar ─────────────────────────────────────────────────────────────

function StorageBar() {
  const pct = (STORAGE_USAGE.usedMB / STORAGE_USAGE.quotaMB) * 100
  return (
    <div className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-lg border border-[var(--line)] bg-white text-[11.5px] font-bold text-[var(--text)]">
      <HardDrive size={12} className="text-[var(--muted)]" />
      <div className="w-[140px] h-1.5 rounded-full bg-[var(--soft)] overflow-hidden">
        <div className="h-full rounded-full bg-[var(--text)]" style={{ width: `${Math.max(2, pct).toFixed(1)}%` }} />
      </div>
      <span className="tabular-nums whitespace-nowrap">
        {STORAGE_USAGE.usedMB.toFixed(2)} MB / {(STORAGE_USAGE.quotaMB / 1024).toFixed(0)} GB
      </span>
    </div>
  )
}

// ─── Filter pill ─────────────────────────────────────────────────────────────

function FilterPill({
  icon: Icon,
  value,
  options,
  onChange,
}: {
  icon: typeof Filter
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 rounded-lg border border-[var(--line)] bg-white text-[12.5px] font-bold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)]"
      >
        <Icon size={11} className="text-[var(--muted)]" />
        {value}
        <ChevronDown size={11} className="text-[var(--muted)] -mr-0.5" />
      </button>
      {open && (
        <>
          {/* click-away */}
          <span onClick={() => setOpen(false)} aria-hidden className="fixed inset-0 z-10" />
          <div className="absolute top-full left-0 mt-1.5 min-w-[160px] rounded-xl border border-[var(--line)] bg-white shadow-[0_18px_42px_rgba(9,9,11,0.14)] p-1 z-20">
            {options.map((opt) => {
              const active = opt === value
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={cn(
                    "w-full h-8 px-2.5 rounded-md text-left text-[12px] font-bold cursor-pointer flex items-center gap-2 transition-colors",
                    active ? "bg-[var(--soft)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)]"
                  )}
                >
                  {active ? <Check size={11} strokeWidth={2.6} className="text-[var(--text)]" /> : <span className="w-[11px]" />}
                  {opt}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function ViewToggle({ view, onChange }: { view: "grid" | "list"; onChange: (v: "grid" | "list") => void }) {
  return (
    <div className="h-9 p-0.5 rounded-lg border border-[var(--line)] bg-white flex items-center">
      {(["grid", "list"] as const).map((v) => {
        const Icon = v === "grid" ? LayoutGrid : List
        const active = view === v
        return (
          <button
            key={v}
            type="button"
            aria-label={v === "grid" ? "网格视图" : "列表视图"}
            onClick={() => onChange(v)}
            className={cn(
              "h-7 w-8 rounded-md flex items-center justify-center cursor-pointer transition-colors",
              active ? "bg-[var(--soft)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            <Icon size={13} strokeWidth={2.2} />
          </button>
        )
      })}
    </div>
  )
}

// ─── Batch button ────────────────────────────────────────────────────────────

function BatchBtn({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = "default",
}: {
  icon: typeof Download
  label: string
  onClick?: () => void
  disabled?: boolean
  tone?: "default" | "danger"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 px-3 rounded-md text-[12px] font-extrabold flex items-center gap-1.5 transition-colors",
        disabled
          ? "bg-white text-[var(--muted-2)] cursor-not-allowed border border-[var(--line)]"
          : tone === "danger"
            ? "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] hover:bg-[#fee2e2] cursor-pointer"
            : "bg-white text-[var(--text)] border border-[var(--line)] hover:bg-[var(--soft)] cursor-pointer"
      )}
    >
      <Icon size={11} strokeWidth={2.4} />
      {label}
    </button>
  )
}

// ─── List view ───────────────────────────────────────────────────────────────

function ListView({ items, selecting, selected, onToggle }: {
  items: AssetItem[]
  selecting: boolean
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[10.5px] font-extrabold uppercase tracking-wide">
            {selecting && <th className="w-10 px-3 py-2.5" />}
            <th className="text-left px-3 py-2.5">资产</th>
            <th className="text-left px-3 py-2.5">类型</th>
            <th className="text-right px-3 py-2.5">大小</th>
            <th className="text-left px-3 py-2.5">时间</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr
              key={it.id}
              onClick={selecting ? () => onToggle(it.id) : undefined}
              className={cn(
                i > 0 && "border-t border-[var(--line)]",
                selecting && "cursor-pointer hover:bg-[var(--soft-2)]"
              )}
            >
              {selecting && (
                <td className="px-3 py-2">
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    selected.has(it.id) ? "bg-[#18181b] text-white" : "border-2 border-[var(--line-strong)]"
                  )}>
                    {selected.has(it.id) ? <Check size={9} strokeWidth={3.2} /> : null}
                  </span>
                </td>
              )}
              <td className="px-3 py-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-md overflow-hidden bg-[var(--soft)] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.thumb} alt="" className="w-full h-full object-cover" />
                  </span>
                  <span className="font-bold text-[var(--text)] truncate">{it.caption ?? it.id}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-[var(--muted)] font-bold">{it.kind}</td>
              <td className="px-3 py-2 text-right text-[var(--muted)] tabular-nums">{(it.sizeKB / 1024).toFixed(2)} MB</td>
              <td className="px-3 py-2 text-[var(--muted)]">{it.deletedAt ? `删除于 ${it.deletedAt}` : it.timeLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: AssetTab }) {
  const meta: Record<AssetTab, { title: string; sub: string }> = {
    reports:   { title: "还没有创意报告",          sub: "生成或保存的创意报告会展示在此处" },
    analysis:  { title: "还没有创意分析",          sub: "完成素材分析后可保存到资产库" },
    briefs:    { title: "还没有创意 Brief",        sub: "确认后的 Brief 会集中展示在此处" },
    generated: { title: "还没有 AI 生成的资产",  sub: "用「生成图片」/「生成视频」开始创作" },
    uploaded:  { title: "还没有上传的资产",      sub: "拖拽到此处或点上传开始" },
    avatars:   { title: "还没有数字人",          sub: "去数字人工作室创建" },
    products:  { title: "还没有商品",            sub: "导入商品库后会展示在此处" },
    trash:     { title: "回收站空",              sub: "删除的资产会进入此处，30 天后自动清空" },
  }
  const cfg = meta[tab]
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] px-6 py-12 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center mb-3">
        <Circle size={20} strokeWidth={2.2} />
      </div>
      <p className="text-[14px] font-extrabold text-[var(--text)]">{cfg.title}</p>
      <p className="text-[12px] text-[var(--muted)] mt-1.5">{cfg.sub}</p>
    </div>
  )
}

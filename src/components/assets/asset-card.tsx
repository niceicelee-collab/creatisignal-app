"use client"

import { Box, Check, Download, ImageIcon, Play, Star, Trash2, User, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { ASSET_KIND_META, type AssetItem } from "@/lib/assets/mock"

interface Props {
  item: AssetItem
  selecting: boolean
  selected: boolean
  onToggleSelect: () => void
  onOpen?: () => void
  showCaption?: boolean
  favorite?: boolean
  onToggleFavorite?: () => void
  favoritable?: boolean
}

export function AssetCard({ item, selecting, selected, onToggleSelect, onOpen, showCaption = false, favorite = false, onToggleFavorite, favoritable = false }: Props) {
  const kindMeta = ASSET_KIND_META[item.kind]
  const TypeIcon =
    item.kind === "video" ? Video :
    item.kind === "avatar" ? User :
    item.kind === "product" ? Box :
    ImageIcon

  return (
    <article
      onClick={selecting ? onToggleSelect : onOpen}
      onKeyDown={(event) => {
        if (!onOpen || selecting || (event.key !== "Enter" && event.key !== " ")) return
        event.preventDefault()
        onOpen()
      }}
      role={onOpen && !selecting ? "button" : undefined}
      tabIndex={onOpen && !selecting ? 0 : undefined}
      className={cn(
        "group relative rounded-2xl overflow-hidden bg-white border transition-all",
        selecting && selected
          ? "border-[#18181b] shadow-[0_0_0_3px_rgba(24,24,27,0.18)]"
          : "border-[var(--line)] hover:border-[var(--line-strong)]",
        (selecting || onOpen) && "cursor-pointer"
      )}
    >
      {/* 缩略图 */}
      <div className="relative bg-[var(--soft)] aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.thumb} alt={item.caption ?? item.id} className="w-full h-full object-cover" draggable={false} />

        {/* video play overlay */}
        {item.kind === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/15 pointer-events-none">
            <span className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <Play size={14} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
            </span>
          </div>
        )}

        {/* 左上角类型徽章 */}
        <span
          className="absolute top-2 left-2 inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10.5px] font-extrabold backdrop-blur"
          style={{ backgroundColor: kindMeta.bg + "ee", color: kindMeta.color }}
        >
          <TypeIcon size={11} strokeWidth={2.4} />
          {kindMeta.label}
        </span>

        {/* 右上角选择圆点 */}
        {selecting && (
          <button
            type="button"
            aria-label={selected ? "取消选择" : "选择"}
            onClick={(e) => { e.stopPropagation(); onToggleSelect() }}
            className={cn(
              "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
              selected
                ? "bg-[#18181b] text-white"
                : "bg-white/90 border-2 border-white text-transparent hover:bg-white"
            )}
          >
            {selected && <Check size={12} strokeWidth={3} />}
          </button>
        )}

        {favoritable ? (
          <button
            type="button"
            aria-label={favorite ? "取消收藏" : "收藏"}
            title={favorite ? "取消收藏" : "收藏"}
            onClick={(event) => { event.stopPropagation(); onToggleFavorite?.() }}
            className={cn("absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition", favorite ? "bg-[#c9ff29] text-[#273408]" : "bg-black/55 text-white hover:bg-black/75")}
          >
            <Star size={14} strokeWidth={2.2} fill={favorite ? "currentColor" : "none"} />
          </button>
        ) : (
          <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/55 backdrop-blur text-white flex items-center justify-center pointer-events-none">
            <Box size={11} strokeWidth={2.4} />
          </span>
        )}
      </div>

      {/* 底部信息 */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <span className="min-w-0">
          {showCaption ? <span className="block truncate text-[12.5px] font-extrabold text-[var(--text)]">{item.caption}</span> : null}
          <span className={cn("block truncate text-[11.5px] font-semibold text-[var(--muted)]", showCaption && "mt-1")}>{item.deletedAt ? `删除于 ${item.deletedAt}` : item.timeLabel}</span>
        </span>
        {!selecting && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconBtn icon={Download} label="下载" />
            <IconBtn icon={Trash2} label="删除" tone="danger" />
          </div>
        )}
      </div>
    </article>
  )
}

function IconBtn({ icon: Icon, label, tone = "default" }: { icon: typeof Download; label: string; tone?: "default" | "danger" }) {
  return (
    <button
      type="button"
      onClick={(e) => e.stopPropagation()}
      aria-label={label}
      title={label}
      className={cn(
        "w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-colors",
        tone === "danger"
          ? "text-[var(--muted)] hover:text-[#dc2626] hover:bg-[#fef2f2]"
          : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)]"
      )}
    >
      <Icon size={12} strokeWidth={2.4} />
    </button>
  )
}

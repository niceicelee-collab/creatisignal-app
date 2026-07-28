"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Copy, ExternalLink, Sparkles, X } from "lucide-react"
import type { AigcMaterial } from "@/lib/aigc-hits/mock"

function formatCompact(value: number) {
  if (value >= 10000) {
    const tenThousands = value / 10000
    return `${Number.isInteger(tenThousands) ? tenThousands : tenThousands.toFixed(1)}万+`
  }
  return `${value}+`
}

export function AigcMaterialDrawer({ material, onClose }: { material: AigcMaterial | null; onClose: () => void }) {
  const router = useRouter()
  useEffect(() => {
    if (!material) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [material, onClose])

  if (!material) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25" role="presentation" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${material.title}素材详情`}
        onMouseDown={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[540px] flex-col border-l border-[var(--line)] bg-white shadow-[-20px_0_48px_rgba(24,24,27,0.14)]"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--line)] px-5">
          <div>
            <p className="text-[11px] font-bold text-[#8b8f98]">AIGC爆款素材</p>
            <h2 className="mt-0.5 text-[16px] font-extrabold text-[#17181c]">素材详情</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-md text-[#6f737c] hover:bg-[#f3f4f6]" aria-label="关闭详情" title="关闭">
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="relative mx-auto aspect-[9/16] max-h-[420px] w-full max-w-[236px] overflow-hidden rounded-lg bg-black">
            <video src={material.previewVideo} poster={material.cover} controls muted playsInline preload="metadata" className="h-full w-full object-contain" />
            <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-[10px] font-bold text-white">{material.duration}</span>
          </div>

          <section className="mt-6 border-t border-[var(--line)] pt-5">
            <h3 className="text-[17px] font-extrabold leading-6 text-[#202229]">{material.title}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["AIGC", material.platform].map((tag) => (
                <span key={tag} className="rounded bg-[#f1f2f4] px-2 py-1 text-[11px] font-bold text-[#5f636c]">{tag}</span>
              ))}
            </div>
            <dl className="mt-4 space-y-2.5 text-[12px]">
              <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#999ca4]">类目</dt><dd className="font-semibold text-[#4f535b]">{material.category}</dd></div>
              <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#999ca4]">产品名称</dt><dd className="font-semibold text-[#4f535b]">{material.productName}</dd></div>
            </dl>
          </section>

          <section className="mt-6 grid grid-cols-[0.85fr_0.85fr_1.3fr] divide-x divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[#fafafa] py-4">
            <div className="px-3">
              <p className="text-[10px] text-[#92959d]">GMV</p>
              <p className="mt-1 text-[15px] font-extrabold">约 ${formatCompact(material.gmv)}</p>
            </div>
            <div className="px-3">
              <p className="text-[10px] text-[#92959d]">播放量</p>
              <p className="mt-1 text-[15px] font-extrabold">{formatCompact(material.views)}</p>
            </div>
            <div className="px-3">
              <p className="text-[10px] text-[#92959d]">统计周期</p>
              <p className="mt-1 whitespace-nowrap text-[11px] font-extrabold leading-5">{material.period}</p>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-[13px] font-extrabold text-[#26292f]">视频要点</h3>
            <ul className="mt-3 space-y-2.5">
              {material.highlights.map((point) => (
                <li key={point} className="flex gap-2 text-[13px] leading-6 text-[#555962]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#84a421]" />
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-lg border border-[#dfe4cf] bg-[#f8faef] p-4">
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#313720]"><Sparkles size={15} />提示词反推</div>
            <p className="mt-3 text-[13px] leading-6 text-[#5b614e]">{material.prompt}</p>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(material.prompt)}
              className="mt-3 flex h-8 items-center gap-1.5 rounded-md border border-[#d9deca] bg-white px-3 text-[11px] font-bold text-[#4f5544]"
              title="复制提示词"
            >
              <Copy size={13} />复制提示词
            </button>
          </section>

          <section className="mt-6 border-t border-[var(--line)] pt-5">
            <h3 className="text-[13px] font-extrabold text-[#26292f]">来源说明</h3>
            <dl className="mt-3 space-y-3 text-[12px]">
              <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#999ca4]">来源</dt><dd className="font-semibold text-[#4f535b]">{material.sourceName}</dd></div>
              <div className="flex gap-3"><dt className="w-16 shrink-0 text-[#999ca4]">更新时间</dt><dd className="text-[#4f535b]">{material.updateDate}</dd></div>
            </dl>
            <a href={material.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#4d6510] hover:underline">
              打开来源链接<ExternalLink size={13} />
            </a>
          </section>
        </div>

        <footer className="shrink-0 border-t border-[var(--line)] bg-white p-4">
          <button
            type="button"
            onClick={() => router.push(`/replicate/beta-aigc-${material.id}?asset=${material.id}&source=aigc&title=${encodeURIComponent(`复刻 · ${material.title}`)}`)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#17181b] text-[13px] font-extrabold text-white transition-colors hover:bg-black"
          >
            <Sparkles size={15} />一键复刻
          </button>
        </footer>
      </aside>
    </div>
  )
}

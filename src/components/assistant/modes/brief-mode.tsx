"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown, Clock, Languages, PackageSearch, Pencil, X } from "lucide-react"
import { SendButton } from "../send-button"
import { cn } from "@/lib/utils"
import type { Product } from "@/components/products/product-data"
import { LANGUAGE_OPTIONS, SCRIPT_STYLES } from "@/components/zero-to-video/zero-to-video-data"

interface BriefModeProps {
  initialPrompt?: string
  onSubmit?: () => void
  onSelectProduct?: () => void
  selectedProduct?: Product | null
  onRemoveProduct?: () => void
  submitting?: boolean
}

export function BriefMode({ initialPrompt, onSubmit, onSelectProduct, selectedProduct, onRemoveProduct, submitting }: BriefModeProps = {}) {
  const [text, setText] = useState("")
  const [scriptStyle, setScriptStyle] = useState(SCRIPT_STYLES[0])
  const [locale, setLocale] = useState(LANGUAGE_OPTIONS[0].value)
  const [duration, setDuration] = useState(15)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!initialPrompt) return
    window.setTimeout(() => {
      setText(initialPrompt)
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.selectionStart = el.selectionEnd = el.value.length
    }, 0)
  }, [initialPrompt])

  function handleSend() {
    if (!text.trim() || !selectedProduct) return
    onSubmit?.()
  }

  return (
    <>
      <div className="flex min-h-24 items-start gap-2.5">
        <div className="relative w-16 shrink-0">
          <button type="button" onClick={onSelectProduct} aria-label={selectedProduct ? `更换商品：${selectedProduct.name}` : "从商品库选择商品"} title={selectedProduct?.name ?? "从公共商品库选择"} className="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#e2e4df] bg-[#f5f6f4] text-[#737a70] transition hover:border-[#bfc5ba] hover:bg-[#f0f2ed] hover:text-[#242824]">
            {selectedProduct ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedProduct.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </>
            ) : (
              <PackageSearch size={22} strokeWidth={1.8} />
            )}
          </button>
          {selectedProduct && onRemoveProduct ? <button type="button" onClick={onRemoveProduct} aria-label="移除已选商品" className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#242823] text-white shadow-sm hover:bg-black"><X size={9} strokeWidth={3} /></button> : null}
        </div>

        <textarea
          ref={textareaRef}
          className="min-h-20 min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-1 text-[14px] leading-[1.55] text-[#24272f] outline-none placeholder:text-[var(--muted-2)]"
          placeholder="请选择商品，并描述你的创意想法"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="创意脚本"
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-[var(--line)] pt-3">
        <CompactSelect label="脚本风格" icon={Pencil} value={scriptStyle} onChange={setScriptStyle}>
          {SCRIPT_STYLES.map((item) => <option key={item}>{item}</option>)}
        </CompactSelect>
        <CompactSelect label="目标语言" icon={Languages} value={locale} onChange={setLocale}>
          {LANGUAGE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </CompactSelect>
        <DurationPicker value={duration} onChange={setDuration} />
        <span className="ml-auto" />
        <SendButton disabled={!text.trim() || !selectedProduct} loading={submitting} onClick={handleSend} />
      </div>
    </>
  )
}

function DurationPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={`视频时长 ${value} 秒`} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[10.5px] font-extrabold text-[#596058] transition hover:bg-[#f1f2ef] hover:text-[#242824]">
        <Clock size={12} />
        <span>{value}s</span>
        <ChevronDown size={11} className={cn(open && "rotate-180")} />
      </button>
      {open ? (
        <>
          <button type="button" aria-label="关闭时长选择" onClick={() => setOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <div className="absolute left-0 top-full z-20 mt-1.5 rounded-xl border border-[#dfe3dc] bg-white p-3 shadow-[0_16px_38px_rgba(24,29,22,0.16)]" style={{ width: 232 }}>
            <div className="mb-2 flex items-center justify-between whitespace-nowrap text-[11px]">
              <span className="font-bold text-[#777e74]">时长</span>
              <span className="font-black tabular-nums text-[#242824]">{value}s</span>
            </div>
            <input type="range" min={1} max={60} step={1} value={value} aria-label="自定义视频时长" onChange={(event) => onChange(Number(event.currentTarget.value))} className="h-1.5 w-full cursor-pointer" style={{ accentColor: "#20241f" }} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function CompactSelect({
  label,
  icon: Icon,
  value,
  onChange,
  children,
}: {
  label: string
  icon: typeof Pencil
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="relative inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[#596058] transition hover:bg-[#f1f2ef] hover:text-[#242824]">
      <Icon size={12} className="shrink-0" />
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-[104px] appearance-none bg-transparent pr-4 text-[10.5px] font-extrabold outline-none"
      >
        {children}
      </select>
      <ChevronDown size={11} className="pointer-events-none absolute right-1.5 text-[var(--muted)]" />
    </label>
  )
}

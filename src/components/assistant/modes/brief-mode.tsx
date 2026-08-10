"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronDown, Clock, Languages, LayoutTemplate, Pencil, Plus, UserRound, Zap } from "lucide-react"
import { SendButton } from "../send-button"
import { SelectedProductTile } from "../selected-product-tile"
import type { Product } from "@/components/products/product-data"
import { DigitalHumanModal, type DHItem } from "@/components/modals/digital-human-modal"
import { CREATIVE_TEMPLATES, LANGUAGE_OPTIONS, SCRIPT_STYLES } from "@/components/zero-to-video/zero-to-video-data"
import { HOOK_PATTERNS, HookPopup, type HookPattern } from "./generate-mode"
import { cn } from "@/lib/utils"

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
  const [templateId, setTemplateId] = useState(CREATIVE_TEMPLATES[0].id)
  const [hookPattern, setHookPattern] = useState<HookPattern>(HOOK_PATTERNS[0])
  const [hookPickerOpen, setHookPickerOpen] = useState(false)
  const [locale, setLocale] = useState(LANGUAGE_OPTIONS[0].value)
  const [duration, setDuration] = useState(15)
  const [digitalHuman, setDigitalHuman] = useState<DHItem>({
    id: "dh-amy",
    name: "安然",
    thumb: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=420&h=560&q=85",
  })
  const [digitalHumanPickerOpen, setDigitalHumanPickerOpen] = useState(false)
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
    if (!text.trim()) return
    onSubmit?.()
  }

  return (
    <>
      <textarea
        ref={textareaRef}
        className="w-full min-h-[44px] border-0 outline-none resize-none text-[#24272f] text-[15px] leading-[1.5] bg-transparent placeholder:text-[var(--muted-2)]"
        placeholder="填写 Brief 目标、人群、卖点、投放场景或参考方向"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="创意 Brief"
        maxLength={2000}
        rows={3}
      />
      <div className="mt-3 border-t border-[var(--line)] pt-3">
        <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#3f3f46]">
          <Pencil size={13} />
          脚本 Brief 设置
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <BriefSelect label="脚本风格" icon={Pencil} value={scriptStyle} onChange={setScriptStyle}>
            {SCRIPT_STYLES.map((item) => <option key={item}>{item}</option>)}
          </BriefSelect>
          <BriefSelect label="创意模板" icon={LayoutTemplate} value={templateId} onChange={setTemplateId}>
            {CREATIVE_TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </BriefSelect>
          <BriefAction label="Hook" icon={Zap} onClick={() => setHookPickerOpen(true)}>
            <span className="truncate">{hookPattern.title} · {hookPattern.prompt}</span>
          </BriefAction>
          <BriefSelect label="目标语言" icon={Languages} value={locale} onChange={setLocale}>
            {LANGUAGE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </BriefSelect>
          <BriefAction label="数字人 / 人物" icon={UserRound} onClick={() => setDigitalHumanPickerOpen(true)}>
            <span
              className="h-6 w-6 shrink-0 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url("${digitalHuman.thumb}")` }}
              aria-hidden="true"
            />
            <span className="truncate">{digitalHuman.name}</span>
          </BriefAction>
          <div className="rounded-[10px] border border-[var(--line)] bg-white px-3 py-2">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--muted)]">
              <Clock size={12} /> 视频时长
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[10, 15, 20, 30].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setDuration(seconds)}
                  className={cn(
                    "h-7 rounded-[7px] border text-[11px] font-semibold transition-colors",
                    duration === seconds
                      ? "border-[#171a16] bg-[#171a16] text-white"
                      : "border-[var(--line)] bg-white text-[#52525b] hover:border-[#a1a1aa]",
                  )}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-[14px] mt-auto">
        <div className="flex items-center gap-2.5">
          {selectedProduct && onSelectProduct && onRemoveProduct ? (
            <SelectedProductTile product={selectedProduct} onSelect={onSelectProduct} onRemove={onRemoveProduct} />
          ) : (
            <button
              type="button"
              onClick={onSelectProduct}
              className="w-[34px] h-[34px] rounded-full border border-[var(--line)] bg-white text-[#52525b] flex items-center justify-center cursor-pointer"
              aria-label="选择商品"
              title="选择商品"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          )}
        </div>
        <SendButton disabled={!text.trim()} loading={submitting} onClick={handleSend} />
      </div>
      {hookPickerOpen ? (
        <HookPopup
          initialHookId={hookPattern.id}
          onApply={(nextHook) => {
            setHookPattern(nextHook)
            setHookPickerOpen(false)
          }}
          onClose={() => setHookPickerOpen(false)}
        />
      ) : null}
      <DigitalHumanModal
        open={digitalHumanPickerOpen}
        onOpenChange={setDigitalHumanPickerOpen}
        onConfirm={setDigitalHuman}
      />
    </>
  )
}

function BriefSelect({
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
    <label className="relative rounded-[10px] border border-[var(--line)] bg-white px-3 py-2">
      <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--muted)]">
        <Icon size={12} /> {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-6 w-full appearance-none bg-transparent pr-6 text-[12px] font-semibold text-[#27272a] outline-none"
      >
        {children}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute bottom-[13px] right-3 text-[var(--muted)]" />
    </label>
  )
}

function BriefAction({
  label,
  icon: Icon,
  onClick,
  children,
}: {
  label: string
  icon: typeof Pencil
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 rounded-[10px] border border-[var(--line)] bg-white px-3 py-2 text-left transition-colors hover:border-[#a1a1aa]"
    >
      <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--muted)]">
        <Icon size={12} /> {label}
      </span>
      <span className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-[#27272a]">
        {children}
      </span>
    </button>
  )
}

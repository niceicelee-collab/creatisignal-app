"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Video, Image, UserRound, ChevronDown, SlidersHorizontal, Sparkles, Star, X, Play, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SendButton } from "../send-button"
import { ImageSelectModal, type ImageItem } from "@/components/modals/image-select-modal"
import { VideoSelectModal, type VideoItem } from "@/components/modals/video-select-modal"
import { DigitalHumanModal, type DHItem } from "@/components/modals/digital-human-modal"
import { ReplicateSourceModal, type ReplicateSourceChoice } from "@/components/assistant/replicate-source-modal"

// ─── Types & Data ────────────────────────────────────────────────────────────

type GenType = "video" | "image" | "remix" | "reverse"
type ActivePopup = "task" | "model" | "hook" | "settings" | null

const TASK_TYPES: { id: "video" | "remix"; label: string; description: string; icon: typeof Video }[] = [
  { id: "video", label: "视频生成", description: "从提示词生成新视频", icon: Video },
  { id: "remix", label: "高保真复刻", description: "先选参考素材，再拆解与替换", icon: Link2 },
]

const videoModels = ["Seedance 2", "Seedance 1 Pro", "Veo 3", "Kling 2.1"]
const imageModels = ["Nano Banana Pro", "GPT Image 1", "Seedream 4.0"]
const reverseModels = ["GPT-5.5", "GPT-5.4", "Claude Sonnet 4.5"]

const VIDEO_RESOLUTIONS = ["480P", "720P"]
const IMAGE_RESOLUTIONS = ["1K", "2K", "4K"]
const VIDEO_RATIOS = ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "自动"]
const IMAGE_RATIOS = ["Auto", "1:1", "3:4", "4:3", "9:16", "16:9", "21:9"]

const HOOK_CATEGORIES = ["全部", "推荐", "高打断", "建立信任", "教程演示", "UGC自然", "产品卖点"] as const

type HookCategory = (typeof HOOK_CATEGORIES)[number]
type HookPattern = {
  id: string
  category: Exclude<HookCategory, "全部">
  title: string
  desc: string
  prompt: string
  image: string
  tag: string
}

const HOOK_PATTERNS: HookPattern[] = [
  {
    id: "result-first",
    category: "推荐",
    title: "结果前置",
    desc: "一位自信的人物通过充满表现力的动作亮出产品，随后介绍产品的核心优势。",
    prompt: "开场先展示最惊艳的最终效果，随后用一句话说明产品如何带来这个结果。",
    image: "https://picsum.photos/seed/hook-result-first/420/560",
    tag: "强转化",
  },
  {
    id: "pain-question",
    category: "推荐",
    title: "痛点反问",
    desc: "用一个扎心问题，让目标用户立刻代入。",
    prompt: "开场用一个用户正在经历的痛点反问，引导观众意识到自己需要这个解决方案。",
    image: "https://picsum.photos/seed/hook-pain-question/420/560",
    tag: "强共鸣",
  },
  {
    id: "fail-moment",
    category: "高打断",
    title: "翻车瞬间",
    desc: "先出现失败或尴尬画面，再给解决方法。",
    prompt: "第一幕展示一次明显失败或尴尬的使用场景，紧接着切到产品解决问题的画面。",
    image: "https://picsum.photos/seed/hook-fail-moment/420/560",
    tag: "停滑",
  },
  {
    id: "falling-object",
    category: "高打断",
    title: "突然入画",
    desc: "物体突然落入画面，制造视觉中断。",
    prompt: "开场让关键物体突然进入画面或被快速推近镜头，制造视觉打断后展示产品卖点。",
    image: "https://picsum.photos/seed/hook-falling-object/420/560",
    tag: "视觉冲击",
  },
  {
    id: "street-proof",
    category: "建立信任",
    title: "真人证言",
    desc: "像路人/用户一句话背书，降低怀疑。",
    prompt: "以真实用户口吻开场，说出购买前的顾虑和使用后的具体变化。",
    image: "https://picsum.photos/seed/hook-street-proof/420/560",
    tag: "信任感",
  },
  {
    id: "comment-reply",
    category: "建立信任",
    title: "评论回复",
    desc: "用一条高频评论引出产品证明。",
    prompt: "开场展示一条用户质疑评论，然后用产品实拍和细节证明回应这条评论。",
    image: "https://picsum.photos/seed/hook-comment-reply/420/560",
    tag: "社证",
  },
  {
    id: "three-step",
    category: "教程演示",
    title: "三步演示",
    desc: "把复杂卖点拆成 3 个简单动作。",
    prompt: "开场承诺三步看懂产品使用方法，然后用清晰分镜展示每一步。",
    image: "https://picsum.photos/seed/hook-three-step/420/560",
    tag: "易理解",
  },
  {
    id: "before-after",
    category: "产品卖点",
    title: "前后对比",
    desc: "同场景展示使用前和使用后的差异。",
    prompt: "开场用前后对比画面展示产品带来的明显变化，并突出最核心的一个卖点。",
    image: "https://picsum.photos/seed/hook-before-after/420/560",
    tag: "强证明",
  },
  {
    id: "close-detail",
    category: "产品卖点",
    title: "细节特写",
    desc: "用超近景展示材质、效果或关键结构。",
    prompt: "第一镜头使用产品细节特写，放大材质、结构或效果，让观众先被画面质感吸引。",
    image: "https://picsum.photos/seed/hook-close-detail/420/560",
    tag: "质感",
  },
  {
    id: "friend-share",
    category: "UGC自然",
    title: "朋友安利",
    desc: "像朋友分享一样自然说出使用感受。",
    prompt: "开场用朋友聊天式口吻介绍产品，语气自然，先说真实使用感受再补充卖点。",
    image: "https://picsum.photos/seed/hook-friend-share/420/560",
    tag: "自然口播",
  },
]

const VIDEO_POINT_RATES: Record<string, Record<string, number>> = {
  "Seedance 2": { "480P": 6, "720P": 9 },
  "Seedance 1 Pro": { "480P": 5, "720P": 8 },
  "Veo 3": { "480P": 18, "720P": 28 },
  "Kling 2.1": { "480P": 8, "720P": 12 },
}

const IMAGE_POINT_COSTS: Record<string, Record<string, number>> = {
  "Nano Banana Pro": { "1K": 60, "2K": 120, "4K": 240 },
  "GPT Image 1": { "1K": 50, "2K": 100, "4K": 200 },
  "Seedream 4.0": { "1K": 40, "2K": 80, "4K": 160 },
}

function getSignalPointCost({
  genType,
  model,
  videoResolution,
  videoDuration,
  imageResolution,
}: {
  genType: GenType
  model: string
  videoResolution: string
  videoDuration: number
  imageResolution: string
}) {
  if (genType === "image") return IMAGE_POINT_COSTS[model]?.[imageResolution] ?? 60
  if (genType === "reverse") return 20

  const pointsPerSecond = VIDEO_POINT_RATES[model]?.[videoResolution] ?? 9
  return pointsPerSecond * videoDuration
}

function getRectDims(ratio: string, maxDim: number): { w: number; h: number } | null {
  if (ratio === "自动" || ratio === "Auto") return null
  const [wp, hp] = ratio.split(":").map(Number)
  return wp >= hp
    ? { w: maxDim, h: Math.max(3, Math.round((maxDim * hp) / wp)) }
    : { w: Math.max(3, Math.round((maxDim * wp) / hp)), h: maxDim }
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function RatioRect({ ratio, maxDim }: { ratio: string; maxDim: number }) {
  const d = getRectDims(ratio, maxDim)
  if (!d) return null
  return <div style={{ width: d.w, height: d.h }} className="border-[1.5px] border-current rounded-[1.5px] shrink-0" />
}

function PopupCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "absolute bottom-[calc(100%+8px)] left-0 z-30 bg-white border border-[var(--line)] rounded-[14px] shadow-[0_18px_42px_rgba(9,9,11,0.14)]",
      className
    )}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-[var(--muted)] mb-2 tracking-wide">{children}</p>
}

function TargetArrowIcon({ size = 14, strokeWidth = 2.1 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10" cy="14" r="7" />
      <circle cx="10" cy="14" r="3" />
      <path d="M10 14 20 4" />
      <path d="M15.5 4H20v4.5" />
    </svg>
  )
}

// ─── Popups ──────────────────────────────────────────────────────────────────

function ModelPopup({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <PopupCard className="w-[200px] p-1.5">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onSelect(opt)}
          className={cn("w-full h-[34px] rounded-[9px] text-left px-[9px] flex items-center gap-2 text-[13px] font-[650] cursor-pointer", selected === opt ? "bg-[var(--soft)]" : "hover:bg-[var(--soft)]")}>
          <span className="w-4 h-4 rounded bg-[var(--soft)] text-[9px] font-black flex items-center justify-center shrink-0">{opt.slice(0, 2)}</span>
          {opt}
        </button>
      ))}
    </PopupCard>
  )
}

function HookPopup({ onApply, onClose, initialHookId }: { onApply: (hook: HookPattern) => void; onClose: () => void; initialHookId?: string }) {
  const [activeCategory, setActiveCategory] = useState<HookCategory>("推荐")
  const [selectedHookId, setSelectedHookId] = useState(initialHookId ?? HOOK_PATTERNS[0].id)

  const visibleHooks = activeCategory === "全部"
    ? HOOK_PATTERNS
    : HOOK_PATTERNS.filter((hook) => hook.category === activeCategory)
  const selectedHook = HOOK_PATTERNS.find((hook) => hook.id === selectedHookId) ?? HOOK_PATTERNS[0]

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f172a]/35 p-5 backdrop-blur-[8px]"
      role="dialog"
      aria-modal="true"
      aria-label="Hook选择"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-[min(1120px,calc(100vw-40px))] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭 Hook 弹窗"
          className="absolute right-5 top-5 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-white/90 text-[#6f7480] shadow-sm transition-colors hover:text-[var(--text)]"
        >
          <X size={16} strokeWidth={2.2} />
        </button>

        <div className="grid gap-5 px-7 pb-4 pt-7 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--lime-soft)] text-[#4a641b]">
              <TargetArrowIcon size={20} strokeWidth={2.1} />
            </div>
            <h3 className="whitespace-nowrap text-[32px] font-black leading-[1.08] tracking-[-0.02em] text-[var(--text)]">选择一个能让吸引用户注意力的Hook</h3>
            <p className="mt-3 max-w-[560px] text-[15px] font-medium leading-relaxed text-[var(--muted)]">选择第一幕的开场结构，系统自动把它应用到当前创意提示词里。</p>
          </div>

          <div className="hidden items-start justify-end gap-[-18px] md:flex">
            {HOOK_PATTERNS.slice(0, 3).map((hook, index) => (
              <div
                key={hook.id}
                className={cn(
                  "h-[132px] w-[96px] overflow-hidden rounded-2xl border border-white bg-cover bg-center shadow-[0_18px_38px_rgba(15,23,42,0.18)]",
                  index === 0 && "rotate-[-9deg] opacity-70",
                  index === 1 && "z-10 scale-110",
                  index === 2 && "rotate-[8deg] opacity-80"
                )}
                style={{ backgroundImage: "url('" + hook.image + "')" }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto px-7 pb-4">
          {HOOK_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-[13px] font-bold transition-colors",
                activeCategory === category
                  ? "border-[#18181b] bg-[#18181b] text-white"
                  : "border-[var(--line)] bg-white text-[#6f7480] hover:border-[#c7cdd6] hover:text-[var(--text)]"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(166px,1fr))] gap-3 overflow-y-auto px-7 pb-5">
          {visibleHooks.map((hook) => {
            const selected = hook.id === selectedHook.id
            return (
              <button
                key={hook.id}
                type="button"
                onClick={() => setSelectedHookId(hook.id)}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.14)]",
                  selected ? "border-[#18181b] shadow-[0_0_0_2px_rgba(24,24,27,0.08)]" : "border-[var(--line)]"
                )}
              >
                <div
                  className="relative aspect-[4/5] bg-cover bg-center"
                  style={{ backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 48%, rgba(0,0,0,0.45) 100%), url('" + hook.image + "')" }}
                >
                  <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-extrabold text-[#18181b] shadow-sm">{hook.tag}</span>
                  <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                    <TargetArrowIcon size={13} strokeWidth={2.1} />
                  </span>
                  <span className="absolute bottom-2 left-2 right-2 text-[11px] font-bold leading-tight text-white/95">{hook.category}</span>
                </div>
                <div className="p-3">
                  <p className="truncate text-[14px] font-extrabold text-[var(--text)]">{hook.title}</p>
                  <p className="mt-1 h-[34px] overflow-hidden text-[12px] font-medium leading-[1.4] text-[var(--muted)]">{hook.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--line)] bg-[#fafafa] px-7 py-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-[#8b98a9]">已选 Hook</p>
            <p className="mt-1 text-[13px] font-extrabold text-[var(--text)]">{selectedHook.title}</p>
            <p className="mt-1 max-w-[720px] text-[12px] font-medium leading-relaxed text-[var(--muted)]">{selectedHook.prompt}</p>
          </div>
          <button
            type="button"
            onClick={() => onApply(selectedHook)}
            className="h-10 shrink-0 rounded-full bg-[var(--lime)] px-5 text-[13px] font-extrabold text-[#1a2010] shadow-[0_10px_24px_rgba(185,255,45,0.35)] transition-transform hover:-translate-y-0.5"
          >
            使用此 Hook
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoSettingsPopup({ resolution, setResolution, ratio, setRatio, duration, setDuration }: {
  resolution: string; setResolution: (v: string) => void
  ratio: string; setRatio: (v: string) => void
  duration: number; setDuration: (v: number) => void
}) {
  return (
    <PopupCard className="w-[288px] p-4">
      <div className="mb-4">
        <SectionLabel>分辨率</SectionLabel>
        <div className="flex gap-1 bg-[var(--soft)] rounded-lg p-1">
          {VIDEO_RESOLUTIONS.map((r) => (
            <button key={r} type="button" onClick={() => setResolution(r)}
              className={cn("flex-1 h-7 rounded-md text-[13px] font-semibold transition-colors", resolution === r ? "bg-white shadow-sm text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]")}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <SectionLabel>宽高比</SectionLabel>
        <div className="flex gap-1.5">
          {VIDEO_RATIOS.map((r) => (
            <button key={r} type="button" onClick={() => setRatio(r)}
              className={cn("flex flex-col items-center justify-center gap-[5px] flex-1 py-2 rounded-lg border text-[9px] font-semibold transition-colors",
                ratio === r ? "bg-[#18181b] border-[#18181b] text-white" : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]")}>
              {r === "自动" ? <span className="text-[10px] leading-none">自动</span> : <><RatioRect ratio={r} maxDim={14} /><span className="leading-none">{r}</span></>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>时长</SectionLabel>
        <div className="flex items-center gap-3">
          <input type="range" min={5} max={60} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
            className="dh-range flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #18181b 0%, #18181b ${((duration - 5) / 55) * 100}%, var(--line) ${((duration - 5) / 55) * 100}%, var(--line) 100%)`,
            }} />
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-9 h-7 border border-[var(--line)] rounded-lg text-[13px] font-semibold text-[var(--text)] flex items-center justify-center">{duration}</div>
            <span className="text-[12px] text-[var(--muted)]">s</span>
          </div>
        </div>
      </div>
    </PopupCard>
  )
}

function ImageSettingsPopup({ resolution, setResolution, ratio, setRatio }: {
  resolution: string; setResolution: (v: string) => void
  ratio: string; setRatio: (v: string) => void
}) {
  return (
    <PopupCard className="w-[248px] p-4">
      <div className="mb-4">
        <SectionLabel>Resolution</SectionLabel>
        <div className="flex gap-2">
          {IMAGE_RESOLUTIONS.map((r) => (
            <button key={r} type="button" onClick={() => setResolution(r)}
              className={cn("flex-1 h-8 rounded-lg border text-[13px] font-semibold transition-colors",
                resolution === r ? "bg-[var(--soft)] border-[var(--line-strong)] text-[var(--text)] shadow-sm" : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]")}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Ratio</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {IMAGE_RATIOS.map((r) => (
            <button key={r} type="button" onClick={() => setRatio(r)}
              className={cn("flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[10px] font-semibold transition-colors",
                ratio === r ? "bg-[var(--soft)] border-[var(--line-strong)] text-[var(--text)] shadow-sm" : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]")}>
              {r === "Auto" ? <><Star size={14} strokeWidth={1.5} /><span>Auto</span></> : <><RatioRect ratio={r} maxDim={16} /><span>{r}</span></>}
            </button>
          ))}
        </div>
      </div>
    </PopupCard>
  )
}

function MediaThumb({ src, type, label, onRemove }: {
  src: string; type: "image" | "video"; label?: string; onRemove: () => void
}) {
  return (
    <div className="relative shrink-0 group">
      <div className={cn(
        "overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--soft)]",
        type === "video" ? "w-[60px] h-[38px]" : "w-[42px] h-[42px]"
      )}>
        <img src={src} alt={label} className="w-full h-full object-cover" />
        {type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
              <Play size={9} fill="white" className="text-white ml-[1px]" />
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#18181b] text-white flex items-center justify-center cursor-pointer hover:bg-[#444] z-10 shadow-sm"
      >
        <X size={8} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── Upload slot ──────────────────────────────────────────────────────────────

const pickerBtn = "h-[34px] border border-transparent rounded-full bg-white text-[#18181b] px-[9px] flex items-center gap-1.5 text-[13px] font-[650] cursor-pointer hover:bg-[var(--soft)] whitespace-nowrap"

function UploadSlot({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className="w-[40px] h-[40px] border border-dashed border-[var(--line-strong)] rounded-[10px] bg-white/60 text-[var(--muted)] flex items-center justify-center cursor-pointer hover:border-[var(--muted)] hover:text-[var(--text)] transition-colors">
      <Icon size={16} strokeWidth={2} />
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface GenerateModeProps {
  initialPrompt?: string
  onSubmit?: () => void
  submitting?: boolean
}

export function GenerateMode({ initialPrompt, onSubmit, submitting }: GenerateModeProps = {}) {
  const router = useRouter()
  const [genType, setGenType] = useState<GenType>("video")
  const [text, setText] = useState("")
  const [activePopup, setActivePopup] = useState<ActivePopup>(null)
  const [selectedHook, setSelectedHook] = useState<HookPattern | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Pre-fill from props (e.g. OnboardingHero path B click)
  useEffect(() => {
    if (!initialPrompt) return
    const timer = window.setTimeout(() => {
      setText(initialPrompt)
      window.requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        el.selectionStart = el.selectionEnd = el.value.length
      })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [initialPrompt])

  // Video/remix settings — 默认拉满到新出的「720P · 9:16 · 30s」高质量组合
  const [videoResolution, setVideoResolution] = useState("720P")
  const [videoRatio, setVideoRatio] = useState("9:16")
  const [videoDuration, setVideoDuration] = useState(30)

  // Image settings
  const [imageResolution, setImageResolution] = useState("1K")
  const [imageRatio, setImageRatio] = useState("Auto")

  // Model
  const [model, setModel] = useState(videoModels[0])


  // Selected media
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([])
  const [selectedVideos, setSelectedVideos] = useState<VideoItem[]>([])
  const [digitalHuman, setDigitalHuman] = useState<DHItem | null>(null)
  const [replicateReference, setReplicateReference] = useState<ReplicateSourceChoice | null>(null)
  const [uploadedReference, setUploadedReference] = useState<{ name: string; previewUrl: string } | null>(null)

  // Modal open states
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [dhModalOpen, setDhModalOpen] = useState(false)
  const [replicateSourceOpen, setReplicateSourceOpen] = useState(false)

  useEffect(() => {
    return () => {
      if (uploadedReference?.previewUrl) URL.revokeObjectURL(uploadedReference.previewUrl)
    }
  }, [uploadedReference])

  function openReplicateWorkspace(choice?: ReplicateSourceChoice) {
    const params = new URLSearchParams()
    if (choice) {
      params.set("asset", choice.assetId)
      params.set("title", `${choice.title.replace(/^[^：]+：/, "")} · 新版本`)
    } else if (uploadedReference) {
      params.set("source", "upload")
      params.set("upload", uploadedReference.name)
      params.set("title", `${uploadedReference.name.replace(/\.[^.]+$/, "")} · 新版本`)
    }
    router.push(`/replicate/beta-draft?${params.toString()}`)
  }

  function handleReplicateSource(choice: ReplicateSourceChoice, startImmediately: boolean) {
    setReplicateReference(choice)
    setUploadedReference(null)
    if (startImmediately) openReplicateWorkspace(choice)
  }

  function handleReferenceUpload(file?: File) {
    if (!file) return
    setReplicateReference(null)
    setUploadedReference({ name: file.name, previewUrl: URL.createObjectURL(file) })
  }

  function handleSend() {
    if (genType === "remix") {
      if (replicateReference) openReplicateWorkspace(replicateReference)
      else if (uploadedReference) openReplicateWorkspace()
      else setReplicateSourceOpen(true)
      return
    }
    if (!text.trim()) return
    onSubmit?.()
  }

  const configRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activePopup) return
    function onOutside(e: MouseEvent) {
      if (configRef.current && !configRef.current.contains(e.target as Node)) setActivePopup(null)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [activePopup])

  const toggle = (popup: ActivePopup) => setActivePopup((prev) => (prev === popup ? null : popup))

  const models = genType === "image" ? imageModels : genType === "reverse" ? reverseModels : videoModels
  const maxLen = genType === "video" ? 8000 : 2000
  const settingsLabel = genType === "image" ? `${imageResolution} · ${imageRatio}` : `${videoResolution} · ${videoRatio} · ${videoDuration}s`
  const activeTask = TASK_TYPES.find((task) => task.id === genType) ?? TASK_TYPES[0]
  const ActiveTaskIcon = activeTask.icon
  const signalPointCost = getSignalPointCost({
    genType,
    model,
    videoResolution,
    videoDuration,
    imageResolution,
  })

  const placeholders: Record<GenType, string> = {
    video: "描述视频画面内容和动态过程，使用 @ 指定参考图或参考视频",
    image: "描述你想生成的图片内容、构图、风格与商品信息",
    remix: "选择或上传想要复刻爆款素材，开始复刻",
    reverse: "贴入视频链接，或上传图片 / 视频，反推出可复用提示词",
  }

  const hasMedia = selectedImages.length > 0 || selectedVideos.length > 0
  const hasReplicateSource = Boolean(replicateReference || uploadedReference)
  const sendDisabled = genType === "remix" ? false : !text.trim()

  return (
    <div className="flex flex-col gap-3.5">
      {/* Upload slots + input area */}
      <div className="flex items-start gap-3.5 min-h-[52px]">
        {/* Upload slots */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {genType === "video" && (
            <>
              <UploadSlot label="图片" icon={Image} onClick={() => setImageModalOpen(true)} />
              <UploadSlot label="视频" icon={Video} onClick={() => setVideoModalOpen(true)} />
              {digitalHuman ? (
                <div className="relative h-[40px] w-[40px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setDhModalOpen(true)}
                    aria-label="更换数字人"
                    className="h-full w-full overflow-hidden rounded-[10px] border border-[var(--line)] bg-[var(--soft)]"
                  >
                    <img src={digitalHuman.thumb} alt={digitalHuman.name} className="h-full w-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDigitalHuman(null)}
                    aria-label="移除数字人"
                    className="absolute -right-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#18181b] text-white shadow-sm hover:bg-[#444]"
                  >
                    <X size={8} strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <UploadSlot label="数字人" icon={UserRound} onClick={() => setDhModalOpen(true)} />
              )}
            </>
          )}
          {genType === "image" && <UploadSlot label="图片" icon={Image} onClick={() => setImageModalOpen(true)} />}
          {genType === "reverse" && (
            <UploadSlot label="视频" icon={Video} onClick={() => setVideoModalOpen(true)} />
          )}
          {genType === "remix" && (
            <button
              type="button"
              onClick={() => setReplicateSourceOpen(true)}
              aria-label="选择或上传爆款素材"
              title="选择或上传爆款素材"
              className={cn(
                "flex h-[40px] w-[40px] items-center justify-center rounded-[10px] border transition-colors",
                hasReplicateSource
                  ? "border-[#a8cf25] bg-[#efffc3] text-[#34430b]"
                  : "border-dashed border-[var(--line-strong)] bg-white/60 text-[var(--muted)] hover:border-[#9ebf2b] hover:text-[#4d6210]",
              )}
            >
              <Video size={16} strokeWidth={2.2} />
            </button>
          )}
        </div>

        {/* Input area: media previews + textarea */}
        <div className="flex-1 flex flex-col gap-2">
          {hasMedia && (
            <div className="flex flex-wrap gap-2">
              {selectedImages.map((img) => (
                <MediaThumb
                  key={img.id} src={img.thumb} type="image" label={img.name}
                  onRemove={() => setSelectedImages((prev) => prev.filter((i) => i.id !== img.id))}
                />
              ))}
              {selectedVideos.map((vid) => (
                <MediaThumb
                  key={vid.id} src={vid.thumb} type="video" label={vid.name}
                  onRemove={() => setSelectedVideos((prev) => prev.filter((v) => v.id !== vid.id))}
                />
              ))}
            </div>
          )}
          {genType === "remix" && (replicateReference || uploadedReference) && (
            <div className="flex w-full items-center gap-3 rounded-xl border border-[#dce7b5] bg-[#f8ffe8] p-2.5">
              <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-[#e4e7ea]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={replicateReference?.cover ?? uploadedReference?.previewUrl}
                  alt={replicateReference?.title ?? uploadedReference?.name ?? "参考素材"}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Play size={11} fill="white" className="text-white" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-[#82923e]">本次复刻参考</p>
                <p className="mt-0.5 truncate text-[12px] font-extrabold text-[#303713]">
                  {replicateReference?.title ?? uploadedReference?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReplicateReference(null)
                  setUploadedReference(null)
                }}
                aria-label="移除参考素材"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#7e8757] hover:bg-[#e8f3c3] hover:text-[#303713]"
              >
                <X size={13} />
              </button>
            </div>
          )}
          {genType === "video" && selectedHook && (
            <p className="w-full text-[14px] font-medium leading-6 text-[#667085]" aria-label="Hook 描述">
              前3s Hook：{selectedHook.desc}
            </p>
          )}
          <textarea
            ref={textareaRef}
            className={cn(
              "w-full outline-none resize-none text-[#24272f] text-[15px] leading-[1.5] bg-transparent placeholder:text-[var(--muted-2)]",
              genType === "video" && selectedHook ? "min-h-[48px] border-0 px-0 py-0" : "min-h-[52px] border-0"
            )}
            aria-label={genType === "remix" ? "高保真复刻补充要求" : selectedHook ? "3秒后画面描述" : undefined}
            placeholder={genType === "video" && selectedHook ? "描述3s后的画面内容和动态过程，适用@指定模特、参考图或参考视频" : placeholders[genType]}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={maxLen}
            rows={2}
          />
        </div>
      </div>

      {/* Config row */}
      <div ref={configRef} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Task type */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle("task")}
              aria-label="选择创意生成任务"
              className={cn(pickerBtn, genType === "remix" && "border-[#d9e8a8] bg-[#f5ffdc] text-[#33400d]")}
            >
              <ActiveTaskIcon size={14} strokeWidth={2.2} />
              <span className="font-bold">{activeTask.label}</span>
              <ChevronDown size={12} className={cn("text-[var(--muted)] -ml-0.5 transition-transform", activePopup === "task" && "rotate-180")} />
            </button>
            {activePopup === "task" && (
              <PopupCard className="w-[218px] p-2">
                {TASK_TYPES.map(({ id, label, description, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setGenType(id)
                      setActivePopup(null)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                      genType === id ? "bg-[#f1f2f3]" : "hover:bg-[#f7f7f8]",
                    )}
                  >
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      id === "remix" ? "bg-[#efffc3] text-[#40530d]" : "bg-white text-[#555a63] shadow-sm",
                    )}>
                      <Icon size={15} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12px] font-extrabold text-[#292b31]">{label}</span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-[#92969e]">{description}</span>
                    </span>
                  </button>
                ))}
              </PopupCard>
            )}
          </div>

          {genType !== "remix" && (
            <>
              {/* Model */}
              <div className="relative">
                <button type="button" onClick={() => toggle("model")} className={pickerBtn}>
                  <span className="w-4 h-4 rounded bg-[var(--soft)] text-[9px] font-black flex items-center justify-center shrink-0">{model.slice(0, 2)}</span>
                  <span className="font-medium">{model}</span>
                  <ChevronDown size={12} className={cn("text-[var(--muted)] -ml-0.5 transition-transform", activePopup === "model" && "rotate-180")} />
                </button>
                {activePopup === "model" && (
                  <ModelPopup options={models} selected={model} onSelect={(v) => { setModel(v); setActivePopup(null) }} />
                )}
              </div>

              {/* Hook */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggle("hook")}
                  className={cn(pickerBtn, "w-[112px] overflow-hidden", selectedHook && "bg-[#eff8ff] text-[#0a84d8]")}
                >
                  <TargetArrowIcon size={14} strokeWidth={2.1} />
                  <span className="min-w-0 flex-1 truncate text-left">{selectedHook?.title ?? "Hook"}</span>
                  <ChevronDown size={12} className={cn("-ml-0.5 shrink-0 transition-transform", selectedHook ? "text-[#0a84d8]" : "text-[var(--muted)]", activePopup === "hook" && "rotate-180")} />
                </button>
                {activePopup === "hook" && (
                  <HookPopup
                    onApply={(hook) => {
                      setSelectedHook(hook)
                      setActivePopup(null)
                    }}
                    onClose={() => setActivePopup(null)}
                    initialHookId={selectedHook?.id}
                  />
                )}
              </div>

              {/* Settings */}
              {genType !== "reverse" && (
                <div className="relative">
                  <button type="button" onClick={() => toggle("settings")} className={pickerBtn}>
                    <SlidersHorizontal size={15} strokeWidth={2} />
                    <span>{settingsLabel}</span>
                    {genType !== "image" && videoResolution === "720P" && videoRatio === "9:16" && videoDuration === 30 && (
                      <span
                        className="ml-1 inline-flex items-center h-[18px] px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[9.5px] font-extrabold tracking-wide leading-none"
                        title="新推出的高质量默认配置"
                      >
                        NEW
                      </span>
                    )}
                    <ChevronDown size={12} className={cn("text-[var(--muted)] -ml-0.5 transition-transform", activePopup === "settings" && "rotate-180")} />
                  </button>
                  {activePopup === "settings" && (
                    genType === "image" ? (
                      <ImageSettingsPopup resolution={imageResolution} setResolution={setImageResolution} ratio={imageRatio} setRatio={setImageRatio} />
                    ) : (
                      <VideoSettingsPopup resolution={videoResolution} setResolution={setVideoResolution} ratio={videoRatio} setRatio={setVideoRatio} duration={videoDuration} setDuration={setVideoDuration} />
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {genType !== "remix" && (
            <span
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#6f7480] tabular-nums whitespace-nowrap"
              title={`预计消耗 ${signalPointCost.toLocaleString("zh-CN")} 积分`}
            >
              <Sparkles size={14} strokeWidth={2.4} />
              {signalPointCost.toLocaleString("zh-CN")}
            </span>
          )}
          <SendButton disabled={sendDisabled} loading={submitting} onClick={handleSend} />
        </div>
      </div>

      {/* Modals */}
      <ImageSelectModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        onConfirm={(items) => setSelectedImages((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          return [...prev, ...items.filter((i) => !existingIds.has(i.id))]
        })}
      />
      <VideoSelectModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        onConfirm={(items) => setSelectedVideos((prev) => {
          const existingIds = new Set(prev.map((v) => v.id))
          return [...prev, ...items.filter((v) => !existingIds.has(v.id))]
        })}
      />
      <DigitalHumanModal
        open={dhModalOpen}
        onOpenChange={setDhModalOpen}
        onConfirm={(item) => setDigitalHuman(item)}
      />
      <ReplicateSourceModal
        open={replicateSourceOpen}
        selectedId={replicateReference?.id}
        onOpenChange={setReplicateSourceOpen}
        onSelect={handleReplicateSource}
        onUpload={handleReferenceUpload}
      />
    </div>
  )
}

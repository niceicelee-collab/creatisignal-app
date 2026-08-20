"use client"

/* eslint-disable @next/next/no-img-element */

import { cloneElement, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheck,
  Clock,
  Copy,
  Film,
  Image as ImageIcon,
  Languages,
  LayoutTemplate,
  LoaderCircle,
  Package,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Trash2,
  User,
  Wand2,
  Zap,
} from "lucide-react"
import { ProductPickerDialog } from "@/components/products/product-picker-dialog"
import { INITIAL_PRODUCTS, type Product } from "@/components/products/product-data"
import { DigitalHumanModal, type DHItem } from "@/components/modals/digital-human-modal"
import { HOOK_PATTERNS, HookPopup, type HookPattern } from "@/components/assistant/modes/generate-mode"
import { cn } from "@/lib/utils"
import {
  buildBriefVersions,
  CREATIVE_TEMPLATES,
  LANGUAGE_OPTIONS,
  SCRIPT_STYLES,
  type BriefVersion,
  type SceneDraft,
} from "./zero-to-video-data"

type GenerationStatus = "idle" | "compiling" | "queued" | "generating" | "success"

export function ZeroToVideoWorkspace() {
  const [step, setStep] = useState<1 | 2>(1)
  const [product, setProduct] = useState<Product>(INITIAL_PRODUCTS[0])
  const [pickerOpen, setPickerOpen] = useState(false)
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
  const [briefLoading, setBriefLoading] = useState(false)
  const [versions, setVersions] = useState<BriefVersion[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<BriefVersion["id"] | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  const [scenes, setScenes] = useState<SceneDraft[]>([])
  const [expandedSceneIds, setExpandedSceneIds] = useState<string[]>([])
  const [rewritingSceneId, setRewritingSceneId] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle")
  const timers = useRef<number[]>([])

  const selectedVersion = versions.find((version) => version.id === selectedVersionId) ?? null
  const languageLabel = LANGUAGE_OPTIONS.find((option) => option.value === locale)?.label ?? locale
  const sceneSeconds = scenes.reduce((sum, scene) => sum + Math.max(0, scene.end - scene.start), 0)
  const durationValid = Math.abs(sceneSeconds - duration) < 0.01

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), [])

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
  }

  function flashNotice(message: string) {
    setNotice(message)
    schedule(() => setNotice(""), 1800)
  }

  function resetBriefOutput() {
    setVersions([])
    setSelectedVersionId(null)
    setGenerationStatus("idle")
  }

  function handleGenerateBrief() {
    setBriefLoading(true)
    setVersions([])
    setSelectedVersionId(null)
    schedule(() => {
      const selectedTemplate = CREATIVE_TEMPLATES.find((item) => item.id === templateId)
      const nextVersions = buildBriefVersions(product, duration, locale).map((version, index) => ({
        ...version,
        template: `${selectedTemplate?.name ?? version.template} · ${scriptStyle}`,
        hook: index === 0 ? hookPattern.prompt : version.hook,
        voiceoverSummary: `${version.voiceoverSummary} 出镜人物：${digitalHuman.name}。`,
      }))
      setVersions(nextVersions)
      setSelectedVersionId(nextVersions[0].id)
      setBriefLoading(false)
      flashNotice("已生成 3 个机制差异化创意版本")
    }, 900)
  }

  function handleRegenerate(versionId: BriefVersion["id"]) {
    setRegeneratingId(versionId)
    schedule(() => {
      setVersions((current) => current.map((version) => version.id === versionId
        ? { ...version, title: `${version.title} · 新角度`, hook: "新 Hook：先展示结果，再回到使用前的冲突" }
        : version))
      setRegeneratingId(null)
      flashNotice("当前版本已单独重新生成，其他版本未变")
    }, 700)
  }

  function handleAdoptVersion() {
    if (!selectedVersion) return
    setScenes(selectedVersion.scenes.map((scene) => ({ ...scene })))
    setGenerationStatus("idle")
    setStep(2)
    window.requestAnimationFrame(() => document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" }))
  }

  function updateScene<K extends keyof SceneDraft>(sceneId: string, field: K, value: SceneDraft[K]) {
    setScenes((current) => current.map((scene) => scene.id === sceneId ? { ...scene, [field]: value } : scene))
  }

  function splitScene(sceneId: string) {
    setScenes((current) => {
      const index = current.findIndex((scene) => scene.id === sceneId)
      if (index === -1) return current
      const scene = current[index]
      const middle = Math.round(((scene.start + scene.end) / 2) * 10) / 10
      if (middle <= scene.start || middle >= scene.end) return current
      const first = { ...scene, end: middle }
      const inserted: SceneDraft = {
        ...scene,
        id: `${scene.id}-split-${Date.now()}`,
        type: scene.type === "Hook" ? "主体" : scene.type,
        start: middle,
        visual: "补充分镜：延续前一镜头的场景与人物，加入一个清晰的商品动作。",
        voiceover: "Add one supporting line that connects naturally with the next beat.",
        meaningZh: "补充一句承上启下的口播，与下一段自然衔接。",
        onScreenText: "ONE MORE DETAIL",
      }
      return [...current.slice(0, index), first, inserted, ...current.slice(index + 1)]
    })
  }

  function deleteScene(sceneId: string) {
    setScenes((current) => {
      const index = current.findIndex((scene) => scene.id === sceneId)
      if (index <= 0 || current.length <= 2) return current
      const previous = { ...current[index - 1], end: current[index].end }
      return [...current.slice(0, index - 1), previous, ...current.slice(index + 1)]
    })
  }

  function rewriteScene(sceneId: string) {
    setRewritingSceneId(sceneId)
    schedule(() => {
      setScenes((current) => current.map((scene) => scene.id === sceneId
        ? { ...scene, voiceover: `${scene.voiceover.replace(/\.$/, "")} — simple, natural, and easy to verify.` }
        : scene))
      setRewritingSceneId(null)
      flashNotice("已在不改商品事实的前提下重写本段口播")
    }, 650)
  }

  function applyHookPattern(nextHook: HookPattern) {
    setHookPattern(nextHook)
    setHookPickerOpen(false)

    if (step === 1) {
      resetBriefOutput()
      return
    }

    const hookScene = scenes.find((scene) => scene.type === "Hook")
    if (!hookScene) return
    setScenes((current) => current.map((scene) => scene.id === hookScene.id ? {
      ...scene,
      voiceover: nextHook.prompt,
      meaningZh: nextHook.desc,
      onScreenText: nextHook.title.toUpperCase(),
    } : scene))
    flashNotice("已替换完整 Hook，并保留正文与已编辑内容")
  }

  function handleGenerateVideo() {
    if (!durationValid) {
      flashNotice("请先校正分镜时长，使总时长与目标时长一致")
      return
    }
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setGenerationStatus("compiling")
    schedule(() => setGenerationStatus("queued"), 700)
    schedule(() => setGenerationStatus("generating"), 1400)
    schedule(() => setGenerationStatus("success"), 3400)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[#f4f5f1]">
      <div className="mx-auto w-full max-w-[1380px] px-6 pb-20 pt-7">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#70813a]">
              <Sparkles size={14} /> 0 → 1 广告生产链路
            </div>
            <h1 className="text-[28px] font-black tracking-[-0.04em] text-[#171a16]">从商品 Brief 到创意视频</h1>
            <p className="mt-1.5 text-[13px] font-medium text-[#747a71]">无需参考视频，先比较创意方向，再校正分镜并提交成片。</p>
          </div>
          <span className="rounded-full border border-[#dfe4d8] bg-white px-3 py-1.5 text-[11px] font-bold text-[#778073]">交互 Demo · Mock 模型与生成任务</span>
        </header>

        <StepBar step={step} />

        {step === 1 ? (
          <section className="mt-5 grid min-w-0 items-start gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-4 xl:sticky xl:top-5">
              <Panel title="创作输入" icon={Package} desc="引用商品库快照，并配置本次创作约束。">
                <button type="button" onClick={() => setPickerOpen(true)} className="group mt-4 flex w-full items-center gap-3 rounded-[16px] border border-[#dfe3db] bg-[#f9faf7] p-3 text-left transition hover:border-[#9ab848] hover:bg-[#fbfff2]">
                  <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-black text-[#20231f]">{product.name}</span>
                    <span className="mt-1 block truncate text-[11px] font-semibold text-[#81877e]">{product.brand} · {product.category}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#70852b]"><RefreshCw size={11} /> 从商品库更换</span>
                  </span>
                </button>

                <div className="mt-4 grid min-w-0 gap-3">
                  <SettingSelect label="脚本风格" icon={Pencil} value={scriptStyle} onChange={(value) => { setScriptStyle(value); resetBriefOutput() }} options={SCRIPT_STYLES} />
                  <SettingAction label="Hook" icon={Zap} onClick={() => setHookPickerOpen(true)}>
                    <span className="truncate">{hookPattern.title} · {hookPattern.prompt}</span>
                  </SettingAction>
                  <SettingSelect label="目标语言" icon={Languages} value={locale} onChange={(value) => { setLocale(value); resetBriefOutput() }} options={LANGUAGE_OPTIONS.map((item) => item.value)} renderValue={(value) => LANGUAGE_OPTIONS.find((item) => item.value === value)?.label ?? value} />
                  <SettingAction label="数字人 / 人物" icon={User} onClick={() => setDigitalHumanPickerOpen(true)}>
                    <span className="flex min-w-0 items-center gap-2">
                      <img src={digitalHuman.thumb} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                      <span className="truncate">{digitalHuman.name}</span>
                    </span>
                  </SettingAction>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold text-[#555b53]"><span className="flex items-center gap-1.5"><Clock size={12} /> 视频时长</span><span className="text-[#1d211c]">{duration} 秒</span></div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 15, 20, 30].map((value) => <button key={value} type="button" onClick={() => { setDuration(value); resetBriefOutput() }} className={cn("h-8 rounded-lg border text-[11px] font-extrabold transition", duration === value ? "border-[#1d211b] bg-[#1d211b] text-white" : "border-[#e0e3dc] bg-white text-[#6f756d] hover:border-[#b6beb0]")}>{value}s</button>)}
                  </div>
                </div>
              </Panel>

              <button type="button" disabled={briefLoading} onClick={handleGenerateBrief} className="flex h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[#1b1e1a] text-[13px] font-black text-white shadow-[0_12px_30px_rgba(26,30,24,0.16)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
                {briefLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {briefLoading ? "正在生成 3 个创意方向…" : versions.length ? "重新生成创意脚本" : "生成 3 个创意脚本"}
              </button>
            </aside>

            <div className="min-w-0 space-y-5">
              <Panel title="创意模板" icon={LayoutTemplate} desc="模板定义正文说服结构，Hook 保持独立可替换。">
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {CREATIVE_TEMPLATES.map((template) => (
                    <button key={template.id} type="button" onClick={() => { setTemplateId(template.id); resetBriefOutput() }} className={cn("relative rounded-[15px] border p-3 text-left transition", templateId === template.id ? "border-[#9fc532] bg-[#f7ffe6] ring-2 ring-[#dfff83]" : "border-[#e1e4de] bg-white hover:border-[#bcc3b7]") }>
                      <span className="text-[12px] font-black text-[#252824]">{template.name}</span>
                      <span className="mt-1.5 block text-[10.5px] font-medium leading-4 text-[#777d74]">{template.desc}</span>
                      <span className="mt-3 inline-flex rounded-full bg-[#eef4df] px-2 py-1 text-[9.5px] font-extrabold text-[#718331]">{template.tag}</span>
                      {templateId === template.id ? <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#263018] text-[#c9ff29]"><Check size={11} strokeWidth={3} /></span> : null}
                    </button>
                  ))}
                </div>
              </Panel>

              {briefLoading ? <BriefLoading /> : versions.length ? (
                <section>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div><h2 className="text-[16px] font-black text-[#20231f]">选择创意方向</h2><p className="mt-1 text-[11px] font-semibold text-[#858b82]">三个版本在 Hook、主卖点或结构上至少有两项不同。</p></div>
                    <span className="rounded-full bg-[#e8eddc] px-2.5 py-1 text-[10px] font-extrabold text-[#697b2c]">GPT-5.6 Terra · 3 个版本</span>
                  </div>
                  <div className="grid gap-3">
                    {versions.map((version) => <BriefVersionCard key={version.id} version={version} selected={selectedVersionId === version.id} favorite={favoriteIds.includes(version.id)} regenerating={regeneratingId === version.id} onSelect={() => setSelectedVersionId(version.id)} onFavorite={() => setFavoriteIds((current) => current.includes(version.id) ? current.filter((id) => id !== version.id) : [...current, version.id])} onRegenerate={() => handleRegenerate(version.id)} onCopy={() => flashNotice("已复制为新的 Brief 草稿")} />)}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button type="button" disabled={!selectedVersion} onClick={handleAdoptVersion} className="flex h-11 items-center gap-2 rounded-xl bg-[#1b1e1a] px-5 text-[12px] font-black text-white transition hover:-translate-y-0.5 disabled:opacity-40">采用当前版本并编辑分镜 <ArrowRight size={14} /></button>
                  </div>
                </section>
              ) : <EmptyBrief />}
            </div>
          </section>
        ) : selectedVersion ? (
          <section className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#e0e4dc] bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dfe3dc] text-[#626860] hover:bg-[#f2f4ef]"><ArrowLeft size={14} /></button>
                <span className="min-w-0"><span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#869079]">已采纳 · {selectedVersion.label}</span><span className="block truncate text-[13px] font-black text-[#20231f]">{selectedVersion.title}</span></span>
              </div>
              <div className={cn("rounded-full px-3 py-1.5 text-[10.5px] font-extrabold", durationValid ? "bg-[#eff8da] text-[#647b24]" : "bg-[#fff0ed] text-[#b34e42]")}>{durationValid ? `时长守恒 · ${sceneSeconds}s` : `当前 ${sceneSeconds}s / 目标 ${duration}s`}</div>
            </div>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div><h2 className="text-[17px] font-black text-[#20231f]">纵向分镜编辑器</h2><p className="mt-1 text-[11px] font-semibold text-[#858b82]">确认画面、目标语言口播、中文释义、屏幕文字与参考资产。</p></div>
                  <button type="button" onClick={() => setHookPickerOpen(true)} className="flex h-9 items-center gap-1.5 rounded-xl border border-[#d8ded1] bg-white px-3 text-[11px] font-extrabold text-[#596451] hover:border-[#9eb947] hover:bg-[#fbfff1]"><Zap size={13} /> 替换 Hook</button>
                </div>
                {scenes.map((scene, index) => (
                  <SceneCard key={scene.id} scene={scene} index={index} expanded={expandedSceneIds.includes(scene.id)} rewriting={rewritingSceneId === scene.id} canDelete={index > 0 && scenes.length > 2} onToggleExpanded={() => setExpandedSceneIds((current) => current.includes(scene.id) ? current.filter((id) => id !== scene.id) : [...current, scene.id])} onChange={updateScene} onRewrite={() => rewriteScene(scene.id)} onSplit={() => splitScene(scene.id)} onDelete={() => deleteScene(scene.id)} />
                ))}
              </div>

              <GenerationPanel product={product} version={selectedVersion} language={languageLabel} duration={duration} sceneCount={scenes.length} status={generationStatus} durationValid={durationValid} onGenerate={handleGenerateVideo} />
            </div>
          </section>
        ) : null}
      </div>

      <ProductPickerDialog open={pickerOpen} onOpenChange={setPickerOpen} selectedId={product.id} onSelect={(nextProduct) => { setProduct(nextProduct); resetBriefOutput() }} />
      {hookPickerOpen ? <HookPopup initialHookId={hookPattern.id} onApply={applyHookPattern} onClose={() => setHookPickerOpen(false)} /> : null}
      <DigitalHumanModal
        open={digitalHumanPickerOpen}
        onOpenChange={setDigitalHumanPickerOpen}
        onConfirm={(item) => {
          setDigitalHuman(item)
          resetBriefOutput()
        }}
      />
      {notice ? <div className="fixed bottom-7 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-[#1b1e1a] px-4 py-2 text-[11px] font-bold text-white shadow-2xl">{notice}</div> : null}
    </main>
  )
}

function StepBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="grid overflow-hidden rounded-[18px] border border-[#dde1d9] bg-white md:grid-cols-2">
      {[{ number: 1, title: "创意脚本", desc: "选择商品与创作约束，比较 3 个创意版本" }, { number: 2, title: "创意视频", desc: "校正分镜，编译 Recipe 并提交 Seedance 任务" }].map((item) => {
        const active = step === item.number
        const complete = step > item.number
        return <div key={item.number} className={cn("flex items-center gap-3 px-5 py-4", active ? "bg-[#f5ffdc]" : "bg-white", item.number === 2 && "border-t border-[#e4e7e0] md:border-l md:border-t-0") }><span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-black", active ? "bg-[#1c2119] text-[#c9ff29]" : complete ? "bg-[#dff7a1] text-[#50661e]" : "bg-[#f0f1ee] text-[#9aa097]")}>{complete ? <Check size={14} strokeWidth={3} /> : item.number}</span><span><span className="block text-[12px] font-black text-[#242724]">{item.title}</span><span className="mt-0.5 block text-[10.5px] font-semibold text-[#858b82]">{item.desc}</span></span></div>
      })}
    </div>
  )
}

function Panel({ title, desc, icon: Icon, children }: { title: string; desc: string; icon: typeof Package; children: React.ReactNode }) {
  return <section className="min-w-0 overflow-hidden rounded-[20px] border border-[#dfe3dc] bg-white p-4 shadow-[0_12px_34px_rgba(29,34,25,0.045)]"><div className="flex min-w-0 items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eff7dc] text-[#698027]"><Icon size={15} /></span><span className="min-w-0"><h2 className="text-[13px] font-black text-[#242724]">{title}</h2><p className="mt-0.5 text-[10.5px] font-semibold text-[#8a9087]">{desc}</p></span></div>{children}</section>
}

function SettingSelect({ label, icon: Icon, value, options, onChange, renderValue }: { label: string; icon: typeof Pencil; value: string; options: string[]; onChange: (value: string) => void; renderValue?: (value: string) => string }) {
  return <label className="block min-w-0"><span className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#656b63]"><Icon size={11} /> {label}</span><span className="relative block min-w-0"><select value={value} onChange={(event) => onChange(event.target.value)} className="block h-10 w-full min-w-0 max-w-full appearance-none rounded-xl border border-[#dfe3dc] bg-white px-3 pr-8 text-[11px] font-bold text-[#252824] outline-none focus:border-[#9eb848]">{options.map((option) => <option key={option} value={option}>{renderValue ? renderValue(option) : option}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8d938a]" /></span></label>
}

function SettingAction({ label, icon: Icon, onClick, children }: { label: string; icon: typeof Pencil; onClick: () => void; children: React.ReactNode }) {
  return <div className="min-w-0"><span className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#656b63]"><Icon size={11} /> {label}</span><button type="button" onClick={onClick} className="flex h-10 w-full min-w-0 max-w-full items-center justify-between gap-2 rounded-xl border border-[#dfe3dc] bg-white px-3 text-left text-[11px] font-bold text-[#252824] outline-none transition hover:border-[#9eb848]"><span className="min-w-0 flex-1 overflow-hidden">{children}</span><ChevronDown size={13} className="shrink-0 text-[#8d938a]" /></button></div>
}

function EmptyBrief() {
  return <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#d9ded5] bg-white/60 p-8 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf6d1] text-[#6b8424]"><Wand2 size={21} /></span><h2 className="mt-4 text-[15px] font-black text-[#252824]">准备生成差异化创意版本</h2><p className="mt-2 max-w-[420px] text-[11.5px] font-medium leading-5 text-[#81877e]">系统将锁定商品事实，并分别从稳健说服、卖点强化和探索性叙事三个方向生成 Brief。</p></div>
}

function BriefLoading() {
  return <div className="grid min-h-[360px] place-items-center rounded-[22px] border border-[#e0e4dc] bg-white"><div className="text-center"><LoaderCircle size={28} className="mx-auto animate-spin text-[#87a52e]" /><h2 className="mt-4 text-[14px] font-black text-[#252824]">正在生成创意脚本</h2><p className="mt-1.5 text-[11px] font-semibold text-[#8a9087]">校验商品事实 · 区分创意机制 · 估算目标语言时长</p></div></div>
}

function BriefVersionCard({ version, selected, favorite, regenerating, onSelect, onFavorite, onRegenerate, onCopy }: { version: BriefVersion; selected: boolean; favorite: boolean; regenerating: boolean; onSelect: () => void; onFavorite: () => void; onRegenerate: () => void; onCopy: () => void }) {
  return <article className={cn("rounded-[19px] border bg-white p-4 transition", selected ? "border-[#92b329] ring-2 ring-[#dfff7f] shadow-[0_12px_35px_rgba(99,126,29,0.09)]" : "border-[#e0e4dc] hover:border-[#b8c0b2]") }>
    <div className="flex flex-wrap items-start gap-3"><button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-start gap-3 text-left"><span className="mt-0.5 flex h-6 items-center rounded-full px-2.5 text-[9.5px] font-black text-white" style={{ backgroundColor: version.accent }}>{version.label}</span><span className="min-w-0"><span className="block text-[13px] font-black leading-5 text-[#20231f]">{version.title}</span><span className="mt-1 block text-[10.5px] font-bold text-[#7b8278]">{version.mechanism} · 推荐 {version.duration}s</span></span></button><div className="flex items-center gap-1"><IconButton label="收藏" active={favorite} onClick={onFavorite}><Star size={13} fill={favorite ? "currentColor" : "none"} /></IconButton><IconButton label="复制" onClick={onCopy}><Copy size={13} /></IconButton><IconButton label="重新生成" onClick={onRegenerate}>{regenerating ? <LoaderCircle size={13} className="animate-spin" /> : <RefreshCw size={13} />}</IconButton></div></div>
    <button type="button" onClick={onSelect} className="mt-3 grid w-full gap-x-5 gap-y-3 rounded-[14px] bg-[#f7f8f5] p-3 text-left md:grid-cols-2"><Info label="创意角度" value={version.angle} /><Info label="目标受众" value={version.audience} /><Info label="模板 / Hook" value={`${version.template} · ${version.hook}`} /><Info label="结构摘要" value={version.structure} /><div className="md:col-span-2"><Info label="口播摘要" value={version.voiceoverSummary} /></div></button>
    {selected ? <div className="mt-3 flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#5e741f]"><CircleCheck size={13} /> 已选择此版本</div> : null}
  </article>
}

function IconButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={cn("flex h-8 w-8 items-center justify-center rounded-full border transition", active ? "border-[#c9e56b] bg-[#f2ffd1] text-[#75901f]" : "border-[#e1e4de] bg-white text-[#7e857b] hover:border-[#b8c0b3] hover:text-[#252824]")}>{children}</button>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><span className="block text-[9.5px] font-extrabold uppercase tracking-[0.08em] text-[#9aa096]">{label}</span><span className="mt-1 block text-[11px] font-semibold leading-5 text-[#444a42]">{value}</span></div>
}

function SceneCard({ scene, index, expanded, rewriting, canDelete, onToggleExpanded, onChange, onRewrite, onSplit, onDelete }: { scene: SceneDraft; index: number; expanded: boolean; rewriting: boolean; canDelete: boolean; onToggleExpanded: () => void; onChange: <K extends keyof SceneDraft>(sceneId: string, field: K, value: SceneDraft[K]) => void; onRewrite: () => void; onSplit: () => void; onDelete: () => void }) {
  const typeStyle = scene.type === "Hook" ? "bg-[#ffe6e2] text-[#b34035]" : scene.type === "CTA" ? "bg-[#def6e5] text-[#287044]" : "bg-[#e5efff] text-[#3265aa]"
  return <article className="overflow-hidden rounded-[19px] border border-[#dfe3dc] bg-white shadow-[0_10px_30px_rgba(29,34,25,0.04)]">
    <header className="flex flex-wrap items-center gap-2 border-b border-[#e7e9e4] px-4 py-3"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#20241e] text-[10px] font-black text-white">{index + 1}</span><span className={cn("rounded-full px-2.5 py-1 text-[9.5px] font-black", typeStyle)}>{scene.type}</span><label className="ml-1 flex items-center gap-1 text-[10px] font-bold text-[#7e857b]">从 <input aria-label={`分镜 ${index + 1} 开始时间`} type="number" min={0} step={0.5} value={scene.start} onChange={(event) => onChange(scene.id, "start", Number(event.target.value))} className="h-7 w-14 rounded-lg border border-[#dfe3dc] bg-[#f8f9f6] px-2 text-[#30342e] outline-none focus:border-[#9ab342]" /> 秒</label><label className="flex items-center gap-1 text-[10px] font-bold text-[#7e857b]">至 <input aria-label={`分镜 ${index + 1} 结束时间`} type="number" min={0} step={0.5} value={scene.end} onChange={(event) => onChange(scene.id, "end", Number(event.target.value))} className="h-7 w-14 rounded-lg border border-[#dfe3dc] bg-[#f8f9f6] px-2 text-[#30342e] outline-none focus:border-[#9ab342]" /> 秒</label><div className="ml-auto flex items-center gap-1"><button type="button" onClick={onRewrite} className="flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-extrabold text-[#66752e] hover:bg-[#f2f8e4]">{rewriting ? <LoaderCircle size={12} className="animate-spin" /> : <Sparkles size={12} />} AI 重写</button><button type="button" onClick={onSplit} className="flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-extrabold text-[#697068] hover:bg-[#f2f3f0]"><Plus size={12} /> 拆分</button>{canDelete ? <button type="button" onClick={onDelete} aria-label={`删除分镜 ${index + 1}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9b6a63] hover:bg-[#fff0ed]"><Trash2 size={13} /></button> : null}</div></header>
    <div className="grid gap-3 p-4 lg:grid-cols-2"><Field label="画面" icon={ImageIcon}><textarea value={scene.visual} onChange={(event) => onChange(scene.id, "visual", event.target.value)} rows={3} /></Field><Field label="目标语言口播" icon={Film}><textarea value={scene.voiceover} onChange={(event) => onChange(scene.id, "voiceover", event.target.value)} rows={3} /></Field><Field label="中文释义" icon={Languages}><textarea value={scene.meaningZh} onChange={(event) => onChange(scene.id, "meaningZh", event.target.value)} rows={2} /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="屏幕文字" icon={Play}><textarea value={scene.onScreenText} onChange={(event) => onChange(scene.id, "onScreenText", event.target.value)} rows={2} /></Field><Field label="参考资产" icon={Package}><textarea value={scene.assetRefs} onChange={(event) => onChange(scene.id, "assetRefs", event.target.value)} rows={2} /></Field></div></div>
    <div className="border-t border-[#e8eae5]"><button type="button" onClick={onToggleExpanded} className="flex h-10 w-full items-center justify-between px-4 text-[10.5px] font-extrabold text-[#777e74] hover:bg-[#fafbf8]"><span>高级设置 · 人物动作与真实性约束</span><ChevronDown size={13} className={cn("transition", expanded && "rotate-180")} /></button>{expanded ? <div className="grid gap-3 border-t border-[#eceee9] bg-[#fafbf8] p-4 md:grid-cols-2"><Field label="人物动作" icon={User}><textarea value={scene.action} onChange={(event) => onChange(scene.id, "action", event.target.value)} rows={2} /></Field><Field label="真实性约束" icon={Check}><textarea value={scene.constraints} onChange={(event) => onChange(scene.id, "constraints", event.target.value)} rows={2} /></Field></div> : null}</div>
  </article>
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof ImageIcon; children: React.ReactElement<{ className?: string }> }) {
  return <label className="block"><span className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.06em] text-[#8b9288]"><Icon size={11} /> {label}</span>{cloneElement(children, { className: cn("w-full resize-none rounded-xl border border-[#e0e4dc] bg-[#f8f9f6] px-3 py-2 text-[11px] font-medium leading-5 text-[#30352e] outline-none transition placeholder:text-[#a9afa6] focus:border-[#9bb842] focus:bg-white", children.props.className) })}</label>
}

function GenerationPanel({ product, version, language, duration, sceneCount, status, durationValid, onGenerate }: { product: Product; version: BriefVersion; language: string; duration: number; sceneCount: number; status: GenerationStatus; durationValid: boolean; onGenerate: () => void }) {
  const statusMeta: Record<Exclude<GenerationStatus, "idle" | "success">, { title: string; desc: string }> = { compiling: { title: "正在编译 Seedance Recipe", desc: "锁定口播、商品事实与资产 alias" }, queued: { title: "任务排队中", desc: "已生成幂等任务与积分价格快照" }, generating: { title: "视频生成中", desc: "Seedance 2.0 正在渲染创意视频" } }
  return <aside className="xl:sticky xl:top-5"><section className="overflow-hidden rounded-[21px] border border-[#dce1d8] bg-[#1c201b] text-white shadow-[0_18px_50px_rgba(22,27,19,0.16)]"><div className="border-b border-white/10 p-4"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c9ff29] text-[#26310c]"><Film size={15} /></span><div><h2 className="text-[13px] font-black">生成确认</h2><p className="mt-0.5 text-[9.5px] font-semibold text-white/45">Recipe → Prompt → Seedance 2.0</p></div></div></div><div className="p-4">
    <div className="flex items-center gap-3 rounded-[14px] bg-white/6 p-2.5"><img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" /><span className="min-w-0"><span className="block truncate text-[11px] font-black">{product.name}</span><span className="mt-1 block truncate text-[9.5px] font-semibold text-white/45">{version.label} · {version.template}</span></span></div>
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-white/10 py-4"><Summary label="目标语言" value={language} /><Summary label="时长 / 画幅" value={`${duration}s · 9:16`} /><Summary label="模型" value="Seedance 2.0" /><Summary label="分镜 / 数量" value={`${sceneCount} 镜 · 1 条`} /><Summary label="参考资产" value={`${product.media.length} 个商品资产`} /><Summary label="预计积分" value="160 积分" /></dl>
    {!durationValid ? <div className="mt-3 rounded-xl bg-[#7d3028] px-3 py-2 text-[10px] font-bold text-[#ffdcd7]">分镜总时长与目标时长不一致，暂不能生成。</div> : null}
    {status === "idle" ? <button type="button" onClick={onGenerate} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c9ff29] text-[12px] font-black text-[#202713] transition hover:bg-[#d5ff57]"><Sparkles size={15} /> 编译并生成视频</button> : status === "success" ? <div className="mt-4 overflow-hidden rounded-[15px] border border-white/10 bg-white/5"><div className="relative aspect-video overflow-hidden"><img src={product.image} alt="生成视频首帧" className="h-full w-full object-cover opacity-80" /><span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-[#c9ff29] px-2 py-1 text-[9px] font-black text-[#27310e]">生成成功</span><button type="button" aria-label="播放生成视频" className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-xl"><Play size={16} fill="currentColor" /></button><span className="absolute bottom-3 left-3 text-[10px] font-bold">创意视频 Demo 预览 · {duration}s</span></div><button type="button" onClick={onGenerate} className="flex h-10 w-full items-center justify-center gap-1.5 text-[10.5px] font-extrabold text-white/75 hover:bg-white/5 hover:text-white"><RefreshCw size={12} /> 基于同一 Prompt 再次生成</button></div> : <div className="mt-4 rounded-[15px] border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-2"><LoaderCircle size={16} className="animate-spin text-[#c9ff29]" /><span><span className="block text-[11px] font-black">{statusMeta[status].title}</span><span className="mt-0.5 block text-[9.5px] font-semibold text-white/45">{statusMeta[status].desc}</span></span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className={cn("h-full rounded-full bg-[#c9ff29] transition-all duration-700", status === "compiling" ? "w-1/4" : status === "queued" ? "w-1/2" : "w-[82%]")} /></div></div>}
    <p className="mt-3 text-[9px] font-semibold leading-4 text-white/35">Demo 使用 Mock 模型与任务状态，不会真实扣除积分或调用生成服务。</p>
  </div></section></aside>
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[9px] font-bold text-white/35">{label}</dt><dd className="mt-1 text-[10.5px] font-extrabold text-white/85">{value}</dd></div>
}

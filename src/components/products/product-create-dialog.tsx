"use client"

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { CircleHelp, Link2, LoaderCircle, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { EMPTY_PRODUCT_FORM, RECOGNIZED_PRODUCT_FORM, type ProductFormValue } from "./product-data"

type UploadedMedia = { name: string; url: string }

export function ProductCreateDialog({
  open,
  defaultTab = "images",
  onOpenChange,
  onCreate,
}: {
  open: boolean
  defaultTab?: "images" | "url"
  onOpenChange: (open: boolean) => void
  onCreate: (value: ProductFormValue) => void
}) {
  const [tab, setTab] = useState(defaultTab)
  const [uploads, setUploads] = useState<UploadedMedia[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [result, setResult] = useState<ProductFormValue>({ ...EMPTY_PRODUCT_FORM })
  const [analyzing, setAnalyzing] = useState(false)
  const [urlParsed, setUrlParsed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function resetAndClose() {
    setUploads([])
    setActiveIndex(0)
    setResult({ ...EMPTY_PRODUCT_FORM })
    setAnalyzing(false)
    setUrlParsed(false)
    onOpenChange(false)
  }

  function finishRecognition() {
    setResult((current) => ({ ...RECOGNIZED_PRODUCT_FORM, sourceUrl: current.sourceUrl }))
    setAnalyzing(false)
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const additions = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(0, 9 - uploads.length))
      .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    if (!additions.length) return
    setUploads((current) => [...current, ...additions].slice(0, 9))
    setActiveIndex(uploads.length)
    setAnalyzing(true)
    setResult({ ...EMPTY_PRODUCT_FORM })
    window.setTimeout(finishRecognition, 1000)
  }

  function parseUrl() {
    if (!/^https?:\/\//i.test((result.sourceUrl ?? "").trim())) return
    setAnalyzing(true)
    setUrlParsed(false)
    setResult((current) => ({ ...EMPTY_PRODUCT_FORM, sourceUrl: current.sourceUrl }))
    window.setTimeout(() => {
      setUploads([
        { name: "商品主图", url: "/replicate-covers/sports-bra.jpg" },
        { name: "商品细节", url: "/replicate-covers/black-training-jacket.png" },
        { name: "场景素材", url: "/replicate-covers/beauty-makeup.jpg" },
      ])
      setUrlParsed(true)
      finishRecognition()
    }, 1100)
  }

  function createProduct() {
    const media = uploads.map((item) => item.url)
    const image = media[0] || RECOGNIZED_PRODUCT_FORM.image
    onCreate({
      ...result,
      name: result.name.trim(),
      description: result.description.trim(),
      sourceUrl: tab === "url" ? (result.sourceUrl ?? "").trim() : "",
      image,
      media: media.length ? media : [image],
    })
    resetAndClose()
  }

  const canCreate = Boolean(result.name.trim() && result.description.trim() && !analyzing)
  const activeImage = uploads[activeIndex]?.url

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) resetAndClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[96] bg-[#f1f2ef]/72 backdrop-blur-[5px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[97] flex max-h-[min(760px,calc(100vh-32px))] w-[min(920px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_28px_90px_rgba(26,31,23,0.2)] outline-none">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#e6e8e4] px-5">
            <div>
              <Dialog.Title className="text-[15px] font-black text-[#171a16]">新建商品</Dialog.Title>
              <Dialog.Description className="sr-only">上传商品图片或粘贴商品链接，识别并确认商品信息。</Dialog.Description>
            </div>
            <button type="button" onClick={resetAndClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[#6e756b] hover:bg-[#f1f2ef] hover:text-black"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#f0f1ef] p-1">
              <button type="button" onClick={() => setTab("images")} className={cn("h-9 rounded-lg text-[12px] font-extrabold transition", tab === "images" ? "bg-white text-[#171a16] shadow-sm" : "text-[#686f65] hover:text-black")}>上传图片</button>
              <button type="button" onClick={() => setTab("url")} className={cn("h-9 rounded-lg text-[12px] font-extrabold transition", tab === "url" ? "bg-white text-[#171a16] shadow-sm" : "text-[#686f65] hover:text-black")}>粘贴链接</button>
            </div>

            {tab === "images" ? (
              <div className="mt-4 grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(event) => handleFiles(event.target.files)} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="relative flex aspect-[4/5] w-full overflow-hidden rounded-2xl border border-dashed border-[#d9ddd6] bg-[#fafbf9]">
                    {activeImage ? <img src={activeImage} alt="商品识别预览" className="h-full w-full object-contain" /> : (
                      <span className="m-auto flex max-w-[190px] flex-col items-center text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d5d9d2] bg-white text-[#252a23]"><Plus size={26} /></span>
                        <strong className="mt-5 text-[14px] font-black text-[#171a16]">上传商品图片</strong>
                        <span className="mt-2 text-[11px] leading-4 text-[#777e74]">上传多个角度的商品图，可以提高识别准确度。</span>
                      </span>
                    )}
                    {analyzing && activeImage ? <span className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white backdrop-blur-[1px]"><LoaderCircle size={28} className="animate-spin" /><strong className="mt-4 text-[14px]">正在识别商品</strong><span className="mt-1 text-[11px] text-white/75">提取适合广告创作的详细信息</span></span> : null}
                  </button>
                  {uploads.length ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {uploads.map((upload, index) => <button key={upload.url} type="button" aria-label={`查看上传图片 ${index + 1}`} onClick={() => setActiveIndex(index)} className={cn("relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-white", index === activeIndex ? "border-[#222720] ring-1 ring-[#222720]" : "border-[#e1e3de]")}><img src={upload.url} alt={upload.name} className="h-full w-full object-cover" /></button>)}
                      {uploads.length < 9 ? <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-[#d8dcd5] text-[9px] text-[#747b71]"><Plus size={15} /><span className="mt-0.5">{uploads.length}/9</span></button> : null}
                    </div>
                  ) : null}
                </div>
                <ProductResultFields value={result} onChange={setResult} />
              </div>
            ) : (
              <div className="mt-5">
                <label className="text-[11px] font-extrabold text-[#32372f]">粘贴商品链接</label>
                <div className="mt-2 flex gap-2">
                  <input value={result.sourceUrl ?? ""} onChange={(event) => { setResult((current) => ({ ...current, sourceUrl: event.target.value })); setUrlParsed(false) }} placeholder="https://www.example.com/product/..." className="h-11 min-w-0 flex-1 rounded-xl border border-[#d8dcd5] px-4 text-[12px] outline-none focus:border-[#94b43d] focus:ring-4 focus:ring-[#c9ff29]/15" />
                  <button type="button" onClick={parseUrl} disabled={analyzing || !/^https?:\/\//i.test((result.sourceUrl ?? "").trim())} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d8dcd5] px-4 text-[12px] font-extrabold text-[#4f564c] hover:bg-[#f6f7f4] disabled:cursor-not-allowed disabled:text-[#a3a9a0]"><Link2 size={14} />解析</button>
                </div>
                {analyzing ? <div className="mt-3 flex h-16 items-center gap-2 rounded-xl border border-[#e2e4df] bg-[#fafbf9] px-4 text-[12px] font-bold text-[#727970]"><LoaderCircle size={15} className="animate-spin" />正在解析商品页面...</div> : null}
                {urlParsed ? (
                  <div className="mt-4">
                    <div className="mb-4 flex gap-2">{uploads.map((upload, index) => <button key={upload.url} type="button" onClick={() => setActiveIndex(index)} className={cn("h-16 w-16 overflow-hidden rounded-lg border", index === activeIndex ? "border-[#20251d] ring-1 ring-[#20251d]" : "border-[#e0e3dd]")}><img src={upload.url} alt={upload.name} className="h-full w-full object-cover" /></button>)}</div>
                    <ProductResultFields value={result} onChange={setResult} />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-t border-[#e6e8e4] px-4 py-3">
            <p className="hidden items-center gap-2 text-[10.5px] text-[#828980] sm:flex"><CircleHelp size={13} />上传多个角度的商品图，识别结果会更准确。</p>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={resetAndClose} className="h-10 rounded-xl border border-[#dfe2dc] px-5 text-[12px] font-extrabold text-[#30352e] hover:bg-[#f6f7f4]">取消</button>
              <button type="button" disabled={!canCreate} onClick={createProduct} className="h-10 rounded-xl bg-black px-5 text-[12px] font-extrabold text-white hover:bg-[#202220] disabled:cursor-not-allowed disabled:bg-[#a3a6a2]">创建商品</button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ProductResultFields({ value, onChange }: { value: ProductFormValue; onChange: React.Dispatch<React.SetStateAction<ProductFormValue>> }) {
  function update<K extends keyof ProductFormValue>(key: K, next: ProductFormValue[K]) {
    onChange((current) => ({ ...current, [key]: next }))
  }

  return (
    <div className="space-y-3">
      <ResultInput label="商品名称" value={value.name} placeholder="商品名称" onChange={(next) => update("name", next)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultInput label="品牌名称" value={value.brand} placeholder="品牌名称（选填）" onChange={(next) => update("brand", next)} />
        <ResultInput label="商品品类" value={value.category} placeholder="商品品类（选填）" onChange={(next) => update("category", next)} />
      </div>
      <ResultTextArea label="商品描述" value={value.description} placeholder="描述这个商品..." rows={4} onChange={(next) => update("description", next)} />
      <ResultTextArea label="核心卖点" value={value.sellingPoints.join("\n")} placeholder="每行一条核心卖点" onChange={(next) => update("sellingPoints", splitLines(next))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultTextArea label="目标人群" value={value.audiences.join("\n")} placeholder="每行一类目标人群" onChange={(next) => update("audiences", splitLines(next))} />
        <ResultTextArea label="使用场景" value={value.scenarios.join("\n")} placeholder="每行一个使用场景" onChange={(next) => update("scenarios", splitLines(next))} />
      </div>
    </div>
  )
}

function ResultInput({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-[11px] font-extrabold text-[#30352e]">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 h-10 w-full rounded-xl border border-[#dfe2dc] px-3 text-[12px] outline-none focus:border-[#94b43d]" /></label>
}

function ResultTextArea({ label, value, placeholder, rows = 3, onChange }: { label: string; value: string; placeholder: string; rows?: number; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-[11px] font-extrabold text-[#30352e]">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="mt-1.5 w-full resize-none rounded-xl border border-[#dfe2dc] px-3 py-2.5 text-[12px] leading-5 outline-none focus:border-[#94b43d]" /></label>
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean)
}

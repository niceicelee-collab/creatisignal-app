"use client"

/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, CircleHelp, Link2, LoaderCircle, Plus, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { EMPTY_PRODUCT_FORM, RECOGNIZED_PRODUCT_FORM, type ProductFormValue } from "./product-data"

type UploadedMedia = { name: string; url: string }

const MAX_PRODUCT_MEDIA = 8
const MOCK_PARSED_IMAGE_SOURCES = [
  "/replicate-covers/sports-bra.jpg",
  "/replicate-covers/black-training-jacket.png",
  "/replicate-covers/beauty-makeup.jpg",
  "/replicate-covers/cargo-shorts.jpg",
  "/replicate-covers/knit-cardigan.jpg",
  "/replicate-covers/portable-blender.jpg",
  "/creative-assets/wedding-dress-cover.png",
  "/replicate-covers/creative-draft.jpg",
]
const MOCK_PARSED_IMAGES: UploadedMedia[] = Array.from({ length: 24 }, (_, index) => ({
  name: `解析图片 ${index + 1}`,
  url: `${MOCK_PARSED_IMAGE_SOURCES[index % MOCK_PARSED_IMAGE_SOURCES.length]}?candidate=${index + 1}`,
}))

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
  const [parsedImages, setParsedImages] = useState<UploadedMedia[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function resetAndClose() {
    setUploads([])
    setActiveIndex(0)
    setResult({ ...EMPTY_PRODUCT_FORM })
    setAnalyzing(false)
    setUrlParsed(false)
    setParsedImages([])
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
      .slice(0, Math.max(0, MAX_PRODUCT_MEDIA - uploads.length))
      .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }))
    if (!additions.length) return
    setUploads((current) => [...current, ...additions].slice(0, MAX_PRODUCT_MEDIA))
    setActiveIndex(uploads.length)
    setAnalyzing(true)
    setResult({ ...EMPTY_PRODUCT_FORM })
    window.setTimeout(finishRecognition, 1000)
  }

  function parseUrl() {
    if (!/^https?:\/\//i.test((result.sourceUrl ?? "").trim())) return
    setAnalyzing(true)
    setUrlParsed(false)
    setUploads([])
    setParsedImages([])
    setResult((current) => ({ ...EMPTY_PRODUCT_FORM, sourceUrl: current.sourceUrl }))
    window.setTimeout(() => {
      setParsedImages(MOCK_PARSED_IMAGES)
      setUrlParsed(true)
      finishRecognition()
    }, 1100)
  }

  function toggleParsedImage(image: UploadedMedia) {
    setUploads((current) => {
      const selected = current.some((item) => item.url === image.url)
      if (selected) return current.filter((item) => item.url !== image.url)
      if (current.length >= MAX_PRODUCT_MEDIA) return current
      return [...current, image]
    })
  }

  function createProduct() {
    const media = uploads.slice(0, MAX_PRODUCT_MEDIA).map((item) => item.url)
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

  const canCreate = Boolean(result.name.trim() && result.description.trim() && uploads.length > 0 && !analyzing)
  const activeImage = uploads[activeIndex]?.url

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) resetAndClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[96] bg-[#f1f2ef]/72 backdrop-blur-[5px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[97] flex max-h-[min(760px,calc(100vh-32px))] w-[min(920px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_28px_90px_rgba(26,31,23,0.2)] outline-none">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#e6e8e4] px-5">
            <div>
              <Dialog.Title className="text-[15px] font-black text-[#171a16]">新建商品</Dialog.Title>
              <Dialog.Description className="sr-only">上传商品图片或粘贴 TikTok Shop 商品链接，识别并确认商品信息。</Dialog.Description>
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
                      {uploads.length < MAX_PRODUCT_MEDIA ? <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-[#d8dcd5] text-[9px] text-[#747b71]"><Plus size={15} /><span className="mt-0.5">{uploads.length}/{MAX_PRODUCT_MEDIA}</span></button> : null}
                    </div>
                  ) : null}
                </div>
                <ProductResultFields value={result} onChange={setResult} />
              </div>
            ) : (
              <div className="mt-5">
                <label className="text-[11px] font-extrabold text-[#32372f]">TikTok Shop 商品链接</label>
                <div className="mt-2 flex gap-2">
                  <input value={result.sourceUrl ?? ""} onChange={(event) => { setResult((current) => ({ ...current, sourceUrl: event.target.value })); setUrlParsed(false); setParsedImages([]); setUploads([]) }} placeholder="粘贴 TikTok Shop 商品详情页或分享链接" className="h-11 min-w-0 flex-1 rounded-xl border border-[#d8dcd5] px-4 text-[12px] outline-none focus:border-[#94b43d] focus:ring-4 focus:ring-[#c9ff29]/15" />
                  <button type="button" onClick={parseUrl} disabled={analyzing || !/^https?:\/\//i.test((result.sourceUrl ?? "").trim())} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d8dcd5] px-4 text-[12px] font-extrabold text-[#4f564c] hover:bg-[#f6f7f4] disabled:cursor-not-allowed disabled:text-[#a3a9a0]"><Link2 size={14} />解析</button>
                </div>
                <p className="mt-2 text-[10.5px] text-[#858c81]">支持 TikTok Shop 商品详情页，以及可跳转至商品详情页的分享链接。</p>
                {analyzing ? <div className="mt-3 flex h-16 items-center gap-2 rounded-xl border border-[#e2e4df] bg-[#fafbf9] px-4 text-[12px] font-bold text-[#727970]"><LoaderCircle size={15} className="animate-spin" />正在解析 TikTok Shop 商品信息...</div> : null}
                {urlParsed ? (
                  <div className="mt-4">
                    <section className="mb-5 rounded-2xl border border-[#e1e4dd] bg-[#fafbf9] p-3.5">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-[12px] font-black text-[#252a24]">选择产品图</h3>
                          <p className="mt-1 text-[10.5px] font-medium text-[#858c81]">解析到 {parsedImages.length} 张图片，请选择 1–8 张入库；第一张将作为商品主图。</p>
                        </div>
                        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold", uploads.length ? "bg-[#eaffad] text-[#40520d]" : "bg-[#eceeea] text-[#7d8479]")}>已选 {uploads.length}/{MAX_PRODUCT_MEDIA}</span>
                      </div>
                      <div className="grid max-h-[232px] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 md:grid-cols-8">
                        {parsedImages.map((image) => {
                          const selectedIndex = uploads.findIndex((item) => item.url === image.url)
                          const selected = selectedIndex >= 0
                          const disabled = uploads.length >= MAX_PRODUCT_MEDIA && !selected
                          return (
                            <button
                              key={image.url}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleParsedImage(image)}
                              aria-label={`${selected ? "取消选择" : "选择"}${image.name}`}
                              className={cn(
                                "group relative aspect-square overflow-hidden rounded-xl border bg-white transition",
                                selected ? "border-[#242923] ring-2 ring-[#c9ff29]" : "border-[#e0e3dd] hover:border-[#9ca497]",
                                disabled && "cursor-not-allowed opacity-35",
                              )}
                            >
                              <img src={image.url} alt={image.name} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]" />
                              {selected ? (
                                <span className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center gap-0.5 rounded-full bg-[#c9ff29] px-1 text-[9px] font-black text-[#273309] shadow-sm">
                                  {selectedIndex === 0 ? <Check size={11} strokeWidth={3} /> : selectedIndex + 1}
                                </span>
                              ) : null}
                              {selectedIndex === 0 ? <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-black/65 px-1 py-0.5 text-center text-[8.5px] font-bold text-white backdrop-blur-sm">商品主图</span> : null}
                            </button>
                          )
                        })}
                      </div>
                      {uploads.length >= MAX_PRODUCT_MEDIA ? <p className="mt-2.5 text-[10px] font-bold text-[#758441]">已达到 8 张上限，取消一张后可继续选择。</p> : null}
                    </section>
                    <ProductResultFields value={result} onChange={setResult} />
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-t border-[#e6e8e4] px-4 py-3">
            <p className="hidden items-center gap-2 text-[10.5px] text-[#828980] sm:flex"><CircleHelp size={13} />{tab === "url" ? "解析图片不会全部入库，仅保存已选择的 1–8 张。" : "最多上传 8 张商品图，多角度图片可提高识别准确度。"}</p>
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
      <ResultInput label="商品或服务名称" value={value.name} placeholder="输入商品名称" onChange={(next) => update("name", next)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultInput label="品牌名称" optional value={value.brand} placeholder="输入品牌名称" onChange={(next) => update("brand", next)} />
        <ResultInput label="商品品类" optional value={value.category} placeholder="例如：Women's Activewear" onChange={(next) => update("category", next)} />
      </div>
      <ResultTextArea label="描述你正在销售的商品" value={value.description} placeholder="描述商品并补充独特卖点，例如材质、功能、设计、适用人群与使用方式。" rows={5} onChange={(next) => update("description", next)} />
      <ResultTextArea label="突出主要卖点的关键词" value={value.sellingPoints.join("\n")} placeholder="例如：耐高温、续航 24 小时、轻量便携等，每行一条。" onChange={(next) => update("sellingPoints", splitLines(next))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <ResultTextArea label="目标人群" value={value.audiences.join("\n")} placeholder="每行一类目标人群" onChange={(next) => update("audiences", splitLines(next))} />
        <ResultTextArea label="使用场景" value={value.scenarios.join("\n")} placeholder="每行一个使用场景" onChange={(next) => update("scenarios", splitLines(next))} />
      </div>
    </div>
  )
}

function ResultInput({ label, optional, value, placeholder, onChange }: { label: string; optional?: boolean; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-extrabold text-[#30352e]">{label}{optional ? <em className="ml-1 not-italic font-medium text-[#8a9185]">· 选填</em> : null}</span>
      <span className="relative mt-1.5 block">
        <input value={value} maxLength={100} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-full border border-[#dfe2dc] px-3 pr-14 text-[12px] outline-none focus:border-[#94b43d]" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#8a9185]">{value.length}/100</span>
      </span>
    </label>
  )
}

function ResultTextArea({ label, value, placeholder, rows = 3, onChange }: { label: string; value: string; placeholder: string; rows?: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-extrabold text-[#30352e]">{label}</span>
      <span className="relative mt-1.5 block">
        <textarea value={value} maxLength={3000} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="w-full resize-none rounded-xl border border-[#dfe2dc] px-3 pb-8 pt-2.5 text-[12px] leading-5 outline-none focus:border-[#94b43d]" />
        <span className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[9.5px] font-bold text-[#a1a7a0]"><Sparkles size={10} />AI自动提取/生成建议</span>
        <span className="absolute bottom-2.5 right-3 text-[9px] text-[#8a9185]">{value.length}/3000</span>
      </span>
    </label>
  )
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean)
}

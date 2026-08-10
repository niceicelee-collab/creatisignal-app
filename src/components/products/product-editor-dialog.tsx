"use client"

import { useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ImagePlus, Info, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { EMPTY_PRODUCT_FORM, type ProductFormValue } from "./product-data"

type Props = {
  open: boolean
  mode: "create" | "edit"
  initialValue?: ProductFormValue
  onOpenChange: (open: boolean) => void
  onSave: (value: ProductFormValue) => void
}

export function ProductEditorDialog({ open, mode, initialValue, onOpenChange, onSave }: Props) {
  const [value, setValue] = useState<ProductFormValue>(initialValue ?? EMPTY_PRODUCT_FORM)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update<K extends keyof ProductFormValue>(key: K, next: ProductFormValue[K]) {
    setValue((current) => ({ ...current, [key]: next }))
  }

  function addMedia(files: FileList | null) {
    if (!files) return
    const additions = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(0, 8 - value.media.length))
      .map((file) => URL.createObjectURL(file))
    if (!additions.length) return
    setValue((current) => ({
      ...current,
      image: current.image || additions[0],
      media: [...current.media, ...additions].slice(0, 8),
    }))
  }

  const canSave = value.name.trim().length > 0

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-[#181b17]/35 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-y-3 left-1/2 z-[91] flex w-[min(860px,calc(100vw-28px))] -translate-x-1/2 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_32px_90px_rgba(24,28,20,0.22)] outline-none">
          <div className="flex items-center justify-between px-6 pb-3 pt-5 sm:px-7">
            <Dialog.Title className="text-[22px] font-black tracking-[-0.035em] text-[#171a16]">
              {mode === "create" ? "新增商品或服务" : "编辑商品或服务"}
            </Dialog.Title>
            <Dialog.Description className="sr-only">确认并修改商品链接、基础信息、卖点、目标人群、使用场景与媒体素材。</Dialog.Description>
            <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full text-[#777d74] hover:bg-[#f1f2ef] hover:text-black">
              <X size={17} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-24 sm:px-7">
            <FormSection
              title="提供推广商品的网址"
              description="用于快速获取商品素材和详情，链接为选填项。"
              info
            >
              <TextInput label="商品链接" optional value={value.sourceUrl ?? ""} placeholder="输入商品链接" onChange={(next) => update("sourceUrl", next)} />
            </FormSection>

            <FormSection title="告诉我们商品信息" description="这些信息将用于生成脚本，请确保内容完整且准确。">
              <div className="space-y-5">
                <TextInput label="商品或服务名称" value={value.name} maxLength={100} placeholder="输入商品名称" onChange={(next) => update("name", next)} />
                <div className="grid gap-5 md:grid-cols-2">
                  <TextInput label="品牌名称" optional value={value.brand} maxLength={100} placeholder="输入品牌名称" onChange={(next) => update("brand", next)} />
                  <TextInput label="商品品类" optional value={value.category} maxLength={100} placeholder="例如：Women's Activewear" onChange={(next) => update("category", next)} />
                </div>
                <TextArea
                  label="描述你正在销售的商品"
                  value={value.description}
                  placeholder="描述商品并补充独特卖点，例如材质、功能、设计、适用人群与使用方式。"
                  onChange={(next) => update("description", next)}
                />
                <TextArea
                  label="突出主要卖点的关键词"
                  value={value.sellingPoints.join("\n")}
                  placeholder="例如：耐高温、续航 24 小时、轻量便携等，每行一条。"
                  onChange={(next) => update("sellingPoints", splitLines(next))}
                />
                <div className="grid gap-5 md:grid-cols-2">
                  <TextArea label="目标人群" compact value={value.audiences.join("\n")} placeholder="每行一类目标人群" onChange={(next) => update("audiences", splitLines(next))} />
                  <TextArea label="使用场景" compact value={value.scenarios.join("\n")} placeholder="每行一个使用场景" onChange={(next) => update("scenarios", splitLines(next))} />
                </div>
              </div>
            </FormSection>

            <FormSection title="商品图片" description="上传 1–8 张商品图片，建议包含主图、细节图和多角度图片。">
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addMedia(event.target.files)} />
              <div className="flex flex-wrap gap-3">
                {value.media.map((media, index) => (
                  <div key={`${media}-${index}`} className="group relative h-28 w-24 overflow-hidden rounded-xl border border-[#e0e3dd] bg-[#f5f6f3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={media} alt={`商品素材 ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" aria-label={`删除素材 ${index + 1}`} onClick={() => setValue((current) => ({ ...current, image: current.image === media ? "" : current.image, media: current.media.filter((item) => item !== media) }))} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"><X size={11} /></button>
                  </div>
                ))}
                {value.media.length < 8 ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-28 w-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#cfd3cc] text-[#575d54] transition hover:border-[#94b43d] hover:bg-[#fbfff2]">
                    <ImagePlus size={20} />
                    <span className="text-[11px] font-bold">添加素材</span>
                  </button>
                ) : null}
              </div>
            </FormSection>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-[#e6e8e3] bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
            <Dialog.Close className="h-10 rounded-full bg-[#f5f6f4] px-5 text-[13px] font-extrabold text-[#272b25] hover:bg-[#eceeea]">返回</Dialog.Close>
            <button type="button" disabled={!canSave} onClick={() => { onSave(value); onOpenChange(false) }} className="h-10 rounded-full bg-[#171b16] px-6 text-[13px] font-extrabold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[#d8ece8] disabled:text-white">
              保存更改
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function FormSection({ title, description, info, children }: { title: string; description: string; info?: boolean; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#e8eae6] py-6 last:border-b-0">
      <h3 className="flex items-center gap-1.5 text-[15px] font-black text-[#181b17]">{title}{info ? <Info size={14} className="text-[#7d8479]" /> : null}</h3>
      <p className="mt-1 text-[12px] leading-5 text-[#787f74]">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function TextInput({ label, optional, value, placeholder, maxLength, onChange }: { label: string; optional?: boolean; value: string; placeholder: string; maxLength?: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-[#171a16]">{label}{optional ? <em className="ml-1 not-italic font-medium text-[#8a9185]">· 选填</em> : null}</span>
      <span className="relative mt-2 block">
        <input value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-full border border-[#cfd3cc] px-4 pr-16 text-[13px] font-medium text-[#20241f] outline-none transition placeholder:text-[#a7ada4] focus:border-[#8cab37] focus:ring-4 focus:ring-[#c9ff29]/15" />
        {maxLength ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#767d73]">{value.length}/{maxLength}</span> : null}
      </span>
    </label>
  )
}

function TextArea({ label, value, placeholder, onChange, compact }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-[#171a16]">{label}</span>
      <span className="relative mt-2 block">
        <textarea value={value} maxLength={3000} rows={compact ? 4 : 5} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={cn("w-full resize-none rounded-2xl border border-[#cfd3cc] px-4 pb-9 pt-3 text-[13px] font-medium leading-6 text-[#20241f] outline-none transition placeholder:text-[#a7ada4] focus:border-[#8cab37] focus:ring-4 focus:ring-[#c9ff29]/15", compact && "min-h-28")} />
        <span className="absolute bottom-3 left-4 flex items-center gap-1.5 text-[10.5px] font-bold text-[#a1a7a0]"><Sparkles size={11} />AI 建议</span>
        <span className="absolute bottom-3 right-4 text-[10px] text-[#767d73]">{value.length}/3000</span>
      </span>
    </label>
  )
}

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean)
}

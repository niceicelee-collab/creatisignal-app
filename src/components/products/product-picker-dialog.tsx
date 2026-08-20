"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, Clock3, ExternalLink, Image as ImageIcon, MoreHorizontal, PackagePlus, Pencil, Plus, Search, Trash2, UploadCloud, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductCreateDialog } from "./product-create-dialog"
import { ProductEditorDialog } from "./product-editor-dialog"
import {
  formatProductUpdatedAt,
  INITIAL_PRODUCTS,
  productToForm,
  type Product,
  type ProductFormValue,
} from "./product-data"
import { useProductLibrary, useRecentProductIds } from "./product-store"

type EditorState = { productId: string; value: ProductFormValue } | null

export function ProductPickerDialog({
  open,
  onOpenChange,
  selectedId,
  onSelect,
  allowLocalUpload = false,
  onUpload,
  initialProducts = INITIAL_PRODUCTS,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedId?: string
  onSelect: (product: Product) => void
  allowLocalUpload?: boolean
  onUpload?: (file: File) => void
  initialProducts?: Product[]
}) {
  const sharedLibrary = useProductLibrary()
  const products = initialProducts === INITIAL_PRODUCTS ? sharedLibrary.products : initialProducts
  const { recentProductIds, markProductUsed } = useRecentProductIds()
  const [query, setQuery] = useState("")
  const [menuId, setMenuId] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(null)
  const [createMode, setCreateMode] = useState<"images" | "url" | null>(null)
  const [sourceTab, setSourceTab] = useState<"products" | "upload">("products")
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products
      .filter((product) => !normalized || [product.name, product.brand, product.description, ...product.sellingPoints].join(" ").toLowerCase().includes(normalized))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  }, [products, query])

  const recentProducts = useMemo(() => recentProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
    .slice(0, 4), [products, recentProductIds])

  function saveProduct(value: ProductFormValue) {
    if (!editor) return
    sharedLibrary.updateProduct(editor.productId, value)
    setEditor(null)
  }

  function createProduct(value: ProductFormValue) {
    sharedLibrary.createProduct(value)
    setCreateMode(null)
  }

  function selectProduct(product: Product) {
    markProductUsed(product.id)
    onSelect(product)
    setSourceTab("products")
    onOpenChange(false)
  }

  function selectLocalImage(file?: File) {
    if (!file || !file.type.startsWith("image/")) return
    onUpload?.(file)
    setSourceTab("products")
    onOpenChange(false)
    if (uploadInputRef.current) uploadInputRef.current.value = ""
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) setSourceTab("products"); onOpenChange(nextOpen) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[84] bg-[#eef0eb]/72 backdrop-blur-[5px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[85] flex h-[min(720px,calc(100vh-48px))] w-[min(1120px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_28px_90px_rgba(26,31,23,0.18)] outline-none">
            <div className="flex h-14 shrink-0 items-center gap-4 border-b border-[#e7e9e5] px-5">
              <div className="mr-auto">
                <Dialog.Title className="text-[15px] font-black text-[#171a16]">{allowLocalUpload ? "选择图片" : "选择商品"}</Dialog.Title>
                <Dialog.Description className="sr-only">{allowLocalUpload ? "从商品库图片或本地上传中选择参考图。" : "从商品库选择、新建、编辑或删除商品。"}</Dialog.Description>
              </div>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full text-[#757b72] hover:bg-[#f1f2ef] hover:text-black"><X size={16} /></Dialog.Close>
            </div>

            {allowLocalUpload ? (
              <div className="mx-5 mt-4 grid h-11 shrink-0 grid-cols-2 rounded-xl bg-[#f0f2ee] p-1">
                <button type="button" onClick={() => setSourceTab("products")} className={cn("flex items-center justify-center gap-2 rounded-lg text-[12px] font-extrabold transition", sourceTab === "products" ? "bg-white text-[#1f231e] shadow-sm" : "text-[#737a70] hover:text-[#30352f]")}><ImageIcon size={14} />商品库图片</button>
                <button type="button" onClick={() => setSourceTab("upload")} className={cn("flex items-center justify-center gap-2 rounded-lg text-[12px] font-extrabold transition", sourceTab === "upload" ? "bg-white text-[#1f231e] shadow-sm" : "text-[#737a70] hover:text-[#30352f]")}><UploadCloud size={14} />本地上传</button>
              </div>
            ) : null}

            {sourceTab === "products" ? (
              <div className="flex-1 overflow-y-auto p-5">
                <div className="mb-5 flex items-center gap-3">
                  <label className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d948a]" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索商品名称、描述或卖点关键词" className="h-10 w-full rounded-xl border border-[#dde0da] bg-[#fafbf9] pl-9 pr-3 text-[12px] outline-none focus:border-[#94b33c] focus:bg-white" />
                  </label>
                  <Link href="/assets/products" onClick={() => onOpenChange(false)} className="hidden h-10 items-center gap-1.5 rounded-xl border border-[#dde0da] px-3 text-[11px] font-extrabold text-[#52594f] hover:bg-[#f5f7f2] md:inline-flex">管理商品库<ExternalLink size={12} /></Link>
                </div>

                {recentProducts.length > 0 && !query.trim() ? (
                  <section className="mb-6 rounded-2xl border border-[#e4e8de] bg-[#fbfcf9] p-4">
                    <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-extrabold text-[#697064]"><Clock3 size={12} />最近使用</h3>
                    <div className="flex gap-2.5 overflow-x-auto pb-1">
                      {recentProducts.map((product) => (
                        <PickerProductCard key={`recent-${product.id}`} product={product} selected={product.id === selectedId} menuOpen={false} compact onSelect={() => selectProduct(product)} onMenu={() => {}} onEdit={() => {}} onDelete={() => {}} />
                      ))}
                    </div>
                  </section>
                ) : null}

                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold text-[#697064]">全部商品</h3>
                  <span className="text-[10px] font-semibold text-[#9ba197]">{filteredProducts.length} 个</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-3.5">
                  <PickerAction icon={Plus} label="新建商品" onClick={() => setCreateMode("images")} />
                  {filteredProducts.map((product) => (
                    <PickerProductCard key={product.id} product={product} selected={product.id === selectedId} menuOpen={menuId === product.id} onSelect={() => selectProduct(product)} onMenu={() => setMenuId((current) => current === product.id ? null : product.id)} onEdit={() => { setEditor({ productId: product.id, value: productToForm(product) }); setMenuId(null) }} onDelete={() => { sharedLibrary.deleteProduct(product.id); setMenuId(null) }} />
                  ))}
                </div>
                {filteredProducts.length === 0 ? <div className="flex h-60 items-center justify-center text-[13px] font-bold text-[#8b9288]">没有找到匹配商品</div> : null}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8">
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); selectLocalImage(event.dataTransfer.files?.[0]) }}
                  className="flex h-full max-h-[430px] min-h-[300px] w-full max-w-[760px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#cfd5ca] bg-[#fafbf9] px-8 text-center transition hover:border-[#92ad43] hover:bg-[#fbfff2]"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef2e9] text-[#4d5f32]"><UploadCloud size={25} strokeWidth={1.8} /></span>
                  <span className="mt-5 text-[15px] font-black text-[#252a24]">上传本地图片</span>
                  <span className="mt-2 text-[12px] font-medium text-[#858c81]">点击选择或拖拽图片到此处</span>
                  <span className="mt-1 text-[10.5px] font-semibold text-[#a0a69d]">支持 JPG、PNG、WebP，单张不超过 10 MB</span>
                </button>
                <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => selectLocalImage(event.target.files?.[0])} />
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ProductCreateDialog key={createMode ?? "create-closed"} open={Boolean(createMode)} defaultTab={createMode ?? "images"} onOpenChange={(nextOpen) => { if (!nextOpen) setCreateMode(null) }} onCreate={createProduct} />
      <ProductEditorDialog key={editor?.productId ?? "edit-closed"} open={Boolean(editor)} mode="edit" initialValue={editor?.value} onOpenChange={(nextOpen) => { if (!nextOpen) setEditor(null) }} onSave={saveProduct} />
    </>
  )
}

function PickerProductCard({ product, selected, menuOpen, compact = false, onSelect, onMenu, onEdit, onDelete }: { product: Product; selected: boolean; menuOpen: boolean; compact?: boolean; onSelect: () => void; onMenu: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className={cn("group relative overflow-hidden rounded-[16px] border bg-[#f4f5f2] transition", compact && "w-[220px] shrink-0", selected ? "border-[#242923] ring-2 ring-[#c9ff29]" : "border-[#e0e3dd] hover:border-[#b9bfb4]") }>
      <button type="button" onClick={onSelect} className={cn("relative w-full text-left", compact ? "flex h-[76px] items-center gap-3 p-2" : "block aspect-[4/5]")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className={cn("object-cover", compact ? "h-[60px] w-[60px] shrink-0 rounded-xl" : "h-full w-full")} />
        {compact ? (
          <span className="min-w-0 pr-2">
            <span className="block truncate text-[11.5px] font-extrabold text-[#252a24]">{product.name}</span>
            <span className="mt-1 block text-[9.5px] font-bold text-[#8b9288]">{formatProductUpdatedAt(product.updatedAt)}</span>
          </span>
        ) : <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10 text-[11px] font-extrabold leading-4 text-white">{product.name}</span>}
        {selected ? <span className={cn("absolute flex items-center justify-center rounded-full bg-[#c9ff29] text-[#253008]", compact ? "left-1.5 top-1.5 h-5 w-5" : "left-2 top-2 h-6 w-6")}><Check size={compact ? 11 : 13} strokeWidth={3} /></span> : null}
      </button>
      {!compact ? <button type="button" aria-label={`${product.name} 更多操作`} onClick={onMenu} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus:opacity-100"><MoreHorizontal size={15} /></button> : null}
      {menuOpen ? (
        <div className="absolute right-2 top-10 z-10 w-36 rounded-xl border border-[#e0e2dd] bg-white p-1.5 shadow-xl">
          <button type="button" onClick={onEdit} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-bold text-[#30342f] hover:bg-[#f1f2ef]"><Pencil size={13} />编辑商品</button>
          <button type="button" onClick={onDelete} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-bold text-[#b64d42] hover:bg-[#fff1ef]"><Trash2 size={13} />删除</button>
        </div>
      ) : null}
    </article>
  )
}

function PickerAction({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[#d9ddd6] bg-white text-[#555b52] transition hover:border-[#93b43b] hover:bg-[#fbfff2] hover:text-[#273019]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f5f0]"><Icon size={18} /></span>
      <span className="text-[12px] font-extrabold">{label}</span>
      <PackagePlus size={13} className="text-[#a1a79e]" />
    </button>
  )
}

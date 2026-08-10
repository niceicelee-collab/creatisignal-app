"use client"

import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, MoreHorizontal, PackagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductCreateDialog } from "./product-create-dialog"
import { ProductEditorDialog } from "./product-editor-dialog"
import {
  INITIAL_PRODUCTS,
  productToForm,
  type Product,
  type ProductFormValue,
} from "./product-data"

type EditorState = { productId: string; value: ProductFormValue } | null

export function ProductPickerDialog({
  open,
  onOpenChange,
  selectedId,
  onSelect,
  initialProducts = INITIAL_PRODUCTS,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedId?: string
  onSelect: (product: Product) => void
  initialProducts?: Product[]
}) {
  const [products, setProducts] = useState(initialProducts)
  const [query, setQuery] = useState("")
  const [menuId, setMenuId] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(null)
  const [createMode, setCreateMode] = useState<"images" | "url" | null>(null)

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return products
    return products.filter((product) => [product.name, product.description, ...product.sellingPoints].join(" ").toLowerCase().includes(normalized))
  }, [products, query])

  function saveProduct(value: ProductFormValue) {
    if (!editor) return
    setProducts((current) => current.map((product) => product.id === editor.productId ? { ...product, ...value } : product))
    setEditor(null)
  }

  function createProduct(value: ProductFormValue) {
    const fallbackImage = value.image || "/replicate-covers/sports-bra.jpg"
    setProducts((current) => [{
      id: `prd_${Date.now()}`,
      status: "active",
      ...value,
      image: fallbackImage,
      media: value.media.length ? value.media : [fallbackImage],
    }, ...current])
    setCreateMode(null)
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[84] bg-[#eef0eb]/72 backdrop-blur-[5px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[85] flex h-[min(720px,calc(100vh-48px))] w-[min(1120px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_28px_90px_rgba(26,31,23,0.18)] outline-none">
            <div className="flex h-14 shrink-0 items-center gap-4 border-b border-[#e7e9e5] px-5">
              <div className="mr-auto">
                <Dialog.Title className="text-[15px] font-black text-[#171a16]">选择商品</Dialog.Title>
                <Dialog.Description className="sr-only">从商品库选择、新建、编辑或删除商品。</Dialog.Description>
              </div>
              <label className="relative w-[360px] max-w-[48vw]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d948a]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索商品名称、描述或卖点关键词" className="h-9 w-full rounded-xl border border-[#dde0da] bg-[#fafbf9] pl-9 pr-3 text-[12px] outline-none focus:border-[#94b33c] focus:bg-white" />
              </label>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full text-[#757b72] hover:bg-[#f1f2ef] hover:text-black"><X size={16} /></Dialog.Close>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-3.5">
                <PickerAction icon={Plus} label="新建商品" onClick={() => setCreateMode("images")} />
                {filteredProducts.map((product) => {
                  const selected = product.id === selectedId
                  return (
                    <article key={product.id} className={cn("group relative overflow-hidden rounded-[16px] border bg-[#f4f5f2] transition", selected ? "border-[#242923] ring-2 ring-[#c9ff29]" : "border-[#e0e3dd] hover:border-[#b9bfb4]") }>
                      <button type="button" onClick={() => { onSelect(product); onOpenChange(false) }} className="relative block aspect-[4/5] w-full text-left">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-[11px] font-extrabold leading-4 text-white">{product.name}</span>
                        {selected ? <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c9ff29] text-[#253008]"><Check size={13} strokeWidth={3} /></span> : null}
                      </button>
                      <button type="button" aria-label={`${product.name} 更多操作`} onClick={() => setMenuId((current) => current === product.id ? null : product.id)} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus:opacity-100"><MoreHorizontal size={15} /></button>
                      {menuId === product.id ? (
                        <div className="absolute right-2 top-10 z-10 w-36 rounded-xl border border-[#e0e2dd] bg-white p-1.5 shadow-xl">
                          <button type="button" onClick={() => { setEditor({ productId: product.id, value: productToForm(product) }); setMenuId(null) }} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-bold text-[#30342f] hover:bg-[#f1f2ef]"><Pencil size={13} />编辑商品</button>
                          <button type="button" onClick={() => { setProducts((current) => current.filter((item) => item.id !== product.id)); setMenuId(null) }} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-bold text-[#b64d42] hover:bg-[#fff1ef]"><Trash2 size={13} />删除</button>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
              {filteredProducts.length === 0 ? <div className="flex h-60 items-center justify-center text-[13px] font-bold text-[#8b9288]">没有找到匹配商品</div> : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ProductCreateDialog key={createMode ?? "create-closed"} open={Boolean(createMode)} defaultTab={createMode ?? "images"} onOpenChange={(nextOpen) => { if (!nextOpen) setCreateMode(null) }} onCreate={createProduct} />
      <ProductEditorDialog key={editor?.productId ?? "edit-closed"} open={Boolean(editor)} mode="edit" initialValue={editor?.value} onOpenChange={(nextOpen) => { if (!nextOpen) setEditor(null) }} onSave={saveProduct} />
    </>
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

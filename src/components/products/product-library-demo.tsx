"use client"

import { useMemo, useState } from "react"
import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { ProductCreateDialog } from "./product-create-dialog"
import { ProductEditorDialog } from "./product-editor-dialog"
import {
  formatProductUpdatedAt,
  productToForm,
  type Product,
  type ProductFormValue,
} from "./product-data"
import { useProductLibrary } from "./product-store"

type EditorState = { productId: string; value: ProductFormValue } | null

export function ProductLibraryDemo() {
  const { products, createProduct: addProduct, updateProduct, deleteProduct: removeProduct } = useProductLibrary()
  const [query, setQuery] = useState("")
  const [menuId, setMenuId] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(null)
  const [createMode, setCreateMode] = useState<"images" | "url" | null>(null)
  const [notice, setNotice] = useState("")

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return products
      .filter((product) => !normalized || [product.name, product.brand, product.description, ...product.sellingPoints].join(" ").toLowerCase().includes(normalized))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  }, [products, query])

  function saveProduct(value: ProductFormValue) {
    if (!editor) return
    updateProduct(editor.productId, value)
    setNotice("商品信息已更新")
    setEditor(null)
    window.setTimeout(() => setNotice(""), 2200)
  }

  function createProduct(value: ProductFormValue) {
    addProduct(value)
    setCreateMode(null)
    setNotice("商品已添加到商品库")
    window.setTimeout(() => setNotice(""), 2200)
  }

  function deleteProduct(productId: string) {
    removeProduct(productId)
    setMenuId(null)
    setNotice("商品已删除")
    window.setTimeout(() => setNotice(""), 2200)
  }

  return (
    <>
      <Topbar title="商品库" />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="mx-auto w-full max-w-[1680px] px-5 py-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[26px] font-black tracking-[-0.04em] text-[#171a16]">商品</h1>
              <p className="mt-1.5 text-[12px] text-[#7f867b]">集中管理商品，在创作流程中直接选择和复用。</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative min-w-[230px] flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e958a]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索商品名称、描述或卖点关键词" className="h-10 w-full rounded-xl border border-[#dde0da] bg-[#fafbf9] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#93b33c] focus:bg-white focus:ring-4 focus:ring-[#c9ff29]/15 sm:w-[320px]" />
              </label>
              <button type="button" onClick={() => setCreateMode("images")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#171b16] px-4 text-[12px] font-extrabold text-white hover:bg-black"><Plus size={14} />新增商品</button>
            </div>
          </header>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-b border-[#eceee9] pb-3">
            <div className="flex items-center gap-3">
              <p className="text-[13px] font-extrabold text-[#2d322b]">商品列表 <span className="ml-1 font-semibold text-[#9aa096]">{filteredProducts.length}</span></p>
            </div>
            <p className="text-[11px] text-[#969c93]">默认按更新时间倒序 · 点击商品可编辑</p>
          </div>

          <section className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-x-4 gap-y-6 xl:grid-cols-5 2xl:grid-cols-6">
            <button type="button" onClick={() => setCreateMode("images")} className="group text-left">
              <span className="flex aspect-[1.08/1] items-center justify-center rounded-[16px] border border-dashed border-[#d7dbd3] bg-white transition group-hover:border-[#91b13c] group-hover:bg-[#fbfff2]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f5f0] text-[#3f463b] transition group-hover:bg-[#eaffaa] group-hover:text-[#34470c]"><Plus size={22} /></span>
              </span>
              <span className="mt-2 block text-[12px] font-extrabold text-[#363b34]">新增商品</span>
            </button>

            {filteredProducts.map((product) => (
              <ProductListCard
                key={product.id}
                product={product}
                menuOpen={menuId === product.id}
                onMenu={() => setMenuId((current) => current === product.id ? null : product.id)}
                onEdit={() => { setEditor({ productId: product.id, value: productToForm(product) }); setMenuId(null) }}
                onDelete={() => deleteProduct(product.id)}
              />
            ))}
          </section>

          {filteredProducts.length === 0 ? (
            <div className="mt-10 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dde0da] bg-[#fafbf9] text-center">
              <Search size={24} className="text-[#a2a8a0]" />
              <p className="mt-3 text-[14px] font-black text-[#30352e]">没有找到匹配商品</p>
              <p className="mt-1 text-[12px] text-[#8b9288]">换一个关键词，或新增商品。</p>
            </div>
          ) : null}
        </div>
      </main>

      <ProductCreateDialog key={createMode ?? "create-closed"} open={Boolean(createMode)} defaultTab={createMode ?? "images"} onOpenChange={(nextOpen) => { if (!nextOpen) setCreateMode(null) }} onCreate={createProduct} />
      <ProductEditorDialog key={editor?.productId ?? "edit-closed"} open={Boolean(editor)} mode="edit" initialValue={editor?.value} onOpenChange={(nextOpen) => { if (!nextOpen) setEditor(null) }} onSave={saveProduct} />

      {notice ? <div className="fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#171b16] px-4 py-3 text-[12px] font-extrabold text-white shadow-2xl"><CheckCircle2 size={15} className="text-[#c9ff29]" />{notice}</div> : null}
    </>
  )
}

function ProductListCard({ product, menuOpen, onMenu, onEdit, onDelete }: { product: Product; menuOpen: boolean; onMenu: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="group relative min-w-0">
      <button type="button" onClick={onEdit} className="relative block aspect-[1.08/1] w-full overflow-hidden rounded-[16px] border border-[#dfe2dc] bg-[#f3f4f1] text-left transition group-hover:border-[#bfc5ba] group-hover:shadow-[0_14px_30px_rgba(31,36,28,0.08)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
        <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/20 to-transparent" />
      </button>
      <button type="button" aria-label={`${product.name} 更多操作`} onClick={onMenu} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#42473f] opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 focus:opacity-100"><MoreHorizontal size={15} /></button>
      {menuOpen ? (
        <div className="absolute right-2 top-10 z-20 w-36 rounded-xl border border-[#e0e2dd] bg-white p-1.5 shadow-[0_14px_34px_rgba(24,28,21,0.18)]">
          <button type="button" onClick={onEdit} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-bold text-[#30342f] hover:bg-[#f1f2ef]"><Pencil size={13} />编辑商品</button>
          <button type="button" onClick={onDelete} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-[12px] font-bold text-[#b54b40] hover:bg-[#fff1ef]"><Trash2 size={13} />删除</button>
        </div>
      ) : null}
      <button type="button" onClick={onEdit} className="mt-2 block w-full text-left">
        <span className="block truncate text-[12px] font-extrabold text-[#252a23]">{product.name}</span>
        <span className="mt-0.5 block truncate text-[10.5px] text-[#92988f]">{product.brand || "未填写品牌"}</span>
        <span className="mt-2 block truncate text-[9.5px] font-semibold text-[#a0a69d]">更新于 {formatProductUpdatedAt(product.updatedAt)}</span>
      </button>
    </article>
  )
}

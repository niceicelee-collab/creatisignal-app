"use client"

import { X } from "lucide-react"
import type { Product } from "@/components/products/product-data"

export function SelectedProductTile({ product, onSelect, onRemove }: { product: Product; onSelect: () => void; onRemove: () => void }) {
  return (
    <div className="group relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-xl border border-[#dfe3da] bg-[#f4f5f2] shadow-sm">
      <button type="button" onClick={onSelect} aria-label={`更换商品：${product.name}`} className="absolute inset-0 cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1 pt-4 text-center text-[8px] font-black uppercase tracking-wide text-white">商品</span>
      </button>
      <button type="button" onClick={onRemove} aria-label="移除已选商品" className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-black"><X size={10} strokeWidth={2.8} /></button>
    </div>
  )
}

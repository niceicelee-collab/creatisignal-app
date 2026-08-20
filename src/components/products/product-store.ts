"use client"

import { useEffect, useSyncExternalStore } from "react"
import {
  INITIAL_PRODUCTS,
  type Product,
  type ProductFormValue,
} from "./product-data"

const PRODUCTS_STORAGE_KEY = "creatisignal:product-library:v1"
const RECENT_PRODUCTS_STORAGE_KEY = "creatisignal:recent-products:v1"

let productsState: Product[] = INITIAL_PRODUCTS
let recentProductIdsState: string[] = []
let hydrated = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function getProductsSnapshot() {
  return productsState
}

function getProductsServerSnapshot() {
  return INITIAL_PRODUCTS
}

function getRecentProductIdsSnapshot() {
  return recentProductIdsState
}

const EMPTY_RECENT_PRODUCT_IDS: string[] = []

function getRecentProductIdsServerSnapshot() {
  return EMPTY_RECENT_PRODUCT_IDS
}

function persistProducts() {
  window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(productsState))
}

function persistRecentProductIds() {
  window.localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, JSON.stringify(recentProductIdsState))
}

function hydrateStore() {
  if (hydrated || typeof window === "undefined") return
  hydrated = true

  try {
    const storedProducts = JSON.parse(window.localStorage.getItem(PRODUCTS_STORAGE_KEY) ?? "null")
    if (Array.isArray(storedProducts)) {
      productsState = storedProducts.map((product, index) => ({
        ...product,
        updatedAt: product.updatedAt ?? INITIAL_PRODUCTS[index]?.updatedAt ?? new Date(0).toISOString(),
      }))
    }

    const storedRecentProductIds = JSON.parse(window.localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY) ?? "null")
    if (Array.isArray(storedRecentProductIds)) {
      recentProductIdsState = storedRecentProductIds.filter((id): id is string => typeof id === "string").slice(0, 5)
    }
  } catch {
    productsState = INITIAL_PRODUCTS
    recentProductIdsState = []
  }

  emitChange()
}

export function useProductLibrary() {
  const products = useSyncExternalStore(subscribe, getProductsSnapshot, getProductsServerSnapshot)

  useEffect(() => {
    hydrateStore()
  }, [])

  return {
    products,
    createProduct(value: ProductFormValue) {
      const fallbackImage = value.image || "/replicate-covers/sports-bra.jpg"
      const product: Product = {
        id: `prd_${Date.now()}`,
        status: "active",
        updatedAt: new Date().toISOString(),
        ...value,
        image: fallbackImage,
        media: value.media.length ? value.media : [fallbackImage],
      }
      productsState = [product, ...productsState]
      persistProducts()
      emitChange()
      return product
    },
    updateProduct(productId: string, value: ProductFormValue) {
      productsState = productsState.map((product) => product.id === productId
        ? { ...product, ...value, updatedAt: new Date().toISOString() }
        : product)
      persistProducts()
      emitChange()
    },
    deleteProduct(productId: string) {
      productsState = productsState.filter((product) => product.id !== productId)
      recentProductIdsState = recentProductIdsState.filter((id) => id !== productId)
      persistProducts()
      persistRecentProductIds()
      emitChange()
    },
  }
}

export function useRecentProductIds() {
  const recentProductIds = useSyncExternalStore(subscribe, getRecentProductIdsSnapshot, getRecentProductIdsServerSnapshot)

  useEffect(() => {
    hydrateStore()
  }, [])

  return {
    recentProductIds,
    markProductUsed(productId: string) {
      recentProductIdsState = [productId, ...recentProductIdsState.filter((id) => id !== productId)].slice(0, 5)
      persistRecentProductIds()
      emitChange()
    },
  }
}

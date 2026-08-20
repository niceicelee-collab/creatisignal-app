export type ProductStatus = "active" | "review" | "draft"

export type Product = {
  id: string
  name: string
  brand: string
  category: string
  description: string
  sellingPoints: string[]
  audiences: string[]
  scenarios: string[]
  image: string
  media: string[]
  status: ProductStatus
  updatedAt: string
  sourceUrl?: string
}

export type ProductFormValue = Omit<Product, "id" | "status" | "updatedAt">

export const EMPTY_PRODUCT_FORM: ProductFormValue = {
  name: "",
  brand: "",
  category: "",
  description: "",
  sellingPoints: [],
  audiences: [],
  scenarios: [],
  image: "",
  media: [],
  sourceUrl: "",
}

export const RECOGNIZED_PRODUCT_FORM: ProductFormValue = {
  name: "FlexForm High-Support Sports Bra",
  brand: "FlexForm",
  category: "Women's Activewear",
  description:
    "A high-support sports bra designed for running, HIIT and strength training. Wide straps distribute pressure, while a stable underband and breathable stretch fabric keep movement secure and unrestricted.",
  sellingPoints: [
    "Wide straps distribute shoulder pressure",
    "Stable underband reduces bounce",
    "Breathable stretch fabric moves with the body",
  ],
  audiences: ["Women aged 20–40", "Runners and HIIT enthusiasts"],
  scenarios: ["Running", "HIIT", "Strength training"],
  image: "/replicate-covers/sports-bra.jpg",
  media: ["/replicate-covers/sports-bra.jpg"],
  sourceUrl: "https://shop.tiktok.com/view/product/1729584650001",
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prd_01",
    name: "FlexForm High-Support Sports Bra",
    brand: "FlexForm",
    category: "Women's Activewear",
    description: RECOGNIZED_PRODUCT_FORM.description,
    sellingPoints: RECOGNIZED_PRODUCT_FORM.sellingPoints,
    audiences: RECOGNIZED_PRODUCT_FORM.audiences,
    scenarios: RECOGNIZED_PRODUCT_FORM.scenarios,
    image: "/replicate-covers/sports-bra.jpg",
    media: ["/replicate-covers/sports-bra.jpg"],
    status: "active",
    updatedAt: "2026-08-17T04:20:00.000Z",
    sourceUrl: RECOGNIZED_PRODUCT_FORM.sourceUrl,
  },
  {
    id: "prd_02",
    name: "LumaBlend Portable Blender",
    brand: "LumaBlend",
    category: "Kitchen Appliances",
    description: "A cordless personal blender for smoothies, protein shakes and quick drinks at home or on the go.",
    sellingPoints: ["Cordless design", "Travel-friendly", "Easy-clean cup"],
    audiences: ["Busy professionals", "Fitness enthusiasts"],
    scenarios: ["Office", "Gym", "Travel"],
    image: "/replicate-covers/portable-blender.jpg",
    media: ["/replicate-covers/portable-blender.jpg"],
    status: "active",
    updatedAt: "2026-08-16T09:15:00.000Z",
  },
  {
    id: "prd_03",
    name: "AeroKnit Everyday Cardigan",
    brand: "AeroKnit",
    category: "Women's Knitwear",
    description: "A lightweight knit cardigan with a relaxed silhouette for effortless layering across seasons.",
    sellingPoints: ["Soft-touch knit", "Easy layering", "Relaxed fit"],
    audiences: ["Women 25–45", "Minimal-style shoppers"],
    scenarios: ["Work", "Weekend", "Travel"],
    image: "/replicate-covers/knit-cardigan.jpg",
    media: ["/replicate-covers/knit-cardigan.jpg"],
    status: "active",
    updatedAt: "2026-08-15T07:40:00.000Z",
  },
  {
    id: "prd_04",
    name: "TrailCore Utility Cargo Shorts",
    brand: "TrailCore",
    category: "Men's Outdoor Apparel",
    description: "Durable utility shorts with practical storage and an outdoor-ready silhouette.",
    sellingPoints: ["Multi-pocket storage", "Outdoor-ready", "Flexible fit"],
    audiences: ["Outdoor explorers", "Urban commuters"],
    scenarios: ["Hiking", "Camping", "Daily commute"],
    image: "/replicate-covers/cargo-shorts.jpg",
    media: ["/replicate-covers/cargo-shorts.jpg"],
    status: "active",
    updatedAt: "2026-08-14T11:25:00.000Z",
  },
  {
    id: "prd_05",
    name: "FormLab Studio Training Jacket",
    brand: "FormLab",
    category: "Unisex Activewear",
    description: "A structured black training jacket built for warm-ups, commutes and lightweight outdoor sessions.",
    sellingPoints: ["Streamlined fit", "Layer-ready", "Minimal black finish"],
    audiences: ["Gym members", "Urban athletes"],
    scenarios: ["Warm-up", "Commute", "Outdoor workout"],
    image: "/replicate-covers/black-training-jacket.png",
    media: ["/replicate-covers/black-training-jacket.png"],
    status: "active",
    updatedAt: "2026-08-13T06:05:00.000Z",
  },
  {
    id: "prd_06",
    name: "Glow Theory Everyday Beauty Set",
    brand: "Glow Theory",
    category: "Beauty & Personal Care",
    description: "An everyday makeup edit combining wearable shades with an easy, gift-ready presentation.",
    sellingPoints: ["Everyday shades", "Gift-ready set", "Compact edit"],
    audiences: ["Beauty beginners", "Gift shoppers"],
    scenarios: ["Daily makeup", "Travel", "Gifting"],
    image: "/replicate-covers/beauty-makeup.jpg",
    media: ["/replicate-covers/beauty-makeup.jpg"],
    status: "review",
    updatedAt: "2026-08-12T03:35:00.000Z",
  },
  {
    id: "prd_07",
    name: "Ivory Atelier Column Wedding Dress",
    brand: "Ivory Atelier",
    category: "Bridal Dresses",
    description: "A refined white column wedding dress with a clean neckline and softly draped silhouette.",
    sellingPoints: ["Refined silhouette", "Clean neckline", "Modern bridal look"],
    audiences: ["Modern brides", "Minimalist wedding shoppers"],
    scenarios: ["Ceremony", "Reception", "Bridal editorial"],
    image: "/creative-assets/wedding-dress-cover.png",
    media: ["/creative-assets/wedding-dress-cover.png"],
    status: "draft",
    updatedAt: "2026-08-11T10:10:00.000Z",
  },
]

export function productToForm(product: Product): ProductFormValue {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    sellingPoints: product.sellingPoints,
    audiences: product.audiences,
    scenarios: product.scenarios,
    image: product.image,
    media: product.media,
    sourceUrl: product.sourceUrl,
  }
}

export function formatProductUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(updatedAt))
}

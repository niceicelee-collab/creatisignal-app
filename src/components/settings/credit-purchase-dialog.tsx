"use client"

import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, Coins, Mail, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

type CreditPackage = {
  id: string
  name: string
  price: string
  purchaseCredits: string
  bonusRate: string
  bonusAmount: string
  bonusCredits: string
  totalCredits: string
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "trial",
    name: "尝鲜体验包",
    price: "¥1,000",
    purchaseCredits: "11,030",
    bonusRate: "2%",
    bonusAmount: "¥20",
    bonusCredits: "220",
    totalCredits: "11,250",
  },
  {
    id: "starter",
    name: "初级试验包",
    price: "¥5,000",
    purchaseCredits: "55,160",
    bonusRate: "2%",
    bonusAmount: "¥100",
    bonusCredits: "1,100",
    totalCredits: "56,260",
  },
  {
    id: "monthly",
    name: "月度制作包",
    price: "¥20,000",
    purchaseCredits: "220,650",
    bonusRate: "3%",
    bonusAmount: "¥600",
    bonusCredits: "6,620",
    totalCredits: "227,270",
  },
  {
    id: "scale",
    name: "稳定量产包",
    price: "¥50,000",
    purchaseCredits: "551,630",
    bonusRate: "4%",
    bonusAmount: "¥2,000",
    bonusCredits: "22,060",
    totalCredits: "573,690",
  },
  {
    id: "matrix",
    name: "矩阵生产包",
    price: "¥100,000",
    purchaseCredits: "1,103,260",
    bonusRate: "5%",
    bonusAmount: "¥5,000",
    bonusCredits: "55,160",
    totalCredits: "1,158,420",
  },
  {
    id: "enterprise",
    name: "企业框架包",
    price: "¥200,000 起",
    purchaseCredits: "2,206,530",
    bonusRate: "5%",
    bonusAmount: "最高 5%",
    bonusCredits: "110,320",
    totalCredits: "2,316,850",
  },
]

export function CreditPurchaseDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedId, setSelectedId] = useState(CREDIT_PACKAGES[0].id)
  const selectedPackage = CREDIT_PACKAGES.find((item) => item.id === selectedId) ?? CREDIT_PACKAGES[0]

  const purchaseHref = useMemo(() => {
    const subject = encodeURIComponent(`购买积分｜${selectedPackage.name}`)
    const body = encodeURIComponent(
      `你好，我希望购买 CreatiSignal ${selectedPackage.name}。\n\n实付金额：${selectedPackage.price}\n到账积分：${selectedPackage.totalCredits}\n\n请联系我完成开通。`
    )
    return `mailto:billing@creatisignal.com?subject=${subject}&body=${body}`
  }, [selectedPackage])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#09090b]/45 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] flex max-h-[calc(100vh-32px)] w-[min(1040px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#f7f7f5] shadow-[0_30px_90px_rgba(9,9,11,0.28)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <header className="flex items-start justify-between gap-5 border-b border-[var(--line)] bg-white px-6 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--lime)] text-[#18181b] shadow-[0_8px_22px_rgba(169,214,31,0.24)]">
                <Coins size={19} strokeWidth={2.4} />
              </span>
              <div>
                <Dialog.Title className="text-[20px] font-extrabold leading-tight tracking-tight text-[var(--text)]">
                  购买积分
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  选择适合当前创作规模的积分包，确认套餐后联系购买。
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close
              aria-label="关闭积分购买"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--text)]"
            >
              <X size={16} />
            </Dialog.Close>
          </header>

          <div className="overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="积分套餐">
              {CREDIT_PACKAGES.map((item) => {
                const selected = item.id === selectedId
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "group relative min-h-[196px] cursor-pointer overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all",
                      selected
                        ? "border-[#a8cf2e] shadow-[0_10px_30px_rgba(87,105,25,0.12)] ring-1 ring-[#c9ff29]"
                        : "border-[var(--line)] hover:-translate-y-0.5 hover:border-[#c9ced6] hover:shadow-[0_10px_24px_rgba(9,9,11,0.07)]"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                        selected
                          ? "border-[#18181b] bg-[#18181b] text-white"
                          : "border-[#d4d4d8] bg-white text-transparent"
                      )}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>

                    <div className="pr-8">
                      <p className="text-[13px] font-extrabold text-[var(--text)]">{item.name}</p>
                      <p className="mt-2 text-[24px] font-extrabold leading-none tracking-tight text-[var(--text)]">
                        {item.price}
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl bg-[#f5f6f2] px-3 py-2.5">
                      <div className="flex items-end justify-between gap-3">
                        <span className="text-[11px] font-bold text-[var(--muted)]">到账积分</span>
                        <span className="text-[19px] font-extrabold leading-none tabular-nums text-[var(--text)]">
                          {item.totalCredits}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                      <PackageDetail label="购买积分" value={item.purchaseCredits} />
                      <PackageDetail label="赠送比例" value={item.bonusRate} accent />
                      <PackageDetail label="赠送金额" value={item.bonusAmount} />
                      <PackageDetail label="赠送积分" value={`+${item.bonusCredits}`} accent />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#d9e7a8] bg-[#f6ffda] px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#667d18] shadow-sm">
                  <Sparkles size={16} strokeWidth={2.3} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#718029]">已选择 {selectedPackage.name}</p>
                  <p className="mt-0.5 text-[13px] font-extrabold text-[#242721]">
                    {selectedPackage.price}
                    <span className="mx-2 font-medium text-[#a1ac72]">·</span>
                    到账 {selectedPackage.totalCredits} 积分
                  </p>
                </div>
              </div>
              <a
                href={purchaseHref}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#18181b] px-5 text-[12.5px] font-extrabold text-white transition-opacity hover:opacity-90"
              >
                <Mail size={14} strokeWidth={2.3} />
                联系购买
              </a>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-[var(--line-strong)] bg-white px-4 py-3 text-[11px] leading-relaxed text-[var(--muted)]">
              <p className="font-bold text-[var(--text)]">企业框架包积分折算</p>
              <p className="mt-1">购买积分 = 实付金额 ÷ 0.9064 × 10；赠送积分 = 赠送金额 ÷ 0.9064 × 10；到账积分 = 购买积分 + 赠送积分。</p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PackageDetail({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={cn("font-extrabold tabular-nums text-[var(--text)]", accent && "text-[#627d0a]")}>{value}</span>
    </div>
  )
}

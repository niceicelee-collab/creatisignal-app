"use client"

import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react"
import { Clock3, Coins, Mail, Play, Sparkles } from "lucide-react"

type PriceTier = {
  minCredits: number
  pricePerSecond: number
  creditsPerYuan: number
}

type CreditQuote = {
  credits: number
  amount: number
  creditsPerYuan: number
  seconds: number
  videos: number
}

const MIN_CREDITS = 1000
const MAX_CREDITS = 100000
const CREDIT_STEP = 1000
const DEFAULT_CREDITS = 1000

const PRICE_TIERS: PriceTier[] = [
  { minCredits: 1000, pricePerSecond: 0.9064, creditsPerYuan: 11.03 },
  { minCredits: 5000, pricePerSecond: 0.8961, creditsPerYuan: 11.16 },
  { minCredits: 10000, pricePerSecond: 0.8858, creditsPerYuan: 11.29 },
  { minCredits: 30000, pricePerSecond: 0.8755, creditsPerYuan: 11.42 },
  { minCredits: 50000, pricePerSecond: 0.8652, creditsPerYuan: 11.56 },
  { minCredits: 70000, pricePerSecond: 0.8549, creditsPerYuan: 11.7 },
  { minCredits: 90000, pricePerSecond: 0.8446, creditsPerYuan: 11.84 },
]

const numberFormatter = new Intl.NumberFormat("zh-CN")
const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
const estimateFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

function getPriceTier(credits: number) {
  return PRICE_TIERS.reduce(
    (currentTier, tier) => (credits >= tier.minCredits ? tier : currentTier),
    PRICE_TIERS[0]
  )
}

function calculateQuote(credits: number): CreditQuote {
  const tier = getPriceTier(credits)
  const seconds = credits / 10

  return {
    credits,
    amount: seconds * tier.pricePerSecond,
    creditsPerYuan: tier.creditsPerYuan,
    seconds,
    videos: seconds / 15,
  }
}

function formatCurrency(value: number) {
  return `¥${currencyFormatter.format(value)}`
}

export function CreditPurchasePanel() {
  const [credits, setCredits] = useState(DEFAULT_CREDITS)
  const quote = useMemo(() => calculateQuote(credits), [credits])
  const progress = (credits - MIN_CREDITS) / (MAX_CREDITS - MIN_CREDITS)

  const purchaseHref = useMemo(() => {
    const subject = encodeURIComponent(`积分充值｜${numberFormatter.format(quote.credits)} 积分`)
    const body = encodeURIComponent(
      [
        "你好，我希望充值 CreatiSignal 积分。",
        "",
        `购买积分：${numberFormatter.format(quote.credits)}`,
        `实付金额：${formatCurrency(quote.amount)}`,
        `每元获得积分：${quote.creditsPerYuan.toFixed(2)}`,
        `预计可用时长：${numberFormatter.format(quote.seconds)} 秒`,
        `约可生成 15s 视频：${estimateFormatter.format(quote.videos)} 条`,
      ].join("\n")
    )

    return `mailto:billing@creatisignal.com?subject=${subject}&body=${body}`
  }, [quote])

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#151515] text-white shadow-[0_28px_80px_rgba(20,26,12,0.18)]">
      <div className="px-6 pt-6 sm:px-8 sm:pt-8">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#b9ff36]" size={18} strokeWidth={2.4} />
            <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">购买加量包积分</h2>
          </div>
          <p className="mt-1.5 text-[11.5px] text-white/45">拖动选择积分数量，价格随当前积分梯度自动计算。</p>
        </div>
      </div>

      <div className="grid gap-8 px-5 py-7 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(330px,.95fr)] lg:items-center lg:gap-12">
        <CreditGauge credits={credits} progress={progress} onChange={setCredits} creditsPerYuan={quote.creditsPerYuan} />

        <div className="flex min-h-[330px] flex-col">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">本次实付金额</p>
          <strong className="mt-2 text-[48px] font-extrabold leading-none tracking-[-0.05em] tabular-nums sm:text-[56px]">
            {formatCurrency(quote.amount)}
          </strong>

          <div className="my-6 h-px bg-white/10" />

          <p className="text-[15px] font-extrabold">预计可创作</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <EstimateItem
              icon={Clock3}
              value={`${numberFormatter.format(quote.seconds)}s`}
              label="预估秒数"
            />
            <EstimateItem
              icon={Play}
              value={estimateFormatter.format(quote.videos)}
              label="预估 15s 视频条数"
            />
          </div>

          <p className="mt-5 text-[12px] leading-5 text-white/45">
            预计秒数与视频条数以 Seedance 2.0-720P 为例，实际消耗以生成参数为准。
          </p>

          <a
            href={purchaseHref}
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[13px] font-extrabold text-[#171717] transition hover:bg-[#eaffb4]"
          >
            <Mail size={15} strokeWidth={2.3} />
            立即充值
          </a>
        </div>
      </div>

      <div className="mx-5 border-t border-white/10 px-3 py-5 text-center text-[12px] text-white/50 sm:mx-8">
        加量积分永不过期，加量包购买后不支持退款。
      </div>
    </section>
  )
}

function CreditGauge({
  credits,
  progress,
  onChange,
  creditsPerYuan,
}: {
  credits: number
  progress: number
  onChange: (credits: number) => void
  creditsPerYuan: number
}) {
  const arcProgress = progress * 100
  const knobAngle = Math.PI - progress * Math.PI
  const knobX = 180 + 128 * Math.cos(knobAngle)
  const knobY = 160 - 128 * Math.sin(knobAngle)
  const knobRotation = progress * 180
  const ticks = Array.from({ length: 11 }, (_, index) => {
    const angle = Math.PI - (index / 10) * Math.PI
    return {
      x: 180 + 128 * Math.cos(angle),
      y: 160 - 128 * Math.sin(angle),
    }
  })
  const updateCreditsFromPointer = (event: ReactPointerEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return

    const bounds = svg.getBoundingClientRect()
    const arcStart = bounds.left + bounds.width * (52 / 360)
    const arcWidth = bounds.width * ((308 - 52) / 360)
    const pointerProgress = Math.min(1, Math.max(0, (event.clientX - arcStart) / arcWidth))
    const steppedCredits =
      MIN_CREDITS +
      Math.round((pointerProgress * (MAX_CREDITS - MIN_CREDITS)) / CREDIT_STEP) * CREDIT_STEP

    onChange(steppedCredits)
  }

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="relative aspect-[2/1.18]">
        <svg
          viewBox="0 0 360 212"
          role="img"
          aria-label={`已选择 ${numberFormatter.format(credits)} 积分`}
          className="h-full w-full overflow-visible"
        >
          <path
            d="M 52 160 A 128 128 0 0 1 308 160"
            pathLength="100"
            fill="none"
            stroke="#282828"
            strokeLinecap="round"
            strokeWidth="30"
          />
          <path
            d="M 52 160 A 128 128 0 0 1 308 160"
            pathLength="100"
            fill="none"
            stroke="#a8eb2d"
            strokeDasharray={`${arcProgress} 100`}
            strokeLinecap="butt"
            strokeWidth="28"
          />
          {progress > 0 && <circle cx="52" cy="160" r="14" fill="#a8eb2d" />}
          {ticks.map((tick, index) => (
            <circle
              key={index}
              cx={tick.x}
              cy={tick.y}
              r="3.4"
              fill={index / 10 <= progress ? "#f1ffd0" : "#717171"}
            />
          ))}
          <g
            className="cursor-ew-resize touch-none"
            transform={`translate(${knobX} ${knobY}) rotate(${knobRotation})`}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              updateCreditsFromPointer(event)
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                updateCreditsFromPointer(event)
              }
            }}
          >
            <rect x="-23" y="-17" width="46" height="34" rx="12" fill="transparent" />
            <rect x="-18" y="-7" width="36" height="14" rx="5" fill="#f7f7f7" stroke="#d7d9dd" strokeWidth="1" />
            <rect x="-2" y="-4" width="4" height="8" rx="2" fill="#c7c9cd" />
          </g>
        </svg>

        <input
          type="range"
          min={MIN_CREDITS}
          max={MAX_CREDITS}
          step={CREDIT_STEP}
          value={credits}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="选择积分数量"
          className="sr-only"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-[8%] text-center">
          <output className="block text-[42px] font-extrabold leading-none tracking-[-0.04em] text-[#b9ff36] tabular-nums sm:text-[52px]">
            {numberFormatter.format(credits)}
          </output>
          <span className="mt-1 block text-[12px] font-bold text-white/45">积分</span>
        </div>
      </div>

      <div className="-mt-2 flex items-center justify-between px-[12%] text-[10.5px] font-bold text-white/35">
        <span>{numberFormatter.format(MIN_CREDITS)}</span>
        <span>{numberFormatter.format(MAX_CREDITS)}</span>
      </div>

      <div className="mt-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9ff36]/20 bg-[#b9ff36]/10 px-4 py-2 text-[13px] font-extrabold text-[#b9ff36]">
          <Coins size={14} strokeWidth={2.4} />
          ¥1 = {creditsPerYuan.toFixed(2)} 积分
        </span>
        <p className="mt-3 text-[12.5px] text-white/45">拖动弧形滑杆选择积分数量</p>
      </div>
    </div>
  )
}

function EstimateItem({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Clock3
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3.5">
      <div className="flex items-center gap-2 text-white/35">
        <Icon size={14} strokeWidth={2.2} />
        <span className="text-[12px] font-bold">{label}</span>
      </div>
      <strong className="mt-2 block text-[21px] font-extrabold tabular-nums">{value}</strong>
    </div>
  )
}

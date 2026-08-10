"use client"

import Link from "next/link"
import { useState } from "react"
import { Coins, ScrollText, Sparkles } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { cn } from "@/lib/utils"

type LedgerFilter = "全部" | "消耗" | "获得"
type LedgerDirection = "获得" | "消耗"
type LedgerEntry = {
  id: string
  title: string
  detail?: string
  direction: LedgerDirection
  time: string
  delta: number
}

const BALANCE = {
  gift: 200,
  subscription: 0,
  recharge: 0,
}

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: "l0",
    title: "\u52a0\u91cf\u5305\u5145\u503c\u5230\u8d26",
    detail: "\u6708\u5ea6\u5236\u4f5c\u5305 \u00b7 \u8d2d\u4e70\u79ef\u5206 220,650 + \u8d60\u9001\u79ef\u5206 6,620",
    direction: "\u83b7\u5f97",
    time: "2026-07-09 10:16",
    delta: 227270,
  },
  { id: "l1", title: "每日刷新", direction: "获得", time: "2026-07-09 00:00", delta: 200 },
  { id: "l2", title: "到期清零", direction: "消耗", time: "2026-07-08 23:59", delta: -200 },
  { id: "l3", title: "生成视频", direction: "消耗", time: "2026-07-08 18:20", delta: -135 },
  { id: "l3b", title: "创意克隆", direction: "消耗", time: "2026-07-08 18:12", delta: -80 },
  { id: "l4", title: "生成失败退回", direction: "获得", time: "2026-07-08 18:18", delta: 135 },
  { id: "l5", title: "新注册用户赠送", direction: "获得", time: "2026-07-07 17:14", delta: 400 },
  { id: "l6", title: "一次性赠送", direction: "获得", time: "2026-07-06 10:00", delta: 1000 },
  { id: "l7", title: "到期清零", direction: "消耗", time: "2026-06-12 23:59", delta: -200 },
  { id: "l8", title: "每日刷新", direction: "获得", time: "2026-06-12 00:00", delta: 200 },
]

const LEDGER_FILTERS: LedgerFilter[] = ["全部", "消耗", "获得"]

function formatCredits(value: number) {
  return Math.abs(value).toLocaleString("zh-CN")
}


export default function CreditsPage() {
  const [activeFilter, setActiveFilter] = useState<LedgerFilter>("全部")

  const remainingCredits = BALANCE.gift + BALANCE.subscription + BALANCE.recharge
  const filteredLedger = INITIAL_LEDGER.filter((item) => {
    if (activeFilter === "全部") return true
    return item.direction === activeFilter
  })

  return (
    <>
      <Topbar title="积分" />
      <SettingsShell title="积分" subtitle="查看积分余额、购买充值积分与最近一个月的积分明细。">
        <SettingsCard
          icon={Sparkles}
          title="积分余额"
          allowOverflow
          actions={
            <Link
              href="/settings/credits/purchase"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--lime)] px-4 text-[12px] font-extrabold text-[#18181b] shadow-[0_8px_22px_rgba(169,214,31,0.2)] transition-transform hover:-translate-y-0.5"
            >
              <Coins size={13} strokeWidth={2.4} />
              加量包
            </Link>
          }
        >
          <div className="grid grid-cols-[max-content_minmax(48px,1fr)_max-content_minmax(48px,1fr)_max-content_minmax(48px,1fr)_max-content] items-start gap-0 overflow-visible pb-1">
            <BalanceFigure label="剩余积分" value={remainingCredits} strong />
            <FormulaSign label="=" />
            <BalanceFigure
              label="赠送积分"
              value={BALANCE.gift}
              hint={"默认每日赠送200积分，完成企业认证后，每日赠送800积分\n完成广告账户授权，每日额外赠送200积分"}
            />
            <FormulaSign label="+" />
            <BalanceFigure label="订阅积分" value={BALANCE.subscription} />
            <FormulaSign label="+" />
            <BalanceFigure label="充值积分" value={BALANCE.recharge} />
          </div>
        </SettingsCard>


        <SettingsCard icon={ScrollText} title="积分流水" noPad>
          <div className="px-5 pt-4">
            <div className="grid grid-cols-3 overflow-hidden rounded-lg bg-[var(--soft)] text-[12.5px] font-bold text-[var(--text)]">
              {LEDGER_FILTERS.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "h-10 cursor-pointer border-[var(--line)] transition-colors",
                    index > 0 && "border-l",
                    activeFilter === filter ? "bg-white shadow-sm" : "hover:bg-white/70"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-4">
            <ul className="divide-y divide-transparent">
              {filteredLedger.map((item) => (
                <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-[var(--text)] leading-tight">{item.title}</p>
                    {item.detail && (
                      <p className="mt-1 text-[12px] font-medium text-[#4b5563]">{item.detail}</p>
                    )}
                    <p className="mt-1 text-[12px] font-medium text-[#8b98a9] tabular-nums">{item.time}</p>
                  </div>
                  <p
                    className={cn(
                      "text-[16px] font-semibold tabular-nums",
                      item.delta > 0 ? "text-[#008fbe]" : "text-[var(--text)]"
                    )}
                  >
                    {item.delta > 0 ? "+" : "-"}{formatCredits(item.delta)}
                  </p>
                </li>
              ))}
            </ul>
            {filteredLedger.length === 0 && (
              <p className="py-8 text-center text-[12px] text-[var(--muted)]">暂无流水</p>
            )}
            <p className="pt-5 text-center text-[12px] font-medium text-[#a6b0bd]">仅展示近一个月流水明细</p>
          </div>
        </SettingsCard>
      </SettingsShell>
    </>
  )
}

function BalanceFigure({
  label,
  value,
  strong,
  hint,
}: {
  label: string
  value: number
  strong?: boolean
  hint?: string
}) {
  return (
    <div className="w-max min-w-0">
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#4b5563]">
        <span>{label}</span>
        {hint && (
          <span className="group relative z-30 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-[#d5dde8] bg-white text-[10px] font-bold leading-none text-[#8da0b4]">
            i
            <span className="pointer-events-none absolute left-1/2 top-5 z-50 hidden w-[360px] -translate-x-1/2 whitespace-pre-line rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-left text-[12px] font-medium leading-relaxed text-[#4b5563] shadow-[0_12px_28px_rgba(9,9,11,0.14)] group-hover:block">
              {hint}
            </span>
          </span>
        )}
      </div>
      <p className={cn("mt-2 text-[22px] leading-none tabular-nums text-[var(--text)]", strong ? "font-extrabold" : "font-bold")}>
        {formatCredits(value)}
      </p>
    </div>
  )
}

function FormulaSign({ label }: { label: "=" | "+" }) {
  return <span className="inline-flex h-[18px] w-full items-center justify-center text-[16px] font-bold leading-none text-[#a6b0bd]">{label}</span>
}

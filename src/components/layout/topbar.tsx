"use client"

import Link from "next/link"
import { Bell, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import { DataSourceSwitcher } from "./data-source-switcher"

interface TopbarProps {
  title: string
  /** 显示右侧操作区（积分 / Bell / 数据源切换）。默认 true。 */
  showActions?: boolean
  /** 是否显示底部分割线。默认 true。 */
  bordered?: boolean
}

export function Topbar({ title, showActions = true, bordered = true }: TopbarProps) {
  return (
    <header
      className={cn(
        "h-12 flex items-center justify-between px-6 bg-white text-[#1f2228] text-sm font-medium shrink-0",
        bordered && "border-b border-[var(--line)]"
      )}
    >
      <div>{title}</div>
      {showActions && (
        <div className="flex items-center gap-[14px] text-[#9498a2] text-xs font-medium">
          <Link
            href="/settings/credits"
            aria-label="剩余积分 200，查看积分余额"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#d9e7a8] bg-[#f5ffd8] px-3 text-[#536b19] shadow-[0_6px_16px_rgba(111,143,33,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#b7d75d] hover:bg-[#efffc4]"
          >
            <Coins size={13} strokeWidth={2.4} />
            <strong className="text-[12px] font-extrabold tabular-nums text-[#273116]">200</strong>
            <span className="text-[10.5px] font-bold">积分</span>
          </Link>
          <Bell size={15} strokeWidth={2} />
          <DataSourceSwitcher />
        </div>
      )}
    </header>
  )
}

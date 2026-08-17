"use client"

import { useMemo, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Film,
  FolderKanban,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { BETA_PROJECTS, STATUS_META, type BetaProject, type BetaProjectStatus } from "@/lib/replicate/beta-mock"
import {
  getBetaProjectName,
  getBetaProjectNamesServerSnapshot,
  getBetaProjectNamesSnapshot,
  saveBetaProjectName,
  subscribeBetaProjectNames,
} from "@/lib/replicate/beta-project-names"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "in_progress" | BetaProjectStatus
const PAGE_SIZE = 12

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "draft", label: "选择素材" },
  { id: "breaking_down", label: "爆款拆解" },
  { id: "product_pending", label: "商品信息确认" },
  { id: "script_pending", label: "脚本转写" },
  { id: "rendering", label: "视频生成中" },
  { id: "completed", label: "生成已完成" },
  { id: "failed", label: "失败" },
]

export function ReplicateBetaHub() {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [projects, setProjects] = useState(BETA_PROJECTS)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [createdDate, setCreatedDate] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const projectNamesSnapshot = useSyncExternalStore(
    subscribeBetaProjectNames,
    getBetaProjectNamesSnapshot,
    getBetaProjectNamesServerSnapshot,
  )
  const namedProjects = useMemo(() => projects.map((project) => ({
      ...project,
      title: getBetaProjectName(project.id, projectNamesSnapshot) ?? project.title,
    })), [projectNamesSnapshot, projects])

  function openDatePicker() {
    const input = dateInputRef.current
    if (!input) return

    input.focus()
    if (typeof input.showPicker === "function") {
      input.showPicker()
    } else {
      input.click()
    }
  }

  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return namedProjects.filter((project) => {
      const statusMatches = filter === "all"
        || (filter === "in_progress" && !["completed", "failed"].includes(project.status))
        || project.status === filter
      const queryMatches = !normalized
        || `${project.title} ${project.product}`.toLowerCase().includes(normalized)
      const createdMatches = !createdDate || project.createdAt === createdDate
      return statusMatches && createdMatches && queryMatches
    })
  }, [createdDate, filter, namedProjects, query])

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const paginatedProjects = visibleProjects.slice(pageStart, pageStart + PAGE_SIZE)

  function createProject(title: string) {
    setCreateOpen(false)
    router.push(`/replicate/beta-new?title=${encodeURIComponent(title)}`)
  }

  function duplicateProject(project: BetaProject) {
    setPage(1)
    setProjects((current) => [{
      ...project,
      id: `beta-copy-${Date.now()}`,
      title: `${project.title} · 副本`,
      status: "draft",
      createdAt: "2026-07-24",
      updatedAt: "刚刚",
    }, ...current])
  }

  function deleteProject(id: string) {
    setProjects((current) => current.filter((project) => project.id !== id))
  }

  function renameProject(id: string, title: string) {
    saveBetaProjectName(id, title)
  }

  return (
    <main className="min-w-0 flex-1 overflow-y-auto bg-white">
      <div className="mx-auto w-full min-w-0 max-w-[1420px] px-4 py-7 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#efffc4] text-[#516a12]">
                <Sparkles size={18} />
              </span>
              <h1 className="text-[24px] font-extrabold text-[#17181c]">高保真复刻</h1>
              <span className="rounded bg-[#f1f2f4] px-2 py-1 text-[10px] font-bold text-[#62666f]">Beta</span>
            </div>
            <p className="text-[13px] text-[#858992]">从已验证的爆款素材结构出发，上传新商品、重新生成脚本后生成新的广告视频。</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#17181c] px-4 text-[13px] font-extrabold text-white hover:bg-[#303238]"
          >
            <Plus size={15} strokeWidth={2.5} />
            新建复刻项目
          </button>
        </header>

        <section className="grid gap-4 border-b border-[var(--line)] py-6 md:grid-cols-3" aria-label="复刻流程">
          <FlowSummary icon={<Film size={17} />} number="01" title="拆解爆款结构" detail="识别爆款创意策略、叙事结构、分镜画面、情绪曲线和文案口播" />
          <FlowSummary icon={<FolderKanban size={17} />} number="02" title="替换商品与人物" detail="上传/选择新商品信息和数字人，保留原爆款结构" />
          <FlowSummary icon={<Sparkles size={17} />} number="03" title="生成脚本与视频" detail="调整/确认新的脚本分镜、配置生成参数并提交生成任务" />
        </section>

        <section className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-extrabold text-[#202229]">最近项目</h2>
              <p className="mt-1 text-[11px] text-[#9699a1]">点击项目可从上次状态继续。</p>
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <span className="shrink-0 text-[12px] font-bold text-[#666a72]">创建日期</span>
                <div className="relative h-9 min-w-0 flex-1 rounded-md border border-[var(--line)] bg-white focus-within:border-[#9aa36d] sm:w-[166px] sm:flex-none">
                  <button
                    type="button"
                    onClick={openDatePicker}
                    aria-label="选择创建日期"
                    className="flex h-full w-full items-center gap-2 rounded-md px-3 pr-9 text-left text-[12px] font-bold text-[#555961]"
                  >
                    <CalendarDays size={14} className="shrink-0 text-[#9a9da5]" />
                    <span className="truncate">{createdDate || "全部日期"}</span>
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={createdDate}
                    onChange={(event) => {
                      setCreatedDate(event.currentTarget.value)
                      setPage(1)
                    }}
                    aria-label="按创建日期筛选"
                    className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
                  />
                  {createdDate && (
                    <button
                      type="button"
                      onClick={() => {
                        setCreatedDate("")
                        setPage(1)
                      }}
                      aria-label="清除创建日期"
                      className="absolute right-1.5 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[#8e929a] hover:bg-[#f1f2f4] hover:text-[#33363d]"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
              <label className="relative w-full sm:w-auto">
                <span className="sr-only">搜索项目</span>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9da5]" />
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setPage(1)
                  }}
                  placeholder="搜索项目名称或商品名称"
                  className="h-9 w-full rounded-md border border-[var(--line)] bg-white pl-9 pr-3 text-[12px] outline-none focus:border-[#9aa36d] sm:w-[230px]"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex max-w-full gap-1 overflow-x-auto border-b border-[var(--line)]">
            {FILTERS.map((item) => {
              const active = filter === item.id
              const count = item.id === "all"
                ? projects.length
                : projects.filter((project) => project.status === item.id).length
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFilter(item.id)
                    setPage(1)
                  }}
                  className={cn(
                    "relative h-10 shrink-0 px-3 text-[12px] font-bold transition-colors",
                    active ? "text-[#17181c]" : "text-[#8a8e97] hover:text-[#4b4f57]",
                  )}
                >
                  {item.label}
                  {count > 0 && <span className="ml-1.5 text-[10px] text-[#a0a3aa]">{count}</span>}
                  {active && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[#17181c]" />}
                </button>
              )
            })}
          </div>

          {visibleProjects.length > 0 ? (
            <>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDuplicate={() => duplicateProject(project)}
                    onDelete={() => deleteProject(project.id)}
                    onRename={(title) => renameProject(project.id, title)}
                  />
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
                <p className="text-[11px] text-[#8a8e97]">
                  第 {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, visibleProjects.length)} 条，共 {visibleProjects.length} 条
                </p>
                {totalPages > 1 && (
                  <nav className="flex items-center gap-1" aria-label="项目分页">
                    <button
                      type="button"
                      title="上一页"
                      aria-label="上一页"
                      disabled={currentPage === 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] text-[#555961] hover:bg-[#f5f5f6] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        aria-label={`第 ${pageNumber} 页`}
                        aria-current={currentPage === pageNumber ? "page" : undefined}
                        onClick={() => setPage(pageNumber)}
                        className={cn(
                          "h-8 min-w-8 rounded-md px-2 text-[11px] font-extrabold",
                          currentPage === pageNumber
                            ? "bg-[#17181c] text-white"
                            : "border border-[var(--line)] text-[#555961] hover:bg-[#f5f5f6]",
                        )}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      title="下一页"
                      aria-label="下一页"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--line)] text-[#555961] hover:bg-[#f5f5f6] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </nav>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center border-b border-[var(--line)] text-center">
              <FolderKanban size={26} className="text-[#b0b3b9]" />
              <p className="mt-3 text-[13px] font-extrabold text-[#363940]">没有匹配的项目</p>
              <button
                type="button"
                onClick={() => { setFilter("all"); setCreatedDate(""); setQuery(""); setPage(1) }}
                className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] px-3 text-[11px] font-bold text-[#5c6068]"
              >
                <RotateCcw size={12} />重置筛选
              </button>
            </div>
          )}
        </section>
      </div>

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={createProject} />
    </main>
  )
}

function FlowSummary({ icon, number, title, detail }: { icon: React.ReactNode; number: string; title: string; detail: string }) {
  return (
    <div className="flex min-w-0 gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#f4f4f5] text-[#4d5159]">{icon}</span>
      <div>
        <p className="text-[10px] font-extrabold text-[#9a9da5]">{number}</p>
        <h3 className="text-[13px] font-extrabold text-[#292c32]">{title}</h3>
        <p className="mt-1 text-[11.5px] leading-5 text-[#7b7f88]">{detail}</p>
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  onDuplicate,
  onDelete,
  onRename,
}: {
  project: BetaProject
  onDuplicate: () => void
  onDelete: () => void
  onRename: (title: string) => void
}) {
  const status = STATUS_META[project.status]
  const href = `/replicate/${project.id}`
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project.title)

  function commitRename() {
    const nextTitle = draft.trim()
    if (nextTitle && nextTitle !== project.title) onRename(nextTitle)
    else setDraft(project.title)
    setEditing(false)
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-[var(--line)] bg-white transition hover:border-[#c7c9cf] hover:shadow-[0_10px_28px_rgba(24,24,27,0.08)]">
      <Link href={href} className="relative block aspect-[16/8] overflow-hidden bg-[#e9eaed]">
        <Image src={project.cover} alt={project.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" />
        <span
          className="absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-extrabold text-white"
          style={{ backgroundColor: status.tone }}
        >
          {status.label}
        </span>
      </Link>

      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitRename()
                    if (event.key === "Escape") {
                      setDraft(project.title)
                      setEditing(false)
                    }
                  }}
                  className="h-7 min-w-0 flex-1 rounded-md border border-[#7f9d26] px-2 text-[13px] font-extrabold text-[#202229] outline-none"
                />
                <ToolButton label="保存项目名称" onClick={commitRename}><Check size={13} /></ToolButton>
                <ToolButton label="取消修改" onClick={() => { setDraft(project.title); setEditing(false) }}><X size={13} /></ToolButton>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-1">
                <Link href={href} className="block min-w-0 flex-1 truncate text-[14px] font-extrabold text-[#202229] hover:underline">{project.title}</Link>
                <ToolButton label="修改项目名称" onClick={() => { setDraft(project.title); setEditing(true) }}><Pencil size={13} /></ToolButton>
              </div>
            )}
            <p className="mt-1 truncate text-[11px] text-[#858992]">来源：{project.source}</p>
          </div>
          <div className="flex shrink-0 items-center">
            <ToolButton label="复制项目" onClick={onDuplicate}><Copy size={13} /></ToolButton>
            <ToolButton label="删除项目" onClick={onDelete}><Trash2 size={13} /></ToolButton>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-[var(--line)] pt-3">
          <div className="min-w-0">
            <p className="text-[10px] text-[#a0a3aa]">新商品信息</p>
            <p className="mt-0.5 truncate text-[11.5px] font-bold text-[#565a62]">{project.product}</p>
            <p className="mt-1 flex items-center gap-1 text-[10px] text-[#a0a3aa]"><Clock3 size={10} />{project.updatedAt}</p>
          </div>
          <Link href={href} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-[#17181c] px-3 text-[11px] font-extrabold text-white hover:bg-[#303238]">
            {project.status === "failed" ? "查看并重试" : "继续项目"}<ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function ToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-[#9a9da5] hover:bg-[#f2f3f5] hover:text-[#393c43]"
    >
      {children}
    </button>
  )
}

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (title: string) => void
}) {
  const [name, setName] = useState("运动内衣承托测试 · 新版本")

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-[16px] font-extrabold text-[#202229]">新建高保真复刻项目</Dialog.Title>
              <Dialog.Description className="mt-1 text-[12px] text-[#858992]">创建后从选择参考素材开始。</Dialog.Description>
            </div>
            <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-md text-[#777b84] hover:bg-[#f2f3f5]" aria-label="关闭">
              <X size={15} />
            </Dialog.Close>
          </div>
          <label className="mt-5 block text-[11px] font-bold text-[#666a72]">
            项目名称
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-[var(--line)] px-3 text-[13px] outline-none focus:border-[#8d9d57]"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close className="h-9 rounded-md px-3 text-[12px] font-bold text-[#686c75] hover:bg-[#f3f4f6]">取消</Dialog.Close>
            <button
              type="button"
              disabled={!name.trim()}
              onClick={() => onCreate(name.trim())}
              className="h-9 rounded-md bg-[#17181c] px-4 text-[12px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              创建并选择素材
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

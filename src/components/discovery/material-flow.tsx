"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Pencil, RefreshCw, Share2, Sparkles } from "lucide-react"
import { coverUrl, creators, findMaterial, seconds, type Material } from "@/lib/discovery/data"
import { taskHref, taskPhase, useDiscoveryState, useWorkspaceId, type DiscoveryTask, type FlowKind } from "@/lib/discovery/curated-state"
import { ReplicateBetaWorkspace } from "@/components/replicate/beta/replicate-beta-workspace"
import { MaterialPlayer } from "./material-detail"
import "./discovery.css"

export function MaterialFlow({ materialId, kind }: { materialId: string; kind: FlowKind }) {
  const workspaceId = useWorkspaceId()
  return <FlowContent key={`${workspaceId}-${kind}-${materialId}`} materialId={materialId} kind={kind} />
}

function FlowContent({ materialId, kind }: { materialId: string; kind: FlowKind }) {
  const router = useRouter()
  const { state, workspaceId, hydrated, startTask, updateTask } = useDiscoveryState()
  const task = state.tasks[`${kind}-${materialId}`]
  const material = findMaterial(materialId)
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const replicate = kind === "replicate"
  useEffect(() => {
    if (hydrated && !task && material && !material.unavailable) {
      const timer = window.setTimeout(() => {
        try { startTask(material.id, kind, "/discover/curated") } catch { setError("任务保存失败，请检查浏览器存储权限后重试") }
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [task, material, kind, startTask, hydrated])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])
  if (!material) return <main className="dc-page"><p>素材不存在</p><Link href="/discover/curated">返回带货精选</Link></main>
  if (material.unavailable) return <main className="dc-page"><p>源视频暂不可用，无法继续处理</p><Link href="/assets/favorites">返回我的收藏</Link></main>
  const phase = task ? taskPhase(task, now) : "downloading"
  const title = task?.title || material.title
  function patch(values: Parameters<typeof updateTask>[1]) {
    if (!task) return
    try { updateTask(task.id, values); setError("") } catch { setError("保存失败，请重试") }
  }
  function enterReplication() {
    try {
      const next = startTask(materialId, "replicate", taskHref({ kind, materialId }))
      // A completed analysis can be reused without another simulated download.
      updateTask(next.id, { startedAt: next.startedAt - 15000 })
      router.push(taskHref(next))
    } catch { setError("任务保存失败，请重试") }
  }
  if (replicate && task?.productStep && phase === "complete") return <div className="flex h-screen min-h-0 flex-col" key={workspaceId}>
    <ReplicateBetaWorkspace projectId={`discovery-${workspaceId}-${materialId}`} title={title}
      referenceMaterial={{ id: `curated-${material.id}`, title: material.title, cover: coverUrl(material), video: material.videoUrl || "", duration: seconds(material.duration), source: "带货精选", account: creators[material.author].handle, evidence: material.reference, updatedAt: material.date }}
      referenceProductName={material.product} onReturnToReference={() => patch({ productStep: false })} />
  </div>
  return <main className={`dc-page dc-flow ${replicate ? "dc-replication" : "dc-analysis"}`}>
    <div className="dc-flow-shell">
      <header className="dc-flow-head"><Link href={task?.returnTo || "/discover/curated"} className="dc-icon-button" aria-label="返回来源页面"><ArrowLeft size={17} /></Link>
        {editing ? <input className="dc-title-input" aria-label="项目名称" autoFocus value={titleDraft} onChange={event => setTitleDraft(event.target.value)} onBlur={() => { if (titleDraft.trim()) patch({ title: titleDraft.trim() }); setEditing(false) }} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") setEditing(false) }} /> : <h1>{title}</h1>}
        {replicate && <button className="dc-text-button" aria-label="编辑项目名称" onClick={() => { setTitleDraft(title); setEditing(true) }}><Pencil size={13} /></button>}
        {!replicate && <span className="dc-status">{phase === "downloading" ? "下载中" : phase === "analyzing" ? "分析中" : "已完成"}</span>}
        <button className="dc-button dc-refresh" onClick={() => { patch({ startedAt: Date.now(), productStep: false }); setNow(Date.now()) }}><RefreshCw size={13} />刷新</button>
      </header>
      {replicate && <ol className="dc-steps">{["爆款拆解", "新商品信息确认", "脚本转写", "视频生成"].map((label, index) => <li key={label} aria-current={index === 0 ? "step" : undefined}><span>{index + 1}</span>{label}</li>)}</ol>}
      <div className="dc-flow-body">
        <aside><div className="dc-flow-video">{phase === "downloading" ? <div className="dc-download-placeholder"><i className="dc-spinner" /><span>视频下载中</span></div> : <MaterialPlayer key={material.id} material={material} />}</div><div className="dc-timeline-placeholder" aria-hidden="true">{[0, 1, 2, 3].map(index => <span key={index} />)}</div></aside>
        {phase === "complete" ? <DiscoveryResult material={material} kind={kind} onContinue={replicate ? () => patch({ productStep: true }) : enterReplication} onMessage={setError} /> :
          <section className="dc-progress" role="status" aria-live="polite"><h2>{phase === "downloading" ? "正在下载源视频" : replicate ? "正在拆解爆款视频" : "正在分析视频"}</h2>
            {phase === "downloading" ? <div className="dc-progress-track"><i /></div> : <><span className="dc-analysis-spark"><Sparkles size={25} /></span><p>脚本分析中……</p><small>预计耗时 3–5 分钟</small></>}
          </section>}
      </div>
      {error && <div className="dc-flow-message" role="status">{error}</div>}
    </div>
  </main>
}

function DiscoveryResult({ material, kind, onContinue, onMessage }: { material: Material; kind: FlowKind; onContinue: () => void; onMessage: (text: string) => void }) {
  const prompt = `参考素材：${material.title}\n时长：${material.duration} 秒\n创意结构：${material.reference}\n按开场、使用过程、结果展示组织镜头；替换为用户确认的新商品，保留真实商品信息。`
  const scenes = [
    { name: "Hook 钩子", start: 0, end: Math.min(3, material.duration), text: `以${material.product}的使用场景引出主题。` },
    { name: "场景应用", start: 3, end: Math.max(4, material.duration - 5), text: material.reference },
    { name: "产品展示", start: Math.max(4, material.duration - 5), end: material.duration, text: `补充${material.product}的外观和使用细节，收束到完整使用体验。` },
  ]
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); onMessage("已复制") } catch { onMessage("复制失败，请重试") } }
  return <section className="dc-result">
    <header><h2>素材分析结果</h2><span className="dc-muted">演示分析</span><button className="dc-text-button" onClick={() => copy(window.location.href)}><Share2 size={14} />分享</button></header>
    <section><h3><Sparkles size={16} />叙事策略全景</h3>
      <dl><dt>整体策略</dt><dd>{material.reference}</dd><dt>目标受众</dt><dd>{creators[material.author].audience}</dd><dt>HOOK 机制</dt><dd>通过商品与生活场景建立关联，以开场画面引导观众了解使用过程。</dd><dt>说服路径</dt><dd>使用场景 → 商品展示 → 细节说明 → 完整体验</dd><dt>情绪曲线</dt><dd><span className="dc-chip">好奇</span> → <span className="dc-chip">理解</span> → <span className="dc-chip">兴趣</span></dd></dl>
    </section>
    <h3>场景拆解 <small>{scenes.length} 个场景</small></h3>
    {scenes.map((scene, index) => <details key={scene.name} open={index === 0}><summary><b>{scene.name}</b><span>{scene.start.toFixed(1)}–{scene.end.toFixed(1)}s</span></summary><dl><dt>为什么有效</dt><dd>{scene.text}</dd><dt>旁白</dt><dd>示例素材未提供完整转录，待接入分析服务。</dd><dt>镜头</dt><dd>商品与使用场景相结合，具体分镜待视频分析确认。</dd><dt>视觉描述</dt><dd>{scene.text}</dd></dl></details>)}
    <section><h3>提示词反推<button className="dc-text-button" onClick={() => copy(prompt)}><Copy size={13} />复制</button></h3><p className="dc-prompt">{prompt}</p></section>
    <button className="dc-button dc-primary" onClick={onContinue}><Sparkles size={15} />{kind === "replicate" ? "确认拆解，进入新商品信息确认" : "去复刻"}</button>
  </section>
}

export function DiscoveryTasks({ kind }: { kind: FlowKind }) {
  const { state } = useDiscoveryState()
  const [now, setNow] = useState(() => Date.now())
  const tasks = Object.values(state.tasks).filter(task => task.kind === kind).sort((a, b) => b.startedAt - a.startedAt)
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  if (!tasks.length) return null
  return <section className="dc-task-list"><h2>{kind === "analysis" ? "素材分析任务" : "带货素材复刻"}</h2><div>{tasks.map(task => <TaskLink key={task.id} task={task} now={now} />)}</div></section>
}
function TaskLink({ task, now }: { task: DiscoveryTask; now: number }) {
  const material = findMaterial(task.materialId)
  if (!material) return null
  const phase = taskPhase(task, now)
  return <Link className="dc-task-link" href={taskHref(task)}><b>{task.title || material.title}</b><span>{task.productStep ? "继续创作" : phase === "complete" ? "查看分析结果" : phase === "analyzing" ? "分析中" : "下载中"}</span></Link>
}

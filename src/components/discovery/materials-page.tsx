"use client"

/* eslint-disable @next/next/no-img-element -- Local fixture covers retain their original crop. */
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bookmark, ChevronLeft, ChevronRight, Clock3, Eye, Heart, Info } from "lucide-react"
import { compact, coverUrl, emptyFilters, filterMaterials, materials, money, seconds, videoEstimates, type Material } from "@/lib/discovery/data"
import { taskHref, useDiscoveryState, useWorkspaceId, type FlowKind, type ListState } from "@/lib/discovery/curated-state"
import { Choice, MaterialFilters } from "./filters"
import { MaterialDetail } from "./material-detail"
import "./discovery.css"

export function MaterialsPage({ view = "curated" }: { view?: "curated" | "favorites" }) {
  const workspaceId = useWorkspaceId()
  return <MaterialsContent key={`${workspaceId}-${view}`} view={view} />
}

function MaterialsContent({ view }: { view: "curated" | "favorites" }) {
  const router = useRouter()
  const { state, workspaceId, hydrated, saveList, toggleFavorite, startTask } = useDiscoveryState()
  const list = state.lists[view]
  const [active, setActive] = useState<Material | null>(null)
  const [message, setMessage] = useState("")
  const focus = useRef<HTMLElement | null>(null)
  const scrollRestored = useRef(false)
  const favorites = view === "favorites"
  const results = useMemo(() => favorites ? materials.filter(item => item.id in state.favorites).sort((a, b) => state.favorites[b.id] - state.favorites[a.id]) : filterMaterials(list.filters, list.sort), [favorites, state.favorites, list.filters, list.sort])
  const pageCount = Math.max(1, Math.ceil(results.length / list.size)), page = Math.min(list.page, pageCount)
  const visible = results.slice((page - 1) * list.size, page * list.size)
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(""), 3000); return () => clearTimeout(timer) }, [message])
  useEffect(() => {
    if (hydrated && !scrollRestored.current) {
      scrollRestored.current = true
      const frame = requestAnimationFrame(() => window.scrollTo(0, list.scroll))
      return () => cancelAnimationFrame(frame)
    }
  }, [list.scroll, hydrated])
  function persist(next: ListState) { try { saveList(view, next) } catch { setMessage("保存失败，请检查浏览器存储权限后重试") } }
  function open(item: Material) { focus.current = document.activeElement as HTMLElement; setActive(item) }
  function start(kind: FlowKind) {
    if (!active || active.unavailable) return
    try {
      saveList(view, { ...list, scroll: window.scrollY })
      const task = startTask(active.id, kind, favorites ? "/assets/favorites" : "/discover/curated")
      setActive(null); router.push(taskHref(task))
    } catch { setMessage("任务保存失败，请重试") }
  }
  return <main className="dc-page" key={workspaceId}>
    <header className="dc-page-head"><div><h1>{favorites ? "我的收藏" : "带货精选"}</h1><p>{favorites ? "收藏值得参考的创意到这里" : "发现TikTok上与你的商品相关的热门达人带货创意视频"}</p></div>{favorites ? <span className="dc-muted">按收藏时间从新到旧</span> : <span className="dc-platform">TikTok</span>}</header>
    <section className="dc-surface">
      {!favorites && <MaterialFilters filters={list.filters} sort={list.sort} onChange={(key, value) => persist({ ...list, page: 1, scroll: 0, filters: { ...list.filters, [key]: value } })} onSort={sort => persist({ ...list, sort, page: 1 })} onClear={() => persist({ ...list, filters: emptyFilters, page: 1 })} onError={setMessage} />}
      {favorites && <p className="dc-count">共 {results.length} 条收藏</p>}
      {results.length ? <><div className="dc-grid">{visible.map(item => {
        const estimate = videoEstimates[item.id], commerce = !!item.product && (estimate?.sales != null || estimate?.gmv != null)
        const saved = item.id in state.favorites
        return <article className="dc-card" key={item.id}>
          <div className="dc-cover"><button className="dc-cover-open" aria-label={`查看${item.title}`} onClick={() => open(item)}><img src={coverUrl(item)} alt={item.title} loading="lazy" /></button>
            {item.unavailable && <div className="dc-unavailable"><Info size={27} /><b>源视频暂不可用</b><small>已保留收藏与历史信息</small></div>}
            <button className={`dc-bookmark ${saved ? "dc-saved" : ""}`} aria-label={`${saved ? "取消收藏" : "收藏"}${item.title}`} aria-pressed={saved} onClick={() => {
              try { toggleFavorite(item.id); setMessage(saved ? "已取消收藏" : "已收藏") } catch { setMessage("收藏保存失败，请重试") }
            }}><Bookmark size={18} fill={saved ? "currentColor" : "none"} /></button>
            <div className="dc-card-metrics"><span title={`播放量 ${item.views}`}><Eye size={17} /><b>{compact(item.views)}</b></span><span title={`点赞 ${item.likes}`}><Heart size={17} /><b>{compact(item.likes)}</b></span></div>
            <span className={`dc-duration ${commerce ? "dc-duration-raised" : ""}`}><Clock3 size={11} />{seconds(item.duration)}</span>
            {item.product && <div className="dc-card-bottom"><button className="dc-product-thumb" aria-label={`查看关联商品：${item.product}`} onClick={() => open(item)}><img src={coverUrl(item)} alt="" /><span>商品</span></button>
              {commerce && <div className="dc-estimates" title="视频关联商品的累计带货预估，演示数据">{estimate?.sales != null && <div><small>预估销量</small><b>{compact(estimate.sales)}</b></div>}{estimate?.gmv != null && <div><small>预估GMV</small><b>{money(estimate.gmv)}</b></div>}</div>}
            </div>}
          </div><h2><button onClick={() => open(item)} title={item.title}>{item.title}</button></h2>
        </article>
      })}</div>
      <nav className="dc-pagination" aria-label="素材分页"><span>共 {results.length} 条</span><label>每页</label><Choice label="每页条数" value={String(list.size)} options={[10, 20, 50].map(size => [String(size), `${size} 条`])} onChange={size => persist({ ...list, size: Number(size), page: 1 })} />
        <button className="dc-page-button" aria-label="上一页" disabled={page <= 1} onClick={() => persist({ ...list, page: page - 1 })}><ChevronLeft size={16} /></button>
        {[...new Set([1, page - 1, page, page + 1, pageCount])].filter(value => value > 0 && value <= pageCount).sort((a, b) => a - b).map((value, index, pages) => <span key={value}>{index > 0 && value - pages[index - 1] > 1 && "…"}<button className={`dc-page-button ${value === page ? "dc-selected" : ""}`} aria-current={value === page ? "page" : undefined} onClick={() => persist({ ...list, page: value })}>{value}</button></span>)}
        <button className="dc-page-button" aria-label="下一页" disabled={page >= pageCount} onClick={() => persist({ ...list, page: page + 1 })}><ChevronRight size={16} /></button><span>第 {page} / {pageCount} 页</span>
      </nav></> : <div className="dc-empty"><Bookmark size={32} /><h2>{favorites ? "还没有收藏素材" : "暂无符合条件的视频"}</h2>{favorites ? <Link className="dc-button dc-primary" href="/discover/curated">去发现素材</Link> : <button className="dc-button" onClick={() => persist({ ...list, filters: emptyFilters, page: 1 })}>清除筛选</button>}</div>}
    </section>
    {active && <MaterialDetail material={active} onClose={() => setActive(null)} onStart={start} onMessage={setMessage} returnFocus={focus} />}
    {message && <div className="dc-toast" role="status">{message}</div>}
  </main>
}

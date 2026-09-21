"use client"

/* eslint-disable @next/next/no-img-element -- Local, original-aspect-ratio prototype assets. */
import { useState, type RefObject } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { BarChart3, Box, Copy, ExternalLink, Globe2, Heart, MessageCircle, Share2, Sparkles, X } from "lucide-react"
import { compact, coverUrl, creators, engagement, money, videoEstimates, type Material } from "@/lib/discovery/data"
import type { FlowKind } from "@/lib/discovery/curated-state"

export function MaterialPlayer({ material, social = false, videoRef }: { material: Material; social?: boolean; videoRef?: RefObject<HTMLVideoElement | null> }) {
  const [failed, setFailed] = useState(false)
  const author = creators[material.author]
  return <div className="dc-player">
    {material.videoUrl && !material.unavailable && !failed ? <video ref={videoRef} src={material.videoUrl} poster={coverUrl(material)} controls preload="metadata" playsInline onError={() => setFailed(true)} /> : <>
      <img src={coverUrl(material)} alt={material.title} />
      <div className="dc-media-note">{material.unavailable ? "源视频暂不可用" : failed ? "视频加载失败" : "视频源尚未接入"}</div>
      {failed && <button className="dc-media-retry" onClick={() => setFailed(false)}>重新加载</button>}
    </>}
    {social && <>
      <div className="dc-player-author"><span className="dc-avatar">{author.initial}</span><span><b>{author.name}</b><small>{author.handle}</small></span><strong className="dc-tiktok">♪</strong></div>
      <div className="dc-player-social"><span><Heart />{compact(material.likes)}</span><span><MessageCircle />{compact(material.comments)}</span><span><Share2 />{compact(material.shares)}</span></div>
    </>}
  </div>
}

export function MaterialDetail({ material, onClose, onStart, onMessage, returnFocus }: { material: Material; onClose: () => void; onStart: (kind: FlowKind) => void; onMessage: (message: string) => void; returnFocus: RefObject<HTMLElement | null> }) {
  const author = creators[material.author], estimate = videoEstimates[material.id], rate = engagement(material)
  const disabled = !!material.unavailable
  async function copyLink() {
    if (!material.sourceUrl) return
    try { await navigator.clipboard.writeText(material.sourceUrl); onMessage("链接已复制") } catch { onMessage("复制失败，请重试") }
  }
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose() }}><Dialog.Portal>
    <Dialog.Overlay className="dc-overlay" />
    <Dialog.Content className="dc-detail" onCloseAutoFocus={event => { event.preventDefault(); returnFocus.current?.focus({ preventScroll: true }) }}>
      <Dialog.Description className="dc-network-tip"><Globe2 size={12} />观看 TikTok 视频前，请确保已开启外网访问。</Dialog.Description>
      <MaterialPlayer key={material.id} material={material} social />
      <section className="dc-detail-body">
        <header><Dialog.Title>{material.title}</Dialog.Title><Dialog.Close className="dc-close" aria-label="关闭素材详情"><X size={17} /></Dialog.Close></header>
        <div className="dc-detail-scroll">
          <div className="dc-detail-metrics">{[[compact(material.views), "播放量"], [compact(material.likes), "点赞"], [compact(material.comments), "评论"], [compact(material.shares), "分享"], [rate == null ? "—" : `${rate.toFixed(2)}%`, "互动率"]].map(([value, label]) => <div key={label}><b>{value}</b><small>{label}</small></div>)}</div>
          <div className="dc-detail-estimates" aria-label="带货预估" title="演示数据：视频关联商品的累计带货预估，截至2026-09-21">
            <div><small><Globe2 size={13} />预估 GMV</small><b>{money(estimate?.gmv)}</b></div><div><small><Box size={13} />预估销量</small><b>{estimate?.sales == null ? "暂无数据" : compact(estimate.sales)}</b></div>
          </div>
          <h3>作者信息</h3><div className="dc-author"><span className="dc-avatar">{author.initial}</span><div><b>{author.name}</b> <small>{author.handle}</small><small>{author.fans.toLocaleString()} 粉丝</small></div></div>
          <div className="dc-product-section"><h3>关联商品</h3>{material.product ? <div className="dc-product"><img src={coverUrl(material)} alt={material.product} /><div><b>{material.product}</b><strong>{material.price == null ? "价格未提供" : `$${material.price.toFixed(2)}`}</strong></div>
            {material.productUrl ? <a className="dc-button" href={material.productUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} />查看商品</a> : <button className="dc-button" disabled title="暂未提供商品链接"><ExternalLink size={13} />查看商品</button>}
          </div> : <p className="dc-muted">暂未关联商品</p>}</div>
        </div>
        <footer className="dc-detail-actions">
          {material.sourceUrl && !disabled ? <a className="dc-button" href={material.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} />打开原视频</a> : <button className="dc-button" disabled title={disabled ? "源视频暂不可用" : "暂未提供原视频链接"}><ExternalLink size={15} />打开原视频</button>}
          <button className="dc-button" disabled={!material.sourceUrl || disabled} title={!material.sourceUrl ? "暂未提供原视频链接" : undefined} onClick={copyLink}><Copy size={15} />复制链接</button>
          <button className="dc-button dc-primary" disabled={disabled} onClick={() => onStart("replicate")}><Sparkles size={15} />复刻</button><button className="dc-button dc-secondary" disabled={disabled} onClick={() => onStart("analysis")}><BarChart3 size={15} />分析</button>
        </footer>
      </section>
    </Dialog.Content>
  </Dialog.Portal></Dialog.Root>
}

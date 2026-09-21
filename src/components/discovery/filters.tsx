"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import * as Dropdown from "@radix-ui/react-dropdown-menu"
import * as Popover from "@radix-ui/react-popover"
import { Check, ChevronDown, X } from "lucide-react"
import { countries, creatorOptions, productOptions, regions, filterNames, rangeOptions, sortOptions, type Filters } from "@/lib/discovery/data"

export function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <Dropdown.Root><Dropdown.Trigger className="dc-choice" aria-label={label}>
    {value ? options.find(([key]) => key === value)?.[1] || label : label}<ChevronDown size={13} />
  </Dropdown.Trigger><Dropdown.Portal><Dropdown.Content className="dc-menu" sideOffset={6} align="start" collisionPadding={12}>
    <Dropdown.RadioGroup value={value} onValueChange={onChange}>{options.map(([key, text]) =>
      <Dropdown.RadioItem className="dc-menu-item" key={key} value={key}>{text}<Dropdown.ItemIndicator><Check size={13} /></Dropdown.ItemIndicator></Dropdown.RadioItem>
    )}</Dropdown.RadioGroup>
  </Dropdown.Content></Dropdown.Portal></Dropdown.Root>
}

function CountrySearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const results = countries.filter(item => [item.name, item.english, item.code, item.value].some(text => text.toLowerCase().includes(query.trim().toLowerCase())))
  function choose(next: string) { onChange(next); setOpen(false); setQuery(""); input.current?.focus() }
  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Anchor asChild><input ref={input} className="dc-country" role="combobox" aria-label="搜索全部国家" aria-autocomplete="list" aria-controls="dc-countries" aria-expanded={open}
      aria-activedescendant={open && results.length ? `dc-country-${results[cursor]?.code}` : undefined}
      placeholder="搜索国家" value={open ? query : value && !regions.includes(value) ? value : ""}
      onFocus={() => { setQuery(""); setCursor(0); setOpen(true) }}
      onClick={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setCursor(0); setOpen(true) }}
      onKeyDown={event => {
        if (event.key === "Escape") { setOpen(false); return }
        if (event.key === "Tab") { setOpen(false); return }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault(); setOpen(true)
          const next = (cursor + (event.key === "ArrowDown" ? 1 : -1) + results.length) % (results.length || 1)
          setCursor(next); document.getElementById(`dc-country-${results[next]?.code}`)?.scrollIntoView({ block: "nearest" })
        }
        if (event.key === "Enter" && open && results[cursor]) { event.preventDefault(); choose(results[cursor].value) }
      }} /></Popover.Anchor>
    <Popover.Portal><Popover.Content className="dc-menu dc-country-menu" align="start" sideOffset={6} collisionPadding={12}
      onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()}
      onInteractOutside={event => { if (event.target === input.current) event.preventDefault() }}>
      <div role="listbox" id="dc-countries" aria-label="国家搜索结果">
        {results.map((item, index) => <button key={item.code} id={`dc-country-${item.code}`} role="option" aria-selected={value === item.value}
          tabIndex={-1} className={`dc-menu-item ${index === cursor ? "dc-focused" : ""}`} onPointerMove={() => setCursor(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(item.value)}>{item.name}{value === item.value && <Check size={13} />}</button>)}
        {!results.length && <p role="status" className="dc-empty-small">未找到匹配的国家</p>}
      </div>
    </Popover.Content></Popover.Portal>
  </Popover.Root>
}

function Facet({ label, options, value, onChange, prefix }: { label: string; options: string[]; value: string; onChange: (value: string) => void; prefix?: ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const [firstRow, setFirstRow] = useState(options.length + 1)
  const container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const measure = () => {
      const chips = Array.from(element.querySelectorAll<HTMLButtonElement>(".dc-chip"))
      const top = chips[0]?.offsetTop
      setFirstRow(chips.filter(chip => chip.offsetTop === top).length)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(element); measure()
    return () => observer.disconnect()
  }, [])
  return <div className="dc-facet"><span className="dc-label">{label}</span><div ref={container} className={`dc-chips ${expanded ? "dc-expanded" : "dc-collapsed"}`}>
    {prefix}{["", ...options].map((option, index) => <button key={option} className={`dc-chip ${value === option ? "dc-selected" : ""}`} aria-pressed={value === option}
      tabIndex={!expanded && index >= firstRow ? -1 : 0} aria-hidden={!expanded && index >= firstRow || undefined}
      onClick={() => onChange(option)}>{option || "全部"}</button>)}
  </div><div className="dc-expand-slot">{firstRow < options.length + 1 && <button className="dc-expand" aria-label={`${expanded ? "收起" : "展开"}${label}分类`} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "收起" : "展开"}<ChevronDown size={12} style={{ transform: expanded ? "rotate(180deg)" : undefined }} /></button>}</div></div>
}

export function MaterialFilters({ filters, sort, onChange, onSort, onClear, onError }: { filters: Filters; sort: string; onChange: (key: keyof Filters, value: string) => void; onSort: (value: string) => void; onClear: () => void; onError: (text: string) => void }) {
  const select = (key: keyof Filters) => <Choice label={filterNames[key]} value={filters[key]} options={[["", "不限"], ...(rangeOptions[key] || [])]} onChange={value => onChange(key, value)} />
  function changeDate(key: "dateStart" | "dateEnd", value: string) {
    const start = key === "dateStart" ? value : filters.dateStart, end = key === "dateEnd" ? value : filters.dateEnd
    if (start && end && start > end) { onError("开始日期不能晚于结束日期"); return }
    onChange(key, value)
  }
  const applied = (Object.entries(filters) as [keyof Filters, string][]).filter(([, value]) => value)
  return <div className="dc-filters">
    <div className="dc-facet"><span className="dc-label" title="按作者地区筛选">地区</span><div className="dc-chips">
      {["", ...regions].map(region => <button key={region} className={`dc-chip ${filters.country === region ? "dc-selected" : ""}`} aria-pressed={filters.country === region} onClick={() => onChange("country", region)}>{region || "全球"}</button>)}
      <CountrySearch value={filters.country} onChange={value => onChange("country", value)} />
    </div></div>
    <Facet label="达人" options={creatorOptions} value={filters.creator} onChange={value => onChange("creator", value)} prefix={select("fans")} />
    <Facet label="商品" options={productOptions} value={filters.product} onChange={value => onChange("product", value)} />
    <div className="dc-facet"><span className="dc-label">视频</span><div className="dc-chips dc-video-filters">
      {(["views", "likes", "duration", "ai"] as const).map(key => <div key={key}>{select(key)}</div>)}
      <div className="dc-dates"><input type="date" aria-label="开始日期" value={filters.dateStart} max={filters.dateEnd || undefined} onChange={event => changeDate("dateStart", event.target.value)} /><span>—</span><input type="date" aria-label="结束日期" value={filters.dateEnd} min={filters.dateStart || undefined} onChange={event => changeDate("dateEnd", event.target.value)} /></div>
    </div><Choice label="排序" value={sort} options={sortOptions} onChange={onSort} /></div>
    <div className="dc-conditions"><span className="dc-label">过滤条件</span><div className="dc-chips">
      {!applied.length && <span className="dc-muted">暂无筛选条件</span>}
      {applied.map(([key, value]) => <button className="dc-condition" key={key} aria-label={`移除${filterNames[key]}`} onClick={() => onChange(key, "")}>{filterNames[key]}：{rangeOptions[key]?.find(([id]) => value === id)?.[1] || value}<X size={12} /></button>)}
    </div>{applied.length > 0 && <button className="dc-text-button" onClick={onClear}>全部清除</button>}</div>
  </div>
}

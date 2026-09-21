"use client"

import { useMemo, useSyncExternalStore } from "react"
import { emptyFilters, type Filters } from "./data"

const EVENT = "creatisignal-discovery-change"
const WORKSPACE_KEY = "creatisignal.active-workspace"
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener)
  window.addEventListener(EVENT, listener)
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(EVENT, listener) }
}
function read(key: string) {
  try { return window.localStorage.getItem(key) } catch { return null }
}
function write(key: string, value: string) {
  window.localStorage.setItem(key, value)
  window.dispatchEvent(new Event(EVENT))
}
export function useWorkspaceId() {
  return useSyncExternalStore(subscribe, () => read(WORKSPACE_KEY) || "default", () => "default")
}
export function selectWorkspace(id: string) { write(WORKSPACE_KEY, id) }

export type FlowKind = "analysis" | "replicate"
export type DiscoveryTask = { id: string; materialId: string; kind: FlowKind; startedAt: number; returnTo: string; title?: string; productStep?: boolean }
export type ListState = { filters: Filters; sort: string; size: number; page: number; scroll: number }
type State = {
  favorites: Record<string, number>
  tasks: Record<string, DiscoveryTask>
  lists: Record<"curated" | "favorites", ListState>
}
const defaultList: ListState = { filters: emptyFilters, sort: "views", size: 10, page: 1, scroll: 0 }
const initialState: State = {
  favorites: { m1: 4, m3: 3, m5: 2, m8: 1 }, tasks: {},
  lists: { curated: defaultList, favorites: defaultList },
}
function parse(raw: string | null): State {
  if (!raw) return initialState
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.favorites !== "object" || !parsed.favorites || !parsed.tasks || !parsed.lists) return initialState
    return parsed as State
  } catch { return initialState }
}
export const taskPhase = (task: DiscoveryTask, now: number) => now - task.startedAt < 3000 ? "downloading" : now - task.startedAt < 15000 ? "analyzing" : "complete"
export const taskHref = (task: Pick<DiscoveryTask, "kind" | "materialId">) => `${task.kind === "analysis" ? "/reports" : "/replicate"}/material/${task.materialId}`

export function useDiscoveryState() {
  const workspaceId = useWorkspaceId()
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  // The current app has a local demo account; each selected workspace owns its own records.
  const key = `creatisignal.discovery.v1.default-user.${workspaceId}`
  const raw = useSyncExternalStore(subscribe, () => read(key), () => null)
  const state = useMemo(() => parse(raw), [raw])
  function update(change: (current: State) => State) { write(key, JSON.stringify(change(parse(read(key))))) }
  function startTask(materialId: string, kind: FlowKind, returnTo: string) {
    const id = `${kind}-${materialId}`
    let task!: DiscoveryTask
    update(current => {
      task = current.tasks[id] ?? { id, materialId, kind, startedAt: Date.now(), returnTo }
      return { ...current, tasks: { ...current.tasks, [id]: task } }
    })
    return task
  }
  return {
    state, workspaceId, hydrated, startTask,
    toggleFavorite(id: string) {
      update(current => {
        const favorites = { ...current.favorites }
        if (id in favorites) delete favorites[id]
        else favorites[id] = Date.now()
        return { ...current, favorites }
      })
    },
    saveList(view: "curated" | "favorites", list: ListState) {
      update(current => ({ ...current, lists: { ...current.lists, [view]: list } }))
    },
    updateTask(id: string, patch: Partial<Pick<DiscoveryTask, "startedAt" | "title" | "productStep">>) {
      update(current => current.tasks[id] ? { ...current, tasks: { ...current.tasks, [id]: { ...current.tasks[id], ...patch } } } : current)
    },
  }
}

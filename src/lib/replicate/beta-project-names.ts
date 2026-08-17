const STORAGE_KEY = "creatisignal.replicate-beta.project-names"
const CHANGE_EVENT = "creatisignal:replicate-beta-project-names"

type ProjectNameMap = Record<string, string>

function parseProjectNames(serialized: string) {
  try {
    return JSON.parse(serialized || "{}") as ProjectNameMap
  } catch {
    return {}
  }
}

export function getBetaProjectNamesSnapshot() {
  if (typeof window === "undefined") return ""
  return window.localStorage.getItem(STORAGE_KEY) ?? ""
}

export function getBetaProjectNamesServerSnapshot() {
  return ""
}

export function subscribeBetaProjectNames(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined

  const handleChange = () => onStoreChange()
  window.addEventListener("storage", handleChange)
  window.addEventListener(CHANGE_EVENT, handleChange)

  return () => {
    window.removeEventListener("storage", handleChange)
    window.removeEventListener(CHANGE_EVENT, handleChange)
  }
}

export function getBetaProjectName(projectId: string, serialized = getBetaProjectNamesSnapshot()) {
  return parseProjectNames(serialized)[projectId]
}

export function saveBetaProjectName(projectId: string, title: string) {
  if (typeof window === "undefined") return

  const names = parseProjectNames(getBetaProjectNamesSnapshot())
  names[projectId] = title
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

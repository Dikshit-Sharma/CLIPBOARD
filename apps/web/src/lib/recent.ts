export type RecentClipboard = {
  id: string
  lastOpenedAt: string
  label?: string
}

const KEY = 'sharedclip.recent'

export function loadRecents(): RecentClipboard[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentClipboard[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRecent(id: string) {
  const now = new Date().toISOString()
  const list = loadRecents().filter((r) => r.id !== id)
  list.unshift({ id, lastOpenedAt: now })
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)))
}

export function clearRecents() {
  localStorage.removeItem(KEY)
}

export function removeRecent(id: string) {
  const list = loadRecents().filter((r) => r.id !== id)
  if (list.length === 0) {
    localStorage.removeItem(KEY)
  } else {
    localStorage.setItem(KEY, JSON.stringify(list))
  }
}

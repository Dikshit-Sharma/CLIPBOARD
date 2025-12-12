export type ClipboardTokens = { readToken: string; writeToken: string }

const KEY = 'sharedclip.tokens'

export function getStoredTokens(id: string): ClipboardTokens | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, ClipboardTokens>
    return parsed[id] || null
  } catch {
    return null
  }
}

export function storeTokens(id: string, tokens: ClipboardTokens) {
  const existing = (() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as Record<string, ClipboardTokens>) : {}
    } catch {
      return {}
    }
  })()

  existing[id] = tokens
  localStorage.setItem(KEY, JSON.stringify(existing))
}

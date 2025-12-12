// Client-side caching for clipboard state to reduce Firestore reads

const CACHE_PREFIX = 'sharedclip.cache.'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export type CachedClipboardState = {
  id: string
  contentHtml: string
  contentUpdatedAt: string
  activity: Array<{ id: string; type: string; at: string; summary: string }>
  settings: Record<string, unknown>
  cachedAt: number
}

export function getCachedState(id: string): CachedClipboardState | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${id}`)
    if (!raw) return null

    const cached = JSON.parse(raw) as CachedClipboardState
    const age = Date.now() - cached.cachedAt

    // Return cached data if still fresh
    if (age < CACHE_TTL) {
      return cached
    }

    // Remove stale cache
    localStorage.removeItem(`${CACHE_PREFIX}${id}`)
    return null
  } catch {
    return null
  }
}

export function setCachedState(id: string, state: Omit<CachedClipboardState, 'cachedAt'>): void {
  try {
    const cached: CachedClipboardState = {
      ...state,
      cachedAt: Date.now()
    }
    localStorage.setItem(`${CACHE_PREFIX}${id}`, JSON.stringify(cached))
  } catch {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
}

export function clearCachedState(id: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${id}`)
  } catch {
    // Ignore errors
  }
}

// Clean up old cache entries (older than 1 hour)
export function cleanupOldCache(): void {
  try {
    const keys = Object.keys(localStorage)
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 hour

    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const raw = localStorage.getItem(key)
          if (raw) {
            const cached = JSON.parse(raw) as CachedClipboardState
            if (now - cached.cachedAt > maxAge) {
              localStorage.removeItem(key)
            }
          }
        } catch {
          // Remove invalid entries
          localStorage.removeItem(key)
        }
      }
    }
  } catch {
    // Ignore errors
  }
}

// Run cleanup on load
if (typeof window !== 'undefined') {
  cleanupOldCache()
  // Run cleanup every hour
  setInterval(cleanupOldCache, 60 * 60 * 1000)
}

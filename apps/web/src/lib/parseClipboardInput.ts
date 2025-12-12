export function parseClipboardInput(input: string): { id: string; token?: string } | null {
  const raw = input.trim()
  if (!raw) return null

  // If the user pasted a full URL.
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const url = new URL(raw)
      const parts = url.pathname.split('/').filter(Boolean)
      const cIdx = parts.indexOf('c')
      const id = cIdx >= 0 ? parts[cIdx + 1] : undefined
      if (!id) return null
      const token = url.searchParams.get('token') || undefined
      return { id, token }
    } catch {
      return null
    }
  }

  // If the user pasted a path like /c/ABC123?token=...
  if (raw.startsWith('/')) {
    try {
      const url = new URL(raw, 'http://local')
      const parts = url.pathname.split('/').filter(Boolean)
      const cIdx = parts.indexOf('c')
      const id = cIdx >= 0 ? parts[cIdx + 1] : undefined
      if (!id) return null
      const token = url.searchParams.get('token') || undefined
      return { id, token }
    } catch {
      return null
    }
  }

  // Otherwise treat as a bare code.
  const normalized = raw.replace(/\s+/g, '')
  if (!/^[a-zA-Z0-9_-]{6,12}$/.test(normalized)) return null
  return { id: normalized }
}

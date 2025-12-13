import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Clipboard, Search, Shield, Timer, Sparkles, Clock, ArrowRight, Zap, Trash2, X, Github } from 'lucide-react'
import { Button, Card, Input, Modal } from '../components/ui'
import { createClipboard } from '../services/api'
import { parseClipboardInput } from '../lib/parseClipboardInput'
import { clearRecents, loadRecents, saveRecent, removeRecent } from '../lib/recent'
import { storeTokens } from '../lib/tokens'
import { trackClipboardCreated, trackClipboardOpened } from '../lib/analytics'

export function Home() {
  const nav = useNavigate()

  const [openInput, setOpenInput] = useState('')
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [recentsKey, setRecentsKey] = useState(0) // Force re-render when recents change

  const [expiresIn, setExpiresIn] = useState<'1h' | '1d' | 'never'>('never')
  const [password, setPassword] = useState('')

  const recents = useMemo(() => {
    const list = loadRecents()
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter((r) => r.id.toLowerCase().includes(q))
  }, [query, recentsKey])

  const handleClearRecents = () => {
    clearRecents()
    setRecentsKey((prev) => prev + 1) // Trigger re-render
  }

  const handleRemoveRecent = (id: string) => {
    removeRecent(id)
    setRecentsKey((prev) => prev + 1) // Trigger re-render
  }

  const createMut = useMutation({
    mutationFn: () =>
      createClipboard({
        expiresIn,
        password: password.trim() ? password.trim() : undefined
      }),
    onSuccess: (data) => {
      storeTokens(data.id, data.tokens)
      saveRecent(data.id)
      setCreateOpen(false)
      // Track clipboard creation
      trackClipboardCreated(data.id, Boolean(password.trim()), expiresIn)
      // Extract token from writeUrl or use stored token
      const writeToken = data.tokens.writeToken
      nav(`/c/${data.id}${writeToken ? `?token=${encodeURIComponent(writeToken)}` : ''}`)
    }
  })

  const onOpen = () => {
    const parsed = parseClipboardInput(openInput)
    if (!parsed) return

    saveRecent(parsed.id)
    // Track clipboard opened
    trackClipboardOpened(parsed.id, 'code')
    nav(`/c/${parsed.id}${parsed.token ? `?token=${encodeURIComponent(parsed.token)}` : ''}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Enhanced Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-400/10 ring-2 ring-accent-500/30 shadow-lg">
              <Clipboard className="h-7 w-7 text-accent-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-primary/80 bg-clip-text text-transparent">
                SharedClip
              </h1>
              <p className="text-sm text-text-muted mt-1 flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Real-time collaborative clipboard for rich text and notes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Dikshit-Sharma/CLIPBOARD"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-surface-800/80 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-700 border border-white/10 hover:border-white/20 transition-all duration-200 shadow-sm hover:shadow-md"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <Button onClick={() => setCreateOpen(true)} className="shadow-lg hover:shadow-xl">
              <Sparkles className="h-4 w-4" />
              Create New Clipboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Open Clipboard Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
            <div className="rounded-lg bg-accent-500/10 p-2 ring-1 ring-accent-500/20">
              <Search className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Open a Clipboard</h2>
              <p className="text-xs text-text-muted mt-0.5">Enter a code or paste a shared link</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={openInput}
                onChange={(e) => setOpenInput(e.target.value)}
                placeholder="Paste code or link (e.g., ABC123 or https://.../c/ABC123)"
                aria-label="Clipboard code or URL"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && parseClipboardInput(openInput)) {
                    onOpen()
                  }
                }}
              />
              <Button onClick={onOpen} disabled={!parseClipboardInput(openInput)}>
                <ArrowRight className="h-4 w-4" />
                <span className="hidden sm:inline">Open</span>
              </Button>
            </div>
            <div className="rounded-lg bg-surface-800/50 p-3 ring-1 ring-white/5">
              <p className="text-xs text-text-muted leading-relaxed">
                <span className="font-medium text-text-primary">💡 Tip:</span> You can share read-only or read/write links. Paste either here to open.
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Clipboards Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-500/10 p-2 ring-1 ring-accent-500/20">
                <Clock className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Recent Clipboards</h2>
                <p className="text-xs text-text-muted mt-0.5">{recents.length} {recents.length === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            {recents.length > 0 && (
              <Button variant="ghost" onClick={handleClearRecents} className="text-xs hover:text-red-400">
                <Trash2 className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by code..."
              className="mb-2"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-surface-800/50 p-4 mb-3 ring-1 ring-white/10">
                    <Clipboard className="h-6 w-6 text-text-muted/50" />
                  </div>
                  <div className="text-sm text-text-muted">No recent clipboards</div>
                  <div className="text-xs text-text-muted mt-1">Clipboards you open will appear here</div>
                </div>
              ) : (
                recents.map((r, index) => (
                  <div
                    key={r.id}
                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-surface-800/80 to-surface-800/60 ring-1 ring-white/10 hover:ring-white/20 hover:from-surface-700/80 hover:to-surface-700/60 transition-all duration-200 hover:shadow-md animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <button
                      className="flex-1 min-w-0 px-4 py-3 text-left"
                      onClick={() => {
                        trackClipboardOpened(r.id, 'recent')
                        nav(`/c/${r.id}`)
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm font-semibold text-text-primary group-hover:text-accent-400 transition-colors">
                          {r.id}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                          <Clock className="h-3 w-3" />
                          {new Date(r.lastOpenedAt).toLocaleString()}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 pr-2">
                      <button
                        onClick={() => {
                          trackClipboardOpened(r.id, 'recent')
                          nav(`/c/${r.id}`)
                        }}
                        className="p-2 rounded-lg text-text-muted hover:text-accent-400 hover:bg-surface-700/50 transition-colors"
                        title="Open"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveRecent(r.id)
                        }}
                        className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove from recents"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Create Clipboard Modal */}
      <Modal open={createOpen} title="Create New Clipboard" onClose={() => setCreateOpen(false)}>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Timer className="h-4 w-4 text-accent-400" /> Expiration
              </div>
              <select
                className="w-full rounded-xl bg-surface-800 px-4 py-2.5 text-sm text-text-primary ring-1 ring-white/10 focus:ring-2 focus:ring-accent-500/50 outline-none transition-all"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value as '1h' | '1d' | 'never')}
              >
                <option value="never">Never expires</option>
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
              </select>
            </label>

            <label className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Shield className="h-4 w-4 text-accent-400" /> Optional Password
              </div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (optional)"
                type="password"
              />
            </label>
          </div>

          {createMut.isError && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/20">
              Failed to create: {(createMut.error as Error).message}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="min-w-[100px]">
              {createMut.isPending ? (
                <>
                  <span className="animate-pulse">Creating…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="mt-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl bg-surface-900/50 px-4 py-2 text-xs text-text-muted ring-1 ring-white/10">
            <span>Developed by Dikshit Sharma</span>
          </div>
          <a
            href="https://github.com/Dikshit-Sharma/CLIPBOARD"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-900/50 px-4 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-800/50 ring-1 ring-white/10 transition-all duration-200 hover:ring-white/20"
          >
            <Github className="h-4 w-4" />
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  )
}

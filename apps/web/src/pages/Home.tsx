import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clipboard, Search, Shield, Clock, ArrowRight, Trash2, X } from 'lucide-react'
import { Button, Card, Input } from '../components/ui'
import { parseClipboardInput } from '../lib/parseClipboardInput'
import { clearRecents, loadRecents, saveRecent, removeRecent } from '../lib/recent'
import { trackClipboardOpened } from '../lib/analytics'
import { useAuth } from '../lib/auth'
import { AdUnit } from '../components/AdUnit'
import { SEO } from '../components/SEO'
import { Footer } from '../components/Footer'

export function Home() {
  const nav = useNavigate()
  const { user, loading } = useAuth()

  const [openInput, setOpenInput] = useState('')
  const [query, setQuery] = useState('')
  const [recentsKey, setRecentsKey] = useState(0) // Force re-render when recents change

  const recents = useMemo(() => {
    const list = loadRecents()
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter((r) => {
      if (r.id.toLowerCase().includes(q)) return true
      if (r.label?.toLowerCase().includes(q)) return true
      return false
    })
  }, [query, recentsKey])

  const handleClearRecents = () => {
    clearRecents()
    setRecentsKey((prev) => prev + 1) // Trigger re-render
  }

  const handleRemoveRecent = (id: string) => {
    removeRecent(id)
    setRecentsKey((prev) => prev + 1) // Trigger re-render
  }

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
      <SEO
        title="Online Shared Clipboard – Real-Time Clipboard with File Sharing"
        description="Share text, images, and files instantly across devices without login. Valid for 24 hours or forever. Secure, fast, and free."
        canonical="https://sharedclip.netlify.app"
      />

      {/* Intro Section - Moved from Header Title */}
      <div className="mb-10 text-center relative z-10">
         <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-transparent mb-4 tracking-tight">
            Share Text & Files Instantly
         </h1>
         <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
           Real-time collaborative clipboard. No login required.
         </p>
      </div>

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

        {/* High RPM Ad Unit - Middle of Page */}
        <div className="col-span-full md:col-span-2 flex justify-center py-2">
           <AdUnit slot="9527620124" format="horizontal" className="w-full max-w-[728px] rounded-xl bg-surface-800/30 p-2 border border-white/5" />
        </div>

        {/* Recent Clipboards or Login Prompt */}
        {!loading && (
          user ? (
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
                              {r.label || r.id}
                            </div>
                            {r.label && <div className="text-xs text-text-muted font-mono">{r.id}</div>}
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
          ) : (
            <Card className="p-8 border-accent-500/20 bg-gradient-to-br from-surface-900 to-accent-500/5 h-full flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-accent-500/10 p-4 inline-block mb-4 ring-1 ring-accent-500/20">
                <Shield className="h-8 w-8 text-accent-400" />
              </div>
              <h2 className="text-xl font-bold mb-3 text-text-primary">Unlock More Features</h2>
              <p className="text-text-muted mb-6 max-w-sm leading-relaxed">
                Sign in to keep track of your recent clipboards, sync your history across devices, and organize your content.
              </p>
              {/* Note: This button does nothing now since AuthModal is gone from Home.
                  However, Navbar has auth. I should probably remove this block or
                  make it trigger a global auth event?

                  Actually, user request was "add navbar... make it such that it follows current structure".
                  If I remove the "Sign In" button here, the user experience degrades slightly if they scroll down.
                  But clicking "Sign In" here would need to open the AuthModal which is now in Navbar.

                  I can export a `useAuthModal` hook or context, or just direct them to scroll up?
                  Or simply keep it simple: The Navbar is sticky. So "Sign In" is always visible.

                  Let's change this button to say "Sign In (use top right)" or just remove the button?
                  Or better: The prompt says "add login current user in nav too".

                  I'll keep the card but redirect the user's attention to the Navbar or
                  I can't easily trigger the Navbar's state from here without context.

                  I will remove the button action for now or perhaps leave it?
                  Wait, `setAuthOpen` is gone. So I must remove the `onClick`.
                  I will just change the text or make it a link to /login if that existed, but it's a modal.

                  I'll remove the button for now to avoid broken UI, OR I can add a small text "Sign in using the button in the top right".
              */}
              <div className="text-sm text-text-muted italic">
                (Please sign in using the button in the top right)
              </div>
            </Card>
          )
        )}
      </div>

      {/* AdSense Unit - Home Footer */}
      <div className="mt-12 flex justify-center">
        <div className="w-full max-w-[728px] overflow-hidden rounded-xl bg-surface-800/30 p-4 border border-white/5">
           <div className="text-xs text-text-muted mb-2 w-full text-center">Advertisement</div>
           <AdUnit slot="9527620124" format="horizontal" />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

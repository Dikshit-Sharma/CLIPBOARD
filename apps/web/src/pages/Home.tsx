import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Clipboard, Search, Shield, Timer } from 'lucide-react'
import { Button, Card, Input, Modal } from '../components/ui'
import { createClipboard } from '../services/api'
import { parseClipboardInput } from '../lib/parseClipboardInput'
import { clearRecents, loadRecents, saveRecent } from '../lib/recent'
import { storeTokens } from '../lib/tokens'

export function Home() {
  const nav = useNavigate()

  const [openInput, setOpenInput] = useState('')
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const [expiresIn, setExpiresIn] = useState<'1h' | '1d' | 'never'>('never')
  const [password, setPassword] = useState('')

  const recents = useMemo(() => {
    const list = loadRecents()
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter((r) => r.id.toLowerCase().includes(q))
  }, [query])

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
      // Extract token from writeUrl or use stored token
      const writeToken = data.tokens.writeToken
      nav(`/c/${data.id}${writeToken ? `?token=${encodeURIComponent(writeToken)}` : ''}`)
    }
  })

  const onOpen = () => {
    const parsed = parseClipboardInput(openInput)
    if (!parsed) return

    saveRecent(parsed.id)
    nav(`/c/${parsed.id}${parsed.token ? `?token=${encodeURIComponent(parsed.token)}` : ''}`)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500/15 ring-1 ring-white/10">
            <Clipboard className="h-5 w-5 text-accent-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">SharedClip</h1>
            <p className="text-sm text-text-muted">Real-time shareable clipboard for rich text.</p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Create New Clipboard</Button>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4 text-text-muted" />
            Open a clipboard
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={openInput}
              onChange={(e) => setOpenInput(e.target.value)}
              placeholder="Paste a code or shared link (e.g., ABC123 or https://.../c/ABC123)"
              aria-label="Clipboard code or URL"
            />
            <Button onClick={onOpen} disabled={!parseClipboardInput(openInput)}>
              Open
            </Button>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Tip: you can share a read-only or read/write link. Paste either here.
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Recent clipboards</div>
            <Button variant="ghost" onClick={() => clearRecents()}>
              Clear
            </Button>
          </div>
          <div className="mt-3">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by code" />
          </div>
          <div className="mt-3 space-y-2">
            {recents.length === 0 ? (
              <div className="text-sm text-text-muted">No recents yet.</div>
            ) : (
              recents.map((r) => (
                <button
                  key={r.id}
                  className="flex w-full items-center justify-between rounded-xl bg-surface-800 px-3 py-2 text-left ring-1 ring-white/10 hover:bg-surface-700"
                  onClick={() => nav(`/c/${r.id}`)}
                >
                  <div>
                    <div className="font-mono text-sm">{r.id}</div>
                    <div className="text-xs text-text-muted">Last opened: {new Date(r.lastOpenedAt).toLocaleString()}</div>
                  </div>
                  <span className="text-xs text-text-muted">Open</span>
                </button>
              ))
            )}
          </div>
        </Card>
      </div>

      <Modal open={createOpen} title="Create clipboard" onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Timer className="h-4 w-4" /> Expiration
              </div>
              <select
                className="w-full rounded-xl bg-surface-800 px-3 py-2 text-sm ring-1 ring-white/10"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value as '1h' | '1d' | 'never')}
              >
                <option value="never">Never</option>
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
              </select>
            </label>

            <label className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Shield className="h-4 w-4" /> Optional password
              </div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="(optional)" />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
              {createMut.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>

          {createMut.isError ? (
            <div className="text-sm text-red-400">Failed to create: {(createMut.error as Error).message}</div>
          ) : null}
        </div>
      </Modal>

    </div>
  )
}

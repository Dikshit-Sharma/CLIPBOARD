import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Copy, Link2, Lock, Settings, Share2 } from 'lucide-react'
import { Button, Card, Input, Modal } from '../components/ui'
import { ApiError, authClipboard, getClipboardMeta, updateClipboardSettings } from '../services/api'
import { createClipboardSocket, type PresenceUser } from '../services/realtime'
import type { ClipboardSettings, ClipboardState, ClipboardRole, ClipboardActivity } from '../types'
import { RichEditor } from '../components/RichEditor'
import { ActivityFeed } from '../components/ActivityFeed'
import { PresenceBar } from '../components/PresenceBar'
import { getStoredTokens } from '../lib/tokens'
import { saveRecent } from '../lib/recent'
import { getCachedState, setCachedState } from '../lib/cache'

export function ClipboardPage() {
  const { id } = useParams<{ id: string }>()
  const [sp] = useSearchParams()
  const nav = useNavigate()

  const token = sp.get('token') || undefined

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [password, setPassword] = useState('')

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [role, setRole] = useState<ClipboardRole>('read')

  const [state, setState] = useState<Omit<ClipboardState, 'role'> | null>(null)
  const [presence, setPresence] = useState<PresenceUser[]>([])
  const [error, setError] = useState<string | null>(null)

  const socketRef = useRef<ReturnType<typeof createClipboardSocket> | null>(null)

  const metaQ = useQuery({
    queryKey: ['meta', id],
    queryFn: () => getClipboardMeta(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to reduce Firestore reads
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  })

  const authMut = useMutation({
    mutationFn: (input: { token?: string; password?: string }) => authClipboard(id!, input),
    onSuccess: (data) => {
      setSessionToken(data.sessionToken)
      setRole(data.role)
      setPasswordOpen(false)
      setError(null)
      saveRecent(id!)
    },
    onError: (e: unknown) => {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setPasswordOpen(true)
          return
        }
        setError(e.message)
        return
      }

      setError(e instanceof Error ? e.message : 'Auth failed')
    }
  })

  // Try auth as soon as meta is loaded.
  useEffect(() => {
    if (!id) return
    if (!metaQ.data) return

    // Prefer token from URL; otherwise if we created it on this device, use stored write token.
    const stored = getStoredTokens(id)
    const candidateToken = token || stored?.writeToken || stored?.readToken

    // If protected and we have no token, we must prompt.
    if (metaQ.data.protected && !candidateToken) {
      setPasswordOpen(true)
      return
    }

    if (!sessionToken && !authMut.isPending) authMut.mutate({ token: candidateToken })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, metaQ.data, token])

  // Socket connection
  useEffect(() => {
    if (!id || !sessionToken) {
      // Try to load from cache while waiting for auth
      if (id) {
        const cached = getCachedState(id)
        if (cached) {
          setState({
            id: cached.id,
            contentHtml: cached.contentHtml,
            contentUpdatedAt: cached.contentUpdatedAt,
            // defensive cast: cached may originate from older versions and activity items sometimes
            // contain generic string types; the types.ts now accepts string-based activity.type.
            activity: (cached.activity as ClipboardActivity[]) || [],
            settings: cached.settings as ClipboardSettings
          })
        }
      }
      return
    }

    const socket = createClipboardSocket()
    socketRef.current = socket

    socket.on('clipboard:error', (p) => setError(p.message))
    socket.on('presence:update', (p) => setPresence(p.users))
    socket.on('clipboard:state', (s) => {
      setRole(s.role)
      const newState = {
        id: s.id,
        contentHtml: s.contentHtml,
        contentUpdatedAt: s.contentUpdatedAt,
        activity: s.activity,
        settings: s.settings
      }
      setState(newState)
      // Cache the state to reduce future reads
      setCachedState(id, newState)
    })
    socket.on('clipboard:content:updated', (p) => {
      setState((prev) => {
        if (!prev) return prev
        if (new Date(p.contentUpdatedAt).getTime() < new Date(prev.contentUpdatedAt).getTime()) return prev
        return { ...prev, contentHtml: p.html, contentUpdatedAt: p.contentUpdatedAt }
      })
    })

    socket.emit('clipboard:join', { clipboardId: id, sessionToken })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [id, sessionToken])

  const isWrite = role === 'write'

  const downloadLink = useMemo(() => {
    const origin = window.location.origin
    const current = `${origin}/c/${id}${token ? `?token=${encodeURIComponent(token)}` : ''}`
    return current
  }, [id, token])

  const shareLinks = useMemo(() => {
    if (!id) return null
    const stored = getStoredTokens(id)
    const origin = window.location.origin
    return {
      current: `${origin}/c/${id}${token ? `?token=${encodeURIComponent(token)}` : ''}`,
      read: stored?.readToken ? `${origin}/c/${id}?token=${encodeURIComponent(stored.readToken)}` : null,
      write: stored?.writeToken ? `${origin}/c/${id}?token=${encodeURIComponent(stored.writeToken)}` : null
    }
  }, [id, token])

  const settingsMut = useMutation({
    mutationFn: (input: Partial<ClipboardSettings> & { expiresIn?: '1h' | '1d' | 'never'; password?: string | null }) =>
      updateClipboardSettings(id!, sessionToken!, input),
    onSuccess: (data) => {
      setState((prev) => (prev ? { ...prev, settings: data.settings } : prev))
      setSettingsOpen(false)
    }
  })

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  if (!id) return null

  if (metaQ.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Failed to load clipboard.
          </div>
          <pre className="mt-3 whitespace-pre-wrap text-xs text-text-muted">{(metaQ.error as Error).message}</pre>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => nav('/')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => nav('/')}
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Button>
          <div className="rounded-xl bg-surface-900 px-3 py-2 ring-1 ring-white/10">
            <div className="text-xs text-text-muted">Clipboard code</div>
            <div className="font-mono text-sm">{id}</div>
          </div>
          <Button variant="ghost" onClick={() => copyToClipboard(id)} aria-label="Copy code">
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PresenceBar users={presence} />

          <Button
            variant="ghost"
            onClick={() => copyToClipboard(shareLinks?.current || downloadLink)}
            aria-label="Copy current link"
          >
            <Link2 className="h-4 w-4" />
            Copy link
          </Button>

          <Button variant="ghost" onClick={() => setShareOpen(true)} aria-label="Share">
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {isWrite ? (
            <Button variant="ghost" onClick={() => setSettingsOpen(true)} aria-label="Settings">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-surface-900 px-3 py-2 text-xs text-text-muted ring-1 ring-white/10">
              <Lock className="h-4 w-4" /> Read-only
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/20">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Shared content</div>
            {state ? (
              <div className="text-xs text-text-muted">Last update: {new Date(state.contentUpdatedAt).toLocaleString()}</div>
            ) : null}
          </div>
          <div className="mt-3">
            <RichEditor
              html={state?.contentHtml || '<p></p>'}
              editable={isWrite}
              onDebouncedUpdate={(html) => socketRef.current?.emit('clipboard:content:update', { html })}
              onLocalUpdate={(html) =>
                setState((prev) => (prev ? { ...prev, contentHtml: html, contentUpdatedAt: new Date().toISOString() } : prev))
              }
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-sm font-medium">Activity</div>
            <div className="mt-3">
              <ActivityFeed items={state?.activity || []} />
            </div>
          </Card>
        </div>
      </div>

      <Modal open={passwordOpen} title="Password required" onClose={() => setPasswordOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-text-muted">This clipboard is protected. Enter the password to continue.</p>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => nav('/')}>Cancel</Button>
            <Button onClick={() => authMut.mutate({ token, password })}>
              Unlock
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={shareOpen} title="Share" onClose={() => setShareOpen(false)}>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-text-muted">Current link</div>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={shareLinks?.current || downloadLink} />
              <Button onClick={() => copyToClipboard(shareLinks?.current || downloadLink)}>Copy</Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted">Read-only link</div>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={shareLinks?.read || 'Not available (only shown for clipboards created on this device)'} />
              <Button onClick={() => shareLinks?.read && copyToClipboard(shareLinks.read)} disabled={!shareLinks?.read}>
                Copy
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted">Read/write link</div>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={shareLinks?.write || 'Not available (only shown for clipboards created on this device)'} />
              <Button onClick={() => shareLinks?.write && copyToClipboard(shareLinks.write)} disabled={!shareLinks?.write}>
                Copy
              </Button>
            </div>
          </div>

          <p className="text-xs text-text-muted">
            Anyone with a link token can access the clipboard. Treat links like passwords.
          </p>
        </div>
      </Modal>

      <SettingsModal
        key={settingsOpen ? 'open' : 'closed'}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        current={state?.settings}
        protected={metaQ.data?.protected || false}
        onSave={(input) => settingsMut.mutate(input)}
        busy={settingsMut.isPending}
      />
    </div>
  )
}

function SettingsModal(props: {
  open: boolean
  onClose: () => void
  current?: ClipboardSettings
  protected: boolean
  busy: boolean
  onSave: (input: Partial<ClipboardSettings> & { expiresIn?: '1h' | '1d' | 'never'; password?: string | null }) => void
}) {
  // These are initialized when the modal opens; we remount SettingsModal on open in the parent.
  const [expiresIn, setExpiresIn] = useState<'1h' | '1d' | 'never'>('never')
  const [password, setPassword] = useState<string>('')
  const [removePassword, setRemovePassword] = useState(false)

  return (
    <Modal open={props.open} title="Clipboard settings" onClose={props.onClose}>
      <div className="space-y-4">
        <label className="space-y-1">
          <div className="text-xs text-text-muted">Expiration (resets from now)</div>
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

        <div className="rounded-xl bg-surface-800 p-3 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Password</div>
            <div className="text-xs text-text-muted">{props.protected ? 'Enabled' : 'Not set'}</div>
          </div>
          <div className="mt-2 space-y-2">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (leave empty to keep)" />
            {props.protected ? (
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" checked={removePassword} onChange={(e) => setRemovePassword(e.target.checked)} />
                Remove password
              </label>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              props.onSave({
                expiresIn,
                password: removePassword ? null : password.trim() ? password.trim() : undefined
              })
            }
            disabled={props.busy}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}

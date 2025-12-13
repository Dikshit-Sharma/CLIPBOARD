import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowLeft, Copy, Link2, Lock, Settings, Share2, Trash2, Github } from 'lucide-react'
import { Button, Card, Input, Modal } from '../components/ui'
import { ApiError, authClipboard, getClipboardMeta, getClipboardState, updateClipboardSettings, deleteClipboard } from '../services/api'
import { createClipboardSocket, type PresenceUser } from '../services/realtime'
import type { ClipboardSettings, ClipboardState, ClipboardRole, ClipboardActivity } from '../types'
import { RichEditor } from '../components/RichEditor'
import { ActivityFeed } from '../components/ActivityFeed'
import { PresenceBar } from '../components/PresenceBar'
import { getStoredTokens } from '../lib/tokens'
import { saveRecent, removeRecent } from '../lib/recent'
import { getCachedState, setCachedState } from '../lib/cache'
import { trackClipboardOpened, trackClipboardShared, trackClipboardDeleted, trackContentUpdated, trackSettingsUpdated } from '../lib/analytics'

export function ClipboardPage() {
  const { id } = useParams<{ id: string }>()
  const [sp] = useSearchParams()
  const nav = useNavigate()

  const token = sp.get('token') || undefined

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [password, setPassword] = useState('')

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

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

  // Pre-load state via REST API while socket is connecting (for Citrix compatibility)
  useEffect(() => {
    if (!id || !sessionToken) return

    // Load state via REST API immediately (faster than waiting for socket)
    getClipboardState(id, sessionToken)
      .then((initialState) => {
        setState(initialState)
        setCachedState(id, initialState)
      })
      .catch((err) => {
        // If REST API fails, socket will handle it
        console.warn('Failed to pre-load state via REST API:', err)
      })
  }, [id, sessionToken])

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
      // Always accept authoritative server state
      setState((prev) => {
        // Track clipboard opened on first actual state
        if (!prev && id) {
          trackClipboardOpened(id, token ? 'link' : 'code')
        }
        return newState
      })
      // Cache the state to reduce future reads
      setCachedState(id, newState)
    })
    socket.on('clipboard:content:updated', (p) => {
      setState((prev) => {
        if (!prev) return prev
        if (new Date(p.contentUpdatedAt).getTime() < new Date(prev.contentUpdatedAt).getTime()) return prev
        const newState = { ...prev, contentHtml: p.html, contentUpdatedAt: p.contentUpdatedAt }
        // Update cache with the new content to prevent data loss on refresh
        setCachedState(id, newState)
        return newState
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
    onSuccess: (data, variables) => {
      setState((prev) => (prev ? { ...prev, settings: data.settings } : prev))
      setSettingsOpen(false)
      // Track settings update
      if (id) {
        trackSettingsUpdated(id, {
          expires_in: variables.expiresIn,
          has_password: variables.password !== undefined && variables.password !== null
        })
      }
    }
  })

  const deleteMut = useMutation({
    mutationFn: () => {
      if (!id || !sessionToken) throw new Error('Missing clipboard ID or session token')
      return deleteClipboard(id, sessionToken)
    },
    onSuccess: () => {
      // Track deletion
      if (id) {
        trackClipboardDeleted(id)
      }
      removeRecent(id!)
      nav('/')
    }
  })

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  if (!id) return null

  if (metaQ.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-8">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <div className="rounded-full bg-red-500/20 p-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Failed to load clipboard</h2>
              <p className="text-sm text-text-muted mt-1">There was an error loading this clipboard.</p>
            </div>
          </div>
          <pre className="mt-4 p-4 rounded-xl bg-surface-800 whitespace-pre-wrap text-xs text-text-muted ring-1 ring-white/10">
            {(metaQ.error as Error).message}
          </pre>
          <div className="mt-6">
            <Button variant="ghost" onClick={() => nav('/')} className="hover:bg-surface-700">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Enhanced Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-surface-900/90 via-surface-800/80 to-surface-900/90 p-6 ring-1 ring-white/10 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => nav('/')} aria-label="Back" className="hover:bg-surface-700">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="rounded-xl bg-gradient-to-br from-accent-500/10 to-accent-400/5 px-4 py-2.5 ring-1 ring-accent-500/20">
              <div className="text-xs font-medium text-accent-400/80 uppercase tracking-wide">Clipboard ID</div>
              <div className="font-mono text-base font-semibold text-text-primary mt-0.5">{id}</div>
            </div>
            <Button variant="ghost" onClick={() => copyToClipboard(id)} aria-label="Copy code" className="hover:bg-surface-700">
              <Copy className="h-4 w-4" />
              <span className="hidden sm:inline">Copy ID</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://github.com/Dikshit-Sharma/CLIPBOARD"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-surface-800/80 px-3 py-2 text-xs font-medium text-text-primary hover:bg-surface-700 border border-white/10 hover:border-white/20 transition-all duration-200"
              title="View on GitHub"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <PresenceBar users={presence} />

            <Button
              variant="ghost"
              onClick={() => copyToClipboard(shareLinks?.current || downloadLink)}
              aria-label="Copy current link"
              className="hover:bg-surface-700"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Copy link</span>
            </Button>

            <Button variant="ghost" onClick={() => setShareOpen(true)} aria-label="Share" className="hover:bg-surface-700">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>

          {isWrite ? (
            <>
              <Button variant="ghost" onClick={() => setSettingsOpen(true)} aria-label="Settings" className="hover:bg-surface-700">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setDeleteOpen(true)}
                aria-label="Delete clipboard"
                className="hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-surface-800/80 to-surface-700/60 px-3 py-2 text-xs text-text-muted ring-1 ring-white/10">
              <Lock className="h-4 w-4 text-accent-400" />
              <span className="font-medium">Read-only</span>
            </div>
          )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/20 shadow-lg animate-slide-up">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main Content Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Shared Content</h2>
              {state ? (
                <div className="text-xs text-text-muted mt-1">
                  Last updated: {new Date(state.contentUpdatedAt).toLocaleString()}
                </div>
              ) : (
                <div className="text-xs text-text-muted mt-1">Loading content...</div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <RichEditor
              html={state?.contentHtml || '<p></p>'}
              editable={isWrite}
              onDebouncedUpdate={(html) => {
                socketRef.current?.emit('clipboard:content:update', { html })
                // Track content update
                if (id) {
                  trackContentUpdated(id, html.length)
                }
              }}
              onLocalUpdate={(html) =>
                setState((prev) => (prev ? { ...prev, contentHtml: html, contentUpdatedAt: new Date().toISOString() } : prev))
              }
            />
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-accent-500 to-accent-400"></div>
              <h3 className="text-base font-semibold text-text-primary">Activity Feed</h3>
            </div>
            <ActivityFeed items={state?.activity || []} />
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
              <Button
                onClick={() => {
                  copyToClipboard(shareLinks?.current || downloadLink)
                  if (id) trackClipboardShared(id, 'current')
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted">Read-only link</div>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={shareLinks?.read || 'Not available (only shown for clipboards created on this device)'} />
              <Button
                onClick={() => {
                  if (shareLinks?.read) {
                    copyToClipboard(shareLinks.read)
                    if (id) trackClipboardShared(id, 'read')
                  }
                }}
                disabled={!shareLinks?.read}
              >
                Copy
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs text-text-muted">Read/write link</div>
            <div className="mt-1 flex gap-2">
              <Input readOnly value={shareLinks?.write || 'Not available (only shown for clipboards created on this device)'} />
              <Button
                onClick={() => {
                  if (shareLinks?.write) {
                    copyToClipboard(shareLinks.write)
                    if (id) trackClipboardShared(id, 'write')
                  }
                }}
                disabled={!shareLinks?.write}
              >
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

      <Modal open={deleteOpen} title="Delete Clipboard" onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <div className="rounded-xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-300 mb-1">Warning: This action cannot be undone</h3>
                <p className="text-sm text-text-muted">
                  Deleting this clipboard will permanently remove all content, settings, and activity. This action cannot be reversed.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMut.mutate()}
              disabled={deleteMut.isPending}
              className="min-w-[100px]"
            >
              {deleteMut.isPending ? 'Deleting…' : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
          {deleteMut.isError && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/20">
              Failed to delete: {(deleteMut.error as Error).message}
            </div>
          )}
        </div>
      </Modal>
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
  <>
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
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (leave empty to keep)"
            />
            {props.protected ? (
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input
                  type="checkbox"
                  checked={removePassword}
                  onChange={(e) => setRemovePassword(e.target.checked)}
                />
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
                password: removePassword
                  ? null
                  : password.trim()
                  ? password.trim()
                  : undefined
              })
            }
            disabled={props.busy}
          >
            Save
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
  </>
)
}

import { Router, type NextFunction, type Request, type Response } from 'express'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { getClipboard, createClipboard, updateClipboard, deleteClipboard } from '../db.js'
import { generateUploadUrl, deleteFileFromStorage } from '../storage.js'
import type { Clipboard, ClipboardActivity, ClipboardRole, ClipboardFile } from '../types.js'

import { generateToken, sha256Hex, signSession, verifySession, verifyIdToken, type ClipboardSession } from '../auth.js'
import { emitClipboardContentUpdated, emitClipboardPresence } from '../socket.js'

export const clipboardsRouter = Router()

function nowIso() {
  return new Date().toISOString()
}

function computeExpiresAt(expiresIn: '1h' | '1d' | 'never') {
  if (expiresIn === 'never') return null
  const ms = expiresIn === '1h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  return new Date(Date.now() + ms).toISOString()
}

function isExpired(cb: Clipboard) {
  return cb.expiresAt ? Date.now() > new Date(cb.expiresAt).getTime() : false
}

function toActivity(type: ClipboardActivity['type'], summary: string): ClipboardActivity {
  return { id: nanoid(10), type, summary, at: nowIso() }
}

function parseRoleFromTokenHash(cb: Clipboard, token: string | undefined): ClipboardRole | null {
  if (!token) return null
  const h = sha256Hex(token)
  if (h === cb.writeTokenHash) return 'write'
  if (h === cb.readTokenHash) return 'read'
  return null
}

const createSchema = z.object({
  expiresIn: z.enum(['1h', '1d', 'never']).default('never'),
  password: z.string().min(4).max(128).optional(),
  title: z.string().max(100).optional()
})

clipboardsRouter.post('/', async (req, res) => {
  try {
    const body = createSchema.parse(req.body || {})
    const authHeader = req.headers.authorization
    let ownerId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      ownerId = await verifyIdToken(token)
    }

    const id = nanoid(8)
    const readToken = generateToken(18)
    const writeToken = generateToken(18)

    const passwordHash = body.password ? await bcrypt.hash(body.password, 10) : null

    const cb: Clipboard = {
      id,
      ownerId,
      title: body.title || null,
      createdAt: nowIso(),
      expiresAt: computeExpiresAt(body.expiresIn),
      passwordHash,
      readTokenHash: sha256Hex(readToken),
      writeTokenHash: sha256Hex(writeToken),
      settings: {},
      contentHtml: '<p></p>',
      contentUpdatedAt: nowIso(),
      activity: [toActivity('created', 'Clipboard created')],
      files: []
    }

    await createClipboard(cb)

    const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '')
    const readUrl = base ? `${base}/c/${id}?token=${readToken}` : `/c/${id}?token=${readToken}`
    const writeUrl = base ? `${base}/c/${id}?token=${writeToken}` : `/c/${id}?token=${writeToken}`

    res.json({
      id,
      tokens: { readToken, writeToken },
      urls: { readUrl, writeUrl },
      expiresAt: cb.expiresAt
    })
  } catch (error) {
    console.error('Error creating clipboard:', error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.issues })
    }
    const message = error instanceof Error ? error.message : 'Failed to create clipboard'
    res.status(500).json({ error: message })
  }
})

clipboardsRouter.get('/:id/meta', async (req, res) => {
  const id = req.params.id
  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })
  if (isExpired(cb)) return res.status(410).json({ error: 'Expired' })

  res.json({
    id: cb.id,
    createdAt: cb.createdAt,
    expiresAt: cb.expiresAt,
    protected: Boolean(cb.passwordHash),
    title: cb.title,
    settings: cb.settings
  })
})

const authSchema = z.object({
  token: z.string().optional(),
  password: z.string().optional()
})

clipboardsRouter.post('/:id/auth', async (req, res) => {
  const id = req.params.id
  const body = authSchema.parse(req.body || {})

  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })
  if (isExpired(cb)) return res.status(410).json({ error: 'Expired' })

  const roleFromToken = parseRoleFromTokenHash(cb, body.token)

  if (cb.passwordHash && !roleFromToken) {
    if (!body.password) return res.status(401).json({ error: 'Password required' })
    const ok = await bcrypt.compare(body.password, cb.passwordHash)
    if (!ok) return res.status(403).json({ error: 'Invalid password' })
  }

  const role: ClipboardRole = roleFromToken || 'write'
  const sessionToken = signSession({ clipboardId: id, role })

  res.json({ sessionToken, role })
})

type AuthedRequest = Request & { session: ClipboardSession }

function requireSession(req: Request, res: Response, next: NextFunction) {
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!token) return res.status(401).json({ error: 'Missing session' })

  try {
    const session = verifySession(token)
    ;(req as AuthedRequest).session = session
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid session' })
  }
}

clipboardsRouter.get('/:id/state', requireSession, async (req: Request, res: Response) => {
  const authed = req as AuthedRequest
  const id = req.params.id
  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })
  if (isExpired(cb)) return res.status(410).json({ error: 'Expired' })
  if (authed.session.clipboardId !== id) return res.status(403).json({ error: 'Forbidden' })

  res.json({
    id: cb.id,
    contentHtml: cb.contentHtml,
    contentUpdatedAt: cb.contentUpdatedAt,
    activity: cb.activity,
    title: cb.title,
    settings: cb.settings,
    files: cb.files || []
  })
})

const settingsSchema = z.object({
  expiresIn: z.enum(['1h', '1d', 'never']).optional(),
  password: z.string().min(4).max(128).nullable().optional(),
  title: z.string().max(100).nullable().optional()
})

clipboardsRouter.post('/:id/settings', requireSession, async (req: Request, res: Response) => {
  const authed = req as AuthedRequest
  const id = req.params.id
  if (authed.session.clipboardId !== id) return res.status(403).json({ error: 'Forbidden' })
  if (authed.session.role !== 'write') return res.status(403).json({ error: 'Read-only' })

  const body = settingsSchema.parse(req.body || {})

  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })

  const updates: Partial<Clipboard> = {}

  if (body.expiresIn) updates.expiresAt = computeExpiresAt(body.expiresIn)
  if (body.title !== undefined) updates.title = body.title
  if (body.password !== undefined) {
    updates.passwordHash = body.password === null ? null : await bcrypt.hash(body.password, 10)
  }

  const newActivity = toActivity('settings-updated', 'Settings updated')
  updates.activity = [newActivity, ...cb.activity]

  await updateClipboard(id, updates)

  const updated = await getClipboard(id)
  if (!updated) return res.status(500).json({ error: 'Failed to update' })

  res.json({ ok: true, expiresAt: updated.expiresAt, settings: updated.settings, protected: Boolean(updated.passwordHash) })
})

clipboardsRouter.post('/:id/files/presign', requireSession, async (req: Request, res: Response) => {
  const authed = req as AuthedRequest
  const id = req.params.id
  if (authed.session.clipboardId !== id) return res.status(403).json({ error: 'Forbidden' })
  if (authed.session.role !== 'write') return res.status(403).json({ error: 'Read-only' })

  const { name, type, size } = req.body
  if (!name || !type || !size) return res.status(400).json({ error: 'Missing file info' })

  // Limit 150MB
  if (size > 150 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 150MB)' })

  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })

  // Only allow uploads for owned clipboards (registered users)
  if (!cb.ownerId) return res.status(403).json({ error: 'Uploads require an account' })

  try {
    const { url, path, publicUrl, token, fileId } = await generateUploadUrl(name, type)
    res.json({ url, path, publicUrl, token, fileId })
  } catch (err) {
    console.error('Presign error:', err)
    res.status(500).json({ error: 'Failed to generate upload URL' })
  }
})

clipboardsRouter.post('/:id/files', requireSession, async (req: Request, res: Response) => {
  const authed = req as AuthedRequest
  const id = req.params.id
  if (authed.session.clipboardId !== id) return res.status(403).json({ error: 'Forbidden' })
  if (authed.session.role !== 'write') return res.status(403).json({ error: 'Read-only' })

  const body = req.body as ClipboardFile

  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })

  const newActivity = toActivity('content-updated', `File uploaded: ${body.name}`)
  const files = cb.files || []

  await updateClipboard(id, {
    files: [body, ...files],
    activity: [newActivity, ...cb.activity]
  })

  res.json({ ok: true })
})

clipboardsRouter.delete('/:id/files/:fileId', requireSession, async (req: Request, res: Response) => {
  const authed = req as AuthedRequest
  const id = req.params.id
  const fileId = req.params.fileId

  if (authed.session.clipboardId !== id) return res.status(403).json({ error: 'Forbidden' })
  if (authed.session.role !== 'write') return res.status(403).json({ error: 'Read-only' })

  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })

  const files = cb.files || []
  const file = files.find(f => f.id === fileId)
  if (!file) return res.status(404).json({ error: 'File not found' })

  // Delete from Storage
  await deleteFileFromStorage(file.path)

  // Update DB
  const newActivity = toActivity('content-updated', `File deleted: ${file.name}`)
  await updateClipboard(id, {
    files: files.filter(f => f.id !== fileId),
    activity: [newActivity, ...cb.activity]
  })

  res.json({ ok: true })
})

// Update content via REST (fallback) - Socket.IO is preferred
const contentSchema = z.object({ html: z.string().max(500_000) })

clipboardsRouter.post('/:id/content', requireSession, async (req: Request, res: Response) => {
  const authed = req as AuthedRequest
  const id = req.params.id
  if (authed.session.clipboardId !== id) return res.status(403).json({ error: 'Forbidden' })
  if (authed.session.role !== 'write') return res.status(403).json({ error: 'Read-only' })

  const body = contentSchema.parse(req.body || {})

  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })

  const newActivity = toActivity('content-updated', 'Content updated')
  await updateClipboard(id, {
    contentHtml: body.html,
    contentUpdatedAt: nowIso(),
    activity: [newActivity, ...cb.activity]
  })

  const updated = await getClipboard(id)
  if (!updated) return res.status(500).json({ error: 'Failed to update' })

  emitClipboardContentUpdated(id, { html: updated.contentHtml, contentUpdatedAt: updated.contentUpdatedAt })

  res.json({ ok: true })
})

// Delete clipboard endpoint
clipboardsRouter.delete('/:id', requireSession, async (req: Request, res: Response) => {
  const authed = req as AuthedRequest
  const id = req.params.id
  if (authed.session.clipboardId !== id) return res.status(403).json({ error: 'Forbidden' })
  if (authed.session.role !== 'write') return res.status(403).json({ error: 'Read-only' })

  const cb = await getClipboard(id)
  if (!cb) return res.status(404).json({ error: 'Not found' })

  await deleteClipboard(id)

  res.json({ ok: true })
})

// Presence endpoint (debug)
clipboardsRouter.get('/:id/presence', async (req, res) => {
  const id = req.params.id
  const list = emitClipboardPresence(id)
  res.json({ users: list })
})

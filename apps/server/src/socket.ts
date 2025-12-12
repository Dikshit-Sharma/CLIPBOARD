import type http from 'node:http'
import { Server } from 'socket.io'
import { getClipboard, updateClipboard } from './db.js'
import { verifySession } from './auth.js'
import { nanoid } from 'nanoid'

let ioRef: Server | null = null

const presenceByClipboard = new Map<string, Map<string, { id: string; connectedAt: string }>>()
const pendingContentUpdates = new Map<string, Map<string, { html: string; timer: NodeJS.Timeout }>>()

function nowIso() {
  return new Date().toISOString()
}

export function attachSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },

    // 🔥 MAKE CITRIX COMPATIBLE
    transports: ['polling', 'websocket'],     
    allowEIO3: true,                            // support older enterprise proxies
    pingTimeout: 30000,
    pingInterval: 25000
  })

  ioRef = io

  io.on('connection', (socket) => {
    socket.on('clipboard:join', async (payload: { clipboardId: string; sessionToken: string }) => {
      try {
        const session = verifySession(payload.sessionToken)
        if (session.clipboardId !== payload.clipboardId) {
          socket.emit('clipboard:error', { message: 'Forbidden' })
          return
        }

        const cb = await getClipboard(payload.clipboardId)
        if (!cb) {
          socket.emit('clipboard:error', { message: 'Not found' })
          return
        }
        if (cb.expiresAt && Date.now() > new Date(cb.expiresAt).getTime()) {
          socket.emit('clipboard:error', { message: 'Expired' })
          return
        }

        const room = `clipboard:${payload.clipboardId}`
        await socket.join(room)

        socket.data.clipboardId = payload.clipboardId
        socket.data.role = session.role

        const existing = presenceByClipboard.get(payload.clipboardId) || new Map()
        existing.set(socket.id, { id: socket.id, connectedAt: nowIso() })
        presenceByClipboard.set(payload.clipboardId, existing)

        io.to(room).emit('presence:update', { users: Array.from(existing.values()) })

        socket.emit('clipboard:state', {
          id: cb.id,
          role: session.role,
          contentHtml: cb.contentHtml,
          contentUpdatedAt: cb.contentUpdatedAt,
          activity: cb.activity,
          settings: cb.settings
        })

        socket.on('clipboard:content:update', async (msg: { html: string }) => {
          if (socket.data.role !== 'write') return

          const clipboardId = payload.clipboardId

          let clipboardPending = pendingContentUpdates.get(clipboardId)
          if (!clipboardPending) {
            clipboardPending = new Map()
            pendingContentUpdates.set(clipboardId, clipboardPending)
          }

          const existing = clipboardPending.get(socket.id)
          if (existing) clearTimeout(existing.timer)

          io.to(room).emit('clipboard:content:updated', {
            html: msg.html,
            contentUpdatedAt: nowIso()
          })

          const timer = setTimeout(async () => {
            try {
              const cb2 = await getClipboard(clipboardId)
              if (!cb2) return

              const contentUpdatedAt = nowIso()
              const newActivity = {
                id: nanoid(10),
                type: 'content-updated',
                at: contentUpdatedAt,
                summary: 'Content updated'
              }

              await updateClipboard(clipboardId, {
                contentHtml: msg.html,
                contentUpdatedAt,
                activity: [newActivity, ...cb2.activity]
              })

              io.to(room).emit('clipboard:content:updated', {
                html: msg.html,
                contentUpdatedAt
              })
            } finally {
              clipboardPending!.delete(socket.id)
              if (clipboardPending!.size === 0) {
                pendingContentUpdates.delete(clipboardId)
              }
            }
          }, 500)

          clipboardPending.set(socket.id, { html: msg.html, timer })
        })
      } catch {
        socket.emit('clipboard:error', { message: 'Unauthorized' })
      }
    })

    socket.on('disconnect', () => {
      const clipboardId = socket.data.clipboardId as string | undefined
      if (!clipboardId) return

      const map = presenceByClipboard.get(clipboardId)
      if (map) {
        map.delete(socket.id)
        const room = `clipboard:${clipboardId}`
        io.to(room).emit('presence:update', { users: Array.from(map.values()) })
      }

      const clipboardPending = pendingContentUpdates.get(clipboardId)
      if (clipboardPending) {
        const pending = clipboardPending.get(socket.id)
        if (pending) {
          clearTimeout(pending.timer)
          getClipboard(clipboardId)
            .then((cb2) => {
              if (!cb2) return
              const contentUpdatedAt = nowIso()
              const newActivity = {
                id: nanoid(10),
                type: 'content-updated',
                at: contentUpdatedAt,
                summary: 'Content updated'
              }
              return updateClipboard(clipboardId, {
                contentHtml: pending.html,
                contentUpdatedAt,
                activity: [newActivity, ...cb2.activity]
              })
            })
            .finally(() => {
              clipboardPending.delete(socket.id)
              if (clipboardPending.size === 0) {
                pendingContentUpdates.delete(clipboardId)
              }
            })
        }
      }
    })
  })

  setInterval(async () => {
    try {
      const now = Date.now()
      for (const [id] of presenceByClipboard.entries()) {
        const cb = await getClipboard(id)
        if (cb && cb.expiresAt && now > new Date(cb.expiresAt).getTime()) {
          presenceByClipboard.delete(id)
        }
      }
    } catch {}
  }, 60000)
}

export function emitClipboardContentUpdated(clipboardId: string, payload: { html: string; contentUpdatedAt: string }) {
  if (!ioRef) return
  ioRef.to(`clipboard:${clipboardId}`).emit('clipboard:content:updated', payload)
}

export function emitClipboardPresence(clipboardId: string) {
  const map = presenceByClipboard.get(clipboardId) || new Map()
  return Array.from(map.values())
}

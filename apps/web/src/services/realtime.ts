import { io, type Socket } from 'socket.io-client'
import { SOCKET_URL } from '../env'
import type { ClipboardFile, ClipboardState } from '../types'

export type PresenceUser = { id: string; connectedAt: string }

export type ClipboardSocket = Socket<
  {
    'clipboard:state': (state: ClipboardState) => void
    'clipboard:content:updated': (payload: { html: string; contentUpdatedAt: string }) => void
    'clipboard:file:added': (payload: { file: ClipboardFile }) => void
    'presence:update': (payload: { users: PresenceUser[] }) => void
    'clipboard:error': (payload: { message: string }) => void
  },
  {
    'clipboard:join': (payload: { clipboardId: string; sessionToken: string }) => void
    'clipboard:content:update': (payload: { html: string }) => void
  }
>

export function createClipboardSocket() {
  return io(SOCKET_URL, {
    // Allow polling first (better for Citrix/proxies), then upgrade to websocket
    transports: ['polling', 'websocket'],
    // Start with polling for better Citrix compatibility
    upgrade: true,
    // Increase connection timeout for slow Citrix networks
    timeout: 20000, // 20 seconds (default is 20s, but explicit helps)
    // Enable reconnection with exponential backoff
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000, // Start with 1 second
    reconnectionDelayMax: 5000, // Max 5 seconds between retries
    // Randomize reconnection delay to avoid thundering herd
    randomizationFactor: 0.5,
    autoConnect: true,
    // Force new connection (helps with Citrix session issues)
    forceNew: false
  }) as unknown as ClipboardSocket
}

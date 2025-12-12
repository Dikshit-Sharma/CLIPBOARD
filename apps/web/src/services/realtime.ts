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
    transports: ['websocket'],
    autoConnect: true
  }) as unknown as ClipboardSocket
}

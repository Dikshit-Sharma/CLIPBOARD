import { getAuth } from 'firebase/auth'
import { app } from '../lib/firebase'
import { API_BASE_URL } from '../env'
import type { ClipboardMeta, ClipboardSettings, ClipboardState } from '../types'

function joinUrl(base: string, p: string) {
  return `${base.replace(/\/$/, '')}${p.startsWith('/') ? '' : '/'}${p}`
}

export type CreateClipboardInput = {
  expiresIn: '1h' | '1d' | 'never'
  password?: string
  title?: string
}

export async function createClipboard(input: CreateClipboardInput) {
  try {
    const auth = getAuth(app)
    const token = await auth.currentUser?.getIdToken()

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(joinUrl(API_BASE_URL, '/api/clipboards'), {
      method: 'POST',
      headers,
      body: JSON.stringify(input)
    })

    if (!res.ok) {
      const errorText = await res.text()
      let errorMessage = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorText
      } catch {
        // Not JSON, use as-is
      }
      throw new Error(errorMessage || `HTTP ${res.status}`)
    }

    return (await res.json()) as {
      id: string
      tokens: { readToken: string; writeToken: string }
      urls: { readUrl: string; writeUrl: string }
      expiresAt: string | null
    }
  } catch (error) {
    if (error instanceof Error) {
      // Improve error message for network errors
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(
          `Cannot connect to server at ${API_BASE_URL}. ` +
          `Make sure the backend is running and check your VITE_API_BASE_URL environment variable.`
        )
      }
      throw error
    }
    throw new Error('Failed to create clipboard')
  }
}

export async function getClipboardMeta(id: string) {
  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${id}/meta`))
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as ClipboardMeta
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function authClipboard(id: string, input: { token?: string; password?: string }) {
  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${id}/auth`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  })
  if (!res.ok) {
    throw new ApiError(res.status, await res.text())
  }
  return (await res.json()) as { sessionToken: string; role: 'read' | 'write' }
}

export async function getClipboardState(id: string, sessionToken: string) {
  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${id}/state`), {
    headers: { Authorization: `Bearer ${sessionToken}` }
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as Omit<ClipboardState, 'role'>
}

export async function updateClipboardSettings(id: string, sessionToken: string, input: Partial<ClipboardSettings> & { expiresIn?: '1h' | '1d' | 'never'; password?: string | null }) {
  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${id}/settings`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`
    },
    body: JSON.stringify(input)
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as {
    ok: true
    expiresAt: string | null
    settings: ClipboardSettings
    protected: boolean
  }
}

export async function deleteClipboard(id: string, sessionToken: string) {
  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${id}`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${sessionToken}`
    }
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || `HTTP ${res.status}`)
  }
  return (await res.json()) as { ok: true }
}

export async function presignUpload(id: string, sessionToken: string, file: { name: string; type: string; size: number }, userToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sessionToken}`
  }
  if (userToken) headers['x-user-token'] = userToken

  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${id}/files/presign`), {
    method: 'POST',
    headers,
    body: JSON.stringify(file)
  })

  if (!res.ok) {
     const errorText = await res.text()
     let errorMessage = errorText
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error || errorText
      } catch { /* empty */ }
    throw new Error(errorMessage || `HTTP ${res.status}`)
  }

  return (await res.json()) as { url: string; path: string; publicUrl: string; token?: string; fileId: string }
}

export async function saveFileMetadata(id: string, sessionToken: string, fileData: any, userToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${sessionToken}`
  }
  if (userToken) headers['x-user-token'] = userToken

  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${id}/files`), {
    method: 'POST',
    headers,
    body: JSON.stringify(fileData)
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

export async function deleteFile(clipboardId: string, fileId: string, sessionToken: string, userToken?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${sessionToken}`
  }
  if (userToken) headers['x-user-token'] = userToken

  const res = await fetch(joinUrl(API_BASE_URL, `/api/clipboards/${clipboardId}/files/${fileId}`), {
    method: 'DELETE',
    headers
  })
  if (!res.ok) throw new Error(await res.text())
  return await res.json()
}

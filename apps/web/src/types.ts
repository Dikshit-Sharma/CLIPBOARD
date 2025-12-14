export type ClipboardRole = 'read' | 'write'

export type ClipboardSettings = {
  // Reserved for future settings
}

export type ClipboardActivity = {
  id: string
  // allow string to accommodate incoming activity types from older cached data or external sources.
  // the usual values are 'created' | 'content-updated' | 'settings-updated'
  type: string
  at: string
  summary: string
}

export type ClipboardFile = {
  id: string
  name: string
  size: number
  mimeType?: string
  url: string
  uploadedAt?: string
}

export type ClipboardMeta = {
  id: string
  createdAt: string
  expiresAt: string | null
  protected: boolean
  title?: string | null
  settings: ClipboardSettings
}

export type ClipboardState = {
  id: string
  role: ClipboardRole
  contentHtml: string
  contentUpdatedAt: string
  activity: ClipboardActivity[]
  settings: ClipboardSettings
}

export type Clipboard = {
  id: string
  ownerId?: string | null
  title?: string | null
  createdAt: string
  expiresAt: string | null
  passwordHash: string | null
  readTokenHash: string
  writeTokenHash: string
  settings: ClipboardSettings
  contentHtml: string
  contentUpdatedAt: string
  activity: ClipboardActivity[]
  folderId?: string | null
  isFavorite?: boolean
  isArchived?: boolean
}

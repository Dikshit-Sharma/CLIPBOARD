export type ClipboardRole = 'read' | 'write'

export type ClipboardSettings = {
  // Reserved for future settings
}

export type ClipboardActivity = {
  id: string
  type: 'created' | 'content-updated' | 'settings-updated'
  at: string
  summary: string
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
  // User-specific fields (handled by client, but good to have in type if we sync)
  folderId?: string | null
  isFavorite?: boolean
  isArchived?: boolean
}

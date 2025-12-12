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
  createdAt: string
  expiresAt: string | null
  passwordHash: string | null
  readTokenHash: string
  writeTokenHash: string
  settings: ClipboardSettings
  contentHtml: string
  contentUpdatedAt: string
  activity: ClipboardActivity[]
}

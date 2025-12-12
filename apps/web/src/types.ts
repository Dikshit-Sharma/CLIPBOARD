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

export type ClipboardMeta = {
  id: string
  createdAt: string
  expiresAt: string | null
  protected: boolean
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

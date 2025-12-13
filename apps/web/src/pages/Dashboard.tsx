import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import {
  Clipboard, Search, Plus, Clock, Star, Archive, Folder,
  MoreVertical, Trash2, Copy, ExternalLink, ArrowLeft,
  Sparkles, Filter, Grid, List, FolderPlus
} from 'lucide-react'
import { Button, Card, Input, Modal } from '../components/ui'
import { useAuth } from '../lib/auth'
import { createClipboard } from '../services/api'
import { storeTokens } from '../lib/tokens'
import { trackClipboardCreated } from '../lib/analytics'

// Mock data for now - will be replaced with Firestore queries
type ClipboardItem = {
  id: string
  contentPreview: string
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  isArchived: boolean
  folderId: string | null
  tags: string[]
}

type FolderItem = {
  id: string
  name: string
  color: string
  clipboardCount: number
}

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showArchived, setShowArchived] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  // Placeholder data - will be replaced with real Firestore queries
  const [clipboards] = useState<ClipboardItem[]>([])
  const [folders] = useState<FolderItem[]>([])

  // Filter clipboards based on search, folder, favorites, archived
  const filteredClipboards = useMemo(() => {
    return clipboards.filter(cb => {
      if (showArchived !== cb.isArchived) return false
      if (showFavoritesOnly && !cb.isFavorite) return false
      if (selectedFolder && cb.folderId !== selectedFolder) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return cb.id.toLowerCase().includes(q) ||
               cb.contentPreview.toLowerCase().includes(q)
      }
      return true
    })
  }, [clipboards, searchQuery, selectedFolder, showFavoritesOnly, showArchived])

  const createMut = useMutation({
    mutationFn: () => createClipboard({ expiresIn: 'never' }),
    onSuccess: (data) => {
      storeTokens(data.id, data.tokens)
      setCreateOpen(false)
      trackClipboardCreated(data.id, false, 'never')
      navigate(`/c/${data.id}?token=${encodeURIComponent(data.tokens.writeToken)}`)
    }
  })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <Card className="p-8 text-center max-w-md">
          <div className="rounded-full bg-accent-500/10 p-4 inline-block mb-4">
            <Clipboard className="h-8 w-8 text-accent-400" />
          </div>
          <h1 className="text-xl font-bold mb-2">Sign in to view your clipboards</h1>
          <p className="text-text-muted mb-4">Create an account to save and organize your clipboards.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
            Go to Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">My Clipboards</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Clipboard</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-4 sticky top-24">
              <nav className="space-y-1">
                <button
                  onClick={() => { setSelectedFolder(null); setShowArchived(false); setShowFavoritesOnly(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedFolder && !showArchived && !showFavoritesOnly
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-text-primary hover:bg-surface-800'
                  }`}
                >
                  <Clipboard className="h-4 w-4" />
                  All Clipboards
                  <span className="ml-auto text-xs text-text-muted">{clipboards.filter(c => !c.isArchived).length}</span>
                </button>
                <button
                  onClick={() => { setShowFavoritesOnly(true); setShowArchived(false); setSelectedFolder(null) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    showFavoritesOnly
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-text-primary hover:bg-surface-800'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  Favorites
                  <span className="ml-auto text-xs text-text-muted">{clipboards.filter(c => c.isFavorite && !c.isArchived).length}</span>
                </button>
                <button
                  onClick={() => { setShowArchived(true); setShowFavoritesOnly(false); setSelectedFolder(null) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    showArchived
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-text-primary hover:bg-surface-800'
                  }`}
                >
                  <Archive className="h-4 w-4" />
                  Archived
                  <span className="ml-auto text-xs text-text-muted">{clipboards.filter(c => c.isArchived).length}</span>
                </button>
              </nav>

              {/* Folders */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Folders</span>
                  <button
                    onClick={() => setCreateFolderOpen(true)}
                    className="p-1 rounded hover:bg-surface-800 text-text-muted hover:text-text-primary"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {folders.length === 0 ? (
                    <p className="text-xs text-text-muted px-3 py-2">No folders yet</p>
                  ) : (
                    folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => { setSelectedFolder(folder.id); setShowArchived(false); setShowFavoritesOnly(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedFolder === folder.id
                            ? 'bg-accent-500/20 text-accent-400'
                            : 'text-text-primary hover:bg-surface-800'
                        }`}
                      >
                        <Folder className="h-4 w-4" style={{ color: folder.color }} />
                        <span className="truncate">{folder.name}</span>
                        <span className="ml-auto text-xs text-text-muted">{folder.clipboardCount}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clipboards..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-surface-700' : ''}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-surface-700' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Clipboard Grid/List */}
            {filteredClipboards.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="rounded-full bg-surface-800/50 p-4 inline-block mb-4">
                  <Clipboard className="h-8 w-8 text-text-muted/50" />
                </div>
                <h2 className="text-lg font-semibold mb-2">No clipboards yet</h2>
                <p className="text-text-muted mb-4">
                  {showArchived
                    ? 'No archived clipboards'
                    : showFavoritesOnly
                    ? 'No favorite clipboards'
                    : 'Create your first clipboard to get started'}
                </p>
                {!showArchived && !showFavoritesOnly && (
                  <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
                    <Sparkles className="h-4 w-4" />
                    Create Clipboard
                  </Button>
                )}
              </Card>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-3'
              }>
                {filteredClipboards.map((cb) => (
                  <Card
                    key={cb.id}
                    className="p-4 hover:ring-white/20 cursor-pointer transition-all group"
                    onClick={() => navigate(`/c/${cb.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-mono text-sm font-semibold text-accent-400">
                        {cb.id}
                      </div>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-surface-700 transition-all"
                      >
                        <MoreVertical className="h-4 w-4 text-text-muted" />
                      </button>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2 mb-3">
                      {cb.contentPreview || 'Empty clipboard'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(cb.updatedAt).toLocaleDateString()}</span>
                      {cb.isFavorite && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 ml-auto" />}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Folder Modal */}
      <Modal open={createFolderOpen} title="Create Folder" onClose={() => setCreateFolderOpen(false)}>
        <div className="space-y-4">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                // TODO: Create folder in Firestore
                setCreateFolderOpen(false)
                setNewFolderName('')
              }}
              disabled={!newFolderName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

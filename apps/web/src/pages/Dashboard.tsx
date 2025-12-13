import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid, List as ListIcon, Star, Clock, Folder,
  Plus, Search, Archive, Trash2, Shield
} from 'lucide-react'
import { Button, Input, Card, Modal } from '../components/ui'
import { useClipboards } from '../hooks/useClipboards'
import { useAuth } from '../lib/auth'

function getTimeAgo(isoString: string) {
  const date = new Date(isoString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute')
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour')
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), 'day')
  return rtf.format(-Math.floor(seconds / 2592000), 'month')
}

export function Dashboard() {
  const nav = useNavigate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth()
  const {
    clipboards, folders, favorites, archived, loading,
    createFolder, deleteFolder, toggleFavorite, toggleArchive, updateClipboard, deleteClipboard
  } = useClipboards()

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'archived'>('all')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  // Filter Logic
  const filteredClipboards = clipboards.filter(cb => {
    // 1. Search
    if (search) {
      const match = cb.contentHtml.toLowerCase().includes(search.toLowerCase()) ||
                    cb.settings?.title?.toLowerCase().includes(search.toLowerCase())
      if (!match) return false
    }

    // 2. Tab / Folder Logic
    const isArchived = archived.has(cb.id)

    if (activeTab === 'archived') {
      return isArchived
    }

    // Hide archived from other views
    if (isArchived) return false

    if (activeTab === 'favorites') {
      return favorites.has(cb.id)
    }

    if (selectedFolder) {
      // In a folder view
      return cb.folderId === selectedFolder
    }

    // 'all' view
    return true
  })

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    await createFolder(newFolderName)
    setNewFolderName('')
    setIsNewFolderOpen(false)
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    const clipboardId = e.dataTransfer.getData('text/plain')
    if (clipboardId) {
      await updateClipboard(clipboardId, { folderId })
    }
  }

  const handleDragStart = (e: React.DragEvent, clipboardId: string) => {
    e.dataTransfer.setData('text/plain', clipboardId)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-text-muted">Loading dashboard...</div>
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-6 overflow-y-auto">
        <div className="space-y-1">
          <Button
            variant={activeTab === 'all' && !selectedFolder ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => { setActiveTab('all'); setSelectedFolder(null) }}
          >
            <Clock className="h-4 w-4" /> All Clipboards
          </Button>
          <Button
            variant={activeTab === 'favorites' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => { setActiveTab('favorites'); setSelectedFolder(null) }}
          >
            <Star className="h-4 w-4" /> Favorites
          </Button>
          <Button
            variant={activeTab === 'archived' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3"
            onClick={() => { setActiveTab('archived'); setSelectedFolder(null) }}
          >
            <Archive className="h-4 w-4" /> Archived
          </Button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Folders</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsNewFolderOpen(true)}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          {folders.map(folder => (
            <div
              key={folder.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder.id)}
            >
              <Button
                variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 group relative"
                onClick={() => { setSelectedFolder(folder.id); setActiveTab('all') }}
              >
                <Folder className="h-4 w-4 text-accent-500" />
                <span className="truncate flex-1 text-left">{folder.name}</span>
                {/* Delete Folder Action */}
                <span
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 cursor-pointer absolute right-2"
                  onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id) }}
                >
                  <Trash2 className="h-3 w-3" />
                </span>
              </Button>
            </div>
          ))}
          {folders.length === 0 && (
            <div className="text-sm text-text-muted px-2 py-4 text-center border border-dashed border-white/10 rounded-lg">
              No folders yet
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name :
             activeTab === 'favorites' ? 'Favorites' :
             activeTab === 'archived' ? 'Archived' : 'All Clipboards'}
          </h1>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex p-1 bg-surface-800 rounded-lg border border-white/10">
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setView('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => nav('/')}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-surface-900/50">
          {filteredClipboards.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted">
              <div className="p-4 rounded-full bg-surface-800 mb-4">
                <Search className="h-8 w-8 opacity-50" />
              </div>
              <p>No clipboards found</p>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
              {filteredClipboards.map(cb => (
                <div
                  key={cb.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, cb.id)}
                >
                  <Card className={`group relative hover:border-accent-500/50 transition-colors ${view === 'grid' ? 'h-48' : 'h-16 flex items-center px-4'}`}>
                    <div
                      className={`cursor-pointer ${view === 'grid' ? 'p-4 h-full flex flex-col' : 'flex-1 grid grid-cols-[1fr,auto,auto] gap-4 items-center'}`}
                      onClick={() => nav(`/c/${cb.id}?token=${cb.readTokenHash}`)}
                    >
                      {/* Content Preview */}
                      <div className={`${view === 'grid' ? 'flex-1 mb-2 mask-linear-fade' : ''} overflow-hidden font-mono text-xs text-text-muted`}>
                         <div dangerouslySetInnerHTML={{ __html: cb.contentHtml || '<span class="italic opacity-50">Empty</span>' }} />
                      </div>

                      {/* Meta */}
                      <div className={`flex items-center gap-2 text-xs text-text-muted ${view === 'grid' ? 'border-t border-white/5 pt-3 mt-auto' : ''}`}>
                        <span>{getTimeAgo(cb.createdAt)} ago</span>
                        {cb.passwordHash && <Shield className="h-3 w-3 text-emerald-400" />}
                        {activeTab === 'all' && favorites.has(cb.id) && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFavorite(cb.id)}>
                          <Star className={`h-3 w-3 ${favorites.has(cb.id) ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleArchive(cb.id)}>
                          <Archive className={`h-3 w-3 ${archived.has(cb.id) ? 'text-accent-400' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-400" onClick={() => deleteClipboard(cb.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)}>
        <form onSubmit={handleCreateFolder} className="p-6">
          <h2 className="text-lg font-bold mb-4">Create New Folder</h2>
          <Input
            autoFocus
            placeholder="Folder Name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsNewFolderOpen(false)}>Cancel</Button>
            <Button type="submit">Create Folder</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Star,
  Folder,
  Archive,
  Trash2,
  Shield,
  Check,
  Ban
} from 'lucide-react'
import { Button, Card, Modal } from './ui'
import type { Clipboard } from '../types'
import type { Folder as FolderType } from '../hooks/useClipboards'

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

interface ClipboardCardProps {
  clipboard: Clipboard
  folders: FolderType[]
  isFavorite: boolean
  isArchived: boolean
  view: 'grid' | 'list'
  onToggleFavorite: (id: string) => void
  onToggleArchive: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, folderId: string | null) => void
}

export function ClipboardCard({
  clipboard: cb,
  folders,
  isFavorite,
  isArchived,
  view,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  onMove
}: ClipboardCardProps) {
  const nav = useNavigate()
  const [isMoveOpen, setIsMoveOpen] = useState(false)

  const handleMove = (folderId: string | null) => {
    onMove(cb.id, folderId)
    setIsMoveOpen(false)
  }

  // Determine current folder name if any
  const currentFolder = cb.folderId ? folders.find(f => f.id === cb.folderId) : null

  return (
    <>
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', cb.id)}
      >
        <Card className={`group relative hover:border-accent-500/50 transition-colors ${view === 'grid' ? 'h-52' : 'h-20 flex items-center px-4'}`}>
          <div
            className={`cursor-pointer ${view === 'grid' ? 'p-4 h-full flex flex-col' : 'flex-1 grid grid-cols-[1fr,auto,auto] gap-4 items-center'}`}
            onClick={() => nav(`/c/${cb.id}?token=${cb.readTokenHash}`)}
          >
            {/* Header / Content */}
            <div className={`${view === 'grid' ? 'flex-1 mb-2 overflow-hidden' : 'min-w-0'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  {cb.title ? (
                    <h3 className="text-sm font-semibold text-text-primary truncate">{cb.title}</h3>
                  ) : (
                    <h3 className="text-xs font-mono text-text-muted truncate opacity-70">{cb.id}</h3>
                  )}
                  {view === 'list' && (
                    <div className="text-xs text-text-muted truncate mt-0.5 opacity-60">
                      {cb.contentHtml.replace(/<[^>]*>/g, '').slice(0, 50)}
                    </div>
                  )}
                </div>
                {view === 'grid' && (
                   <div className="flex shrink-0 gap-1">
                      {cb.passwordHash && <Shield className="h-3 w-3 text-emerald-400" />}
                      {isFavorite && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
                   </div>
                )}
              </div>

              {view === 'grid' && (
                <div className="font-mono text-xs text-text-muted bg-surface-900/50 p-2 rounded border border-white/5 whitespace-pre-wrap break-all flex-1 h-[calc(100%-2rem)] overflow-hidden opacity-80 mask-linear-fade relative">
                    {cb.contentHtml ? cb.contentHtml.replace(/<[^>]*>/g, '').slice(0, 300) : <span className="italic opacity-50">Empty</span>}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
                </div>
              )}
            </div>

            {/* List View Meta */}
            {view === 'list' && (
              <div className="flex items-center gap-4 text-xs text-text-muted">
                 <span>{getTimeAgo(cb.createdAt)}</span>
                 {cb.passwordHash && <Shield className="h-3 w-3 text-emerald-400" />}
                 {isFavorite && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
                 {currentFolder && (
                   <span className="flex items-center gap-1 text-accent-400/80 bg-accent-500/10 px-2 py-0.5 rounded-full">
                     <Folder className="h-3 w-3" /> {currentFolder.name}
                   </span>
                 )}
              </div>
            )}

            {/* Grid View Footer (Meta + Actions) */}
            {view === 'grid' && (
              <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                <div className="flex items-center gap-2 text-[10px] text-text-muted uppercase tracking-wider font-medium opacity-60">
                  <span>{getTimeAgo(cb.createdAt)}</span>
                  {currentFolder && (
                    <span className="flex items-center gap-1 text-accent-400 max-w-[80px] truncate" title={currentFolder.name}>
                      <Folder className="h-3 w-3" /> {currentFolder.name}
                    </span>
                  )}
                </div>

                {/* Actions (Always visible on mobile, hover on desktop) */}
                <div
                   className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                   onClick={e => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-yellow-400" onClick={() => onToggleFavorite(cb.id)} title="Favorite">
                    <Star className={`h-3 w-3 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                  </Button>

                  <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-accent-400" onClick={() => setIsMoveOpen(true)} title="Move to Folder">
                    <Folder className={`h-3 w-3 ${cb.folderId ? 'text-accent-400 fill-accent-400/20' : ''}`} />
                  </Button>

                  <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-text-primary" onClick={() => onToggleArchive(cb.id)} title="Archive">
                    <Archive className={`h-3 w-3 ${isArchived ? 'text-accent-400' : ''}`} />
                  </Button>

                  <Button variant="ghost" size="icon" className="h-7 w-7 text-text-muted hover:text-red-400" onClick={() => onDelete(cb.id)} title="Delete">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

             {/* List View Actions */}
             {view === 'list' && (
               <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleFavorite(cb.id)}>
                    <Star className={`h-4 w-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMoveOpen(true)}>
                    <Folder className={`h-4 w-4 ${cb.folderId ? 'text-accent-400 fill-accent-400/20' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleArchive(cb.id)}>
                    <Archive className={`h-4 w-4 ${isArchived ? 'text-accent-400' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-400" onClick={() => onDelete(cb.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
               </div>
             )}
          </div>
        </Card>
      </div>

      {/* Move Modal */}
      <Modal open={isMoveOpen} onClose={() => setIsMoveOpen(false)} title="Move to Folder">
         <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-sm text-text-muted mb-4">Select a folder for <strong>{cb.title || cb.id}</strong>:</p>

            <button
               className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${!cb.folderId ? 'bg-accent-500/10 border-accent-500/50 text-accent-400' : 'bg-surface-800 border-white/5 hover:bg-surface-700 text-text-muted'}`}
               onClick={() => handleMove(null)}
            >
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-900/50">
                     <Ban className="h-4 w-4" />
                  </div>
                  <span className="font-medium">No Folder</span>
               </div>
               {!cb.folderId && <Check className="h-4 w-4" />}
            </button>

            {folders.map(f => (
               <button
                  key={f.id}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${cb.folderId === f.id ? 'bg-accent-500/10 border-accent-500/50 text-accent-400' : 'bg-surface-800 border-white/5 hover:bg-surface-700 text-text-primary'}`}
                  onClick={() => handleMove(f.id)}
               >
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-lg bg-surface-900/50">
                        <Folder className="h-4 w-4" />
                     </div>
                     <span className="font-medium">{f.name}</span>
                  </div>
                  {cb.folderId === f.id && <Check className="h-4 w-4" />}
               </button>
            ))}

            {folders.length === 0 && (
               <div className="text-center py-6 text-text-muted text-sm border border-dashed border-white/10 rounded-xl">
                  No folders created yet.
               </div>
            )}
         </div>
      </Modal>
    </>
  )
}

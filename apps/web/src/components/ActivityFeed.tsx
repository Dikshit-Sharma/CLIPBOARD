import type { ClipboardActivity } from '../types'
import { Clock, FileEdit, UserPlus } from 'lucide-react'

const activityIcons: Record<string, React.ReactNode> = {
  'content-updated': <FileEdit className="h-4 w-4" />,
  'clipboard-created': <UserPlus className="h-4 w-4" />
}

export function ActivityFeed(props: { items: ClipboardActivity[] }) {
  if (props.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-8 w-8 text-text-muted/50 mb-2" />
        <div className="text-sm text-text-muted">No activity yet.</div>
        <div className="text-xs text-text-muted mt-1">Activity will appear here as changes are made.</div>
      </div>
    )
  }

  return (
    <div className="max-h-80 space-y-2 overflow-auto pr-1">
      {props.items.slice(0, 50).map((a, index) => (
        <div
          key={a.id}
          className="group rounded-xl bg-gradient-to-br from-surface-800/80 to-surface-800/60 px-3 py-2.5 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-200 hover:shadow-md animate-slide-up"
          style={{ animationDelay: `${index * 20}ms` }}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5 text-accent-400 opacity-70 group-hover:opacity-100 transition-opacity">
              {activityIcons[a.type] || <FileEdit className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-primary font-medium">{a.summary}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                <Clock className="h-3 w-3" />
                {new Date(a.at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

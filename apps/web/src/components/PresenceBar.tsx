import { Users, Circle } from 'lucide-react'
import type { PresenceUser } from '../services/realtime'

export function PresenceBar(props: { users: PresenceUser[] }) {
  const count = props.users.length

  return (
    <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-surface-900/90 to-surface-800/80 px-3 py-2 text-xs text-text-muted ring-1 ring-white/10 hover:ring-white/20 transition-all duration-200">
      <div className="relative">
        <Users className="h-4 w-4 text-accent-400" />
        {count > 0 && (
          <Circle className="absolute -top-0.5 -right-0.5 h-2 w-2 fill-green-500 text-green-500 animate-pulse-slow" />
        )}
      </div>
      <span className="font-medium text-text-primary">
        {count} {count === 1 ? 'user' : 'users'} online
      </span>
    </div>
  )
}

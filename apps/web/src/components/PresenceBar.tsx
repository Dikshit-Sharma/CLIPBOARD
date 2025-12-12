import { Users } from 'lucide-react'
import type { PresenceUser } from '../services/realtime'

export function PresenceBar(props: { users: PresenceUser[] }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-surface-900 px-3 py-2 text-xs text-text-muted ring-1 ring-white/10">
      <Users className="h-4 w-4" />
      {props.users.length} online
    </div>
  )
}

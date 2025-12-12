import type { ClipboardActivity } from '../types'

export function ActivityFeed(props: { items: ClipboardActivity[] }) {
  if (props.items.length === 0) {
    return <div className="text-sm text-text-muted">No activity yet.</div>
  }

  return (
    <div className="max-h-80 space-y-2 overflow-auto pr-1">
      {props.items.slice(0, 50).map((a) => (
        <div key={a.id} className="rounded-xl bg-surface-800 px-3 py-2 ring-1 ring-white/10">
          <div className="text-sm">{a.summary}</div>
          <div className="text-xs text-text-muted">{new Date(a.at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

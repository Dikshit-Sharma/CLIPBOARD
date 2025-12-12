import { Link } from 'react-router-dom'
import { Card } from '../components/ui'

export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card className="p-6">
        <h1 className="text-lg font-semibold">Not found</h1>
        <p className="mt-2 text-sm text-text-muted">That route doesn’t exist.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-accent-400">
          Go home
        </Link>
      </Card>
    </div>
  )
}

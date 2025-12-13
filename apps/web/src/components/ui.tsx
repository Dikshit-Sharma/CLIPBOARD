import { type PropsWithChildren, useEffect } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

export function Button(
  props: PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }
  >
) {
  const { className, variant = 'primary', ...rest } = props

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-950 focus:ring-accent-500/60 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
  const variants = {
    primary: 'bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-400 hover:to-accent-300 active:scale-95',
    ghost: 'bg-surface-800/80 hover:bg-surface-700 text-text-primary border border-white/10 hover:border-white/20',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 active:scale-95'
  }

  return <button className={clsx(base, variants[variant], className)} {...rest} />
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return (
    <input
      className={clsx(
        'w-full rounded-xl bg-surface-800/80 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none',
        'ring-1 ring-white/10 focus:ring-2 focus:ring-accent-500/50 focus:bg-surface-800',
        'transition-all duration-200 shadow-sm focus:shadow-md',
        className
      )}
      {...rest}
    />
  )
}

export function Card(props: PropsWithChildren<{ className?: string; onClick?: () => void }>) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-gradient-to-br from-surface-900/90 to-surface-800/80 ring-1 ring-white/10 shadow-lg hover:shadow-xl transition-all duration-300',
        props.className
      )}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  )
}

export function Modal(
  props: PropsWithChildren<{ open: boolean; title: string; onClose: () => void; className?: string }>
) {
  const { open, onClose, title, children, className } = props

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={clsx(
          'w-full max-w-lg rounded-2xl bg-gradient-to-br from-surface-900 to-surface-800 p-6 ring-1 ring-white/10 shadow-2xl animate-zoom-in-95',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 hover:bg-surface-700 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

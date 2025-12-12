import { type PropsWithChildren, useEffect } from 'react'
import clsx from 'clsx'

export function Button(
  props: PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }
  >
) {
  const { className, variant = 'primary', ...rest } = props

  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent-500/60 disabled:opacity-50'
  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-400',
    ghost: 'bg-surface-800 hover:bg-surface-700 text-text-primary',
    danger: 'bg-red-600 hover:bg-red-500 text-white'
  }

  return <button className={clsx(base, variants[variant], className)} {...rest} />
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return (
    <input
      className={clsx(
        'w-full rounded-xl bg-surface-800 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-accent-500/50',
        className
      )}
      {...rest}
    />
  )
}

export function Card(props: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('rounded-2xl bg-surface-900 ring-1 ring-white/10', props.className)}>{props.children}</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className={clsx('w-full max-w-lg rounded-2xl bg-surface-900 p-4 ring-1 ring-white/10', className)}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

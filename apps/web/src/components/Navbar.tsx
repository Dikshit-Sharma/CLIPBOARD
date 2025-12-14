import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Clipboard, Sparkles, Github, LogIn, Timer, Shield, Menu, X } from 'lucide-react'
import { Button, Input, Modal } from './ui' // improved import path
import { UserMenu } from './UserMenu'
import { AuthModal } from './AuthModal'
import { FeedbackModal } from './FeedbackModal'
import { useAuth } from '../lib/auth'
import { createClipboard } from '../services/api'
import { storeTokens } from '../lib/tokens'
import { saveRecent } from '../lib/recent'
import { trackClipboardCreated } from '../lib/analytics'

export function Navbar() {
  const nav = useNavigate()
  const { user, loading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Create Clipboard State
  const [expiresIn, setExpiresIn] = useState<'1h' | '1d' | 'never'>('never')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')

  const createMut = useMutation({
    mutationFn: () =>
      createClipboard({
        expiresIn,
        password: password.trim() ? password.trim() : undefined,
        title: title.trim() || undefined
      }),
    onSuccess: (data) => {
      storeTokens(data.id, data.tokens)
      saveRecent(data.id, title.trim() || undefined)
      setCreateOpen(false)
      // Track clipboard creation
      trackClipboardCreated(data.id, Boolean(password.trim()), expiresIn)
      // Extract token from writeUrl or use stored token
      const writeToken = data.tokens.writeToken
      nav(`/c/${data.id}${writeToken ? `?token=${encodeURIComponent(writeToken)}` : ''}`)
      // Reset state
      setPassword('')
      setTitle('')
      setExpiresIn('never')
    }
  })

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-bg-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity !no-underline">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-400/10 ring-1 ring-accent-500/30">
                <Clipboard className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-text-primary to-text-primary/80 bg-clip-text text-transparent">
                  SharedClip <span className="text-sm text-text-muted">Beta</span>
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors !no-underline">
                Home
              </Link>
              <Link to="/about" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors !no-underline">
                About
              </Link>
              <Link to="/how-it-works" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors !no-underline">
                How it Works
              </Link>
              <Link to="/use-cases" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors !no-underline">
                Use Cases
              </Link>
              <button
                onClick={() => setFeedbackOpen(true)}
                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                Feedback
              </button>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="https://github.com/Dikshit-Sharma/CLIPBOARD"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-surface-800/50 text-text-muted hover:text-text-primary hover:bg-surface-800 ring-1 ring-white/5 hover:ring-white/10 transition-all"
                title="View on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>

              <div className="h-4 w-px bg-white/10 mx-1" />

              {loading ? (
                <div className="w-8 h-8 rounded-full bg-surface-800 animate-pulse" />
              ) : user ? (
                <UserMenu />
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true)}>
                  <LogIn className="h-4 w-4" />
                  <span className="ml-2">Sign In</span>
                </Button>
              )}

              <Button size="sm" onClick={() => setCreateOpen(true)} className="shadow-lg shadow-accent-500/10">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="ml-2">Create New</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-text-muted hover:text-text-primary"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-surface-900/95 backdrop-blur-xl">
            <div className="space-y-1 px-4 py-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-text-muted hover:bg-surface-800 hover:text-text-primary rounded-lg !no-underline"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-text-muted hover:bg-surface-800 hover:text-text-primary rounded-lg !no-underline"
              >
                About
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-text-muted hover:bg-surface-800 hover:text-text-primary rounded-lg !no-underline"
              >
                How it Works
              </Link>
              <Link
                to="/use-cases"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-text-muted hover:bg-surface-800 hover:text-text-primary rounded-lg !no-underline"
              >
                Use Cases
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setFeedbackOpen(true)
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-text-muted hover:bg-surface-800 hover:text-text-primary rounded-lg"
              >
                Feedback
              </button>

              <div className="my-2 border-t border-white/5" />

              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-medium text-text-muted">Theme</span>
                 {/* Theme Toggle could go here if extracted, but for now simple structure */}
              </div>

               <div className="px-3 py-2">
                 {user ? (
                   <div className="flex items-center gap-3">
                     <UserMenu />
                     <span className="text-sm text-text-primary">{user.email}</span>
                   </div>
                 ) : (
                   <Button variant="ghost" className="w-full justify-start" onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}>
                     <LogIn className="h-4 w-4" />
                     <span className="ml-2">Sign In</span>
                   </Button>
                 )}
               </div>

                <div className="px-3 py-2">
                   <Button className="w-full" onClick={() => { setCreateOpen(true); setMobileMenuOpen(false); }}>
                    <Sparkles className="h-4 w-4" />
                    <span className="ml-2">Create New Clipboard</span>
                  </Button>
                </div>
            </div>
          </div>
        )}
      </header>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Create Clipboard Modal */}
      <Modal open={createOpen} title="Create New Clipboard" onClose={() => setCreateOpen(false)}>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Timer className="h-4 w-4 text-accent-400" /> Expiration
              </div>
              <select
                className="w-full rounded-xl bg-surface-800 px-4 py-2.5 text-sm text-text-primary ring-1 ring-white/10 focus:ring-2 focus:ring-accent-500/50 outline-none transition-all"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value as '1h' | '1d' | 'never')}
              >
                <option value="never">Never expires</option>
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
              </select>
            </label>

            <label className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Shield className="h-4 w-4 text-accent-400" /> Optional Password
              </div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (optional)"
                type="password"
              />
            </label>
          </div>

          <label className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Sparkles className="h-4 w-4 text-accent-400" /> Clipboard Name (Optional)
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Notes, Shopping List"
            />
          </label>

          {createMut.isError && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/20">
              Failed to create: {(createMut.error as Error).message}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending} className="min-w-[100px]">
              {createMut.isPending ? (
                <>
                  <span className="animate-pulse">Creating…</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

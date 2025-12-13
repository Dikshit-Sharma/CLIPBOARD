import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { Modal, Button, Input } from './ui'
import { AlertTriangle, Mail, Github, Loader2 } from 'lucide-react'

// Google Icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup' | 'reset'

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, resetPassword, error, clearError } = useAuth()

  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMode('signin')
      setEmail('')
      setPassword('')
      setDisplayName('')
      setResetSent(false)
      clearError()
    }
  }, [open, clearError])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      onClose()
    } catch {
      // Error handled by context
    } finally {
      setLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGithub()
      onClose()
    } catch {
      // Error handled by context
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (mode === 'signin') {
        await signInWithEmail(email, password)
        onClose()
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName || undefined)
        onClose()
      } else if (mode === 'reset') {
        await resetPassword(email)
        setResetSent(true)
      }
    } catch {
      // Error handled by context
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    clearError()
    setResetSent(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
    >
      <div className="space-y-4">
        {/* OAuth Buttons */}
        {mode !== 'reset' && (
          <>
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full justify-center gap-2 ring-1 ring-white/10 hover:ring-white/20"
              >
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </Button>
              <Button
                variant="ghost"
                onClick={handleGithubSignIn}
                disabled={loading}
                className="w-full justify-center gap-2 ring-1 ring-white/10 hover:ring-white/20"
              >
                <Github className="h-5 w-5" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-900 px-2 text-text-muted">or continue with email</span>
              </div>
            </div>
          </>
        )}

        {/* Reset password success message */}
        {resetSent && (
          <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-300 ring-1 ring-green-500/20">
            Password reset email sent! Check your inbox.
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {mode === 'signup' && (
            <Input
              type="text"
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
            />
          )}
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          {mode !== 'reset' && (
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <Mail className="h-4 w-4" />
                Sign In
              </>
            ) : mode === 'signup' ? (
              <>
                <Mail className="h-4 w-4" />
                Create Account
              </>
            ) : (
              'Send Reset Email'
            )}
          </Button>
        </form>

        {/* Mode switcher */}
        <div className="text-center text-sm text-text-muted space-y-1">
          {mode === 'signin' && (
            <>
              <p>
                Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-accent-400 hover:underline">
                  Sign up
                </button>
              </p>
              <p>
                <button onClick={() => switchMode('reset')} className="text-accent-400 hover:underline">
                  Forgot password?
                </button>
              </p>
            </>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => switchMode('signin')} className="text-accent-400 hover:underline">
                Sign in
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              Remember your password?{' '}
              <button onClick={() => switchMode('signin')} className="text-accent-400 hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-surface-800/80 px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-700 border border-white/10 hover:border-white/20 transition-all duration-200"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="h-6 w-6 rounded-full ring-2 ring-accent-500/30"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        )}
        <span className="hidden sm:inline max-w-[120px] truncate">
          {user.displayName || user.email?.split('@')[0] || 'User'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-surface-900 border border-white/10 shadow-xl z-50 overflow-hidden animate-slide-up">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-white/10 bg-surface-800/50">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                navigate('/dashboard')
                setOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-800 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-text-muted" />
              My Clipboards
            </button>
            <button
              onClick={() => {
                navigate('/settings')
                setOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-800 transition-colors"
            >
              <Settings className="h-4 w-4 text-text-muted" />
              Settings
            </button>
          </div>

          {/* Sign out */}
          <div className="border-t border-white/10 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

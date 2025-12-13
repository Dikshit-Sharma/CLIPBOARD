import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Moon, Sun, Monitor, Palette, Keyboard, Shield, Trash2 } from 'lucide-react'
import { Button, Card, Modal } from '../components/ui'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'

export function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { theme, setTheme, accentColor, setAccentColor } = useTheme()

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  if (!user) {
    navigate('/')
    return null
  }

  const accentColors = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
  ]

  return (
    <div className="min-h-screen bg-bg-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg-950/80 backdrop-blur-lg border-b border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent-400" />
            Profile
          </h2>
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-16 w-16 rounded-full ring-2 ring-accent-500/30"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-2xl font-bold text-white">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h3 className="font-semibold">{user.displayName || 'User'}</h3>
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* Appearance Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent-400" />
            Appearance
          </h2>

          {/* Theme Selection */}
          <div className="mb-6">
            <label className="text-sm text-text-muted mb-3 block">Theme</label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'primary' : 'ghost'}
                onClick={() => setTheme('light')}
                className="flex-1"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'ghost'}
                onClick={() => setTheme('dark')}
                className="flex-1"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'primary' : 'ghost'}
                onClick={() => setTheme('system')}
                className="flex-1"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="text-sm text-text-muted mb-3 block">Accent Color</label>
            <div className="flex flex-wrap gap-3">
              {accentColors.map(({ name, value }) => (
                <button
                  key={value}
                  onClick={() => setAccentColor(value)}
                  className={`h-10 w-10 rounded-full transition-all ${
                    accentColor === value ? 'ring-2 ring-offset-2 ring-offset-surface-900 ring-white' : ''
                  }`}
                  style={{ backgroundColor: value }}
                  title={name}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-accent-400" />
            Keyboard Shortcuts
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-text-muted">Save clipboard</span>
              <kbd className="px-2 py-1 bg-surface-800 rounded text-xs">Ctrl + S</kbd>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-text-muted">Bold text</span>
              <kbd className="px-2 py-1 bg-surface-800 rounded text-xs">Ctrl + B</kbd>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-text-muted">Italic text</span>
              <kbd className="px-2 py-1 bg-surface-800 rounded text-xs">Ctrl + I</kbd>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-text-muted">Add link</span>
              <kbd className="px-2 py-1 bg-surface-800 rounded text-xs">Ctrl + K</kbd>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-muted">Toggle full screen</span>
              <kbd className="px-2 py-1 bg-surface-800 rounded text-xs">F11</kbd>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 ring-red-500/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            Delete Account
          </Button>
        </Card>
      </div>

      {/* Delete Account Modal */}
      <Modal open={deleteModalOpen} title="Delete Account" onClose={() => setDeleteModalOpen(false)}>
        <div className="space-y-4">
          <div className="rounded-xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
            <p className="text-sm text-red-300">
              This will permanently delete your account and all your clipboards. This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => {
              // TODO: Delete account from Firebase
              signOut()
              navigate('/')
            }}>
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useEffect, useCallback } from 'react'
import { Modal } from './ui'

interface KeyboardShortcutsModalProps {
  open: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['Ctrl', 'S'], description: 'Save clipboard' },
  { keys: ['Ctrl', 'B'], description: 'Bold text' },
  { keys: ['Ctrl', 'I'], description: 'Italic text' },
  { keys: ['Ctrl', 'U'], description: 'Underline text' },
  { keys: ['Ctrl', 'K'], description: 'Add link' },
  { keys: ['Ctrl', 'Shift', '7'], description: 'Numbered list' },
  { keys: ['Ctrl', 'Shift', '8'], description: 'Bullet list' },
  { keys: ['Ctrl', 'Shift', 'X'], description: 'Strikethrough' },
  { keys: ['Ctrl', '`'], description: 'Inline code' },
  { keys: ['Ctrl', 'Alt', 'C'], description: 'Code block' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['?'], description: 'Show this help' },
]

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-1 max-h-[60vh] overflow-y-auto">
        {shortcuts.map(({ keys, description }) => (
          <div
            key={keys.join('+')}
            className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
          >
            <span className="text-sm text-text-secondary">{description}</span>
            <div className="flex items-center gap-1">
              {keys.map((key, index) => (
                <span key={index}>
                  <kbd className="px-2 py-1 bg-surface-800 rounded text-xs text-text-primary font-mono">
                    {key}
                  </kbd>
                  {index < keys.length - 1 && (
                    <span className="text-text-muted mx-0.5">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-text-muted">
        Press <kbd className="px-1.5 py-0.5 bg-surface-800 rounded text-text-primary">?</kbd> anywhere to show this help
      </div>
    </Modal>
  )
}

// Hook to register global keyboard shortcut for showing help
export function useKeyboardShortcutHelp(onShowHelp: () => void) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Show help on '?' key (Shift + /)
    if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      e.preventDefault()
      onShowHelp()
    }
  }, [onShowHelp])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

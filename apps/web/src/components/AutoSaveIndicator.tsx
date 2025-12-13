import { useState, useEffect } from 'react'
import { Check, Cloud, Loader2 } from 'lucide-react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveIndicatorProps {
  status: SaveStatus
  lastSavedAt?: Date | null
}

export function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === 'saving' || status === 'saved') {
      setVisible(true)
    }

    if (status === 'saved') {
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  if (!visible && status === 'idle') return null

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs
        transition-all duration-300
        ${status === 'saving'
          ? 'text-text-muted'
          : status === 'saved'
          ? 'text-green-400'
          : status === 'error'
          ? 'text-red-400'
          : 'text-text-muted'
        }
      `}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3" />
          <span>Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <Cloud className="h-3 w-3" />
          <span>Error saving</span>
        </>
      )}
    </div>
  )
}

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  accentColor: string
  setAccentColor: (color: string) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const THEME_KEY = 'sharedclip.theme'
const ACCENT_KEY = 'sharedclip.accent'
const DEFAULT_ACCENT = '#8b5cf6'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(THEME_KEY)
    return (stored as Theme) || 'dark'
  })

  const [accentColor, setAccentColorState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_ACCENT
    return localStorage.getItem(ACCENT_KEY) || DEFAULT_ACCENT
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemTheme()
    return theme
  })

  // Handle theme changes
  useEffect(() => {
    const root = document.documentElement

    const updateTheme = () => {
      const resolved = theme === 'system' ? getSystemTheme() : theme
      setResolvedTheme(resolved)

      if (resolved === 'light') {
        root.classList.remove('dark')
        root.classList.add('light')
      } else {
        root.classList.remove('light')
        root.classList.add('dark')
      }
    }

    updateTheme()

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') updateTheme()
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  // Handle accent color changes
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)

    // Generate lighter/darker variants
    const hex = accentColor.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    // Lighter variant (for hover states)
    const lighter = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`
    document.documentElement.style.setProperty('--accent-light', lighter)

    // Darker variant
    const darker = `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`
    document.documentElement.style.setProperty('--accent-dark', darker)

    // 10% opacity variant
    document.documentElement.style.setProperty('--accent-10', `rgba(${r}, ${g}, ${b}, 0.1)`)
    document.documentElement.style.setProperty('--accent-20', `rgba(${r}, ${g}, ${b}, 0.2)`)
  }, [accentColor])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_KEY, newTheme)
  }

  const setAccentColor = (color: string) => {
    setAccentColorState(color)
    localStorage.setItem(ACCENT_KEY, color)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        resolvedTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

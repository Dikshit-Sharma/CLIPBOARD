import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { ClipboardPage } from './pages/ClipboardPage'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'
import { NotFound } from './pages/NotFound'
import { trackPageView } from './lib/analytics'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'


function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    // Track page views on route change
    const pageName = location.pathname === '/'
      ? 'Home'
      : location.pathname === '/dashboard'
      ? 'Dashboard'
      : location.pathname === '/settings'
      ? 'Settings'
      : location.pathname.startsWith('/c/')
      ? 'Clipboard'
      : 'NotFound'
    trackPageView(pageName, location.pathname)
  }, [location])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/c/:id" element={<ClipboardPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-bg-950 text-text-primary">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

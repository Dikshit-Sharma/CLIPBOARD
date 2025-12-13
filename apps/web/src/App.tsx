import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { ClipboardPage } from './pages/ClipboardPage'
import { NotFound } from './pages/NotFound'
import { trackPageView } from './lib/analytics'

function AppRoutes() {
  const location = useLocation()

  useEffect(() => {
    // Track page views on route change
    const pageName = location.pathname === '/' ? 'Home' : location.pathname.startsWith('/c/') ? 'Clipboard' : 'NotFound'
    trackPageView(pageName, location.pathname)
  }, [location])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/c/:id" element={<ClipboardPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-bg-950 text-text-primary">
      <AppRoutes />
    </div>
  )
}

import { Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { ClipboardPage } from './pages/ClipboardPage'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <div className="min-h-screen bg-bg-950 text-text-primary">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/c/:id" element={<ClipboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'

// cast to any to avoid React 19 type errors
const HelmetProviderComponent = HelmetProvider as any
import './index.css'
import './lib/firebase' // Initialize Firebase
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 10_000
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProviderComponent>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProviderComponent>
    </QueryClientProvider>
  </StrictMode>
)

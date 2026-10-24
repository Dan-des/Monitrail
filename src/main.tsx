import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Clean up legacy Supabase API cache from users' browsers on app load
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    for (const key of keys) {
      if (key.includes('supabase') || key === 'supabase-api-cache') {
        caches.delete(key)
      }
    }
  }).catch(() => {
    // Ignore cache cleanup errors in unsupported environments
  })
}

// Register service worker with automatic update checks
registerSW({ immediate: true })

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      signInUrl="/"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
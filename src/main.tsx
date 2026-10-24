import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

/**
 * Legacy CacheStorage cleanup:
 * Prior to the migration to Neon and Clerk, the PWA service worker cached financial API
 * responses under the cache name 'supabase-api-cache'. To ensure users do not retain stale
 * financial data in their browsers, we explicitly evict this legacy cache on app launch.
 * (This is the one allowed exception to the codebase-wide "no supabase string" rule).
 */
const LEGACY_CACHE_NAME = 'supabase-api-cache'

if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((keys) => {
    for (const key of keys) {
      if (key === LEGACY_CACHE_NAME || key.includes(LEGACY_CACHE_NAME)) {
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
import { useState, useEffect } from 'react';
import { SignIn, SignUp, useClerk } from '@clerk/clerk-react';
import { Wallet, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getClerkAppearance } from '../lib/clerkTheme';

interface AuthProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
}

const checkIsSignUp = () => {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash;
  const path = window.location.pathname.toLowerCase();

  // If hash routing is used (e.g. #/sign-up or #/sign-up/verify-email-address), normalize while preserving sub-path
  if (hash.toLowerCase().startsWith('#/sign-up') || hash.toLowerCase().startsWith('#sign-up')) {
    const subpath = hash.replace(/^#\/?/, '/');
    window.history.replaceState(null, '', subpath);
    return true;
  }
  if (hash.toLowerCase().startsWith('#/sign-in') || hash.toLowerCase().startsWith('#sign-in')) {
    const subpath = hash.replace(/^#(?:(?:\/sign-in)|sign-in)/, '') || '/';
    window.history.replaceState(null, '', subpath);
    return false;
  }

  // Normalize /sign-in to / since signInUrl is /
  if (path === '/sign-in' || path.startsWith('/sign-in/')) {
    const subpath = window.location.pathname.replace(/^\/sign-in/i, '') || '/';
    window.history.replaceState(null, '', subpath + window.location.search);
    return false;
  }

  // Any path starting with /sign-up (e.g. /sign-up, /sign-up/verify-email-address, /sign-up/continue)
  return path.startsWith('/sign-up');
};

/**
 * Animated skeleton placeholder that mirrors Clerk's card dimensions and styles
 * so the page layout never jumps, collapses, or shows empty gaps while Clerk initializes.
 */
function AuthCardSkeleton({ isSignUp }: { isSignUp: boolean }) {
  return (
    <div
      className="w-full max-w-[440px] rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      style={{ minHeight: isSignUp ? '560px' : '490px' }}
      aria-hidden="true"
    >
      {/* Title & subtitle placeholder */}
      <div className="flex flex-col items-center text-center">
        <div className="h-7 w-44 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="mt-2.5 h-4 w-60 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Form field skeletons */}
      <div className="mt-7 space-y-5">
        {isSignUp && (
          <div>
            <div className="mb-2 h-3.5 w-24 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-[3.25rem] w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse" />
          </div>
        )}
        <div>
          <div className="mb-2 h-3.5 w-28 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-[3.25rem] w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse" />
        </div>
        <div>
          <div className="mb-2 h-3.5 w-20 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-[3.25rem] w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 animate-pulse" />
        </div>

        {/* Primary button skeleton */}
        <div className="pt-2">
          <div className="h-[3.25rem] w-full rounded-xl bg-zinc-900/80 dark:bg-zinc-100/80 animate-pulse" />
        </div>
      </div>

      {/* Footer navigation link skeleton */}
      <div className="mt-8 flex justify-center">
        <div className="h-3.5 w-44 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Authentication view powered by Clerk.
 * Supports smooth, bidirectional navigation between Sign In and Sign Up.
 */
export default function Auth({ isDark, onToggleDarkMode }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(checkIsSignUp);
  const clerk = useClerk();

  useEffect(() => {
    const handleLocationChange = () => {
      setIsSignUp(checkIsSignUp());
    };

    // Intercept pushState and replaceState so that all path navigations trigger location checks
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      const result = originalPush.apply(this, args);
      handleLocationChange();
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplace.apply(this, args);
      handleLocationChange();
      return result;
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const appearance = getClerkAppearance(isDark);
  const isClerkLoaded = clerk?.loaded ?? false;

  return (
    <div className="flex min-h-screen w-full flex-col items-center overflow-y-auto bg-zinc-50 px-4 py-6 dark:bg-zinc-950">
      {/* Dark Mode Toggle — fixed top-right so it's always visible */}
      <button
        onClick={onToggleDarkMode}
        className="fixed right-4 top-4 z-50 cursor-pointer rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Vertical spacer — pushes content toward centre when viewport is tall enough */}
      <div className="flex-1" />

      {/* Monitrail Header / Logo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-col items-center"
      >
        <div className="rounded-2xl bg-zinc-900 p-3.5 shadow-lg shadow-zinc-900/20 dark:bg-zinc-100">
          <Wallet className="text-white dark:text-zinc-900" size={28} />
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Monitrail
        </h1>
      </motion.div>

      {/* Clerk Auth Component Container */}
      <div className="w-full max-w-[440px] flex items-center justify-center">
        {!isClerkLoaded ? (
          <AuthCardSkeleton isSignUp={isSignUp} />
        ) : (
          <motion.div
            key={isSignUp ? 'signup' : 'signin'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full flex justify-center"
          >
            {isSignUp ? (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/"
                fallbackRedirectUrl="/"
                forceRedirectUrl="/"
                appearance={appearance}
                fallback={<AuthCardSkeleton isSignUp={true} />}
              />
            ) : (
              <SignIn
                routing="path"
                path="/"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/"
                forceRedirectUrl="/"
                appearance={appearance}
                fallback={<AuthCardSkeleton isSignUp={false} />}
              />
            )}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
        Your data is encrypted and protected
      </p>

      {/* Vertical spacer — balances the top spacer for centering */}
      <div className="flex-1" />
    </div>
  );
}
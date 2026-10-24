import { SignIn } from '@clerk/clerk-react';
import { Sun, Moon } from 'lucide-react';
import { getClerkAppearance } from '../lib/clerkTheme';

interface ResetPasswordProps {
  onComplete?: () => void;
  onSignOut?: () => Promise<void> | void;
  isDark?: boolean;
  onToggleDarkMode?: () => void;
}

/**
 * Screen displayed if navigating to password reset.
 * With Clerk, password resets are fully integrated into Clerk's SignIn flow.
 */
export default function ResetPassword({ isDark = false, onToggleDarkMode }: ResetPasswordProps) {
  const appearance = getClerkAppearance(isDark);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      {onToggleDarkMode && (
        <button
          onClick={onToggleDarkMode}
          className="absolute right-6 top-6 cursor-pointer rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-500 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}
      <SignIn
        routing="hash"
        signInUrl="#/sign-in"
        signUpUrl="#/sign-up"
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
        appearance={appearance}
      />
    </div>
  );
}

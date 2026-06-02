import { motion } from 'framer-motion';
import { Wallet, LogOut, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  userName: string;
  userEmail: string;
  currentMonth: number;
  currentYear: number;
  isDark: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSignOut: () => void;
  onToggleDarkMode: () => void;
}

/**
 * App shell with sticky header (logo, month nav, dark toggle, user controls)
 * and a centered content area. Full dark mode support.
 */
export default function Layout({
  children,
  userName,
  userEmail,
  currentMonth,
  currentYear,
  isDark,
  onPrevMonth,
  onNextMonth,
  onSignOut,
  onToggleDarkMode,
}: LayoutProps) {
  const monthLabel = new Date(currentYear, currentMonth).toLocaleString(
    'default',
    { month: 'long', year: 'numeric' }
  );

  /** Show user's name if available, otherwise fall back to email */
  const displayName = userName || userEmail;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950"
    >
      {/* ── Sticky header ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-900/80 dark:supports-[backdrop-filter]:bg-zinc-900/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-zinc-900 p-2 shadow-sm dark:bg-white">
                <Wallet className="text-white dark:text-zinc-900" size={20} />
              </div>
              <span className="hidden text-lg font-semibold tracking-tight text-zinc-900 sm:block dark:text-zinc-100">
                Monitrail
              </span>
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={onPrevMonth}
                className="cursor-pointer rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Previous month"
                id="nav-prev-month"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[150px] text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {monthLabel}
              </span>
              <button
                onClick={onNextMonth}
                className="cursor-pointer rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Next month"
                id="nav-next-month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Right section: dark toggle, user, sign-out */}
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                onClick={onToggleDarkMode}
                className="cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="Toggle dark mode"
                id="nav-dark-toggle"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User display */}
              <span className="hidden max-w-[140px] truncate text-sm text-zinc-500 sm:block dark:text-zinc-400">
                {displayName}
              </span>

              {/* Sign out */}
              <button
                onClick={onSignOut}
                className="cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                title="Sign out"
                id="nav-sign-out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </motion.div>
  );
}

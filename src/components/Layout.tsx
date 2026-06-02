import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  userName: string;
  userEmail: string;
  currentMonth: number;
  currentYear: number;
  isDark: boolean;
  activeCurrency: string;
  onCurrencyChange: (currency: string) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
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
  activeCurrency,
  onCurrencyChange,
  onMonthChange,
  onYearChange,
  onSignOut,
  onToggleDarkMode,
}: LayoutProps) {
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

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
              <img src="/favicon.svg" className="h-8 w-8 rounded-lg shadow-sm" alt="Monitrail Logo" />
              <span className="hidden text-lg font-semibold tracking-tight text-zinc-900 sm:block dark:text-zinc-100">
                Monitrail
              </span>
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-1">
              <div className="flex items-center justify-center gap-0.5 min-w-[160px] text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {/* Month Dropdown */}
                <select
                  value={currentMonth}
                  onChange={(e) => onMonthChange(Number(e.target.value))}
                  className="cursor-pointer bg-transparent py-1 px-1.5 focus:outline-none hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border-0 outline-none"
                  aria-label="Select month"
                  id="nav-month-select"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const name = new Date(0, i).toLocaleString('default', { month: 'long' });
                    return (
                      <option key={i} value={i} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {name}
                      </option>
                    );
                  })}
                </select>

                {/* Year Dropdown */}
                <select
                  value={currentYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="cursor-pointer bg-transparent py-1 px-1.5 focus:outline-none hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border-0 outline-none"
                  aria-label="Select year"
                  id="nav-year-select"
                >
                  {/* Years 2020 to 2030 */}
                  {Array.from({ length: 11 }, (_, i) => {
                    const yr = 2020 + i;
                    return (
                      <option key={yr} value={yr} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {yr}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Right section: dark toggle, user, sign-out */}
            <div className="flex items-center gap-2">
              {/* Currency selector */}
              <select
                value={activeCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="cursor-pointer rounded-lg border border-zinc-200 bg-transparent px-2 py-1.5 text-xs font-medium text-zinc-600 outline-none hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                aria-label="Select currency"
                id="nav-currency-select"
              >
                <option value="NGN" className="dark:bg-zinc-900">₦ NGN</option>
                <option value="USD" className="dark:bg-zinc-900">$ USD</option>
                <option value="EUR" className="dark:bg-zinc-900">€ EUR</option>
                <option value="GBP" className="dark:bg-zinc-900">£ GBP</option>
                <option value="GHS" className="dark:bg-zinc-900">₵ GHS</option>
              </select>

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
                onClick={() => setShowSignOutConfirm(true)}
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
      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              key="signout-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignOutConfirm(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              key="signout-panel"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-x-4 bottom-4 z-50 rounded-2xl bg-white p-6 shadow-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 dark:bg-zinc-900"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Sign Out
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Are you sure you want to sign out of your account?
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSignOutConfirm(false)}
                  className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignOutConfirm(false);
                    onSignOut();
                  }}
                  className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 active:bg-rose-800"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

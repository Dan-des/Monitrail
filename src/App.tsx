import { useState, useCallback, useEffect } from 'react';
import { Loader2, Plus, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useDarkMode } from './hooks/useDarkMode';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Onboarding from './components/Onboarding';
import BudgetModal from './components/BudgetModal';
import type { Transaction, TransactionFormData } from './types';

/**
 * Neutral full-page loading indicator with Monitrail branding and a spinner.
 * Shown when the user is not recognized as signed-in while Clerk initializes.
 * Respects dark mode to prevent white flashes.
 */
function AppLoadingSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="flex flex-col items-center">
        <div className="rounded-2xl bg-zinc-900 p-3.5 shadow-lg shadow-zinc-900/20 dark:bg-zinc-100">
          <Wallet className="text-white dark:text-zinc-900" size={28} />
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Monitrail
        </h1>
        <div className="mt-6">
          <Loader2 className="animate-spin text-zinc-400 dark:text-zinc-500" size={28} />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton placeholder that precisely mirrors the authenticated Dashboard shell.
 * Rendered during page reload when the non-sensitive `monitrail-signed-in` flag is present,
 * preventing layout shift and eliminating any sign-in card flash.
 * Respects dark mode to prevent white flashes.
 */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sticky header skeleton */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 shadow-sm dark:bg-zinc-100">
                <Wallet className="h-4 w-4 text-white dark:text-zinc-900" />
              </div>
              <span className="hidden text-lg font-semibold tracking-tight text-zinc-900 sm:block dark:text-zinc-100">
                Monitrail
              </span>
            </div>

            {/* Header controls skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-24 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
              <div className="h-9 w-9 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome message skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
          <div className="h-4 w-32 rounded bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
        </div>

        {/* 3 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
                <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              </div>
              <div className="h-8 w-36 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart / Budget card skeleton */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-5 w-40 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse mb-6" />
          <div className="h-32 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
        </div>

        {/* Transaction list skeleton */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
            <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800/50 animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-20 rounded bg-zinc-200/70 dark:bg-zinc-800/70 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Root application component.
 *
 * Flow:
 * 1. Clerk initializing (!isLoaded) → Render DashboardSkeleton (if signed in previously) or AppLoadingSpinner. Never render <Auth />.
 * 2. Loaded + signed out (isLoaded && !isSignedIn) → Render <Auth />.
 * 3. Loaded + signed in (isLoaded && isSignedIn) → Render Onboarding or Dashboard.
 */
export default function App() {
  const { session, user, isSignedIn, isLoaded, signOut } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();

  // Remember signed-in state non-sensitively to show the dashboard skeleton on reload
  const [wasSignedIn] = useState(() => {
    try {
      return localStorage.getItem('monitrail-signed-in') === '1';
    } catch {
      return false;
    }
  });

  // Keep the non-sensitive flag synchronized with the authoritative Clerk auth state
  useEffect(() => {
    if (isLoaded) {
      try {
        if (isSignedIn) {
          localStorage.setItem('monitrail-signed-in', '1');
        } else {
          localStorage.removeItem('monitrail-signed-in');
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [isLoaded, isSignedIn]);

  // Track category budgets (persisted in localStorage)
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('monitrail-category-budgets');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  const handleSaveBudgets = (budgets: Record<string, number>) => {
    setCategoryBudgets(budgets);
    localStorage.setItem('monitrail-category-budgets', JSON.stringify(budgets));
  };

  // Track user-selected currency preference (persisted in localStorage)
  const [activeCurrency, setActiveCurrency] = useState(() =>
    localStorage.getItem('monitrail-currency') || 'NGN'
  );

  const handleCurrencyChange = (currency: string) => {
    setActiveCurrency(currency);
    localStorage.setItem('monitrail-currency', currency);
  };

  // Track the currently viewed month (defaults to today)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Fetch transactions for the current user + month
  const {
    transactions,
    loading: txLoading,
    totalIncome,
    totalExpenses,
    balance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(user?.id, month, year);

  // Form modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Onboarding state — show when user hasn't completed it yet
  const [onboardingDismissed, setOnboardingDismissed] = useState(() =>
    localStorage.getItem('monitrail-onboarding-complete') === 'true'
  );

  const handleMonthChange = useCallback((newMonth: number) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), newMonth, 1)
    );
  }, []);

  const handleYearChange = useCallback((newYear: number) => {
    setCurrentDate(
      (prev) => new Date(newYear, prev.getMonth(), 1)
    );
  }, []);

  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: TransactionFormData) => {
    if (editingTransaction) {
      return await updateTransaction(editingTransaction.id, formData);
    } else {
      return await addTransaction(formData);
    }
  };

  // ── 1. While Clerk auth is loading, NEVER render <Auth /> or any sign-in skeleton ──
  if (!isLoaded) {
    if (wasSignedIn) {
      return <DashboardSkeleton />;
    }
    return <AppLoadingSpinner />;
  }

  // ── 2. Render <Auth /> ONLY when isLoaded is true AND the user is signed out ──
  if (!isSignedIn || !session) {
    return <Auth isDark={isDark} onToggleDarkMode={toggleDarkMode} />;
  }

  // Extract full name from user metadata (set during signup)
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ?? '';

  // Show onboarding if: not dismissed AND not loading AND no transactions
  const showOnboarding =
    !onboardingDismissed && !txLoading && transactions.length === 0;

  // ── 3. Render Dashboard ONLY when isLoaded is true AND the user is signed in ──
  return (
    <Layout
      userName={userName}
      userEmail={user?.email ?? ''}
      currentMonth={month}
      currentYear={year}
      isDark={isDark}
      activeCurrency={activeCurrency}
      onCurrencyChange={handleCurrencyChange}
      onMonthChange={handleMonthChange}
      onYearChange={handleYearChange}
      onSignOut={signOut}
      onToggleDarkMode={toggleDarkMode}
    >
      {showOnboarding ? (
        <Onboarding
          userName={userName}
          onComplete={() => setOnboardingDismissed(true)}
          onAddTransaction={addTransaction}
          currencyCode={activeCurrency}
        />
      ) : (
        <>
          <Dashboard
            balance={balance}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            transactions={transactions}
            currencyCode={activeCurrency}
            categoryBudgets={categoryBudgets}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            userName={userName}
            userEmail={user?.email ?? ''}
          />
          <TransactionList
            transactions={transactions}
            loading={txLoading}
            onEdit={handleEditClick}
            onDelete={deleteTransaction}
            currencyCode={activeCurrency}
          />
        </>
      )}

      {/* FAB: Floating Action Button for Adding a Transaction */}
      {!showOnboarding && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddClick}
          className="fixed bottom-6 right-6 z-40 cursor-pointer rounded-full bg-zinc-900 p-4 text-white shadow-lg shadow-zinc-900/25 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/10 dark:hover:bg-zinc-200"
          aria-label="Add transaction"
          id="fab-add-transaction"
        >
          <Plus size={24} />
        </motion.button>
      )}

      {/* Dialog Modal: Add / Edit Transaction */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
        currencyCode={activeCurrency}
      />

      {/* Dialog Modal: Set Category Budgets */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={categoryBudgets}
        onSave={handleSaveBudgets}
        currencyCode={activeCurrency}
      />
    </Layout>
  );
}
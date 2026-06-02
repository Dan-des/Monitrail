import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useDarkMode } from './hooks/useDarkMode';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Onboarding from './components/Onboarding';

/**
 * Root application component.
 *
 * Flow:
 * 1. useAuth() — check for existing session
 * 2. If loading → spinner
 * 3. If no session → Auth screen
 * 4. If authenticated + new user → Onboarding flow
 * 5. If authenticated + returning user → Dashboard
 */
export default function App() {
  const { session, user, loading: authLoading, signOut } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();

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
    deleteTransaction,
  } = useTransactions(user?.id, month, year);

  // Onboarding state — show when user hasn't completed it yet
  const [onboardingDismissed, setOnboardingDismissed] = useState(() =>
    localStorage.getItem('monitrail-onboarding-complete') === 'true'
  );

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }, []);

  // ── Auth loading state ───────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  // ── Not authenticated ────────────────────────────────────
  if (!session) {
    return <Auth />;
  }

  // Extract full name from user metadata (set during signup)
  const userName =
    (user?.user_metadata?.full_name as string | undefined) ?? '';

  // Show onboarding if: not dismissed AND not loading AND no transactions
  const showOnboarding =
    !onboardingDismissed && !txLoading && transactions.length === 0;

  // ── Authenticated dashboard ──────────────────────────────
  return (
    <Layout
      userName={userName}
      userEmail={user?.email ?? ''}
      currentMonth={month}
      currentYear={year}
      isDark={isDark}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onSignOut={signOut}
      onToggleDarkMode={toggleDarkMode}
    >
      {showOnboarding ? (
        <Onboarding
          userName={userName}
          onComplete={() => setOnboardingDismissed(true)}
          onAddTransaction={addTransaction}
        />
      ) : (
        <>
          <Dashboard
            balance={balance}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
          />
          <TransactionList
            transactions={transactions}
            loading={txLoading}
            onDelete={deleteTransaction}
          />
        </>
      )}
      <TransactionForm onSubmit={addTransaction} />
    </Layout>
  );
}
import { useState, useCallback } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { useDarkMode } from './hooks/useDarkMode';
import Auth from './components/Auth';
import ResetPassword from './components/ResetPassword';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Onboarding from './components/Onboarding';
import type { Transaction, TransactionFormData } from './types';

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
  const { session, user, loading: authLoading, signOut, isRecoveryMode, setIsRecoveryMode } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();

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
    return <Auth isDark={isDark} onToggleDarkMode={toggleDarkMode} />;
  }

  // ── Password recovery mode ───────────────────────────────
  if (isRecoveryMode) {
    return (
      <ResetPassword
        onComplete={() => setIsRecoveryMode(false)}
        onSignOut={signOut}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
      />
    );
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
    </Layout>
  );
}
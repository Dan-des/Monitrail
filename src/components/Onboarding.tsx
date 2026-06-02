import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import type { TransactionFormData } from '../types';
import { CATEGORIES } from '../lib/categories';

interface OnboardingProps {
  userName: string;
  onComplete: () => void;
  onAddTransaction: (data: TransactionFormData) => Promise<{ error: string | null }>;
}

/** Slide transition variants for step changes */
const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

/**
 * Multi-step onboarding flow shown when a new user has no transactions.
 *
 * Steps:
 * 0 — Welcome greeting
 * 1 — Add monthly income (Salary)
 * 2 — Add a first expense
 * 3 — Completion confirmation
 */
export default function Onboarding({
  userName,
  onComplete,
  onAddTransaction,
}: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1 — income amount
  const [incomeAmount, setIncomeAmount] = useState('');

  // Step 2 — expense amount + category
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');

  const expenseCategories = CATEGORIES.filter((c) => c.type === 'expense');

  /** Submit monthly income as a Salary transaction */
  const handleAddIncome = async () => {
    if (!incomeAmount || Number(incomeAmount) <= 0) return;
    setLoading(true);
    await onAddTransaction({
      amount: Number(incomeAmount),
      category: 'Salary',
      type: 'income',
      description: 'Monthly salary',
      date: new Date().toISOString().split('T')[0],
    });
    setLoading(false);
    setStep(2);
  };

  /** Submit first expense transaction */
  const handleAddExpense = async () => {
    if (!expenseAmount || Number(expenseAmount) <= 0 || !expenseCategory)
      return;
    setLoading(true);
    await onAddTransaction({
      amount: Number(expenseAmount),
      category: expenseCategory,
      type: 'expense',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setLoading(false);
    setStep(3);
  };

  /** Mark onboarding complete in localStorage and notify parent */
  const handleFinish = () => {
    localStorage.setItem('monitrail-onboarding-complete', 'true');
    onComplete();
  };

  /* Shared input classes */
  const inputCls =
    'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:placeholder:text-zinc-500';

  const btnPrimary =
    'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200';

  const btnSecondary =
    'w-full cursor-pointer rounded-xl py-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-lg"
    >
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        {/* Step indicators */}
        <div className="mb-8 flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step
                  ? 'w-8 bg-zinc-900 dark:bg-zinc-100'
                  : 'w-4 bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {/* ── Step 0: Welcome ────────────────────────────── */}
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Sparkles
                  className="text-zinc-600 dark:text-zinc-300"
                  size={28}
                />
              </div>
              <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Welcome{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
                Let&apos;s set up your finances in under a minute.
                <br />
                We&apos;ll help you add your first transactions so your
                dashboard isn&apos;t empty.
              </p>
              <button onClick={() => setStep(1)} className={btnPrimary}>
                Get Started <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Step 1: Monthly Income ─────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                What&apos;s your monthly income?
              </h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                We&apos;ll add this as your salary for the current month.
              </p>

              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
                  ₦
                </span>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className={`${inputCls} !pl-8`}
                  placeholder="e.g. 500000"
                  autoFocus
                  id="onboarding-income"
                />
              </div>

              <button
                onClick={handleAddIncome}
                disabled={loading || !incomeAmount}
                className={btnPrimary}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {loading ? 'Adding…' : 'Add Income & Continue'}
              </button>
              <button onClick={() => setStep(2)} className={btnSecondary}>
                Skip for now
              </button>
            </motion.div>
          )}

          {/* ── Step 2: First Expense ──────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Track your first expense
              </h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Add a recent expense to see your dashboard in action.
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
                    ₦
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className={`${inputCls} !pl-8`}
                    placeholder="e.g. 5000"
                    autoFocus
                    id="onboarding-expense-amount"
                  />
                </div>

                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className={`${inputCls} appearance-none`}
                  id="onboarding-expense-category"
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddExpense}
                  disabled={
                    loading || !expenseAmount || !expenseCategory
                  }
                  className={btnPrimary}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {loading ? 'Adding…' : 'Add Expense & Finish'}
                </button>
                <button onClick={() => setStep(3)} className={btnSecondary}>
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Done ───────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20"
              >
                <CheckCircle2 className="text-emerald-600" size={32} />
              </motion.div>
              <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                You&apos;re all set!
              </h2>
              <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
                Your dashboard is ready. You can always add more transactions
                using the + button.
              </p>
              <button onClick={handleFinish} className={btnPrimary}>
                Go to Dashboard <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

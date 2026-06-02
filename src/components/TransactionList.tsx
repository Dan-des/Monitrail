import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Receipt } from 'lucide-react';
import type { Transaction } from '../types';
import { getCategoryIcon } from '../lib/categories';
import { formatCurrency } from '../lib/currency';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onDelete: (id: string) => Promise<{ error: string | null }>;
}

/** Format a date string (YYYY-MM-DD) to a short readable form (e.g. "Jun 2") */
const formatDate = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

/**
 * Scrollable list of transactions with animated add/remove,
 * category icons, and hover-revealed delete buttons.
 * Full dark mode support.
 */
export default function TransactionList({
  transactions,
  loading,
  onDelete,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading transactions…
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
      id="transaction-list"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Transactions
          </h2>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {transactions.length}{' '}
            {transactions.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────── */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-12">
          <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
            <Receipt className="text-zinc-400 dark:text-zinc-500" size={28} />
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No transactions yet
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Tap the + button to add your first entry
          </p>
        </div>
      ) : (
        /* ── Transaction rows ────────────────────────────── */
        <div className="max-h-[480px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
          <AnimatePresence initial={false}>
            {transactions.map((tx) => {
              const CategoryIcon = getCategoryIcon(tx.category);
              const isIncome = tx.type === 'income';

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                >
                  {/* Category icon */}
                  <div
                    className={`shrink-0 rounded-xl p-2.5 ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    <CategoryIcon size={16} />
                  </div>

                  {/* Description & category */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {tx.description || tx.category}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                      {tx.category} · {formatDate(tx.date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <p
                    className={`shrink-0 text-sm font-semibold tabular-nums ${
                      isIncome
                        ? 'text-emerald-600'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatCurrency(Number(tx.amount))}
                  </p>

                  {/* Delete button (visible on hover / focus) */}
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-zinc-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100 disabled:opacity-50 dark:text-zinc-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                    title="Delete transaction"
                    aria-label={`Delete ${tx.description || tx.category}`}
                  >
                    {deletingId === tx.id ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border border-rose-300 border-t-rose-500" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}

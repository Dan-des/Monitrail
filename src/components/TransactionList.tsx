import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Receipt, Search, Download, Pencil } from 'lucide-react';
import type { Transaction } from '../types';
import { getCategoryIcon } from '../lib/categories';
import { formatCurrency } from '../lib/currency';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<{ error: string | null }>;
  currencyCode?: string;
}

/** Formats grouping date headers safely to avoid local-timezone day shifts */
const formatHeaderDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return 'Today';
  }
  
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Enhanced transaction list showing:
 * - Search by description/category & Category filter pills
 * - CSV Export function
 * - Interactive edit/delete actions
 * - Date grouping headers with sticky placement and daily sums
 */
export default function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
  currencyCode = 'NGN',
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  // Get unique categories active in current transaction dataset for dynamic filters
  const activeCategories = useMemo(() => {
    const cats = new Set(transactions.map((tx) => tx.category));
    return ['All', ...Array.from(cats)].sort();
  }, [transactions]);

  // CSV Exporter
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = transactions.map((tx) => [
      tx.date,
      tx.type,
      tx.category,
      tx.description || '',
      tx.amount.toString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `monitrail_transactions_${new Date().toISOString().slice(0, 7)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter transactions based on filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const label = (tx.description || tx.category).toLowerCase();
      const cat = tx.category.toLowerCase();
      const matchesSearch =
        label.includes(searchQuery.toLowerCase()) ||
        cat.includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || tx.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategory]);

  // Group filtered transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    // Sort transactions by date descending, then created_at descending
    const sorted = [...filteredTransactions].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    sorted.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });
    
    return groups;
  }, [filteredTransactions]);

  // Compute daily sums
  const getDailySum = (txs: Transaction[]) => {
    return txs.reduce((sum, tx) => {
      const amount = Number(tx.amount);
      return tx.type === 'income' ? sum + amount : sum - amount;
    }, 0);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Transactions
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {transactions.length} total {transactions.length === 1 ? 'record' : 'records'}
            </p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-zinc-200/85 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              id="export-csv-btn"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Filter / Search Bar ──────────────────────────────── */}
      {transactions.length > 0 && (
        <div className="border-b border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-4 text-xs text-zinc-900 transition-all focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-700"
            />
          </div>

          {/* Dynamic category pills */}
          {activeCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border border-zinc-200/80 bg-white text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Ledger content ────────────────────────────────────── */}
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
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 p-12">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            No results match your filters
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="cursor-pointer text-xs font-semibold text-zinc-900 underline dark:text-zinc-100"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* ── Scrollable list grouped by dates ──────────────── */
        <div className="max-h-[480px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
          {Object.entries(groupedTransactions).map(([dateStr, txs]) => {
            const dailySum = getDailySum(txs);
            
            return (
              <div key={dateStr} className="relative">
                {/* Date Group Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-50/90 dark:bg-zinc-950/90 px-6 py-2 backdrop-blur-sm border-b border-zinc-100/50 dark:border-zinc-800/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {formatHeaderDate(dateStr)}
                  </span>
                  <span className={`text-[11px] font-semibold ${
                    dailySum > 0 ? 'text-emerald-600' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {dailySum > 0 ? '+' : ''}{formatCurrency(dailySum, currencyCode)}
                  </span>
                </div>

                {/* Rows under this date */}
                <div className="divide-y divide-zinc-100/40 dark:divide-zinc-800/40">
                  <AnimatePresence initial={false}>
                    {txs.map((tx) => {
                      const CategoryIcon = getCategoryIcon(tx.category);
                      const isIncome = tx.type === 'income';

                      return (
                        <motion.div
                          key={tx.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="group flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-zinc-50/40 dark:hover:bg-zinc-850/20"
                        >
                          {/* Category Icon */}
                          <div
                            className={`shrink-0 rounded-xl p-2.5 ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            <CategoryIcon size={16} />
                          </div>

                          {/* Description */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {tx.description || tx.category}
                            </p>
                            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                              {tx.category}
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
                            {formatCurrency(Number(tx.amount), currencyCode)}
                          </p>

                          {/* Actions: Edit & Delete (visible on hover) */}
                          <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            {/* Edit Button */}
                            <button
                              onClick={() => onEdit(tx)}
                              className="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                              title="Edit transaction"
                            >
                              <Pencil size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(tx.id)}
                              disabled={deletingId === tx.id}
                              className="cursor-pointer rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                              title="Delete transaction"
                              aria-label={`Delete ${tx.description || tx.category}`}
                            >
                              {deletingId === tx.id ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border border-rose-300 border-t-rose-500" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

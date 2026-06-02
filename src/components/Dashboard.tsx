import { useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from './StatCard';
import type { Transaction } from '../types';
import { getCategoryIcon, getCategoryColor } from '../lib/categories';
import { formatCurrency } from '../lib/currency';

interface DashboardProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
  currencyCode?: string;
  categoryBudgets: Record<string, number>;
  onOpenBudgetModal: () => void;
}

/**
 * Enhanced Dashboard section showing:
 * - Summary cards (Total Balance, Income, Expenses) with dynamic currency formatting
 * - Budget Burn Rate Progress Bar (percentage of income spent)
 * - visual SVG Donut Chart representing category distribution
 * - Visual bar breakdown of categories
 */
export default function Dashboard({
  balance,
  totalIncome,
  totalExpenses,
  transactions,
  currencyCode = 'NGN',
  categoryBudgets,
  onOpenBudgetModal,
}: DashboardProps) {
  // Compute category totals and percentages for expenses
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExp = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const amount = Number(tx.amount);
        totals[tx.category] = (totals[tx.category] || 0) + amount;
        totalExp += amount;
      }
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0,
        color: getCategoryColor(name),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Compute donut chart segment offsets
  const categorySegments = useMemo(() => {
    let currentOffset = 100;
    return categoryBreakdown.map((cat) => {
      const percentage = cat.percentage;
      const offset = currentOffset;
      currentOffset -= percentage;
      return {
        name: cat.name,
        percentage,
        offset,
        color: cat.color,
      };
    });
  }, [categoryBreakdown]);

  // Budget Burn Rate
  const expensePercentageOfIncome = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <section className="mb-8" id="dashboard-summary">
      {/* ── Summary cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Balance"
          value={formatCurrency(balance, currencyCode)}
          icon={Wallet}
          iconColor="text-zinc-600 dark:text-zinc-400"
          iconBg="bg-zinc-100"
          iconBgDark="dark:bg-zinc-800"
          valueColor={balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}
          index={0}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(totalIncome, currencyCode)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          iconBgDark="dark:bg-emerald-900/20"
          valueColor="text-emerald-600"
          index={1}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(totalExpenses, currencyCode)}
          icon={TrendingDown}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
          iconBgDark="dark:bg-rose-900/20"
          valueColor="text-rose-600"
          index={2}
        />
      </div>

      {/* ── Budget Burn Rate Progress Bar ────────────────────── */}
      {totalIncome > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">Monthly Budget Burn Rate</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {expensePercentageOfIncome.toFixed(0)}% of income spent
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                expensePercentageOfIncome > 90
                  ? 'bg-rose-500'
                  : expensePercentageOfIncome > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(expensePercentageOfIncome, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
            {expensePercentageOfIncome > 100 
              ? 'Warning: Monthly expenses have exceeded your income!'
              : `You have ${formatCurrency(Math.max(totalIncome - totalExpenses, 0), currencyCode)} remaining of your monthly income.`}
          </p>
        </div>
      )}

      {/* ── Visual Analytics (Donut Chart & Breakdown) ───────── */}
      {transactions.some((tx) => tx.type === 'expense') && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          {/* Donut Chart */}
          <div className="flex flex-col items-center justify-center p-4">
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 mb-4 self-start">
              Expense Distribution
            </h3>
            <div className="relative flex items-center justify-center h-48 w-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                {/* Background ring */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#e4e4e7"
                  className="dark:stroke-zinc-800"
                  strokeWidth="3.5"
                />
                
                {/* Colored segments */}
                {categorySegments.map((segment) => (
                  <circle
                    key={segment.name}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="3.5"
                    strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                    strokeDashoffset={segment.offset}
                    className="transition-all duration-500 ease-in-out"
                  />
                ))}
              </svg>
              {/* Central text displaying total expense */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 font-sans">Expenses</span>
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatCurrency(totalExpenses, currencyCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown bars list */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Breakdown by Category
              </h3>
              <button
                onClick={onOpenBudgetModal}
                className="cursor-pointer text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                id="btn-set-budgets"
              >
                Set Budgets
              </button>
            </div>
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {categoryBreakdown.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                const budget = categoryBudgets[cat.name];
                const hasBudget = budget !== undefined && budget > 0;
                const spentPercent = hasBudget ? (cat.amount / budget) * 100 : cat.percentage;
                const isExceeded = hasBudget && cat.amount > budget;

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                        <Icon size={12} style={{ color: cat.color }} />
                        <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums font-sans">
                        {hasBudget ? (
                          <>
                            <span className={isExceeded ? 'text-rose-500 font-bold' : ''}>
                              {formatCurrency(cat.amount, currencyCode)}
                            </span>
                            <span className="text-[10px] font-normal text-zinc-400">
                              / {formatCurrency(budget, currencyCode)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>{formatCurrency(cat.amount, currencyCode)}</span>
                            <span className="text-[10px] font-normal text-zinc-400">
                              ({cat.percentage.toFixed(0)}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Progress indicator bar */}
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(spentPercent, 100)}%`,
                          backgroundColor: isExceeded ? '#ef4444' : cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

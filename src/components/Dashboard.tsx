import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from './StatCard';
import { formatCurrency } from '../lib/currency';

interface DashboardProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

/**
 * Dashboard section showing three summary stat cards:
 * Total Balance, Monthly Income, and Monthly Expenses.
 */
export default function Dashboard({
  balance,
  totalIncome,
  totalExpenses,
}: DashboardProps) {
  return (
    <section className="mb-8" id="dashboard-summary">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Balance"
          value={formatCurrency(balance)}
          icon={Wallet}
          iconColor="text-zinc-600 dark:text-zinc-400"
          iconBg="bg-zinc-100"
          iconBgDark="dark:bg-zinc-800"
          valueColor={balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}
          index={0}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          iconBgDark="dark:bg-emerald-900/20"
          valueColor="text-emerald-600"
          index={1}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
          iconBgDark="dark:bg-rose-900/20"
          valueColor="text-rose-600"
          index={2}
        />
      </div>
    </section>
  );
}

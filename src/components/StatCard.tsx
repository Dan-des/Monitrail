import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  iconBgDark?: string;
  valueColor?: string;
  index: number;
}

/**
 * Reusable summary stat card for the dashboard.
 * Renders with a staggered slide-up entrance animation.
 * Supports light and dark themes.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  iconBgDark,
  valueColor,
  index,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        <div className={`rounded-xl p-2.5 ${iconBg} ${iconBgDark ?? ''}`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      <p
        className={`text-3xl font-semibold tracking-tight ${
          valueColor ?? 'text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </p>
    </motion.div>
  );
}

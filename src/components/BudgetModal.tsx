import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { CATEGORIES } from '../lib/categories';
import { getCurrencySymbol } from '../lib/currency';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Record<string, number>;
  onSave: (budgets: Record<string, number>) => void;
  currencyCode?: string;
}

/**
 * Modal to configure monthly spending budgets for each expense category.
 * Integrates react-hook-form for binding inputs and Framer Motion for premium dialog animations.
 */
export default function BudgetModal({
  isOpen,
  onClose,
  budgets,
  onSave,
  currencyCode = 'NGN',
}: BudgetModalProps) {
  const { register, handleSubmit, reset } = useForm<Record<string, string>>();

  // Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset form values with current budgets when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultValues: Record<string, string> = {};
      CATEGORIES.forEach((cat) => {
        if (cat.type === 'expense') {
          defaultValues[cat.name] = budgets[cat.name] ? String(budgets[cat.name]) : '';
        }
      });
      reset(defaultValues);
    }
  }, [isOpen, budgets, reset]);

  const onSubmit = (data: Record<string, string>) => {
    const updatedBudgets: Record<string, number> = {};
    Object.entries(data).forEach(([categoryName, value]) => {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > 0) {
        updatedBudgets[categoryName] = parsed;
      }
    });
    onSave(updatedBudgets);
    onClose();
  };

  const expenseCategories = CATEGORIES.filter((c) => c.type === 'expense');
  const currencySymbol = getCurrencySymbol(currencyCode);

  /* Shared input classes */
  const inputCls =
    'w-full rounded-xl border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:placeholder:text-zinc-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="budget-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            key="budget-panel"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-x-4 bottom-4 z-50 max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 dark:bg-zinc-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Category Budgets
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Set monthly spending limits for each category
                </p>
              </div>
              <button
                onClick={onClose}
                className="cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              {/* Category Inputs Scroll Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
                {expenseCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.name} className="flex items-center justify-between gap-4">
                      {/* Left: Icon & Category Name */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          <Icon size={18} style={{ color: cat.color }} />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {cat.name}
                        </span>
                      </div>

                      {/* Right: Budget Input */}
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="any"
                          inputMode="decimal"
                          placeholder="None"
                          {...register(cat.name)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
                >
                  <Save size={16} />
                  Save Budgets
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

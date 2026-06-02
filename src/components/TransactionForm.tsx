import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import type { TransactionFormData } from '../types';
import { CATEGORIES } from '../lib/categories';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<{ error: string | null }>;
}

/**
 * Floating Action Button + modal form for adding a new transaction.
 * Full dark mode support throughout.
 */
export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: undefined as unknown as number,
      description: '',
    },
  });

  const selectedType = watch('type');

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Reset form defaults whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: undefined as unknown as number,
        description: '',
      });
      setSubmitError(null);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    setSubmitError(null);
    const result = await onSubmit({ ...data, amount: Number(data.amount) });
    if (result.error) {
      setSubmitError(result.error);
    } else {
      reset();
      setIsOpen(false);
    }
    setLoading(false);
  };

  const filteredCategories = CATEGORIES.filter(
    (c) => c.type === selectedType
  );

  /* Shared input classes */
  const inputCls =
    'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:placeholder:text-zinc-500';

  return (
    <>
      {/* ── Floating Action Button ────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 cursor-pointer rounded-full bg-zinc-900 p-4 text-white shadow-lg shadow-zinc-900/25 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/10 dark:hover:bg-zinc-200"
        aria-label="Add transaction"
        id="fab-add-transaction"
      >
        <Plus size={24} />
      </motion.button>

      {/* ── Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{
                duration: 0.25,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="fixed inset-x-4 bottom-4 z-50 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 dark:bg-zinc-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-0">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Add Transaction
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  id="modal-close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-5 p-6"
              >
                {/* ── Type toggle ─────────────────────────── */}
                <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                  {(['expense', 'income'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setValue('type', type);
                        setValue('category', '');
                      }}
                      className={`flex-1 cursor-pointer rounded-lg py-2.5 text-sm font-medium transition-all ${
                        selectedType === type
                          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                      id={`toggle-${type}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                {/* ── Amount ──────────────────────────────── */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      {...register('amount', {
                        required: 'Amount is required',
                        min: {
                          value: 0.01,
                          message: 'Must be greater than 0',
                        },
                      })}
                      className={`${inputCls} !pl-8`}
                      placeholder="0.00"
                      id="input-amount"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                {/* ── Category ────────────────────────────── */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>
                  <select
                    {...register('category', {
                      required: 'Category is required',
                    })}
                    className={`${inputCls} appearance-none`}
                    id="input-category"
                  >
                    <option value="">Select a category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* ── Description (optional) ──────────────── */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Description{' '}
                    <span className="font-normal text-zinc-400 dark:text-zinc-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    {...register('description')}
                    className={inputCls}
                    placeholder="Coffee, groceries, etc."
                    id="input-description"
                  />
                </div>

                {/* ── Date ────────────────────────────────── */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Date
                  </label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className={inputCls}
                    id="input-date"
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                {/* ── Submit error ────────────────────────── */}
                {submitError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400"
                  >
                    {submitError}
                  </motion.p>
                )}

                {/* ── Submit ──────────────────────────────── */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
                  id="submit-transaction"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Adding…' : 'Add Transaction'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

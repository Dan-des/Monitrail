import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Loader2, Lock, CheckCircle2 } from 'lucide-react';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordProps {
  onComplete: () => void;
  onSignOut: () => Promise<void>;
}

/**
 * Screen displayed when the user enters the app via a password recovery link.
 * Allows the user to set a new password, validates inputs, and updates the user's
 * password on Supabase.
 */
export default function ResetPassword({ onComplete, onSignOut }: ResetPasswordProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  /** Submit new password to Supabase Auth */
  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Automatically redirect to dashboard after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  };

  /* Shared input classes matching Auth.tsx */
  const inputCls =
    'w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 transition-all focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-100/10 dark:placeholder:text-zinc-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        {/* ── Card ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl bg-zinc-900 p-3.5 shadow-lg shadow-zinc-900/20"
            >
              <Wallet className="text-white" size={28} />
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Heading */}
                <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Reset password
                </h1>
                <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Please enter a new, secure password for your account
                </p>

                {/* Inline error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        size={16}
                      />
                      <input
                        type="password"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Minimum 6 characters',
                          },
                        })}
                        className={inputCls}
                        placeholder="••••••••"
                        id="reset-password"
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        size={16}
                      />
                      <input
                        type="password"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (val) =>
                            val === watch('password') || 'Passwords do not match',
                        })}
                        className={inputCls}
                        placeholder="••••••••"
                        id="reset-confirm-password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    id="reset-submit"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Updating…' : 'Update Password'}
                  </button>
                </form>

                {/* Cancel / Sign Out Link */}
                <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="w-full cursor-pointer text-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
                    id="reset-cancel"
                  >
                    Cancel & Sign Out
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="mb-4 text-emerald-500"
                >
                  <CheckCircle2 size={56} />
                </motion.div>
                <h1 className="mb-2 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Password updated!
                </h1>
                <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                  Your password was reset successfully. Redirecting you to the dashboard...
                </p>
                <button
                  onClick={onComplete}
                  className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  id="reset-dashboard-btn"
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          Your session is secure and encrypted
        </p>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Loader2, Mail, Lock, User } from 'lucide-react';

interface AuthFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Full-screen authentication view with login / sign-up toggle.
 * Signup includes full name and password confirmation fields.
 * Uses react-hook-form for validation and displays inline error/success messages.
 */
export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AuthFormData>();

  /** Handle login or signup via Supabase Auth */
  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (isLogin) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (authError) setError(authError.message);
    } else {
      // Signup — pass full name as user metadata
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName },
        },
      });
      if (authError) {
        setError(authError.message);
      } else {
        setSuccess('Check your email to confirm your account.');
      }
    }

    setLoading(false);
  };

  /** Toggle between login and signup, clearing messages and form */
  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError(null);
    setSuccess(null);
    reset();
  };

  /* Shared input classes */
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

          {/* Heading */}
          <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {isLogin
              ? 'Sign in to manage your finances'
              : 'Start tracking your spending today'}
          </p>

          {/* ── Inline messages ─────────────────────────────── */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ──────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name (signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={16}
                  />
                  <input
                    type="text"
                    {...register('fullName', {
                      required: !isLogin ? 'Full name is required' : false,
                    })}
                    className={inputCls}
                    placeholder="John Doe"
                    id="auth-fullname"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.fullName.message}
                  </p>
                )}
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  size={16}
                />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className={inputCls}
                  placeholder="you@example.com"
                  id="auth-email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
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
                  id="auth-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password (signup only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={16}
                  />
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: !isLogin
                        ? 'Please confirm your password'
                        : false,
                      validate: (val) =>
                        isLogin ||
                        val === watch('password') ||
                        'Passwords do not match',
                    })}
                    className={inputCls}
                    placeholder="••••••••"
                    id="auth-confirm-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="auth-submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 active:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-300"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading
                ? 'Processing…'
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
          </form>

          {/* ── Toggle login / signup ─────────────────────── */}
          <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <button
              onClick={toggleMode}
              className="w-full cursor-pointer text-center text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              id="auth-toggle"
            >
              {isLogin
                ? "Don't have an account? "
                : 'Already have an account? '}
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
          Your data is encrypted and protected
        </p>
      </motion.div>
    </div>
  );
}
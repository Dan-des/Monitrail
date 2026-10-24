import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type { Transaction, TransactionFormData } from '../types';

/**
 * Custom hook for managing transactions for a specific user and month.
 * Communicates with /api/transactions serverless endpoints backed by Neon Postgres.
 *
 * Provides CRUD operations, computed totals (income, expenses, balance),
 * and handles Clerk token authorization and 401 session expiry.
 */
// In-memory cache for transactions keyed by `${userId}:${year}-${month}`
// Enables instant zero-wait month switching (SWR - Stale While Revalidate)
const transactionsCache = new Map<string, Transaction[]>();

export function useTransactions(
  userId: string | undefined,
  month: number,
  year: number
) {
  const { getToken, signOut } = useAuth();
  const monthStr = String(month + 1).padStart(2, '0');
  const cacheKey = userId ? `${userId}:${year}-${monthStr}` : '';

  // Initialize immediately from cache if available, preventing loading flash
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (cacheKey && transactionsCache.has(cacheKey)) {
      return transactionsCache.get(cacheKey)!;
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !cacheKey || !transactionsCache.has(cacheKey);
  });
  const [error, setError] = useState<string | null>(null);

  /** Handle 401 Unauthorized responses by clearing auth state and navigating to sign-in */
  const handleUnauthorized = useCallback(async () => {
    try {
      await signOut?.();
    } catch {
      // Ignore signOut errors during redirection
    }
    window.location.href = '/';
  }, [signOut]);

  /**
   * Fetch all transactions for the given user + month/year window.
   * Uses isSilent to perform background revalidation without clearing UI.
   */
  const fetchTransactions = useCallback(async (isSilent = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const currentKey = `${userId}:${year}-${monthStr}`;
    const hasCached = transactionsCache.has(currentKey);

    // Only show full loading indicator if we don't have cached data to display
    if (!hasCached && !isSilent) {
      setLoading(true);
    }
    setError(null);

    // Build date range for the selected month (avoids timezone pitfalls)
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    try {
      const token = await getToken();
      if (!token) {
        await handleUnauthorized();
        return;
      }

      const res = await fetch(
        `/api/transactions?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Failed to fetch transactions');
        if (!hasCached) {
          setTransactions([]);
        }
      } else {
        const data: Transaction[] = (await res.json()) ?? [];
        transactionsCache.set(currentKey, data);
        setTransactions(data);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to fetch transactions');
      if (!hasCached) {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, monthStr, year, getToken, handleUnauthorized]);

  // Synchronize state and trigger background revalidation whenever user or month changes
  useEffect(() => {
    if (cacheKey && transactionsCache.has(cacheKey)) {
      setTransactions(transactionsCache.get(cacheKey)!);
      setLoading(false);
      // Revalidate in background without blocking UI
      fetchTransactions(true);
    } else {
      fetchTransactions(false);
    }
  }, [cacheKey, fetchTransactions]);

  /**
   * Insert a new transaction via POST /api/transactions.
   * Returns `{ error: null }` on success or `{ error: string }` on failure.
   */
  const addTransaction = async (
    formData: TransactionFormData
  ): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const token = await getToken();
      if (!token) {
        await handleUnauthorized();
        return { error: 'Not authenticated' };
      }

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return { error: 'Unauthorized' };
      }

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { error: result.error || 'Failed to add transaction' };
      }

      // Add the new row, keeping descending-date sort and updating cache
      setTransactions((prev) => {
        const next = [result, ...prev].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        if (cacheKey) {
          transactionsCache.set(cacheKey, next);
        }
        return next;
      });

      return { error: null };
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Failed to add transaction' };
    }
  };

  /**
   * Delete a transaction via DELETE /api/transactions?id=.
   */
  const deleteTransaction = async (
    id: string
  ): Promise<{ error: string | null }> => {
    try {
      const token = await getToken();
      if (!token) {
        await handleUnauthorized();
        return { error: 'Not authenticated' };
      }

      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return { error: 'Unauthorized' };
      }

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        return { error: result.error || 'Failed to delete transaction' };
      }

      setTransactions((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (cacheKey) {
          transactionsCache.set(cacheKey, next);
        }
        return next;
      });
      return { error: null };
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Failed to delete transaction' };
    }
  };

  /**
   * Update an existing transaction via PATCH /api/transactions?id=.
   */
  const updateTransaction = async (
    id: string,
    formData: TransactionFormData
  ): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not authenticated' };

    try {
      const token = await getToken();
      if (!token) {
        await handleUnauthorized();
        return { error: 'Not authenticated' };
      }

      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return { error: 'Unauthorized' };
      }

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        return { error: result.error || 'Failed to update transaction' };
      }

      setTransactions((prev) => {
        const next = prev
          .map((t) => (t.id === id ? result : t))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (cacheKey) {
          transactionsCache.set(cacheKey, next);
        }
        return next;
      });

      return { error: null };
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Failed to update transaction' };
    }
  };

  // ── Derived totals ──────────────────────────────────────────
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    totalIncome,
    totalExpenses,
    balance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}

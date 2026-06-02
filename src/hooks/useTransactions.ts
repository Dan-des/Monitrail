import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction, TransactionFormData } from '../types';

/**
 * Custom hook for managing transactions for a specific user and month.
 *
 * Provides CRUD operations, computed totals (income, expenses, balance),
 * and loading/error state.
 */
export function useTransactions(
  userId: string | undefined,
  month: number,
  year: number
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all transactions for the given user + month/year window.
   * Builds date range strings manually to avoid timezone issues with Date.toISOString().
   */
  const fetchTransactions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Build date range for the selected month (avoids timezone pitfalls)
    const monthStr = String(month + 1).padStart(2, '0');
    const lastDay = new Date(year, month + 1, 0).getDate();
    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setTransactions([]);
    } else {
      setTransactions(data ?? []);
    }

    setLoading(false);
  }, [userId, month, year]);

  // Re-fetch whenever user/month/year changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /**
   * Insert a new transaction into Supabase and update local state.
   * Returns `{ error: null }` on success or `{ error: string }` on failure.
   */
  const addTransaction = async (
    formData: TransactionFormData
  ): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not authenticated' };

    const payload = {
      ...formData,
      user_id: userId,
    };

    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      return { error: insertError.message };
    }

    // Optimistically add the new row, keeping descending-date sort
    setTransactions((prev) =>
      [data, ...prev].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );

    return { error: null };
  };

  /**
   * Delete a transaction by ID and remove it from local state.
   */
  const deleteTransaction = async (
    id: string
  ): Promise<{ error: string | null }> => {
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return { error: null };
  };

  /**
   * Update an existing transaction in Supabase and update local state.
   */
  const updateTransaction = async (
    id: string,
    formData: TransactionFormData
  ): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not authenticated' };

    const { data, error: updateError } = await supabase
      .from('transactions')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return { error: updateError.message };
    }

    setTransactions((prev) =>
      prev
        .map((t) => (t.id === id ? data : t))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );

    return { error: null };
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

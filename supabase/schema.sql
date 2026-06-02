-- ============================================================
-- Monitrail — Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID            REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount      NUMERIC(12, 2)  NOT NULL CHECK (amount > 0),
  category    TEXT            NOT NULL,
  type        TEXT            NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT            DEFAULT '',
  date        DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ     DEFAULT NOW() NOT NULL
);

-- 2. Indexes for performant user-scoped and date-range queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);

-- 3. Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — each user can only access their own rows

-- SELECT: Users can read their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create transactions linked to themselves
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can modify only their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can remove only their own transactions
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

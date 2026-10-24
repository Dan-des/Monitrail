-- ============================================================
-- Monitrail — Neon PostgreSQL Database Schema
-- Run this in your Neon SQL Editor (Neon Console -> SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
  id          UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT            NOT NULL,
  amount      NUMERIC(12, 2)  NOT NULL CHECK (amount > 0),
  category    TEXT            NOT NULL,
  type        TEXT            NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT            DEFAULT '',
  date        DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ     DEFAULT NOW() NOT NULL
);

-- Index for performant user-scoped and date-range queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);

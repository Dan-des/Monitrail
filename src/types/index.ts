/** A single financial transaction stored in Supabase */
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
  date: string;
  created_at: string;
}

/** Shape of the data submitted from the "Add Transaction" form */
export interface TransactionFormData {
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
  date: string;
}
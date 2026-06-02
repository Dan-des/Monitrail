import {
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  Gamepad2,
  ShoppingBag,
  Heart,
  GraduationCap,
  Plane,
  Banknote,
  Laptop,
  TrendingUp,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

/** A category definition with display name, transaction type, and icon */
export interface Category {
  name: string;
  type: 'income' | 'expense';
  icon: LucideIcon;
}

/** All available transaction categories */
export const CATEGORIES: Category[] = [
  // ── Expense categories ──────────────────────────
  { name: 'Food & Drink',    type: 'expense', icon: UtensilsCrossed },
  { name: 'Transportation',  type: 'expense', icon: Car },
  { name: 'Housing',         type: 'expense', icon: Home },
  { name: 'Utilities',       type: 'expense', icon: Zap },
  { name: 'Entertainment',   type: 'expense', icon: Gamepad2 },
  { name: 'Shopping',        type: 'expense', icon: ShoppingBag },
  { name: 'Health',          type: 'expense', icon: Heart },
  { name: 'Education',       type: 'expense', icon: GraduationCap },
  { name: 'Travel',          type: 'expense', icon: Plane },
  { name: 'Other',           type: 'expense', icon: MoreHorizontal },

  // ── Income categories ───────────────────────────
  { name: 'Salary',          type: 'income', icon: Banknote },
  { name: 'Freelance',       type: 'income', icon: Laptop },
  { name: 'Investment',      type: 'income', icon: TrendingUp },
  { name: 'Other Income',    type: 'income', icon: MoreHorizontal },
];

/** Look up the Lucide icon component for a given category name */
export function getCategoryIcon(categoryName: string): LucideIcon {
  const category = CATEGORIES.find((c) => c.name === categoryName);
  return category?.icon ?? MoreHorizontal;
}

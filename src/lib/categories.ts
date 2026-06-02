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

/** A category definition with display name, transaction type, icon, and visual color */
export interface Category {
  name: string;
  type: 'income' | 'expense';
  icon: LucideIcon;
  color: string;
}

/** All available transaction categories with visual theme colors */
export const CATEGORIES: Category[] = [
  // ── Expense categories ──────────────────────────
  { name: 'Food & Drink',    type: 'expense', icon: UtensilsCrossed, color: '#f59e0b' }, // Amber
  { name: 'Transportation',  type: 'expense', icon: Car,             color: '#3b82f6' }, // Blue
  { name: 'Housing',         type: 'expense', icon: Home,            color: '#ef4444' }, // Red
  { name: 'Utilities',       type: 'expense', icon: Zap,             color: '#10b981' }, // Emerald
  { name: 'Entertainment',   type: 'expense', icon: Gamepad2,        color: '#8b5cf6' }, // Purple
  { name: 'Shopping',        type: 'expense', icon: ShoppingBag,     color: '#ec4899' }, // Pink
  { name: 'Health',          type: 'expense', icon: Heart,           color: '#f43f5e' }, // Rose
  { name: 'Education',       type: 'expense', icon: GraduationCap,   color: '#6366f1' }, // Indigo
  { name: 'Travel',          type: 'expense', icon: Plane,           color: '#06b6d4' }, // Cyan
  { name: 'Other',           type: 'expense', icon: MoreHorizontal,  color: '#71717a' }, // Zinc

  // ── Income categories ───────────────────────────
  { name: 'Salary',          type: 'income', icon: Banknote,        color: '#10b981' }, // Emerald
  { name: 'Freelance',       type: 'income', icon: Laptop,          color: '#06b6d4' }, // Cyan
  { name: 'Investment',      type: 'income', icon: TrendingUp,      color: '#3b82f6' }, // Blue
  { name: 'Other Income',    type: 'income', icon: MoreHorizontal,  color: '#71717a' }, // Zinc
];

/** Look up the Lucide icon component for a given category name */
export function getCategoryIcon(categoryName: string): LucideIcon {
  const category = CATEGORIES.find((c) => c.name === categoryName);
  return category?.icon ?? MoreHorizontal;
}

/** Look up the theme color hex for a given category name */
export function getCategoryColor(categoryName: string): string {
  const category = CATEGORIES.find((c) => c.name === categoryName);
  return category?.color ?? '#71717a';
}

/**
 * Format a number as Nigerian Naira (₦).
 * Uses the en-NG locale for proper grouping and symbol placement.
 */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);

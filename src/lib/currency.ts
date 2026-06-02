/**
 * Format a number as a specified currency.
 * Uses locales corresponding to each currency for proper formatting.
 */
export const formatCurrency = (amount: number, currencyCode: string = 'NGN'): string => {
  const currencyLocales: Record<string, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    GHS: 'en-GH',
  };

  return new Intl.NumberFormat(currencyLocales[currencyCode] || 'en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get the symbol for a given currency code.
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: '₵',
  };
  return symbols[currencyCode] || '$';
};

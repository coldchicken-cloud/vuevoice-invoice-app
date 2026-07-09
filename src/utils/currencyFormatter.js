import { DEFAULT_CURRENCY_CODE } from './currencies';

// Consistent number -> currency-string formatting used across the invoice
// list, invoice detail, PDF export, and dashboard. Every call site passes
// the invoice's own currency code so mixed-currency data never gets
// silently mislabeled as USD.

export function formatCurrency(amount, currencyCode = DEFAULT_CURRENCY_CODE) {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(value);
  } catch (error) {
    // Unknown/invalid currency code - fall back rather than throw.
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

// Used where space is tight (chart labels) - $1,234.50 becomes $1.2K.
export function formatCompactCurrency(amount, currencyCode = DEFAULT_CURRENCY_CODE) {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  } catch (error) {
    return `${currencyCode} ${Math.round(value)}`;
  }
}

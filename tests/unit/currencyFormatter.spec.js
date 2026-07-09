import { describe, expect, it } from 'vitest';
import { formatCurrency, formatCompactCurrency } from '@/utils/currencyFormatter';

describe('formatCurrency', () => {
  it('formats a USD amount with two decimal places', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50');
  });

  it('defaults to USD when no currency code is given', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });

  it('treats non-numeric amounts as zero', () => {
    expect(formatCurrency(undefined, 'USD')).toBe('$0.00');
  });

  it('formats other supported currencies with their own symbol', () => {
    expect(formatCurrency(50, 'EUR')).toContain('50.00');
    expect(formatCurrency(50, 'GBP')).toContain('50.00');
  });

  it('falls back gracefully for an invalid currency code instead of throwing', () => {
    expect(() => formatCurrency(10, 'NOT_REAL')).not.toThrow();
  });
});

describe('formatCompactCurrency', () => {
  it('leaves small numbers unabbreviated', () => {
    expect(formatCompactCurrency(42, 'USD')).toContain('42');
  });

  it('abbreviates large numbers', () => {
    const result = formatCompactCurrency(12500, 'USD');
    expect(result.toUpperCase()).toContain('K');
  });
});

import { describe, expect, it } from 'vitest';
import {
  addDaysToInvoiceDate,
  isPastDue,
  isoDateStringToInvoiceDate,
  unixToIsoDateString,
} from '@/utils/dateHelpers';

describe('addDaysToInvoiceDate', () => {
  it('adds the given number of days to the base timestamp', () => {
    const base = new Date('2026-01-01T00:00:00Z').getTime();
    const result = addDaysToInvoiceDate(base, 30);
    const expected = new Date('2026-01-31T00:00:00Z').getTime();
    expect(result.unix).toBe(expected);
  });

  it('produces a human-readable date string', () => {
    const base = new Date('2026-01-01T00:00:00Z').getTime();
    const result = addDaysToInvoiceDate(base, 60);
    expect(typeof result.readable).toBe('string');
    expect(result.readable.length).toBeGreaterThan(0);
  });
});

describe('unixToIsoDateString / isoDateStringToInvoiceDate round trip', () => {
  it('converts a unix timestamp to an ISO date string and back', () => {
    const original = new Date('2026-03-15T00:00:00').getTime();
    const isoString = unixToIsoDateString(original);
    const { unix } = isoDateStringToInvoiceDate(isoString);
    expect(new Date(unix).toDateString()).toBe(new Date(original).toDateString());
  });

  it('returns an empty string for a falsy timestamp', () => {
    expect(unixToIsoDateString(null)).toBe('');
  });
});

describe('isPastDue', () => {
  it('is false when the invoice is already paid, regardless of date', () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    expect(isPastDue(yesterday, true)).toBe(false);
  });

  it('is true when unpaid and the due date has passed', () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    expect(isPastDue(yesterday, false)).toBe(true);
  });

  it('is false when unpaid but the due date is in the future', () => {
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
    expect(isPastDue(tomorrow, false)).toBe(false);
  });

  it('is false when there is no due date at all', () => {
    expect(isPastDue(null, false)).toBe(false);
  });
});

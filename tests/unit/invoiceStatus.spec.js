import { describe, expect, it } from 'vitest';
import { getInvoiceStatus } from '@/utils/invoiceStatus';

function baseInvoice(overrides = {}) {
  return {
    invoicePaid: false,
    invoicePending: false,
    invoiceDraft: true,
    paymentDueDateUnix: null,
    ...overrides,
  };
}

describe('getInvoiceStatus', () => {
  it('returns "paid" when invoicePaid is true, even if also marked pending', () => {
    const invoice = baseInvoice({ invoicePaid: true, invoicePending: true });
    expect(getInvoiceStatus(invoice)).toBe('paid');
  });

  it('returns "draft" for a plain draft invoice', () => {
    expect(getInvoiceStatus(baseInvoice())).toBe('draft');
  });

  it('returns "pending" when pending and not yet due', () => {
    const invoice = baseInvoice({
      invoicePending: true,
      invoiceDraft: false,
      paymentDueDateUnix: Date.now() + 100000,
    });
    expect(getInvoiceStatus(invoice)).toBe('pending');
  });

  it('returns "overdue" when pending and the due date has passed', () => {
    const invoice = baseInvoice({
      invoicePending: true,
      invoiceDraft: false,
      paymentDueDateUnix: Date.now() - 100000,
    });
    expect(getInvoiceStatus(invoice)).toBe('overdue');
  });
});

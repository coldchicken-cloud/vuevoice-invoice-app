import { describe, expect, it } from 'vitest';
import invoicesModule from '@/store/modules/invoices';

function invoice(overrides = {}) {
  return {
    docId: 'doc1',
    invoiceId: 'AB1234',
    currencyCode: 'USD',
    invoiceTotal: 100,
    invoicePaid: false,
    invoicePending: false,
    invoiceDraft: true,
    invoiceDateUnix: Date.now(),
    paymentDueDateUnix: null,
    ...overrides,
  };
}

describe('invoices store getters', () => {
  it('totalsByStatus only sums invoices in the requested currency', () => {
    const state = {
      invoiceList: [
        invoice({ invoicePaid: true, invoiceDraft: false, invoiceTotal: 100, currencyCode: 'USD' }),
        invoice({ invoicePaid: true, invoiceDraft: false, invoiceTotal: 200, currencyCode: 'EUR' }),
      ],
    };

    const totals = invoicesModule.getters.totalsByStatus(state)('USD');
    expect(totals.paid).toBe(100);

    const eurTotals = invoicesModule.getters.totalsByStatus(state)('EUR');
    expect(eurTotals.paid).toBe(200);
  });

  it('totalsByStatus buckets overdue invoices separately from pending', () => {
    const state = {
      invoiceList: [
        invoice({ invoicePending: true, invoiceDraft: false, paymentDueDateUnix: Date.now() + 100000, invoiceTotal: 50 }),
        invoice({ invoicePending: true, invoiceDraft: false, paymentDueDateUnix: Date.now() - 100000, invoiceTotal: 75 }),
      ],
    };

    const totals = invoicesModule.getters.totalsByStatus(state)('USD');
    expect(totals.pending).toBe(50);
    expect(totals.overdue).toBe(75);
  });

  it('currenciesInUse returns each distinct currency exactly once', () => {
    const state = {
      invoiceList: [invoice({ currencyCode: 'USD' }), invoice({ currencyCode: 'USD' }), invoice({ currencyCode: 'INR' })],
    };
    expect(invoicesModule.getters.currenciesInUse(state).sort()).toEqual(['INR', 'USD']);
  });

  it('monthlyPaidRevenue only counts paid invoices in the current month bucket', () => {
    const state = {
      invoiceList: [invoice({ invoicePaid: true, invoiceDraft: false, invoiceTotal: 300, invoiceDateUnix: Date.now() })],
    };
    const months = invoicesModule.getters.monthlyPaidRevenue(state)('USD');
    expect(months).toHaveLength(6);
    expect(months[months.length - 1].total).toBe(300);
  });
});

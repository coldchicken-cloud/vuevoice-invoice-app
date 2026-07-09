import { describe, expect, it } from 'vitest';
import { buildInvoicesCsv } from '@/utils/csvExporter';

function sampleInvoice(overrides = {}) {
  return {
    invoiceId: 'AB1234',
    clientName: 'Acme, Inc.',
    clientEmail: 'billing@acme.test',
    invoiceDate: 'Jan 1, 2026',
    paymentDueDate: 'Jan 31, 2026',
    invoicePaid: true,
    invoicePending: false,
    invoiceDraft: false,
    currencyCode: 'USD',
    invoiceTotal: 500,
    ...overrides,
  };
}

describe('buildInvoicesCsv', () => {
  it('includes a header row and one row per invoice', () => {
    const csv = buildInvoicesCsv([sampleInvoice(), sampleInvoice({ invoiceId: 'CD5678' })]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('Invoice ID');
  });

  it('quotes and escapes fields that contain commas', () => {
    const csv = buildInvoicesCsv([sampleInvoice({ clientName: 'Acme, Inc.' })]);
    expect(csv).toContain('"Acme, Inc."');
  });

  it('returns just the header row for an empty invoice list', () => {
    const csv = buildInvoicesCsv([]);
    expect(csv.split('\n')).toHaveLength(1);
  });
});

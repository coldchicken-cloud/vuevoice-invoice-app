import { isPastDue } from './dateHelpers';

export const STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Pending',
  draft: 'Draft',
  overdue: 'Overdue',
};

/**
 * Invoices store their status as three separate booleans (legacy shape
 * from the original data model). This is the one place that turns those
 * booleans - plus the current date, for "overdue" - into a single status
 * string everything else can rely on.
 */
export function getInvoiceStatus(invoice) {
  if (invoice.invoicePaid) return 'paid';
  if (invoice.invoicePending && isPastDue(invoice.paymentDueDateUnix, false)) return 'overdue';
  if (invoice.invoicePending) return 'pending';
  return 'draft';
}

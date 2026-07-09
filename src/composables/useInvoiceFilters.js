import { computed, ref } from 'vue';
import { isPastDue } from '../utils/dateHelpers';

/**
 * Wraps a reactive list of invoices with status/search/date-range
 * filtering. Kept separate from any single view so both the invoice
 * list and, potentially, the dashboard can reuse the same filtering
 * rules.
 *
 * @param {import('vue').Ref<Array>} invoicesRef
 */
export function useInvoiceFilters(invoicesRef) {
  const statusFilter = ref(null); // null | 'draft' | 'pending' | 'paid' | 'overdue'
  const searchText = ref('');
  const dateFrom = ref(null); // yyyy-mm-dd from an <input type="date">
  const dateTo = ref(null);

  function matchesStatus(invoice) {
    if (!statusFilter.value) return true;
    if (statusFilter.value === 'draft') return Boolean(invoice.invoiceDraft);
    if (statusFilter.value === 'paid') return Boolean(invoice.invoicePaid);
    if (statusFilter.value === 'overdue') {
      return Boolean(invoice.invoicePending) && isPastDue(invoice.paymentDueDateUnix, false);
    }
    if (statusFilter.value === 'pending') {
      return Boolean(invoice.invoicePending) && !isPastDue(invoice.paymentDueDateUnix, false);
    }
    return true;
  }

  function matchesSearch(invoice) {
    const term = searchText.value.trim().toLowerCase();
    if (!term) return true;
    const haystack = `${invoice.clientName || ''} ${invoice.invoiceId || ''}`.toLowerCase();
    return haystack.includes(term);
  }

  function matchesDateRange(invoice) {
    if (!dateFrom.value && !dateTo.value) return true;
    if (!invoice.invoiceDateUnix) return false;

    const invoiceTime = invoice.invoiceDateUnix;
    if (dateFrom.value && invoiceTime < new Date(dateFrom.value).getTime()) return false;
    if (dateTo.value) {
      // Add a day so the "to" date is inclusive of its whole day.
      const endOfDay = new Date(dateTo.value).getTime() + 24 * 60 * 60 * 1000;
      if (invoiceTime > endOfDay) return false;
    }
    return true;
  }

  const filteredInvoices = computed(() =>
    invoicesRef.value.filter(
      (invoice) => matchesStatus(invoice) && matchesSearch(invoice) && matchesDateRange(invoice)
    )
  );

  const hasActiveFilters = computed(
    () => Boolean(statusFilter.value) || Boolean(searchText.value) || Boolean(dateFrom.value) || Boolean(dateTo.value)
  );

  function clearFilters() {
    statusFilter.value = null;
    searchText.value = '';
    dateFrom.value = null;
    dateTo.value = null;
  }

  return {
    statusFilter,
    searchText,
    dateFrom,
    dateTo,
    filteredInvoices,
    hasActiveFilters,
    clearFilters,
  };
}

<template>
  <div class="container">
    <div class="page-header flex fade-rise-in">
      <div>
        <h1>Invoices</h1>
        <p class="subtitle">{{ subtitleText }}</p>
      </div>
      <button type="button" class="purple new-invoice-button flex" @click="openNewInvoiceEditor">
        <span class="icon-badge flex">
          <img src="@/assets/icons/icon-plus.svg" alt="" />
        </span>
        New Invoice
      </button>
    </div>

    <div class="filter-bar flex">
      <input
        type="search"
        class="search-input"
        placeholder="Search by client or invoice #"
        v-model="searchText"
      />
      <select v-model="statusFilter" class="status-select">
        <option :value="null">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="pending">Pending</option>
        <option value="overdue">Overdue</option>
        <option value="paid">Paid</option>
      </select>
      <div class="date-range flex">
        <input type="date" v-model="dateFrom" aria-label="From date" />
        <span>to</span>
        <input type="date" v-model="dateTo" aria-label="To date" />
      </div>
      <button v-if="hasActiveFilters" type="button" class="clear-filters" @click="clearFilters">
        Clear filters
      </button>
      <button type="button" class="export-csv" @click="exportCsv" :disabled="filteredInvoices.length === 0">
        Export CSV
      </button>
    </div>

    <p v-if="!invoicesLoaded" class="status-message">Loading your invoices…</p>

    <div v-else-if="filteredInvoices.length === 0" class="empty-state flex flex-column">
      <img src="@/assets/icons/illustration-empty.svg" alt="" />
      <h3>{{ hasActiveFilters ? 'No invoices match your filters' : 'There is nothing here' }}</h3>
      <p v-if="!hasActiveFilters">
        Create a new invoice by clicking the <strong>New Invoice</strong> button and get started.
      </p>
      <button v-else type="button" class="purple" @click="clearFilters">Clear filters</button>
    </div>

    <div v-else class="invoice-list">
      <InvoiceListItem
        v-for="(invoice, index) in filteredInvoices"
        :key="invoice.docId"
        :invoice="invoice"
        :index="index"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import InvoiceListItem from '@/components/invoices/InvoiceListItem.vue';
import { useInvoiceFilters } from '@/composables/useInvoiceFilters';
import { downloadInvoicesCsv } from '@/utils/csvExporter';

const store = useStore();

const allInvoices = computed(() => store.getters['invoices/allInvoices']);
const invoicesLoaded = computed(() => store.state.invoices.invoicesLoaded);

const { statusFilter, searchText, dateFrom, dateTo, filteredInvoices, hasActiveFilters, clearFilters } =
  useInvoiceFilters(allInvoices);

const subtitleText = computed(() => {
  const count = filteredInvoices.value.length;
  return `${count} invoice${count === 1 ? '' : 's'}`;
});

function openNewInvoiceEditor() {
  store.commit('ui/SET_EDITING_INVOICE_DOC_ID', null);
  store.commit('ui/SET_INVOICE_EDITOR_OPEN', true);
}

function exportCsv() {
  downloadInvoicesCsv(filteredInvoices.value, `vuevoice-invoices-${new Date().toISOString().slice(0, 10)}.csv`);
}
</script>

<style lang="scss" scoped>
.page-header {
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  h1 {
    color: var(--color-text);
  }

  .subtitle {
    color: var(--color-text-secondary);
    font-size: 12px;
    margin-top: 4px;
  }

  .new-invoice-button {
    align-items: center;

    .icon-badge {
      background-color: #fff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      align-items: center;
      justify-content: center;
      margin-right: 8px;

      img {
        width: 10px;
        height: 10px;
      }
    }
  }
}

.filter-bar {
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;

  .search-input,
  .status-select,
  .date-range input {
    background-color: var(--color-surface);
    border: 1px solid var(--color-input-border);
    color: var(--color-text);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
  }

  .search-input {
    flex: 1;
    min-width: 200px;
  }

  .date-range {
    align-items: center;
    gap: 8px;
    color: var(--color-text-muted);
    font-size: 12px;
  }

  .clear-filters {
    background: none;
    border: none;
    color: var(--color-accent);
    cursor: pointer;
    font-size: 12px;
    padding: 8px;
  }

  .export-csv {
    background-color: var(--color-surface-alt);
    color: var(--color-text);
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 12px;
    cursor: pointer;
    margin-right: 0;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.status-message {
  color: var(--color-text-secondary);
  padding: 40px 0;
  text-align: center;
}

.empty-state {
  align-items: center;
  text-align: center;
  padding: 80px 0;

  img {
    width: 200px;
    margin-bottom: 32px;
    animation: gentle-float 5s ease-in-out infinite;
  }

  h3 {
    color: var(--color-text);
    margin-bottom: 16px;
  }

  p {
    color: var(--color-text-secondary);
    max-width: 280px;
    line-height: 1.5;
  }

  button {
    margin-top: 24px;
  }
}
</style>

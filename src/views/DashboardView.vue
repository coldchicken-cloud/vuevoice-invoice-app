<template>
  <div class="container">
    <div class="page-header flex fade-rise-in">
      <div>
        <h1>Dashboard</h1>
        <p class="subtitle">A quick look at how things are going.</p>
      </div>
      <div v-if="currenciesInUse.length > 1" class="input flex flex-column">
        <label for="dashboardCurrency">Currency</label>
        <select id="dashboardCurrency" v-model="selectedCurrency">
          <option v-for="code in currenciesInUse" :key="code" :value="code">{{ code }}</option>
        </select>
      </div>
    </div>

    <p v-if="currenciesInUse.length === 0" class="status-message">
      Create your first invoice to see totals here.
    </p>

    <template v-else>
      <div class="summary-cards flex">
        <div class="card fade-rise-in" style="animation-delay: 0.05s">
          <p class="label">Paid</p>
          <h2>{{ formatCurrency(paidDisplay, selectedCurrency) }}</h2>
        </div>
        <div class="card fade-rise-in" style="animation-delay: 0.1s">
          <p class="label">Pending</p>
          <h2>{{ formatCurrency(pendingDisplay, selectedCurrency) }}</h2>
        </div>
        <div class="card overdue-card fade-rise-in" style="animation-delay: 0.15s" v-if="totals.overdue > 0">
          <p class="label">Overdue</p>
          <h2>{{ formatCurrency(overdueDisplay, selectedCurrency) }}</h2>
        </div>
        <div class="card fade-rise-in" style="animation-delay: 0.2s">
          <p class="label">Draft</p>
          <h2>{{ formatCurrency(draftDisplay, selectedCurrency) }}</h2>
        </div>
        <div class="card fade-rise-in" style="animation-delay: 0.25s">
          <p class="label">Total Invoices</p>
          <h2>{{ Math.round(countDisplay) }}</h2>
        </div>
      </div>

      <div class="chart-card fade-rise-in" style="animation-delay: 0.3s">
        <h3>Paid revenue - last 6 months ({{ selectedCurrency }})</h3>
        <RevenueChart :data="monthlyRevenue" :currency-code="selectedCurrency" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import RevenueChart from '@/components/dashboard/RevenueChart.vue';
import { formatCurrency } from '@/utils/currencyFormatter';
import { DEFAULT_CURRENCY_CODE } from '@/utils/currencies';
import { useCountUp } from '@/composables/useCountUp';

const store = useStore();

const currenciesInUse = computed(() => store.getters['invoices/currenciesInUse']);
const selectedCurrency = ref(DEFAULT_CURRENCY_CODE);

// Keep the selection valid as invoices load in / currencies change.
watch(
  currenciesInUse,
  (codes) => {
    if (codes.length && !codes.includes(selectedCurrency.value)) {
      selectedCurrency.value = codes[0];
    }
  },
  { immediate: true }
);

const totals = computed(() => store.getters['invoices/totalsByStatus'](selectedCurrency.value));
const monthlyRevenue = computed(() => store.getters['invoices/monthlyPaidRevenue'](selectedCurrency.value));
const invoiceCount = computed(
  () =>
    store.getters['invoices/allInvoices'].filter(
      (invoice) => (invoice.currencyCode || DEFAULT_CURRENCY_CODE) === selectedCurrency.value
    ).length
);

// Each summary figure eases toward its new value instead of snapping -
// a small touch, but it's the difference between a spreadsheet and a
// product.
const { displayValue: paidDisplay } = useCountUp(computed(() => totals.value.paid));
const { displayValue: pendingDisplay } = useCountUp(computed(() => totals.value.pending));
const { displayValue: overdueDisplay } = useCountUp(computed(() => totals.value.overdue));
const { displayValue: draftDisplay } = useCountUp(computed(() => totals.value.draft));
const { displayValue: countDisplay } = useCountUp(invoiceCount);
</script>

<style lang="scss" scoped>
.page-header {
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  h1 {
    color: var(--color-text);
  }

  .subtitle {
    color: var(--color-text-secondary);
    font-size: 12px;
    margin-top: 4px;
  }

  select {
    background-color: var(--color-surface);
    border: 1px solid var(--color-input-border);
    color: var(--color-text);
    border-radius: 6px;
    padding: 8px 12px;
  }

  label {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-bottom: 4px;
  }
}

.status-message {
  color: var(--color-text-secondary);
  padding: 40px 0;
}

.summary-cards {
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 32px;

  .card {
    flex: 1;
    min-width: 140px;
    background-color: var(--color-surface);
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 20px;
    box-shadow: var(--shadow-panel);
    transition: transform 0.2s var(--ease-premium), border-color 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--color-accent-soft);
    }

    &.overdue-card h2 {
      color: var(--color-danger);
    }

    .label {
      color: var(--color-text-secondary);
      font-size: 12px;
      margin-bottom: 8px;
    }

    h2 {
      color: var(--color-text);
      font-size: 24px;
      font-variant-numeric: tabular-nums;
    }
  }
}

.chart-card {
  background-color: var(--color-surface);
  border-radius: 10px;
  padding: 24px;
  box-shadow: var(--shadow-panel);

  h3 {
    color: var(--color-text);
    font-size: 14px;
    margin-bottom: 16px;
  }
}
</style>

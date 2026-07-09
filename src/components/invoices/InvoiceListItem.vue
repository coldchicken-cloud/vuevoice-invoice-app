<template>
  <router-link
    :to="{ name: 'InvoiceDetail', params: { invoiceId: invoice.invoiceId } }"
    class="invoice-row nav-link flex fade-rise-in"
    :style="{ animationDelay: `${Math.min(index, 8) * 0.05}s` }"
  >
    <h4><span>#</span>{{ invoice.invoiceId }}</h4>
    <p class="due-date">Due {{ invoice.paymentDueDate }}</p>
    <p class="client-name">{{ invoice.clientName }}</p>
    <h3 class="total">{{ formattedTotal }}</h3>
    <StatusBadge :status="status" />
    <svg class="chevron" width="8" height="14" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1l6 6-6 6" stroke="#c9a66b" stroke-width="2" fill="none" fill-rule="evenodd" />
    </svg>
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import StatusBadge from '../common/StatusBadge.vue';
import { formatCurrency } from '@/utils/currencyFormatter';
import { getInvoiceStatus } from '@/utils/invoiceStatus';

const props = defineProps({
  invoice: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
});

const status = computed(() => getInvoiceStatus(props.invoice));
const formattedTotal = computed(() => formatCurrency(props.invoice.invoiceTotal, props.invoice.currencyCode));
</script>

<style lang="scss" scoped>
.invoice-row {
  cursor: pointer;
  padding: 16px;
  background-color: var(--color-surface);
  border-radius: 8px;
  margin-bottom: 16px;
  align-items: center;
  flex-wrap: wrap;
  border: 1px solid transparent;
  box-shadow: var(--shadow-panel);
  transition: transform 0.2s var(--ease-premium), box-shadow 0.2s var(--ease-premium), border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--color-accent);
    box-shadow: var(--shadow-panel), 0 0 0 1px var(--color-accent-soft);

    .chevron {
      transform: translateX(3px);
    }
  }

  h4 {
    flex-basis: 15%;
    color: var(--color-text);
    span {
      color: var(--color-text-muted);
    }
  }

  .due-date,
  .client-name {
    flex-basis: 25%;
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  .total {
    flex-basis: 15%;
    color: var(--color-text);
  }

  .chevron {
    transition: transform 0.2s var(--ease-premium);
    margin-left: 16px;
  }

  @media (max-width: 640px) {
    h4,
    .due-date,
    .client-name,
    .total {
      flex-basis: 45%;
      margin-bottom: 8px;
    }
  }
}
</style>

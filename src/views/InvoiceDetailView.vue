<template>
  <div class="container">
    <router-link :to="{ name: 'InvoiceList' }" class="back-link nav-link flex">
      <svg width="7" height="10" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 1L2 5l4 4" stroke="#c9a66b" stroke-width="2" fill="none" fill-rule="evenodd" />
      </svg>
      Go back
    </router-link>

    <p v-if="!invoice" class="status-message">That invoice doesn't exist (or isn't yours).</p>

    <template v-else>
      <div class="detail-header flex fade-rise-in">
        <div class="status-row flex">
          <span>Status</span>
          <StatusBadge :status="status" />
        </div>
        <div class="actions flex">
          <button type="button" class="dark-purple" @click="openEditor">Edit</button>
          <button type="button" class="red" @click="confirmDelete">Delete</button>
          <button type="button" class="outline" @click="downloadPdf">Download PDF</button>
          <button type="button" class="outline" :disabled="isEmailing" @click="emailInvoice">
            {{ isEmailing ? 'Sending…' : 'Email Invoice' }}
          </button>
          <button v-if="status !== 'paid'" type="button" class="green" @click="markAsPaid">Mark as Paid</button>
          <button v-else type="button" class="orange" @click="markAsPending">Mark as Pending</button>
        </div>
      </div>

      <p v-if="emailStatusMessage" class="email-status" :class="{ error: emailStatusIsError }">
        {{ emailStatusMessage }}
      </p>

      <div class="detail-card">
        <div class="top-row flex">
          <div>
            <h4><span>#</span>{{ invoice.invoiceId }}</h4>
            <p>{{ invoice.productDescription }}</p>
          </div>
          <div class="biller-address">
            <p>{{ invoice.billerStreetAddress }}</p>
            <p>{{ invoice.billerCity }}</p>
            <p>{{ invoice.billerZipCode }}</p>
            <p>{{ invoice.billerCountry }}</p>
          </div>
        </div>

        <div class="middle-row flex">
          <div>
            <p class="label">Invoice Date</p>
            <h4>{{ invoice.invoiceDate }}</h4>
            <p class="label due">Payment Due</p>
            <h4>{{ invoice.paymentDueDate }}</h4>
          </div>
          <div>
            <p class="label">Bill To</p>
            <h4>{{ invoice.clientName }}</h4>
            <p>{{ invoice.clientStreetAddress }}</p>
            <p>{{ invoice.clientCity }}</p>
            <p>{{ invoice.clientZipCode }}</p>
            <p>{{ invoice.clientCountry }}</p>
          </div>
          <div>
            <p class="label">Sent To</p>
            <h4>{{ invoice.clientEmail }}</h4>
          </div>
        </div>

        <div class="items-card">
          <div class="item-row flex heading">
            <p class="name">Item Name</p>
            <p class="qty">QTY.</p>
            <p class="price">Price</p>
            <p class="total">Total</p>
          </div>
          <div class="item-row flex" v-for="item in invoice.invoiceItemList" :key="item.id">
            <p class="name">{{ item.itemName }}</p>
            <p class="qty">{{ item.qty }}</p>
            <p class="price">{{ formatCurrency(item.price, invoice.currencyCode) }}</p>
            <p class="total">{{ formatCurrency(item.total, invoice.currencyCode) }}</p>
          </div>
          <div class="grand-total flex">
            <p>Amount Due</p>
            <h2>{{ formatCurrency(invoice.invoiceTotal, invoice.currencyCode) }}</h2>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatCurrency } from '@/utils/currencyFormatter';
import { getInvoiceStatus } from '@/utils/invoiceStatus';
import { exportInvoiceToPdf } from '@/utils/pdfExporter';
import { emailInvoiceToClient } from '@/utils/emailInvoice';

const route = useRoute();
const router = useRouter();
const store = useStore();

const invoice = computed(() => store.getters['invoices/invoiceByPublicId'](route.params.invoiceId));
const status = computed(() => (invoice.value ? getInvoiceStatus(invoice.value) : null));

const isEmailing = ref(false);
const emailStatusMessage = ref('');
const emailStatusIsError = ref(false);

function openEditor() {
  store.commit('ui/SET_EDITING_INVOICE_DOC_ID', invoice.value.docId);
  store.commit('ui/SET_INVOICE_EDITOR_OPEN', true);
}

async function confirmDelete() {
  const confirmed = window.confirm(`Delete invoice #${invoice.value.invoiceId}? This can't be undone.`);
  if (!confirmed) return;
  await store.dispatch('invoices/deleteInvoice', invoice.value.docId);
  router.push({ name: 'InvoiceList' });
}

function markAsPaid() {
  store.dispatch('invoices/setInvoiceStatus', { docId: invoice.value.docId, status: 'paid' });
}

function markAsPending() {
  store.dispatch('invoices/setInvoiceStatus', { docId: invoice.value.docId, status: 'pending' });
}

function downloadPdf() {
  exportInvoiceToPdf(invoice.value);
}

async function emailInvoice() {
  isEmailing.value = true;
  emailStatusMessage.value = '';
  emailStatusIsError.value = false;
  try {
    await emailInvoiceToClient(invoice.value);
    emailStatusMessage.value = `Sent to ${invoice.value.clientEmail}.`;
  } catch (error) {
    emailStatusIsError.value = true;
    emailStatusMessage.value = error.message || 'Could not send that email. Please try again.';
  } finally {
    isEmailing.value = false;
  }
}
</script>

<style lang="scss" scoped>
.back-link {
  align-items: center;
  gap: 12px;
  color: var(--color-text);
  margin-bottom: 32px;
  font-size: 13px;

  svg {
    margin-right: 4px;
  }
}

.status-message {
  color: var(--color-text-secondary);
  padding: 40px 0;
  text-align: center;
}

.email-status {
  font-size: 13px;
  margin-bottom: 16px;
  color: var(--color-success);

  &.error {
    color: var(--color-danger);
  }
}

.detail-header,
.detail-card {
  background-color: var(--color-surface);
  border-radius: 10px;
  box-shadow: var(--shadow-panel);
}

.detail-card {
  animation: fade-rise-in 0.5s var(--ease-premium) 0.05s both;
}

.detail-header {
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;

  .status-row {
    align-items: center;
    gap: 12px;
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  .actions {
    gap: 8px;

    button {
      margin-right: 0;
    }

    .outline {
      background: none;
      color: var(--color-accent);
      border: 1px solid var(--color-accent);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.detail-card {
  padding: 32px;
  color: var(--color-text);

  .top-row {
    justify-content: space-between;
    margin-bottom: 40px;

    h4 {
      margin-bottom: 8px;
      span {
        color: var(--color-text-muted);
      }
    }

    p {
      color: var(--color-text-secondary);
      font-size: 13px;
    }

    .biller-address {
      text-align: right;
    }
  }

  .middle-row {
    gap: 60px;
    margin-bottom: 40px;

    .label {
      color: var(--color-text-secondary);
      font-size: 12px;
      margin-bottom: 12px;

      &.due {
        margin-top: 24px;
      }
    }

    h4 {
      margin-bottom: 4px;
    }

    p {
      color: var(--color-text-secondary);
      font-size: 13px;
    }
  }

  .items-card {
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    background-color: var(--color-surface-alt);
    padding: 32px;

    .item-row {
      justify-content: space-between;
      margin-bottom: 24px;

      &.heading {
        color: var(--color-text-secondary);
        font-size: 11px;
      }

      p {
        flex-basis: 22%;
      }

      .name {
        flex-basis: 40%;
      }

      .qty,
      .price,
      .total {
        text-align: right;
      }
    }

    .grand-total {
      background-color: var(--color-surface-strong);
      color: #fff;
      margin: 0 -32px -32px;
      padding: 24px 32px;
      justify-content: space-between;
      align-items: center;
      border-radius: 0 0 8px 8px;
    }
  }
}
</style>

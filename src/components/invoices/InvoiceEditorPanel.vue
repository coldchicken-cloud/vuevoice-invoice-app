<template>
  <div @click="checkBackgroundClick" class="editor-overlay flex flex-column">
    <form @submit.prevent="handleSubmit" class="editor-panel">
      <SpinnerOverlay v-show="isSaving" />
      <h1>{{ isEditing ? 'Edit Invoice' : 'New Invoice' }}</h1>

      <!-- Bill From -->
      <div class="field-group flex flex-column">
        <h4>Bill From</h4>
        <div class="input flex flex-column">
          <label for="billerStreetAddress">Street Address</label>
          <input required type="text" id="billerStreetAddress" v-model="form.billerStreetAddress" />
        </div>
        <div class="location-fields flex">
          <div class="input flex flex-column">
            <label for="billerCity">City</label>
            <input required type="text" id="billerCity" v-model="form.billerCity" />
          </div>
          <div class="input flex flex-column">
            <label for="billerZipCode">Zip Code</label>
            <input required type="text" id="billerZipCode" v-model="form.billerZipCode" />
          </div>
          <div class="input flex flex-column">
            <label for="billerCountry">Country</label>
            <input required type="text" id="billerCountry" v-model="form.billerCountry" />
          </div>
        </div>
      </div>

      <!-- Bill To -->
      <div class="field-group flex flex-column">
        <h4>Bill To</h4>
        <div class="input flex flex-column" v-if="savedClients.length">
          <label for="savedClient">Load Saved Client</label>
          <select id="savedClient" @change="applySavedClient($event.target.value)">
            <option value="">— Select a client —</option>
            <option v-for="client in savedClients" :key="client.docId" :value="client.docId">
              {{ client.name }}
            </option>
          </select>
        </div>
        <div class="input flex flex-column">
          <label for="clientName">Client's Name</label>
          <input required type="text" id="clientName" v-model="form.clientName" />
        </div>
        <div class="input flex flex-column">
          <label for="clientEmail">Client's Email</label>
          <input required type="email" id="clientEmail" v-model="form.clientEmail" />
        </div>
        <div class="input flex flex-column">
          <label for="clientStreetAddress">Street Address</label>
          <input required type="text" id="clientStreetAddress" v-model="form.clientStreetAddress" />
        </div>
        <div class="location-fields flex">
          <div class="input flex flex-column">
            <label for="clientCity">City</label>
            <input required type="text" id="clientCity" v-model="form.clientCity" />
          </div>
          <div class="input flex flex-column">
            <label for="clientZipCode">Zip Code</label>
            <input required type="text" id="clientZipCode" v-model="form.clientZipCode" />
          </div>
          <div class="input flex flex-column">
            <label for="clientCountry">Country</label>
            <input required type="text" id="clientCountry" v-model="form.clientCountry" />
          </div>
        </div>
        <label class="checkbox-row flex">
          <input type="checkbox" v-model="saveClientAfterSubmit" />
          Save this client for future invoices
        </label>
      </div>

      <!-- Work details -->
      <div class="field-group flex flex-column">
        <div class="payment-dates flex">
          <div class="input flex flex-column">
            <label for="invoiceDate">Invoice Date</label>
            <input required type="date" id="invoiceDate" v-model="invoiceDateInput" />
          </div>
          <div class="input flex flex-column">
            <label for="paymentDueDate">Payment Due</label>
            <input required type="date" id="paymentDueDate" v-model="paymentDueDateInput" />
          </div>
        </div>
        <div class="location-fields flex">
          <div class="input flex flex-column">
            <label for="paymentTerms">Payment Terms</label>
            <select required id="paymentTerms" v-model="form.paymentTerms">
              <option value="30">Net 30 Days</option>
              <option value="60">Net 60 Days</option>
            </select>
          </div>
          <div class="input flex flex-column">
            <label for="currencyCode">Currency</label>
            <select required id="currencyCode" v-model="form.currencyCode">
              <option v-for="currency in supportedCurrencies" :key="currency.code" :value="currency.code">
                {{ currency.code }} ({{ currency.symbol }})
              </option>
            </select>
          </div>
        </div>
        <div class="input flex flex-column">
          <label for="productDescription">Product Description</label>
          <input required type="text" id="productDescription" v-model="form.productDescription" />
        </div>

        <InvoiceLineItemsTable
          :items="form.invoiceItemList"
          :currency-code="form.currencyCode"
          @add-item="addLineItem"
          @remove-item="removeLineItem"
        />
      </div>

      <!-- Actions -->
      <div class="editor-actions flex">
        <div class="left">
          <button type="button" @click="closeEditor" class="red">Cancel</button>
        </div>
        <div class="right flex">
          <button v-if="!isEditing" type="submit" @click="pendingIntent = 'draft'" class="dark-purple">
            Save Draft
          </button>
          <button v-if="!isEditing" type="submit" @click="pendingIntent = 'pending'" class="purple">
            Create Invoice
          </button>
          <button v-if="isEditing" type="submit" class="purple">Update Invoice</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { uid } from 'uid';
import SpinnerOverlay from '../common/SpinnerOverlay.vue';
import InvoiceLineItemsTable from './InvoiceLineItemsTable.vue';
import {
  addDaysToInvoiceDate,
  getTodayAsInvoiceDate,
  isoDateStringToInvoiceDate,
  unixToIsoDateString,
} from '@/utils/dateHelpers';
import { DEFAULT_CURRENCY_CODE, SUPPORTED_CURRENCIES } from '@/utils/currencies';

const store = useStore();
const supportedCurrencies = SUPPORTED_CURRENCIES;

const isSaving = ref(false);
const pendingIntent = ref(null); // 'draft' | 'pending' | null (null = update, when editing)
const saveClientAfterSubmit = ref(false);
const selectedClientDocId = ref(null);
// Once someone picks their own due date, payment-terms changes stop
// silently overwriting it - they've taken over that field on purpose.
const dueDateManuallySet = ref(false);

const editingDocId = computed(() => store.state.ui.editingInvoiceDocId);
const isEditing = computed(() => store.getters['ui/isEditingInvoice']);
const savedClients = computed(() => store.getters['clients/allClients']);

function buildEmptyForm() {
  const today = getTodayAsInvoiceDate();
  return {
    billerStreetAddress: '',
    billerCity: '',
    billerZipCode: '',
    billerCountry: '',
    clientName: '',
    clientEmail: '',
    clientStreetAddress: '',
    clientCity: '',
    clientZipCode: '',
    clientCountry: '',
    invoiceDateUnix: today.unix,
    invoiceDate: today.readable,
    paymentTerms: '30',
    paymentDueDateUnix: null,
    paymentDueDate: '',
    currencyCode: DEFAULT_CURRENCY_CODE,
    productDescription: '',
    invoiceItemList: [],
  };
}

const form = reactive(buildEmptyForm());

function populateFormFromExistingInvoice(invoice) {
  Object.assign(form, {
    billerStreetAddress: invoice.billerStreetAddress,
    billerCity: invoice.billerCity,
    billerZipCode: invoice.billerZipCode,
    billerCountry: invoice.billerCountry,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientStreetAddress: invoice.clientStreetAddress,
    clientCity: invoice.clientCity,
    clientZipCode: invoice.clientZipCode,
    clientCountry: invoice.clientCountry,
    invoiceDateUnix: invoice.invoiceDateUnix,
    invoiceDate: invoice.invoiceDate,
    paymentTerms: invoice.paymentTerms,
    paymentDueDateUnix: invoice.paymentDueDateUnix,
    paymentDueDate: invoice.paymentDueDate,
    currencyCode: invoice.currencyCode || DEFAULT_CURRENCY_CODE,
    productDescription: invoice.productDescription,
    invoiceItemList: invoice.invoiceItemList.map((item) => ({ ...item })),
  });
}

// Whenever the panel is opened - for a new invoice or to edit one - reset
// or repopulate the form to match.
watch(
  editingDocId,
  (docId) => {
    pendingIntent.value = null;
    saveClientAfterSubmit.value = false;
    selectedClientDocId.value = null;
    dueDateManuallySet.value = Boolean(docId); // editing an existing invoice - don't clobber its due date
    if (docId) {
      const invoice = store.getters['invoices/allInvoices'].find((candidate) => candidate.docId === docId);
      if (invoice) populateFormFromExistingInvoice(invoice);
    } else {
      Object.assign(form, buildEmptyForm());
    }
  },
  { immediate: true }
);

// Payment terms drive the due date, same as the original app - unless
// the user has already picked their own due date by hand.
watch(
  () => form.paymentTerms,
  (terms) => {
    if (dueDateManuallySet.value) return;
    const dueDate = addDaysToInvoiceDate(form.invoiceDateUnix, terms);
    form.paymentDueDateUnix = dueDate.unix;
    form.paymentDueDate = dueDate.readable;
  },
  { immediate: true }
);

const invoiceDateInput = computed({
  get: () => unixToIsoDateString(form.invoiceDateUnix),
  set: (isoDateString) => {
    const { unix, readable } = isoDateStringToInvoiceDate(isoDateString);
    form.invoiceDateUnix = unix;
    form.invoiceDate = readable;
    if (!dueDateManuallySet.value) {
      const dueDate = addDaysToInvoiceDate(unix, form.paymentTerms);
      form.paymentDueDateUnix = dueDate.unix;
      form.paymentDueDate = dueDate.readable;
    }
  },
});

const paymentDueDateInput = computed({
  get: () => unixToIsoDateString(form.paymentDueDateUnix),
  set: (isoDateString) => {
    const { unix, readable } = isoDateStringToInvoiceDate(isoDateString);
    form.paymentDueDateUnix = unix;
    form.paymentDueDate = readable;
    dueDateManuallySet.value = true;
  },
});

function applySavedClient(docId) {
  if (!docId) return;
  const client = savedClients.value.find((candidate) => candidate.docId === docId);
  if (!client) return;
  form.clientName = client.name;
  form.clientEmail = client.email;
  form.clientStreetAddress = client.streetAddress;
  form.clientCity = client.city;
  form.clientZipCode = client.zipCode;
  form.clientCountry = client.country;
  selectedClientDocId.value = docId;
}

function addLineItem() {
  form.invoiceItemList.push({ id: uid(), itemName: '', qty: '', price: 0, total: 0 });
}

function removeLineItem(itemId) {
  form.invoiceItemList = form.invoiceItemList.filter((item) => item.id !== itemId);
}

function closeEditor() {
  store.commit('ui/SET_INVOICE_EDITOR_OPEN', false);
  store.commit('ui/SET_EDITING_INVOICE_DOC_ID', null);
}

function checkBackgroundClick(event) {
  if (event.target === event.currentTarget) {
    store.commit('ui/SET_DISCARD_CONFIRM_OPEN', true);
  }
}

async function maybePersistClient() {
  if (!saveClientAfterSubmit.value) return;
  await store.dispatch('clients/saveClient', {
    docId: selectedClientDocId.value,
    name: form.clientName,
    email: form.clientEmail,
    streetAddress: form.clientStreetAddress,
    city: form.clientCity,
    zipCode: form.clientZipCode,
    country: form.clientCountry,
  });
}

async function handleSubmit() {
  if (form.invoiceItemList.length === 0) {
    alert('Please add at least one item before saving.');
    return;
  }

  isSaving.value = true;
  try {
    if (isEditing.value) {
      await store.dispatch('invoices/updateInvoice', {
        docId: editingDocId.value,
        changes: { ...form },
      });
    } else {
      const status = pendingIntent.value || 'pending';
      await store.dispatch('invoices/createInvoice', {
        ...form,
        invoiceDraft: status === 'draft',
        invoicePending: status === 'pending',
      });
    }
    await maybePersistClient();
    closeEditor();
  } finally {
    isSaving.value = false;
  }
}
</script>

<style lang="scss" scoped>
.editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: scroll;
  z-index: 150;
  background-color: var(--color-overlay);
  backdrop-filter: blur(3px);

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 900px) {
    left: 90px;
  }
}

.editor-panel {
  position: relative;
  padding: 56px;
  max-width: 700px;
  width: 100%;
  background-color: var(--color-page-bg);
  color: var(--color-text);
  box-shadow: var(--shadow-panel);
  animation: fade-rise-in 0.4s var(--ease-premium) both;

  h1 {
    margin-bottom: 48px;
  }

  h4 {
    color: var(--color-accent);
    font-size: 12px;
    margin-bottom: 24px;
  }

  .field-group {
    margin-bottom: 48px;

    .location-fields {
      gap: 16px;
      div {
        flex: 1;
      }
    }
  }

  .payment-dates {
    gap: 24px;
    div {
      flex: 1;
    }
  }

  .editor-actions {
    margin-top: 60px;

    div {
      flex: 1;
    }

    .right {
      justify-content: flex-end;
    }
  }

  .input {
    margin-bottom: 24px;
  }

  .checkbox-row {
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 24px;

    input {
      width: auto;
    }
  }

  label {
    font-size: 12px;
    margin-bottom: 6px;
    color: var(--color-text-secondary);
  }

  input,
  select {
    width: 100%;
    background-color: var(--color-input-bg);
    border: 1px solid var(--color-input-border);
    color: var(--color-text);
    border-radius: 6px;
    padding: 12px 10px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: var(--shadow-focus);
    }
  }
}
</style>

<template>
  <div class="container">
    <div class="page-header flex fade-rise-in">
      <div>
        <h1>Clients</h1>
        <p class="subtitle">{{ clients.length }} saved client{{ clients.length === 1 ? '' : 's' }}</p>
      </div>
      <button type="button" class="purple" @click="startNewClient">+ Add Client</button>
    </div>

    <form v-if="isFormOpen" @submit.prevent="handleSave" class="client-form flex flex-column">
      <div class="input flex flex-column">
        <label for="name">Name</label>
        <input required type="text" id="name" v-model="form.name" />
      </div>
      <div class="input flex flex-column">
        <label for="email">Email</label>
        <input required type="email" id="email" v-model="form.email" />
      </div>
      <div class="input flex flex-column">
        <label for="streetAddress">Street Address</label>
        <input required type="text" id="streetAddress" v-model="form.streetAddress" />
      </div>
      <div class="location-fields flex">
        <div class="input flex flex-column">
          <label for="city">City</label>
          <input required type="text" id="city" v-model="form.city" />
        </div>
        <div class="input flex flex-column">
          <label for="zipCode">Zip Code</label>
          <input required type="text" id="zipCode" v-model="form.zipCode" />
        </div>
        <div class="input flex flex-column">
          <label for="country">Country</label>
          <input required type="text" id="country" v-model="form.country" />
        </div>
      </div>
      <div class="form-actions flex">
        <button type="button" class="dark-purple" @click="closeForm">Cancel</button>
        <button type="submit" class="purple">{{ form.docId ? 'Update Client' : 'Save Client' }}</button>
      </div>
    </form>

    <p v-if="clients.length === 0" class="status-message">
      No saved clients yet. Add one here, or save it straight from the invoice editor next time you bill someone new.
    </p>

    <div v-else class="client-list">
      <div class="client-row flex" v-for="client in clients" :key="client.docId">
        <div>
          <h4>{{ client.name }}</h4>
          <p>{{ client.email }}</p>
        </div>
        <div class="row-actions flex">
          <button type="button" class="dark-purple" @click="startEditClient(client)">Edit</button>
          <button type="button" class="red" @click="handleDelete(client)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const clients = computed(() => store.getters['clients/allClients']);
const isFormOpen = ref(false);

function emptyForm() {
  return { docId: null, name: '', email: '', streetAddress: '', city: '', zipCode: '', country: '' };
}

const form = reactive(emptyForm());

function startNewClient() {
  Object.assign(form, emptyForm());
  isFormOpen.value = true;
}

function startEditClient(client) {
  Object.assign(form, client);
  isFormOpen.value = true;
}

function closeForm() {
  isFormOpen.value = false;
}

async function handleSave() {
  await store.dispatch('clients/saveClient', { ...form });
  closeForm();
}

async function handleDelete(client) {
  const confirmed = window.confirm(`Delete ${client.name}? This won't affect any existing invoices.`);
  if (!confirmed) return;
  await store.dispatch('clients/deleteClient', client.docId);
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
}

.status-message {
  color: var(--color-text-secondary);
  padding: 40px 0;
  text-align: center;
  max-width: 420px;
}

.client-form {
  background-color: var(--color-surface);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  gap: 16px;
  max-width: 500px;

  label {
    font-size: 12px;
    color: var(--color-text-secondary);
    margin-bottom: 6px;
  }

  input {
    width: 100%;
    background-color: var(--color-input-bg);
    border: 1px solid var(--color-input-border);
    color: var(--color-text);
    border-radius: 4px;
    padding: 10px;

    &:focus {
      outline: none;
      border-color: var(--color-accent);
    }
  }

  .location-fields {
    gap: 12px;
    div {
      flex: 1;
    }
  }

  .form-actions {
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}

.client-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .client-row {
    background-color: var(--color-surface);
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 16px 20px;
    align-items: center;
    justify-content: space-between;
    box-shadow: var(--shadow-panel);
    transition: transform 0.2s var(--ease-premium), border-color 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--color-accent-soft);
    }

    h4 {
      color: var(--color-text);
    }

    p {
      color: var(--color-text-secondary);
      font-size: 13px;
      margin-top: 4px;
    }

    .row-actions {
      gap: 8px;
      button {
        margin-right: 0;
      }
    }
  }
}
</style>

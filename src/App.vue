<template>
  <div :class="['app-shell', { 'theme-light': isLightTheme }]">
    <div v-if="isBelowSupportedWidth" class="mobile-message flex flex-column">
      <h2>Vuevoice works best on a bigger screen</h2>
      <p>Please switch to a tablet or desktop browser to keep going.</p>
    </div>
    <div v-else class="app flex flex-column">
      <SideNav v-if="isAuthenticated" />
      <div class="app-content flex flex-column">
        <ConfirmDiscardDialog v-if="discardConfirmOpen" />
        <transition name="invoice-panel">
          <InvoiceEditorPanel v-if="invoiceEditorOpen" />
        </transition>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useStore } from 'vuex';
import SideNav from './components/layout/SideNav.vue';
import ConfirmDiscardDialog from './components/invoices/ConfirmDiscardDialog.vue';
import InvoiceEditorPanel from './components/invoices/InvoiceEditorPanel.vue';
import { useResponsiveScreen } from './composables/useResponsiveScreen';

const store = useStore();
const { isBelowSupportedWidth } = useResponsiveScreen();

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const isLightTheme = computed(() => store.getters['ui/isLightTheme']);
const invoiceEditorOpen = computed(() => store.state.ui.invoiceEditorOpen);
const discardConfirmOpen = computed(() => store.state.ui.discardConfirmOpen);

// The moment we know who (if anyone) is signed in, open a live listener
// for their invoices and clients. Logging out clears currentUser, which
// tears the listeners down again - Firestore would otherwise reject
// them with a permission error once the session is gone.
watch(
  () => store.state.auth.currentUser,
  (user) => {
    if (user) {
      store.dispatch('invoices/subscribeToInvoices');
      store.dispatch('clients/subscribeToClients');
    } else {
      store.dispatch('invoices/unsubscribeFromInvoices');
      store.dispatch('clients/unsubscribeFromClients');
    }
  },
  { immediate: true }
);
</script>

<style lang="scss">
@import './assets/styles/theme.scss';
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Manrope', sans-serif;
}

h1,
h2,
h3 {
  font-family: 'Fraunces', serif;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.app-shell {
  min-height: 100vh;
  background-color: var(--color-page-bg);
  transition: background-color 0.3s ease;
}

.app {
  background-color: var(--color-page-bg);
  min-height: 100vh;

  @media (min-width: 900px) {
    flex-direction: row !important;
  }

  .app-content {
    padding: 0 20px;
    flex: 1;
    position: relative;
  }
}

.mobile-message {
  text-align: center;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--color-page-bg);
  color: var(--color-text);

  p {
    margin-top: 16px;
    color: var(--color-text-secondary);
  }
}

.invoice-panel-enter-active,
.invoice-panel-leave-active {
  transition: 0.5s var(--ease-premium) all;
}

.invoice-panel-enter-from,
.invoice-panel-leave-to {
  transform: translateX(-700px);
  opacity: 0;
}
</style>
